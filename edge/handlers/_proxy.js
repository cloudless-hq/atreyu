import doReq from '../lib/req.js'
import { getEnv } from '/_env.js'
import { escapeId } from '/_ayu/src/lib/helpers.js'

// TODO: needs different domain from main?!
const cookieBindings = {}
const data = {}
function getCookie (name, cookieString = '') {
  const v = cookieString.match('(^|;) ?' + name + '=([^;]*)(;|$)')
  return v ? v[2] : null
}
const { _couchKey, _couchSecret, couchHost, env, appName } = getEnv(['_couchKey', '_couchSecret', 'couchHost', 'env', 'appName'])

const dbName = 'ayu_' + (env === 'prod' ? escapeId(appName) : escapeId(env + '__' + appName))

const { json: settings } = await doReq(`${couchHost}/${dbName}/system:settings`, { // text, headers, ok, error
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

// TODO: prevend cookie name clashes!!!!, enforce origin and path propperly


// "csp-report": {
//   "document-uri": "http://preview.localhost/?return=http://preview.localhost/foundation/de-DE",
//   referrer: "http://preview.localhost/?return=http://preview.localhost/foundation/de-DE",
//   "violated-directive": "script-src",
//   "effective-directive": "script-src",
//   "original-policy": "script-src 'none'; frame-ancestors 'none'; object-src 'none'; frame-src 'none'; connect-src 'none'; ...",
//   disposition: "report",
//   "blocked-uri": "eval",
//   "line-number": 2,
//   "column-number": 12925,
//   "source-file": "https://patternlib-all.prod.external.eu-tm-prod.vorwerk-digital.com/pl-core-20.36.1-cf4db1803e698839...",
//   "status-code": 401,
//   "script-sample": ""
// }

// "csp-report": {
//   "document-uri": "http://preview.localhost/?return=http://preview.localhost/foundation/de-DE",
//   referrer: "http://preview.localhost/?return=http://preview.localhost/foundation/de-DE",
//   "violated-directive": "script-src-elem",
//   "effective-directive": "script-src-elem",
//   "original-policy": "script-src 'none'; frame-ancestors 'none'; object-src 'none'; frame-src 'none'; connect-src 'none'; ...",
//   disposition: "report",
//   "blocked-uri": "http://preview.localhost/_ayu/src/service-worker/start-worker.js",
//   "line-number": 164,
//   "source-file": "http://preview.localhost/",
//   "status-code": 401,
//   "script-sample": ""
// }

// {
//   "csp-report": {
//     "document-uri": "http://preview.localhost/",
//     referrer: "",
//     "violated-directive": "frame-src",
//     "effective-directive": "frame-src",
//     "original-policy": "script-src 'none'; frame-ancestors 'none'; object-src 'none'; frame-src 'none'; connect-src 'none'; ...",
//     disposition: "report",
//     "blocked-uri": "http://webchat.localhost",
//     "line-number": 24,
//     "column-number": 23,
//     "source-file": "http://preview.localhost/src/main.js",
//     "status-code": 401,
//     "script-sample": ""
//   }
// }

async function hash (string) {
  const utf8 = new TextEncoder().encode(string)
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, '0'))
    .join('')
  return hashHex
}

export async function handler ({ req, parsedBody, text }) {
  const origUrl = new URL(req.url.href)
  // console.log(req.headers['forwarded'] || req.url.href)
  if (req.url.pathname === '/__csp_report') {
    return new Response('OK')
  }

  if (
    !req.headers['referer']?.endsWith('service-worker.bundle.js')
    // && !req.url.pathname.startsWith('/oauth2') &&
    // !req.url.pathname.startsWith('/login-consent-provider') &&
    // !req.url.pathname.startsWith('/profile/de-DE/login') &&
    // !req.url.href.includes('?return=')
  ) {
    if (req.url.pathname !== '/') {
      return Response.redirect(`${origUrl.origin}/?return=${origUrl.href}`, 307)
    }

    const initBody = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="icon" href="data:,">
    <title>installing service worker</title>
    <script type="module">
      import startWorker from '/_ayu/src/service-worker/start-worker.js'
      startWorker({ reloadAfterInstall: true }).then(() => {

      })
    </script>
  </head>
  <body>
    Installing...
  </body>
</html>`
    return new Response(initBody, { headers:  {
      'content-type': 'text/html'
    }})
  }

  if (req.url.pathname === '/__ayu_data') {
    return new Response(JSON.stringify(data), { headers:  {
      'content-type': 'application/json'
    }})
  }

  if (!settings.hostname) {
    return Response.redirect(`${origUrl.origin}/_dashboard/#/settings`, 307)
  }

  let forwarded = false
  if (req.headers['forwarded']) {
    forwarded = true
    const forwardConf = req.headers['forwarded']
      .replaceAll(' ', '')
      .split(';').map(elem => elem.split('='))
      .reduce((aggr, param) => {
        aggr[param[0]] = param[1]
        return aggr
      }, {})
    // console.log({forwardConf})
    req.url.host = forwardConf.host
    req.url.port = forwardConf.port
    req.url.protocol = forwardConf.proto
  } else if (req.headers.cookie && getCookie('AYU_SECONDARY_PROXY', req.headers.cookie)) {
    forwarded = true
    const secondaryProxyUrl = new URL(getCookie('AYU_SECONDARY_PROXY', req.headers.cookie))
    req.url.hostname = secondaryProxyUrl.hostname
    req.url.port = secondaryProxyUrl.port
    req.url.protocol = secondaryProxyUrl.protocol
  } else {
    // TODO move to origen setting with proto and port instead of domain only
    req.url.hostname = settings.hostname
    req.url.protocol = 'https'
  }

  if (!data[req.url.hostname]) {
    data[req.url.hostname] = { paths: {}, cookies: {}, domainInfo: {}, certInfo: {}, firstSeen: Date.now(), lastSeen: Date.now() }
    // console.log('new: ', req.url.hostname)
    // fetch('https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=at_67cgy7rNjEoykwPiDXpsWP9qW45Mu&outputFormat=JSON&domainName=' + req.url.hostname)
    //   .then(res => res.json()).then(({WhoisRecord}) => data[req.url.hostname].domainInfo = WhoisRecord)

    // fetch('https://ssl-certificates.whoisxmlapi.com/api/v1?apiKey=at_67cgy7rNjEoykwPiDXpsWP9qW45Mu&outputFormat=JSON&domainName=' + req.url.hostname)
    //   .then(res => res.json()).then(certInfo => data[req.url.hostname].certInfo = certInfo)

    fetch(`http://secret-beige-takin.faviconkit.com/${ req.url.hostname }/24`)
      .then(res => res.blob())
      .then(blob => {
        const a = new FileReader()
        a.onload = e => {
          data[req.url.hostname].favicon = e.target.result
        }
        a.readAsDataURL(blob)
      })
      .catch(_err => {})
  }
  if (!data[req.url.hostname].paths[req.url.pathname]) {
    data[req.url.hostname].paths[req.url.pathname] = {
      reqs: [],
      firstSeen: Date.now(),
      lastSeen: Date.now()
    }
  }

  const href = req.url.href

  // if (!href || href.endsWith('.map')) {
  //   return new Response('Cannot process request', {
  //     status: 500,
  //     statusText: 'Url not found in cors proxy request'
  //   })
  // }
  // allow http
  // allowed cookies
  // TODO handle existing cookies and issue an unset if not whitelisted with warning
  // TODO: const originWhitelist = []
  // <base href="https://example.com/" />

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
    // 'host'
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

  const reqHeaderBlocklist = [
    'referer',
    'x-via',
    'forwarded',
    'origin'
  ]

  // TODO: cookie js set/js accessible, iframes
  // cookie, referer, user-agent?, authorization
  const cleanReqHeaders = {}

  Object.entries(req.headers).forEach(([key, val]) => {
    if ([...commonHeadersWhitelist, ...reqHeaderWhitelist].includes(key.toLowerCase())) {
      cleanReqHeaders[key] = val
    } else if (key === 'cookie') {
      const cookies = []

      // console.log(req.url.hostname, cookieBindings)

      val.split(';').map(cook => cook.replace(' ', '').split('=')).forEach(([cname, ...cvalParts]) => {
        const cval = cvalParts.join('=')
        // console.log({cname, cval})
        // if (cookieBindings[cname]) {
        //   console.log(cookieBindings[cname] === req.url.hostname, cname)
        // }
        if (cookieBindings[cname] === req.url.hostname || (!cookieBindings[cname] && !forwarded)) {
          data[req.url.hostname].cookies[cname] = cval
          cookies.push(`${cname}=${cval}`)
        }
      })

      if (cookies.length) {
        cleanReqHeaders.cookie = cookies.join('; ')
      }
    } else if (key === 'host') {
      cleanReqHeaders[key] = req.url.hostname
    } else if (!reqHeaderBlocklist.includes(key.toLowerCase())) {
      // disabled whitelisting for now
      cleanReqHeaders[key] = val
      // console.log(['req', key, val])
    }
  })

  cleanReqHeaders.origin = settings.hostname

  // console.log({ href, cleanReqHeaders, method: req.method, req })
  // TODO: headers allready stripped to minimum if they come from KV store
  const { raw: res, error, ok } = await doReq(href, {
    method: req.method,
    body: text,
    // cacheNs: 'cors',
    headers: cleanReqHeaders,
    raw: true
  })

  data[req.url.hostname].lastSeen = Date.now()
  data[req.url.hostname].paths[req.url.pathname].lastSeen = Date.now()
  // firstSeen, lastSeen
  data[req.url.hostname].paths[req.url.pathname].reqs.push({
    date: Date.now(),
    method: req.method,
    query: req.url.search,
    proto: req.url.protocol,
    port: req.url.port,
    reqHeaders: req.headers,
    status: res.status,
    statusText: res.statusText,
    resHeaders: Object.fromEntries([...(res.headers || [])])
  })

  // console.log(req.headers)
  // TODO: handle cookies, headear, other methods?

  // if (req.headers.cookie) {
  //     console.log('request cookies: ', req.headers.cookie.split('; ').map(cook => cook.split('=')))
  // }

  const resHeaders = [...res.headers]
  const cleanResHeaders = new Headers()
  // NOTE: eg. set cookie headers can appear multiple times with same key in headers!
  resHeaders.forEach(([key, val]) => {
    if ([...commonHeadersWhitelist, ...resHeaderWhitelist].includes(key.toLowerCase())) {
      cleanResHeaders.append(key, val)
    } else if (key === 'set-cookie') {
      // console.log('cookie set: ', req.url.hostname, val)
      cleanResHeaders.append(key, val)
      // console.log(val)
      const [ckey, ...crest] = val.split('=')
      data[req.url.hostname].cookies[ckey.trim()] = crest.join('=').trim()
      if (cookieBindings[ckey.trim()] && cookieBindings[ckey.trim()] !== req.url.hostname) {
        console.warn('cookie names must be unique across domains until v1.0')
      }
      cookieBindings[ckey.trim()] = req.url.hostname
      // console.log(cookieBindings)
      // val.split(';').map(cook => cook.replace(' ', '').split('=')).forEach(([key, ...vals]) => {
      //   data[req.url.hostname].cookies[key] = vals.join('=')
      // })
      // console.log('res cookies', val.split(';').map(cook => cook.split('=')))
    } else {
      // disabled whitilisting for now
      cleanResHeaders.append(key, val)
      // console.log(['res', key, val])
    }
  })

  if (!ok) {
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      if (res.headers.get('location').startsWith('http')) {
        const redirectUrl = new URL(res.headers.get('location'))
        // console.log(redirectUrl, req.url)
        if (redirectUrl.origin !== req.url.origin) {
          console.log('---- external redirect: ' + res.url + ' to: ' + redirectUrl)
          if (redirectUrl.hostname !== settings.hostname) {
            cleanResHeaders.append('set-cookie', `AYU_SECONDARY_PROXY=${redirectUrl.origin}; Path=/; HttpOnly; expires=Tue, 19 Jan 2038 04:14:07 GMT; Version=1;`)
          } else {
            cleanResHeaders.append('set-cookie', `AYU_SECONDARY_PROXY=; Path=/; HttpOnly; expires=Thu, 01 Jan 1970 00:00:00 GMT; Version=1;`)
          }
        }

        redirectUrl.protocol = origUrl.protocol
        redirectUrl.port = origUrl.port
        redirectUrl.hostname = origUrl.hostname
        cleanResHeaders.set('location', redirectUrl.href)
      }
    }
    // else {
    //   console.error('sub request error url: ' + href, { error, res })
    // }
  }

  // {/* <meta http-equiv="Content-Security-Policy" content="default-src data: https:; script-src 'unsafe-inline' 'unsafe-eval' https:; worker-src blob: https:; object-src 'none'; style-src data: 'unsafe-inline' https:; img-src data: https:; media-src data:; frame-src https:; font-src data: https:; connect-src data: https:"> </meta> */}

  // {
  //   "id": "8337233faec2357ff84465a919534e4d",
  //   "url": "https://malicious.example.com/badscript.js",
  //   "added_at": "2021-11-18T10:51:10.09615Z",
  //   "first_seen_at": "2021-11-18T10:51:08Z",
  //   "last_seen_at": "2021-11-22T09:57:54Z",
  //   "host": "example.net",
  //   "domain_reported_malicious": false,
  //   "url_reported_malicious": true,
  //   "malicious_url_categories": ["Malware"],
  //   "first_page_url": "http://malicious.example.com/page_one.html",
  //   "status": "active",
  //   "url_contains_cdn_cgi_path": false,
  //   "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  //   "js_integrity_score": 10,
  //   "obfuscation_score": 10,
  //   "dataflow_score": 8,
  //   "fetched_at": "2021-11-21T16:58:07Z"
  // }
  //   Report-To: { "group": "endpoint-1",
  //               "max_age": 10886400,
  //               "endpoints": [
  //                 { "url": "https://example.com/reports" },
  //                 { "url": "https://backup.com/reports" }
  //               ] }
  // Content-Security-Policy: …; report-to endpoint-1

  // default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; frame-src https://calendly.com/; style-src 'unsafe-inline' 'self'; img-src 'self' https://imagedelivery.net/; connect-src 'self' https://igp.cloudflareaccess.com/ https://c030818326bf4dcb8815b0ddbacd6f68.apm.europe-west3.gcp.cloud.es.io/

  // NEL: { "report_to": "name_of_reporting_group", "max_age": 12345, "include_subdomains": false, "success_fraction": 0.0, "failure_fraction": 1.0 }
  // <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src https://*; child-src 'none';" />
  //  navigator.sendBeacon('/log', analyticsData);
  // report-to: {"endpoints":[{"url":"https:\/\/a.nel.cloudflare.com\/report\/v3?s=rusnAxdqt7ztQKMpDBtrfCS%2FEgdYKc1W47llyCjZR7uElhboUd6nWtpI6YsPT0H2oNHI%2FhXV0%2B3bPvmgav1qSe0dyxdyZYkxkCFJ8zbXnpS0AK9IGM6twnZ9"}],"group":"cf-nel","max_age":604800}
  cleanResHeaders.set('server', 'ayu-proxy-edge-worker')
  // cleanResHeaders['content-security-policy-report-only'] = `script-src 'none'; frame-ancestors 'none'; object-src 'none'; frame-src 'none'; connect-src 'none'; report-uri http://preview.localhost/__csp_report`

  // if (!cleanResHeaders['cache-status']) {
  //   cleanResHeaders['cache-status'] = 'edge-kv; miss'
  // }

  let hasBody = true
  if (res.status === 304) {
    hasBody = false
  }

  // TODO: force installing service worker and reload
  const isHtml = res.headers.get('Content-Type')?.includes('text/html')

  const pathParts = req.url.pathname.split('.')
  const ext = pathParts[pathParts.length - 1]
  data[req.url.hostname].paths[req.url.pathname].isImage = !isHtml && (res.headers.get('Content-Type')?.includes('image/') || ['jpg', 'svg', 'jpeg', 'png', 'gif', 'ico'].includes(ext))

  function userReplacements (text) {
    settings.replacements.forEach(([remove, replace]) => {
      text = text.replace(remove, replace || '')
    })
    return text
  }

  if (isHtml) { // && settings.selector
    // const headers = new Headers(res.headers)

    const body = await res.text()

    // TODO: move all code to main module
    // FIXME: object proxies need inlining
    // window.ayu_settings=${JSON.stringify(settings)}
    const inject = `
<script>
  document.proxied = new Proxy({ cookie: ''}, {
    get (obj, prop, receiver) {
      // console.log('get', { obj, prop, receiver })
      if (prop === 'cookie') {
        return document.cookie
      }
      return obj[prop]
    },
    set (obj, prop, value) {
      // console.log('set', { obj, prop, value })
      if (prop === 'cookie') {
        // console.log('js domain cookie ' + value)
        return document.cookie = value.replaceAll(' ', '').split(';').filter(elem => !elem.startsWith('domain=')).join('; ')
      }
      return obj[prop] = value
    }
  })
  window.proxiedLoc = new Proxy(window.location, {
    get (obj, prop, receiver) {
      return obj[prop]
    },
    set (obj, prop, value) {
      if (prop === 'href') {
        const url = new URL(value)
        if (location.origin !== url.origin) {
          url.host = location.host
          url.protocol = location.protocol
          url.port = location.port
        }
        value = url.href
      }
      return obj[prop] = value
    }
  })
</script>
<script type="module">
  import startWorker from '/_ayu/src/service-worker/start-worker.js'

  // TODO: sw cannot be renamed anyways, make async / promise + config object, rename startWorker etc instead of start
  startWorker({ reloadAfterInstall: true }).then(() => {

  })

  // preload + preconnect
  // TODO: handle document.querySelectorAll('iframe') + links
  // cert and domain whois info
</script>
${settings.inject || ''}`
    // defer?

    // FIXME!
    return new Response(replacements(userReplacements(body)).replace('<head>', `<head>${inject}`), {
      status: res.status,
      statusText: res.statusText,
      headers: cleanResHeaders
    })
  }
  const isJs = res.headers.get('Content-Type')?.includes('application/javascript')

  if (isJs) {
    const body = await res.text()

    return new Response(hasBody ? replacements(body) : null, {
      status: res.status,
      statusText: res.statusText,
      headers: cleanResHeaders
    })
  }

  const ress = new Response(hasBody ? res.body : null, {
    status: res.status,
    statusText: res.statusText,
    headers: cleanResHeaders
  })

  return ress
}

// TODO: window.cookieStorage?
function replacements (text) {
  return text.replace(/[^\w\d](?:window\.location|document\.cookie)[^\w\d]/g, matched => {
    return matched.replace('location', 'proxiedLoc').replace('cookie', 'proxied.cookie')
  })
}

// handle msising, errors and redirects
