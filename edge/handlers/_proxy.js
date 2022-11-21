import doReq from '../lib/req.js'
import { getEnv } from '/_env.js'
import { escapeId } from '/_ayu/src/lib/helpers.js'

// TODO: needs different domain from main?!

const { _couchKey, _couchSecret, couchHost, env, appName } = getEnv(['_couchKey', '_couchSecret', 'couchHost', 'env', 'appName'])
const dbName = 'ayu_' + escapeId(env + '__' + appName.replace('preview', 'closr'))

const { json: settings } = await doReq(`${couchHost}/${dbName}/channel:web`, { // text, headers, ok, error
  cacheNs: 'dialogflow',
  ttl: 60 * 5, // 5 minutes
  headers: {
    'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}`
  }
})

// const doc = {
//     route: 'domain/path*',
//     enabled: true,
//     newResHeaders: {},
//     allowedResHeaders: {},
//     blockedResHeaders: {},
//     newReqHeaders: {},
//     allowedReqHeaders: {},
//     blockedReqHeaders: {},
//     caching: {},
//     addHeaders: {},
//     newCookies: {},
//     allowedCookies: {}
// }

// TODO: prevend cookie name clashes!!!!

export async function handler ({ req }) {
  // console.log(req.headers)
  if (!req.headers['referer']?.endsWith('service-worker.bundle.js')) {
    if (req.url.pathname !== '/') {
      return Response.redirect(`/?return=${req.url.href}`, 307)
    }

    const initBody = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="icon" href="data:,">
    <title>installing service worker</title>
    <script type="module" src="/ayu-main.js"></script>
  </head>
  <body>
    Installing...
  </body>
</html>`
    return new Response(initBody, { headers:  {
      'content-type': 'text/html'
    }})
  }


  if (req.headers['forwarded']) {
    const forwardConf = req.headers['forwarded']
      .replaceAll(' ', '')
      .split(';').map(elem => elem.split('='))
      .reduce((aggr, param) => {
        aggr[param[0]] = param[1]
        return aggr
      }, {})
    console.log({forwardConf})
    req.url.host = forwardConf.host
    req.url.port = forwardConf.port
    req.url.protocol = forwardConf.proto
  } else {
    req.url.hostname = settings.domain
  }

  const href = req.url.href

  if (!href || href.endsWith('.map')) {
    return new Response('Cannot process request', {
      status: 500,
      statusText: 'Url not found in cors proxy request'
    })
  }
  // allow http
  // allowed cookies
  // TODO handle existing cookies and issue an unset if not whitelisted with warning
  // TODO: const originWhitelist = []

  const commonHeadersWhitelist = [
    'accept',
    'accept-encoding',
    'accept-language',

    'connection',
    'pragma',
    'transfer-encoding',
    'vary',
    'date',
    'etag',
    'x-content-type-options',
    'accept-ranges',

    'content-type',
    'content-length',
    'sec-fetch-mode',
    'sec-fetch-dest',
    'strict-transport-security',

    'sec-fetch-site',

    'access-control-allow-origin',
    'access-control-expose-headers',
    'cross-origin-resource-policy',

    'x-content-type-option',
    'x-xss-protectio'
    // 'user-agent'
  ]

  // delete req.headers['if-none-match']
  // delete req.headers['if-modified-since']
  const reqHeaderWhitelist = [
    'host'
  ]

  // headers.delete('content-security-policy-report-only')
  const resHeaderWhitelist = [
    'server',
    'alt-svc',
    'age',
    'last-modified',
    'cf-cache-status',
    'cache-control',
    'x-cache',
    'cache-status'
  ]

  // cookie, referer, user-agent?, authorization
  const cleanReqHeaders = {}

  Object.entries(req.headers).forEach(([key, val]) => {
    if ([...commonHeadersWhitelist, ...reqHeaderWhitelist].includes(key.toLowerCase())) {
      cleanReqHeaders[key] = val
    } else if (key === 'cookie') {
      cleanReqHeaders[key] = val
      console.log('req cookies', val.split(';').map(cook => cook.split('=')))
    } else {
      // console.log(['req', key, val])
    }
  })

  // TODO: headers allready stripped to minimum if they come from KV store
  const { raw: res, error, ok } = await doReq(href, {
    method: req.method,
    cacheNs: 'cors',
    headers: cleanReqHeaders,
    raw: true
  })
  if (!ok) {
    console.error('sub request error url: ' + href, error)
  }

  // console.log(req.headers)
  // TODO: handle cookies, headear, other methods?

  // if (req.headers.cookie) {
  //     console.log('request cookies: ', req.headers.cookie.split('; ').map(cook => cook.split('=')))
  // }

  const cleanResHeaders = {}

  const resHeaders = [...res.headers]
  resHeaders.forEach(([key, val]) => {
    if ([...commonHeadersWhitelist, ...resHeaderWhitelist].includes(key.toLowerCase())) {
      cleanResHeaders[key] = val
    } else if (key === 'cookie') {
      cleanResHeaders[key] = val
      console.log('res cookies', val.split(';').map(cook => cook.split('=')))
    } else {
      // console.log(['res', key, val])
    }
  })

  cleanResHeaders.server = 'ayu-proxy-edge-worker'
  if (!cleanResHeaders['cache-status']) {
    cleanResHeaders['cache-status'] = 'edge-kv; miss'
  }

  // TODO: force installing service worker and reload
  const isHtml = res.headers.get('Content-Type')?.includes('text/html')
  if (isHtml && settings.selector) {
    // const headers = new Headers(res.headers)

    const body = await res.text()

    // TODO: move all code to main module
    const inject = `<script>window.ayu_settings=${JSON.stringify(settings)}</script><script type="module" src="/ayu-main.js"></script>`
    // defer

    return new Response(body.replace('</head>', `${inject}</head>`).replaceAll('window.location', 'window.proxiedLoc').replaceAll('document.cookie', 'document.proxied.cookie'), {
      status: res.status,
      statusText: res.statusText,
      headers: cleanResHeaders
    })
  }
  const isJs = res.headers.get('Content-Type')?.includes('application/javascript')

  if (isJs) {
    const body = await res.text()

    return new Response(body.replaceAll('window.location', 'window.proxiedLoc').replaceAll('document.cookie', 'document.proxied.cookie'), {
      status: res.status,
      statusText: res.statusText,
      headers: cleanResHeaders
    })
  }

  const ress = new Response(await res.arrayBuffer(), {
    status: res.status,
    statusText: res.statusText,
    headers: cleanResHeaders
  })

  return ress
}
