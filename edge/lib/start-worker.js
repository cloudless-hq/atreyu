import log from './log.js'
import { parseReq, bodyParser } from './http.js'
import stats from './stats.js'
import sentryLog from './sentry.js'
import { getWait } from './wait.js'

export default handler => {
  addEventListener('fetch', event => {
    const fetchStart = Date.now()

    stats.updt(event)
    event.stats = stats
    const { waitUntil } = getWait(event)

    const req = parseReq(event.request)

    async function execute () {
      try {
        const { parsedBody, body } = await bodyParser({ event }) // clone: true

        if (req.url.href.startsWith('http://1')) {
          console.log(stats, req)
        }

        return handler({
          stats,
          req,
          parsedBody,
          body,
          event,
          waitUntil
        })
          .then(response => {
            const duration = (Date.now() - fetchStart)
            waitUntil(log({ req, response, stats, body, duration }))
            try {
              // FIXME: cloudant requests have immutable headers?
              response.headers.set('server-timing', 'edge;dur=' + duration)
            } catch (_e) {
              // console.log('header immutable', response, req.url.href)
            }
            return response
          })
      } catch (ex) {
        waitUntil(sentryLog(ex, event.request))

        return new Response(ex.message || 'An error occurred', { status: ex.statusCode || 500 })
      }
    }

    event.respondWith(execute())
  })
}
