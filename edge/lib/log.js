import { getEnv } from './env.js'
import { urlLogger } from '../../app/src/lib/url-logger.js'
// TODO: sentry support for exceptions https://github.com/bustle/cf-sentry/blob/master/sentry.js
let env

export default async function ({ req, body, response, stats, duration = null }) {
  if (!env) {
    env = getEnv(['_ELASTIC_AUTH', 'ELASTIC_URL'])
  }

  let res
  let wokerName

  if (response) {
    let resp

    if (response.then) {
      resp = await response
    } else {
      resp = response
    }

    const headers = {}
    const resHeaders = [...resp.headers]
    resHeaders.forEach(ent => {
      headers[ent[0]] = ent[1]
    })

    res = {
      headers,
      status: resp.status
    }

    wokerName = headers['server']
  }

  urlLogger({method: req.method, scope: wokerName || 'edge-worker', url: req.url.href, duration})

  if (!env.ELASTIC_URL) {
    return
  }

  return fetch(env.ELASTIC_URL, {
    method: 'POST',
    headers: new Headers({
      'Authorization': 'Basic ' + btoa(env._ELASTIC_AUTH),
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({
      stats: stats.get(),

      duration,

      req: {
        method: req.method,
        url: req.url.href,
        path: req.url.pathname,
        headers: req.headers,
        body
      },

      res
    })
  })
  // TODO: error logging for elastic logging errors
  // .then(ress => {
  //   console.log(ress, env._ELASTIC_AUTH)
  //   return ress
  // })
  // .catch(err => {
  //   console.log(err)
  //   return err
  // })
}
