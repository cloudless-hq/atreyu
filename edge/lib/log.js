import { getEnv } from './env.js'
// eslint-disable-next-line
import { urlLogger } from '../../app/src/lib/url-logger.js'
// TODO: sentry support for exceptions https://github.com/bustle/cf-sentry/blob/master/sentry.js
let envConf

export default async function ({ req, body, response, stats, duration = null }) {
  if (!envConf) {
    envConf = getEnv(['_ELASTIC_AUTH', 'ELASTIC_URL', 'env'])
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

  if (envConf.env === 'dev') {
    urlLogger({method: req.method, scope: wokerName || 'edge-worker', url: req.url.href, duration})
  }

  if (!envConf.ELASTIC_URL) {
    return
  }

  return fetch(envConf.ELASTIC_URL, {
    method: 'POST',
    headers: new Headers({
      'Authorization': 'Basic ' + btoa(envConf._ELASTIC_AUTH),
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
  //   console.log(ress, envConf._ELASTIC_AUTH)
  //   return ress
  // })
  // .catch(err => {
  //   console.log(err)
  //   return err
  // })
}
