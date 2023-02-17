import log from './log.js'
import { bodyParser } from './http.js'
import { getWait } from './wait.js'
// import apm from './apm.js'

export default ({ handler, _module, app }) => {
  // module: {
  //    async fetch (req, env, { waitUntil, passThroughOnException }) {
  //    }
  // }
  const stats = {
    workerId: Math.round(Math.random() * 10000000000000),
    reqs: 0,
    workerStart: (new Date()).toISOString(),
    app
  }

  addEventListener('fetch', event => {
    const fetchStart = Date.now()

    stats.lastActive = (new Date()).toISOString()
    stats.reqs++

    const { waitUntil } = getWait(event)

    const url = new URL(event.request.url)
    const req = {
      raw: event.request,
      method: event.request.method,
      headers: Object.fromEntries(event.request.headers.entries()),
      query: Object.fromEntries(url.searchParams.entries()),
      url
    }

    if (req.headers['content-length']) {
      req.headers['content-length'] = parseInt(req.headers['content-length'], 10)
    }
    if (req.headers['Content-Length']) {
      req.headers['Content-Length'] = parseInt(req.headers['Content-Length'], 10)
    }

    const traceId = req.headers.traceparent || Math.round(Math.random() * 10000000000000)
    // used for logging subrequests without having to pass stats just for that, should be replaced with apm solution
    event._traceId = traceId
    event._stats = stats

    async function execute () {
      try {
        const { parsedBody, text } = event.request.body ? await bodyParser(event.request, { clone: true }) : {}

        return handler({
          stats,

          req,
          parsedBody,
          text,

          event,
          waitUntil
        })
          .then(response => {
            const duration = (Date.now() - fetchStart)

            waitUntil(log({ req, response, stats, body: text, duration, traceId }))

            // try {
            //   // FIXME: requests have immutable headers
            //   response.headers.set('server-timing', 'edge;dur=' + duration)
            // } catch (_e) {
            //   // console.log('header immutable', response, req.url.href)
            // }

            return response
          })
      } catch (ex) {
        // waitUntil(apm(ex, event.request))

        return new Response(ex.message || 'An error occurred', { status: ex.statusCode || 500 })
      }
    }

    event.respondWith(execute())
  })
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
