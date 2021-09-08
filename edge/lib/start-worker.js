
import log from './log.js'
import { parseReq, bodyParser } from './http.js'
import stats from  './stats.js'
import sentryLog from  './sentry.js'
import wait from './wait.js'

export default handler => {
  addEventListener('fetch', event => {
    const fetchStart = Date.now()
    stats.updt(event)

    const req = parseReq(event.request)

    async function execute () {
      try {
        const { parsedBody, body } = await bodyParser({ event })

        if (req.url.href.startsWith('http://1')) {
          console.log(stats, req)
        }

        return handler({
          stats,
          req,
          parsedBody,
          body,
          event,
          wait
        })
        .then(response => {
          wait(log({ req, response, stats, body, duration: (Date.now() - fetchStart) }), event)
          return response
        })
      } catch (ex) {
        wait(sentryLog(ex, event.request), event)

        return new Response(ex.message || 'An error occurred', { status: ex.statusCode || 500 })
      }
    }

    event.respondWith(execute())
  })
}
