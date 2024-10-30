// import log from './log.js'
import { sleepRandom } from './helpers.js'

// TODO: handle logout detection and service worker integration!!!
// TODO: integrate base features with edge/lib/req.js

const cacheMap = new Map()
// TODO: copy this dedupe logic to falcor req dedupe too
const pendingMap = new Map()

export default async function req (urlArg, {
  method,
  body,
  cache,
  cacheKey,
  params: paramsArg,
  headers: headersArg = {},
  raw: rawArg,
  retry = false,
  redirect = 'manual',
  fetch: customFetch = fetch
} = {}) {
  // TODO: ttl
  // const { waitUntil, event } = getWait()
  if (!method) {
    method = body ? 'POST' : 'GET'
  }

  paramsArg && Object.entries(paramsArg).forEach(([key, value]) => {
    if (value=== undefined) {
      delete paramsArg[key]
    }
  })

  const params = paramsArg && new URLSearchParams(paramsArg)

  const url = params ? urlArg + `?${params}` : urlArg

  const headers = new Headers(headersArg)

  if (body && !headers.get('content-type')) {
    headers.set('content-type', 'application/json')
  }

  headers.set('X-Requested-With', 'XMLHttpRequest')

  if (body && headers.get('content-type').includes('application/json')) {
    body = JSON.stringify(body)
  }

  let res
  let kvs
  if (cache) {
    if (!cacheKey) {
      cacheKey = url
    }

    if (pendingMap.has(cacheKey)) {
      await pendingMap.get(cacheKey)
    }

    if (cacheMap.has(cacheKey)) {
      const  {body: cachedBod, headers: cachedHead } = cacheMap.get(url)
      cachedHead['cache-status'] = `edge-kv; hit`
      res = new Response(cachedBod, { headers: cachedHead, ok: true, statusText: 'OK', status: 200, redirected: false })
    }

    // ${kvRes.metadata.expiration ? '; ttl=' + (kvRes.metadata.expiration - Math.floor(Date.now() / 1000)) : ''}
    //   kvs = getKvStore(cache)
    //   // TODO: streams are faster for non binaries
    //   const kvRes = await kvs.getWithMetadata(cacheKey, { type: 'arrayBuffer', cacheTtl: 604800 }) //  1 week, TODO ttl for other?
    //   if (kvRes?.value) {
    //     res = new Response(kvRes.value, kvRes.metadata)
    //   }
  }

  let retried
  const reqStart = Date.now()
  let finishLoad = null
  const wasCached = !!res
  if (!wasCached) {
    const loadPromise = new Promise(resolve => { finishLoad = resolve })
    pendingMap.set(url, loadPromise)

    res = await customFetch(url, { method, body, headers, redirect }).catch(fetchError => ({ ok: false, error: fetchError }))

    // FIXME: do not retry redirects etc that are also not ok
    if (!res.ok && retry) {
      retried = {
        status: res.status,
        statusText: res.statusText,
        text: res.text ? await res.text() : undefined,
        error: res.error,
        redirect: res.redirected || res.type === 'opaqueredirect'
      }
      if (retried.redirect || res.status === 401) {
        self.session?.refresh()
        // FIXME: abort here
      }
      await sleepRandom()
      res = await customFetch(url, { method, body, headers, redirect }).catch(fetchError => ({ ok: false, error: fetchError }))
    }

    if (res.ok && cache) {
      res.clone().arrayBuffer().then(body => {
        cacheMap.set(cacheKey, { body,  headers:  {
          'content-type': res.headers.get('content-type'),
          'content-length': res.headers.get('content-length'),
          'last-modified': res.headers.get('last-modified')
        }})
        finishLoad()
        pendingMap.delete(cacheKey)
      })
      //   waitUntil((async () => {
      //     await kvs.put(cacheKey, body, {
      //       expirationTtl: ttl, // s
      //       metadata: {
      //         expiration: ttl ? (Math.floor(Date.now() / 1000) + ttl) : undefined,
      //          headers
      //       }
      //     })
      //   })())
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
    if (res.headers.get('content-type').includes('application/json')) {
      json = JSON.parse(text)
    }
  }

  const baseResponse = {
    headers: resHeaders,

    duration,
    ok: res.ok,
    redirect: res.redirected || res.type === 'opaqueredirect',
    status: res.status,
    statusText: res.statusText,
    retried,
    error: res.error
  }

  if (baseResponse.redirect || res.status === 401) {
    self.session?.refresh()
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

function get (url, opts = {}) {
  opts.method = 'GET'
  return req(url, opts)
}
function del (url, opts = {}) {
  opts.method = 'DELETE'
  return req(url, opts)
}
 function put (url, opts = {}) {
  opts.method = 'PUT'
  return req(url, opts)
}
function post (url, opts = {}) {
  opts.method = 'POST'
  return req(url, opts)
}
function head (url, opts = {}) {
  opts.method = 'HEAD'
  return req(url, opts)
}
function options (url, opts = {}) {
  opts.method = 'OPTIONS'
  return req(url, opts)
}
function patch (url, opts = {}) {
  opts.method = 'PATCH'
  return req(url, opts)
}
function trace (url, opts = {}) {
  opts.method = 'TRACE'
  return req(url, opts)
}

export { get, del, put, post, head, options, patch, trace }
