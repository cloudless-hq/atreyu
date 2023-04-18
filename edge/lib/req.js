import { getKvStore } from '/_kvs.js'
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

export default async function req (url, { method, body, headers: headersArg = {}, params, ttl, cacheKey, cacheNs, raw: rawArg, redirect = 'manual' } = {}) {
  const { waitUntil, event } = getWait()
  if (!method) {
    method = body ? 'POST' : 'GET'
  }
  if (params) {
    const paramsArray = []
    Object.entries(params).forEach(([pKey, pValue]) => {
      if (typeof pValue === 'object') {
        paramsArray.push(`${pKey}=${JSON.stringify(pValue)}`)
      } else {
        paramsArray.push(`${pKey}=${pValue}`)
      }
    })
    url += '?' + paramsArray.join('&')
  }

  const headers = new Headers(headersArg)

  if (body && !headers.get('content-type')) {
    headers.set('content-type', 'application/json')
  }

  if (body && headers.get('content-type') === 'application/json' && !(typeof body === 'string' || typeof body.getReader === 'function')) {
    body = JSON.stringify(body)
  }

  let res
  let kvs
  if (cacheNs) {
    if (!cacheKey) {
      cacheKey = url
    }

    kvs = getKvStore(cacheNs)

    if (headers.get('cache-control') !== 'no-cache') {
      // TODO: streams are faster for non binaries
      const kvRes = await kvs.getWithMetadata(cacheKey, { type: 'arrayBuffer', cacheTtl: 604800 }) //  1 week, TODO ttl for other? remember if the key needs to be changed this needs to be reduced and then increased again!

      if (kvRes?.value) {
        const options = {
          headers: {
            'cache-status': `edge-kv; hit${kvRes.metadata?.expiration ? '; ttl=' + (kvRes.metadata?.expiration - Math.floor(Date.now() / 1000)) : ''}`,
            'content-type': kvRes.metadata?.headers?.['content-type']
          },
          ok: true,
          statusText: 'OK',
          status: 200,
          redirect: false
        }

        res = new Response(kvRes.value, options)
      }
    }
  }

  let retried
  const reqStart = Date.now()
  const wasCached = !!res
  if (!wasCached) {
    // console.log({ url, method, body, headers, length: body?.length })
    res = await fetch(url, { method, body, headers, redirect }).catch(fetchError => ({ ok: false, error: fetchError }))
    // console.log(res)

    // if (!res.ok) { // FIXME: only on certain errors!!, disable option
    //   console.log(res)
    //   retried = {
    //     status: res.status,
    //     statusText: res.statusText,
    //     text: res.text ? await res.text() : undefined,
    //     error: res.error,
    //     redirect: res.redirected
    //   }
    //   await sleepRandom()
    //   res = await fetch(url, { method, body, headers, redirect }).catch(fetchError => ({ ok: false, error: fetchError }))
    // }

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
      resHeaders['cache-status'] = oldCacheStatus + 'edge-kv; miss' + (kvs ? '; stored' : '')
    }

    text = await res.text()
    if (res.headers.get('content-type') === 'application/json') {
      json = JSON.parse(text)
    }
  }

  const baseResponse = {
    headers: resHeaders,

    duration,
    ok: res.ok,
    redirect: res.redirected,
    status: res.status,
    statusText: res.statusText,
    retried,
    error: res.error
  }

  if (event?._traceId) {
    headers.set('traceId', event?._traceId)
  }

  // headers.set('referer', 'todo')
  // headers.set('host', 'todo')

  if (!wasCached) {
    console.log(url)
    waitUntil(log({
      stats: event?._stats,
      traceId: event?._traceId,
      req: {
        raw: {
          cf: event?.request.cf
        },
        method,
        url: new URL(url),
        headers: Object.fromEntries(headers.entries())
      },
      res: { body: text, ...baseResponse},
      body,
      duration
    }))
  }

  return {
    raw: res,
    json,
    text,
    ...baseResponse
  }
}
