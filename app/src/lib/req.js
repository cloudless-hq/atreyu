// import { getKvStore } from '/_kvs.js'
// import { getWait } from './wait.js'
// import log from './log.js'
import { sleepRandom } from './helpers.js'

// TODO: handle logout detection and service worker integration!!!
// TODO: integrate base features with edge/lib/req.js
export default async function req (url, { method, body, headers: headersArg = {}, raw: rawArg, retry = true, redirect = 'error' } = {}) {
  // TODO: ttl, cacheKey, cacheNs,
  // const { waitUntil, event } = getWait()
  if (!method) {
    method = body ? 'POST' : 'GET'
  }

  const headers = new Headers(headersArg)

  if (body && !headers.get('content-type')) {
    headers.set('content-type', 'application/json')
  }

  if (body && headers.get('content-type') === 'application/json') {
    body = JSON.stringify(body)
  }

  let res
  let kvs
  // if (cacheNs) {
  //   if (!cacheKey) {
  //     cacheKey = url
  //   }

  //   kvs = getKvStore(cacheNs)

  //   // TODO: streams are faster for non binaries
  //   const kvRes = await kvs.getWithMetadata(cacheKey, { type: 'arrayBuffer', cacheTtl: 604800 }) //  1 week, TODO ttl for other?

  //   if (kvRes?.value) {
  //     kvRes.metadata.headers['cache-status'] = `edge-kv; hit${kvRes.metadata.expiration ? '; ttl=' + (kvRes.metadata.expiration - Math.floor(Date.now() / 1000)) : ''}`
  //     kvRes.metadata.ok = true
  //     kvRes.metadata.statusText = 'OK'
  //     kvRes.metadata.status = 200
  //     kvRes.metadata.redirected = false
  //     res = new Response(kvRes.value, kvRes.metadata)
  //   }
  // }

  let retried
  const reqStart = Date.now()
  const wasCached = !!res
  if (!wasCached) {
    res = await fetch(url, { method, body, headers, redirect }).catch(fetchError => ({ ok: false, error: fetchError }))

    if (!res.ok && retry) {
      retried = {
        status: res.status,
        statusText: res.statusText,
        text: res.text ? await res.text() : undefined,
        error: res.error,
        redirected: res.redirected
      }
      await sleepRandom()
      res = await fetch(url, { method, body, headers, redirect }).catch(fetchError => ({ ok: false, error: fetchError }))
    }

    // if (res.ok && cacheNs) {
    //   waitUntil((async () => {
    //     await kvs.put(cacheKey, await res.clone().arrayBuffer(), {
    //       expirationTtl: ttl, // s
    //       metadata: {
    //         expiration: ttl ? (Math.floor(Date.now() / 1000) + ttl) : undefined,
    //         headers:  {
    //           'content-type': res.headers.get('content-type'),
    //           'content-length': res.headers.get('content-length'),
    //           'last-modified': res.headers.get('last-modified')
    //         }
    //       }
    //     })
    //   })())
    // }
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
    redirected: res.redirected,
    status: res.status,
    statusText: res.statusText,
    retried,
    error: res.error
  }

  // headers['referer'] = 'todo'
  // headers['traceId'] = 'todo'
  // headers['host'] = 'todo'
  // if (!wasCached) {
  //   waitUntil(log({
  //     stats: event?.stats,
  //     req: {
  //       method,
  //       url: new URL(url),
  //       headers: Object.fromEntries(headers.entries())
  //     },
  //     res: { body: text, ...baseResponse},
  //     body,
  //     duration
  //   }))
  // }

  return {
    raw: res,
    json,
    text,
    ...baseResponse
  }
}
