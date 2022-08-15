import { getEnv } from './env.js'
// eslint-disable-next-line
import { urlLogger } from '../../app/src/lib/url-logger.js'
// TODO: sentry support for exceptions https://github.com/bustle/cf-sentry/blob/master/sentry.js
let envConf

// TODO fix funciton call signature to json payload
export default async function ({ req, body, res, response, stats, duration = null }) {
  if (!envConf) {
    envConf = getEnv(['_ELASTIC_AUTH', 'ELASTIC_URL', 'env'])
  }

  let wokerName

  if (response) {
    let resp

    if (response.then) {
      resp = await response
    } else {
      resp = response
    }

    const headers = Object.fromEntries(resp.headers.entries())

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

  // Delete for data laws
  delete req.headers['cf-connecting-ip']
  delete req.headers['x-real-ip']
  delete req.headers['Authorization']
  delete req.headers['cookie']

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
