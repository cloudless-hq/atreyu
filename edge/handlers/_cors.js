// TODO: needs different domain from main?!
// import { getEnv } from '$env.js'
import { cachedReq } from '../lib/req.js'

// const env = getEnv(['cloudantKey', 'cloudantSecret', 'cloudantDomain'])

// function couch (path, body) {
//     const url = 'https://' + env.cloudantDomain + '/dep-manager/' + path
//     return fetch(url, {
//         headers: {
//             Authorization: `Basic ${btoa(env.cloudantKey + ':' + env.cloudantSecret)}`
//         }
//     })
// }

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

// const confCache = {}

export async function handler ({ req }) {
  const href = decodeURIComponent(req.url.href.substring(req.url.href.indexOf('?') + 1))

  console.log(href)
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

  const reqHeaderWhitelist = [
    'host'
  ]

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
      // console.log(val.split('; ').map(cook => cook.split('=')))
    } else {
      // console.log(['req', key, val])
    }
  })

  // TODO: headers allready stripped to minimum if they come from KV store
  const res = await cachedReq(href, 'cors', {
    headers: cleanReqHeaders
  })

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
    } else {
      // console.log(['res', key, val])
    }
  })

  cleanResHeaders.server = 'cors-edge-worker'
  if (!cleanResHeaders['cache-status']) {
    cleanResHeaders['cache-status'] = 'edge-kv; miss'
  }

  const ress = new Response(await res.arrayBuffer(), {
    status: res.status,
    statusText: res.statusText,
    headers: cleanResHeaders
  })
  return ress
}
