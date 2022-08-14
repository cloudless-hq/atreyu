import { getKvStore } from '/$kvs.js'
import wait from './wait.js' // ./lib. ?
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
  const reqStart = Date.now()
  if (!method) {
    method = body ? 'POST' : 'GET'
  }

  // TODO: make case insensitive with native heders obj
  const headers = {
    'Content-Type': 'application/json',
    ...headersArg
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
      kvRes.metadata.headers['cache-status'] = `edge-kv; hit${kvRes.metadata.expiration ? '; ttl=' + (kvRes.metadata.expiration - Date.now()) : ''}`
      kvRes.metadata.ok = true
      kvRes.metadata.statusText = 'OK'
      kvRes.metadata.status = 200
      kvRes.metadata.redirected = false
      res = new Response(kvRes.value, kvRes.metadata)
    }
  }

  let retried
  const cacheMiss = !res
  if (cacheMiss) {
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
      wait((async () => {
        await kvs.put(cacheKey, await res.clone().arrayBuffer(), {
          expirationTtl: ttl, // s
          metadata: {
            expiration: ttl ? (Date.now() + ttl) : undefined,
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

  let resHeaders
  let json
  let text
  if (!rawArg && res.headers) {
    resHeaders = Object.fromEntries(res.headers.entries())
    if (cacheMiss) {
      let oldCacheStatus = res.headers.get('cache-status') || ''
      if (oldCacheStatus) {
        oldCacheStatus += ', '
      }
      resHeaders['cache-status'] = oldCacheStatus + 'edge-kv; miss; stored'
    }

    if (res.headers.get('content-type') === 'application/json') {
      json = await res.json()
    } else {
      text = await res.text()
    }
  }

  const duration = (Date.now() - reqStart)
  const baseResponse = {
    json,
    text,
    headers: resHeaders,

    ok: res.ok,
    redirected: res.redirected,
    status: res.status,
    statusText: res.statusText,
    retried,
    error: res.error
  }
  wait(log({
    req: {
      method,
      url: new URL(url),
      headers
    },
    res: baseResponse,
    body,
    duration
  }))

  return {
    raw: res,
    ...baseResponse
  }
}
