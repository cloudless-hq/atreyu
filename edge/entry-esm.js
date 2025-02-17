import log from './lib/log.js'
import { bodyParser } from './lib/http.js'
// import apm from './apm.js'
// import rew from './lib/req.js'

import handler from '/_handler.js'
import paramsValidation from '/_validation.js'

// const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
// min, max are inclusive
// const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
// const sleepRandom = () => {
//   const ms = randomInt(500, 1500)
//   // console.log(`error in fetch, retry in  ${ms / 1000} s ...`)
//   return sleep(ms)
// }

const stats = {
  workerId: Math.round(Math.random() * 10000000000000),
  reqs: 0,
  workerStart: (new Date()).toISOString()
}

let toWait = []

export default {
  async fetch (request, env, context) {
    const {
      env: envName,
      folderHash,
      appName,
      ayuVersion,
      rootFolderHash,
      ayuHash
    } = env

    const app = {
      env: envName,
      Hash: folderHash,
      rootFolderHash,
      ayuVersion,
      ayuHash,
      appName
    }
    stats.app = app

    const fetchStart = Date.now()

    stats.lastActive = (new Date()).toISOString()
    stats.reqs++

    const url = new URL(request.url)

    const req = {
      raw: request,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      query: Object.fromEntries(url.searchParams.entries()),
      url,
      parsedBody () {
        return request.body ? bodyParser(request, { clone: true }) : {}
      }
    }

    if (req.headers['content-length']) {
      req.headers['content-length'] = parseInt(req.headers['content-length'], 10)
    }
    if (req.headers['Content-Length']) {
      req.headers['Content-Length'] = parseInt(req.headers['Content-Length'], 10)
    }

    const traceId = req.headers.traceparent || Math.round(Math.random() * 10000000000000)

    // FIXME: move this to lib again!!!!
    async function doReq (reqUrl, { method, body, headers: headersArg = {}, params, ttl, cacheKey, cacheNs, raw: rawArg, redirect = 'manual' } = {}) {
      console.warn('doReq is outdated and uses inlined entry-esm version')
      
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
        reqUrl += '?' + paramsArray.join('&')
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
          cacheKey = reqUrl
        }

        kvs = env[cacheNs]

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
        // console.log({ reqUrl, method, body, headers, length: body?.length })
        res = await fetch(reqUrl, { method, body, headers, redirect }).catch(fetchError => ({ ok: false, error: fetchError }))
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
        //   res = await fetch(reqUrl, { method, body, headers, redirect }).catch(fetchError => ({ ok: false, error: fetchError }))
        // }

        if (res.ok && cacheNs) {
          const pProm = kvs.put(cacheKey, await res.clone().arrayBuffer(), {
            expirationTtl: ttl, // s
            metadata: {
              expiration: ttl ? (Math.floor(Date.now() / 1000) + ttl) : undefined,
              headers:  {
                'content-type': res.headers.get('content-type'),
                'content-length': res.headers.get('content-length'),
                'last-modified': res.headers.get('last-modified')
              }
            }
          }).catch(err => {console.log(err)})

          // toWait.push(pProm)
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

      if (traceId) {
        headers.set('traceId',traceId)
      }

      // headers.set('referer', 'todo')
      // headers.set('host', 'todo')

      if (!wasCached) {
        console.log(reqUrl)

        // toWait.push((log({
        //   envConf: env,
        //   stats,
        //   traceId,
        //   req: {
        //     raw: {
        //       cf: request.cf
        //     },
        //     method,
        //     url: new URL(reqUrl),
        //     headers: Object.fromEntries(headers.entries())
        //   },
        //   res: { body: text, ...baseResponse},
        //   body,
        //   duration
        // }).catch(err => console.error(err))))
      }

      return {
        raw: res,
        json,
        text,
        ...baseResponse
      }
    }

    try {
      if (paramsValidation) {
        if (!paramsValidation({ headers: req.headers })) {
          return new Response(JSON.stringify(paramsValidation.errors), { status: 400, headers: { 'content-type': 'application/json' }})
        }
      }

      const response = await handler.fetch(request, env, { waitUntil, passThroughOnException, app, stats, req, doReq })

      const res = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      })
      const duration = (Date.now() - fetchStart)

      res.headers.set('server-timing', response.headers.get('server-timing') + ', edge;dur=' + duration)

      // waitUntil(log({ req, response, stats, body: text, duration, traceId, envConf: env }))
      //   Promise.all(
      //   ...toWait,
      // )) //.then(toWait = [])

      return res
    } catch (ex) {
      // waitUntil(apm(ex, request))
      console.error(ex)
      return new Response(ex.message || 'An error occurred', { status: ex.statusCode || 500 })
    }
  }
}

// TODO: cloudflare independent security headers?
// Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
// Cross-Origin-Embedder-Policy: require-corp
// Cross-Origin-Opener-Policy: same-origin
// Cross-Origin-Resource-Policy: same-origin
// Origin-Agent-Cluster: ?1
// Referrer-Policy: no-referrer
// Strict-Transport-Security: max-age=15552000; includeSubDomains
// X-Content-Type-Options: nosniff
// X-DNS-Prefetch-Control: off
// X-Download-Options: noopen
// X-Frame-Options: SAMEORIGIN
// X-Permitted-Cross-Domain-Policies: none
// X-XSS-Protection: 0
