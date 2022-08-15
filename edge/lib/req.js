import { getKvStore } from '/$kvs.js'
import { getWait } from './wait.js'
import log from './log.js'


const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
// min, max are inclusive
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
const sleepRandom = () => {
  const ms = randomInt(500, 1500)
  // console.log(`error in fetch, retry in  ${ms / 1000} s ...`)
  return sleep(ms)
}

export default async function req (url, { method, body, headers: headersArg, ttl, cacheKey, cacheNs, raw: rawArg }) {
  const { waitUntil, event } = getWait()
  if (!method) {
    method = body ? 'POST' : 'GET'
  }

  // TODO: make case insensitive with native heders obj
  const headers = {
    'Content-Type': 'application/json',
    ...headersArg
  }

  if (body && headers['Content-Type'] === 'application/json') {
    body = JSON.stringify(body)
  }

  let res
  let kvs
  if (cacheNs) {
    if (!cacheKey) {
      cacheKey = url
    }

    kvs = getKvStore(cacheNs)

    // TODO: streams are faster for non binaries
    const kvRes = await kvs.getWithMetadata(cacheKey, { type: 'arrayBuffer', cacheTtl: 604800 }) //  1 week, TODO ttl for other?

    if (kvRes?.value) {
      kvRes.metadata.headers['cache-status'] = `edge-kv; hit${kvRes.metadata.expiration ? '; ttl=' + (kvRes.metadata.expiration - Math.floor(Date.now() / 1000)) : ''}`
      kvRes.metadata.ok = true
      kvRes.metadata.statusText = 'OK'
      kvRes.metadata.status = 200
      kvRes.metadata.redirected = false
      res = new Response(kvRes.value, kvRes.metadata)
    }
  }

  let retried
  const reqStart = Date.now()
  const wasCached = !!res
  if (!wasCached) {
    res = await fetch(url, { method, body, headers }).catch(fetchError => ({ ok: false, error: fetchError }))

    if (!res.ok) {
      retried = {
        status: res.status,
        statusText: res.statusText,
        text: res.text ? await res.text() : undefined,
        error: res.error,
        redirected: res.redirected
      }
      await sleepRandom()
      res = await fetch(url, { method, body, headers }).catch(fetchError => ({ ok: false, error: fetchError }))
    }

    if (res.ok && cacheNs) {
      waitUntil((async () => {
        await kvs.put(cacheKey, await res.clone().arrayBuffer(), {
          expirationTtl: ttl, // s
          metadata: {
            expiration: ttl ? (Math.floor(Date.now() / 1000) + ttl) : undefined,
            headers:  {
              'content-type': res.headers.get('content-type'),
              'content-length': res.headers.get('content-length'),
              'last-modified': res.headers.get('last-modified')
            }
          }
        })
      })())
    }
  }
  const duration = (Date.now() - reqStart)

  let resHeaders
  let json
  let text
  if (!rawArg && res.headers) {
    resHeaders = Object.fromEntries(res.headers.entries())
    if (!wasCached) {
      let oldCacheStatus = res.headers.get('cache-status') || ''
      if (oldCacheStatus) {
        oldCacheStatus += ', '
      }
      // TODO:
      resHeaders['referer'] = 'todo'
      resHeaders['traceId'] = 'todo'
      resHeaders['cache-status'] = oldCacheStatus + 'edge-kv; miss' + (kvs ? ' ; stored' : '')
    }

    if (res.headers.get('content-type') === 'application/json') {
      json = await res.json()
    } else {
      text = await res.text()
    }
  }

  const baseResponse = {
    json,
    text,
    headers: resHeaders,

    duration,
    ok: res.ok,
    redirected: res.redirected,
    status: res.status,
    statusText: res.statusText,
    retried,
    error: res.error
  }

  if (!wasCached) {
    waitUntil(log({
      stats: event?.stats,
      req: {
        method,
        url: new URL(url),
        headers
      },
      res: baseResponse,
      body,
      duration
    }))
  }

  return {
    raw: res,
    ...baseResponse
  }
}
