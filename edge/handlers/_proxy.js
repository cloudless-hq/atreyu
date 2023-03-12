import doReq from '../lib/req.js'
import { getEnv } from '/_env.js'
import { escapeId } from '/_ayu/src/lib/helpers.js'
import { setCookieParser, renderSetCookieString } from '../lib/http.js'

// TODO: needs different domain from main?!
const data = {}
function getCookie (name, cookieString = '') {
  const v = cookieString.match('(^|;) ?' + name + '=([^;]*)(;|$)')
  return v ? v[2] : null
}
const { _couchKey, _couchSecret, couchHost, env, appName } = getEnv(['_couchKey', '_couchSecret', 'couchHost', 'env', 'appName'])

const dbName = 'ayu_' + (env === 'prod' ? escapeId(appName) : escapeId(env + '__' + appName))

const urlPatternConf = {
  'cookidoo.:lang': [
    '/recipes/recipe/:lang/:recipeId',
    '/search/:lang',
    '/foundation/:lang'
  ],
  'assets.tmecosys.com': [
    '/image/upload/:format/img/recipe/ras/Assets/:assetId/Derivates/:derivateName',
    '/image/upload/:format/img/collection/ras/Assets/:assetId/Derivates/:derivateName',
    '/image/upload/:format/cdn/contentful/:id1/:id2/:filename',
    '/video/upload/:id/:format/v1/videos/:hir1/:hir2/:filename'
  ]
}

const patterns = Object.entries(urlPatternConf).flatMap(([hostname, pathPatterns]) => pathPatterns.map(pathname => new URLPattern({ pathname, hostname })))

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

// async function hash (string) {
//   const utf8 = new TextEncoder().encode(string)
//   const hashBuffer = await crypto.subtle.digest('SHA-256', utf8)
//   const hashArray = Array.from(new Uint8Array(hashBuffer))
//   const hashHex = hashArray
//     .map((bytes) => bytes.toString(16).padStart(2, '0'))
//     .join('')
//   return hashHex
// }

async function getDoc (id, newDoc) {
  const { json, ok } = await doReq(`${couchHost}/${dbName}/${id}`, {
    // cacheNs: 'dialogflow', ttl: 60 * 5,
    headers: { 'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}` }
  })

  if (ok) {
    return json
  }

  if (!newDoc._id) {
    newDoc._id = id
  }
  if (newDoc) {
    edits[id] = [ () => newDoc ]
  }
  return newDoc
}

const edits = {}
function updateDoc (doc, fun) {
  edits[doc._id] = [...(edits[doc._id] || []), fun]
  // console.log(doc)
  return fun(doc)
  // console.log(doc)
}

const pending = {}
const locked = {}
async function commit (doc) {
  if (!edits[doc._id]) {
    return
  }
  if (locked[doc._id]) {
    pending[doc._id] = true
    return
  }
  locked[doc._id] = true
  const currentEdits = edits[doc._id]
  delete edits[doc._id]

  // console.log('\ncommit ' + doc.pathname)

  const _rev = doc._rev
  delete doc._rev // make sure race conditions lead to conflicts

  // console.log('pre', doc.pathname, _rev)
  const { json, ok } = await doReq(`${couchHost}/${dbName}/${doc._id}`, {
    method: 'PUT',
    body: { ...doc, _rev, reqs: undefined },
    headers: { 'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}` }
  })

  if (json.error === 'conflict') {
    const updatedDoc = await getDoc(doc._id)

    console.log(json, updatedDoc.pathname, updatedDoc._rev, doc._rev)
    // console.error(json, { ...doc, _rev, reqs: undefined })
    // TODO: get updstream doc and merge funs
  }

  if (json.rev) {
    doc._rev = json.rev
    // console.log('post', doc.pathname, json.rev)
  }
  locked[doc._id] = false
  if (pending[doc._id]) {
    return commit(doc)
  }
  // console.log(json, { ...doc, _rev, reqs: undefined })
}

let settingsLocked = false
let settings
async function loadSettings () {
  if (settingsLocked) {
    return
  }
  settingsLocked = true
  const { json } = await doReq(`${couchHost}/${dbName}/system:settings`, {
    // cacheNs: 'preview', // TODO: errror message if ns not available
    // ttl: 60 * 3, // 5 minutes
    headers: {
      'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}`
    }
  })
  settingsLocked = false
  return json
}
export async function handler ({ req, text, waitUntil }) {
  const origUrl = new URL(req.url.href)

  if (req.url.pathname === '/__ayu_refresh') {
    settings = await loadSettings()
    return Response.redirect(`${origUrl.origin}/`, 307)
  }

  if (!settings) {
    settings = await loadSettings()
  }

  const cookieBindings = settings.cookieBindings
  if (!cookieBindings[settings.hostname]) {
    cookieBindings[settings.hostname] = {}
  }

  // console.log(req.headers['forwarded'] || req.url.href)
  if (req.url.pathname === '/__csp_report') {
    return new Response('OK')
  }

  if (
    !req.headers['referer']?.endsWith('service-worker.js')
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
      startWorker({ reloadAfterInstall: false }).then(() => {

      })
    </script>
  </head>
  <body>
    <h2>Preparing your Application Proxy...</h2>

    Please note that this is purely for evaluation and testing of your application and is not safe to use with real or sensitive accounts. Please only use test accounts and public pages.

    <button onClick="window.location.reload()">Start</button>
  </body>
</html>`
    return new Response(initBody, { headers:  {
      'content-type': 'text/html'
    }})
  }

  if (req.url.pathname === '/__ayu_data') {
    const { json: { rows } } = await doReq(`${couchHost}/${dbName}/_design/ayu_preview/_view/by_primaryHost_and_hostname_and_pathname`, {
      params: {
        reduce: true,
        group_level: 2,
        start_key: [settings.hostname],
        end_key: [settings.hostname, {}]
      },
      headers: { 'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}`}
    })

    const favReqs = rows.map(({ key: [ _primaryHost, hostname ], value: { jsCookies, httpCookies, firstSeen, reqHeaders } }) => {
      data[hostname] = { httpCookies, jsCookies, firstSeen, reqHeaders, paths: {}, favicon: data[hostname]?.favicon }

      if (hostname === settings.hostname) {
        data[hostname].primaryHost = true
      }

      if (!data[hostname].favicon) {
        return doReq(`https://secret-beige-takin.faviconkit.com/${ hostname }/24`, { raw: true, cacheNs: 'favicons' })
          .then(async ({ raw }) => {
            const buf = new Uint8Array(await raw.arrayBuffer())
            let string = ''
            buf.forEach( byte => { string += String.fromCharCode(byte) })
            data[hostname].favicon = `data:${raw.headers.get('content-type')};base64,` + btoa(string)
          })
      } else {
        return Promise.resolve()
      }
    })

    const { json: { rows: pathRows } } = await doReq(`${couchHost}/${dbName}/_design/ayu_preview/_view/by_primaryHost_and_hostname_and_pathname`, {
      params: {
        include_docs: true,
        reduce: false,
        limit: 4000,
        start_key: [settings.hostname],
        end_key: [settings.hostname, {}]
      },
      headers: { 'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}`}
    })
    pathRows.forEach(({ doc: pathDoc }) => {
      data[pathDoc.hostname].paths[pathDoc.pathname] = pathDoc
    })

    await Promise.all(favReqs)

    // fetch('https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=at_67cgy7rNjEoykwPiDXpsWP9qW45Mu&outputFormat=JSON&domainName=' + req.url.hostname)
    //   .then(res => res.json()).then(({WhoisRecord}) => data[req.url.hostname].domainInfo = WhoisRecord)
    // fetch('https://ssl-certificates.whoisxmlapi.com/api/v1?apiKey=at_67cgy7rNjEoykwPiDXpsWP9qW45Mu&outputFormat=JSON&domainName=' + req.url.hostname)
    //   .then(res => res.json()).then(certInfo => data[req.url.hostname].certInfo = certInfo)

    return new Response(JSON.stringify(data), { headers:  { 'content-type': 'application/json' }})
  }

  if (!settings.hostname) {
    // if worker coninues make sure it lazyly updates possible settings changes without blocking other requests
    // loadSettings().then(result => {
    //   if (result ) {
    //     settings = result
    //   }
    // })
    return Response.redirect(`${origUrl.origin}/_dashboard/#/settings`, 307)
  }

  let forwarded
  if (req.headers['forwarded']) {
    forwarded = 'external'
    const forwardConf = req.headers['forwarded']
      .replaceAll(' ', '')
      .split(';').map(elem => elem.split('='))
      .reduce((aggr, param) => {
        aggr[param[0]] = param[1]
        return aggr
      }, {})
    // console.log({forwardConf})
    req.url.host = forwardConf.host
    if (forwardConf.port) {
      req.url.port = forwardConf.port
    }

    req.url.protocol = forwardConf.proto
  } else if (req.headers.cookie && getCookie('AYU_SECONDARY_PROXY', req.headers.cookie)) {
    forwarded = 'internal'
    const secondaryProxyUrl = new URL(getCookie('AYU_SECONDARY_PROXY', req.headers.cookie))
    req.url.hostname = secondaryProxyUrl.hostname
    if (secondaryProxyUrl.port) {
      req.url.port = secondaryProxyUrl.port
    }
    req.url.protocol = secondaryProxyUrl.protocol
  } else {
    // TODO move to origen setting with proto and port instead of domain only
    req.url.hostname = settings.hostname
    req.url.protocol = 'https'
  }

  let match
  for (const pattern of patterns) {
    const result = pattern.exec(req.url.href)
    if (result) {
      match = { pattern, result }
      break
    }
  }

  let docPath
  if (match) {
    docPath = match.pattern.pathname
  } else {
    docPath = req.url.pathname
  }

  if (!data[req.url.hostname]) {
    data[req.url.hostname] = {
      paths: {}
      // lastSeen:   Date.now() needs reqs ...
    }
  }

  let doc = data[req.url.hostname].paths[docPath]

  if (!doc) {
    doc = await getDoc('path:' + btoa(settings.hostname + req.url.hostname + docPath), {
      primaryHost: settings.hostname,
      hostname: req.url.hostname,
      pathname: docPath,
      examplePath: req.url.pathname,
      reqHeaders: {},
      jsCookies: {},
      httpCookies: {},
      methods: [],
      statuses: [],
      firstSeen: Date.now()
      // lastSeen: Date.now()
    })
    // doc.reqs = []

    data[req.url.hostname].paths[docPath] = doc
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
    'x-forwarded-proto',
    'x-real-ip',
    'x-via',
    'forwarded',
    'origin'
  ]

  const resHeaderBlocklist = [
    'content-security-policy',
    'cross-origin-opener-policy',
    'cross-origin-resource-policy',
    'nel',
    'report-to'
  ]

  // TODO: cookie js set/js accessible, iframes
  // cookie, referer, user-agent?, authorization
  const cleanReqHeaders = {}

  Object.entries(req.headers).forEach(([key, val]) => {
    if ([...commonHeadersWhitelist, ...reqHeaderWhitelist].includes(key.toLowerCase())) {
      cleanReqHeaders[key] = val

      if (!doc.reqHeaders[key]) {
        updateDoc(doc, draft => draft.reqHeaders[key] = val)
      }
    } else if (key === 'cookie') {
      const cookies = []
      // console.log('get cookie', val, doc, settings.hostname, cookieBindings)
      val.split(';').map(cook => cook.split('=')).forEach(([cname, ...cvalParts]) => {
        const cval = cvalParts.join('=').trim()
        cname = cname.trim()

        if (!cookieBindings[settings.hostname][cname] && !forwarded) {
          updateDoc(settings, draft => {
            if (!draft.cookieBindings[settings.hostname]) {
              draft.cookieBindings[settings.hostname] = {}
            }
            if (!draft.cookieBindings[settings.hostname][cname]) {
              draft.cookieBindings[settings.hostname][cname] = {}
            }
            draft.cookieBindings[settings.hostname][cname].hostname = req.url.hostname
            draft.cookieBindings[settings.hostname][cname].http = false
          })
          if (!cookieBindings[settings.hostname][cname]) {
            cookieBindings[settings.hostname][cname] = {}
          }
          cookieBindings[settings.hostname][cname].hostname = req.url.hostname
          cookieBindings[settings.hostname][cname].http = false
        }

        if (cookieBindings[settings.hostname][cname]?.hostname === req.url.hostname) {
          if (cname !== 'CF_Authorization') {
            if (cookieBindings[settings.hostname][cname].http) {
              if (doc.httpCookies[cname] !== decodeURIComponent(cval)) {
                // console.log('get http upd', cname)
                updateDoc(doc, draft => draft.httpCookies[cname] = decodeURIComponent(cval)) // TODO: how handle changes of cookies vs reqheaders?
              }
            } else if (doc.jsCookies[cname] !== decodeURIComponent(cval)) {
              // console.log('get js upd', cname)
              updateDoc(doc, draft => draft.jsCookies[cname] = decodeURIComponent(cval))
              // console.log('new', doc)
            }

            cookies.push(`${cname}=${cval}`)
          }
        }
      })

      if (cookies.length) {
        cleanReqHeaders.cookie = cookies.join('; ')
      }
    } else if (key === 'host') {
      cleanReqHeaders[key] = req.url.hostname
    } else if (!reqHeaderBlocklist.includes(key.toLowerCase()) && !key.toLowerCase().startsWith('cf-')) {
      // disabled whitelisting for now
      cleanReqHeaders[key] = val

      if (!doc.reqHeaders[key]) {
        updateDoc(doc, draft => draft.reqHeaders[key] = val)
      }
    }
  })

  // TODO: only if origin present before + respect current domain
  // cleanReqHeaders.origin = settings.hostname

  // TODO: headers allready stripped to minimum if they come from KV store

  const { raw: res, error, ok } = await doReq(href, {
    redirect: forwarded === 'external' ? 'follow' : 'manual',
    method: req.method,
    body: req.raw.body, // text,
    headers: cleanReqHeaders,
    raw: true
  })
  if (!res || error) {
    console.error('req error:', error, req.raw)
  }

  if (!doc.methods.includes(req.method)) {
    updateDoc(doc, draft => draft.methods.push(req.method))
  }
  if (!doc.statuses.includes(res.status)) {
    updateDoc(doc, draft => draft.statuses.push(res.status))
  }

  if (res.headers.get('content-length') && doc.contentLength !== res.headers.get('content-length')) {
    updateDoc(doc, draft => draft.contentLength = res.headers.get('content-length'))
  }

  if (res.headers.get('content-type') && doc.contentType !== res.headers.get('content-type')) {
    updateDoc(doc, draft => draft.contentType = res.headers.get('content-type'))
  }

  // doc.reqs.push({
  //   date: Date.now(),
  //   method: req.method,
  //   query: req.url.search,
  //   proto: req.url.protocol,
  //   port: req.url.port,
  //   reqHeaders: req.headers,
  //   status: res.status,
  //   statusText: res.statusText,
  //   resHeaders: Object.fromEntries([...(res.headers || [])])
  // })

  const resHeaders = [...res.headers]
  const cleanResHeaders = new Headers()

  // NOTE: set cookie headers can appear multiple times with same key in headers
  resHeaders.forEach(([key, val]) => {
    if ([...commonHeadersWhitelist, ...resHeaderWhitelist].includes(key.toLowerCase())) {
      cleanResHeaders.append(key, val)
    } else if (key === 'set-cookie') {
      const parsedCookies = setCookieParser(val)

      parsedCookies.forEach(cookie => {
        delete cookie.domain
        cleanResHeaders.append('set-cookie', renderSetCookieString(cookie))

        const ckey = cookie.name
        const cvalue = cookie.value
        if (doc.httpCookies[ckey] !== decodeURIComponent(cvalue)) {
          updateDoc(doc, draft => draft.httpCookies[ckey] = decodeURIComponent(cvalue))
        }
        if (cookieBindings[settings.hostname][ckey] && cookieBindings[settings.hostname][ckey]?.hostname !== req.url.hostname) {
          console.warn('cookie names must be unique across domains until v1.0')
        }
        if (cookieBindings[settings.hostname][ckey]?.hostname !== req.url.hostname || !cookieBindings[settings.hostname][ckey]?.http) {
          updateDoc(settings, draft => {
            if (!draft.cookieBindings[settings.hostname]) {
              draft.cookieBindings[settings.hostname] = {}
            }
            if (!draft.cookieBindings[settings.hostname][ckey]) {
              draft.cookieBindings[settings.hostname][ckey] = {}
            }
            draft.cookieBindings[settings.hostname][ckey].hostname = req.url.hostname
            draft.cookieBindings[settings.hostname][ckey].http = true
          })
          if (!cookieBindings[settings.hostname][ckey]) {
            cookieBindings[settings.hostname][ckey] = {}
          }
          cookieBindings[settings.hostname][ckey].hostname = req.url.hostname
          cookieBindings[settings.hostname][ckey].http = true
        }
      })
    } else if (!resHeaderBlocklist.includes(key.toLowerCase())) {
      // NOTE: disabled whitilisting for now
      cleanResHeaders.append(key, val)
    }
  })

  await commit(settings)

  if (!ok) {
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      if (res.headers.get('location').startsWith('http')) {
        const redirectUrl = new URL(res.headers.get('location'))
        if (redirectUrl.origin !== req.url.origin) {
          // TODO handle asset redirects!
          console.log('---- external redirect: ' + res.url + ' to: ' + redirectUrl)
          if (redirectUrl.hostname !== settings.hostname && req.url.hostname === settings.hostname) {
            cleanResHeaders.append('set-cookie', `AYU_SECONDARY_PROXY=${redirectUrl.origin}; Path=/; HttpOnly; Expires=Tue, 19 Jan 2038 04:14:07 GMT`)
          } else if (redirectUrl.hostname === settings.hostname) {
            cleanResHeaders.append('set-cookie', `AYU_SECONDARY_PROXY=delete; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT`)
          } else {
            console.error('third party redirect, should never happen, as they use follow mode')
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
  const isImage = !isHtml && (res.headers.get('Content-Type')?.includes('image/') || ['jpg', 'svg', 'jpeg', 'png', 'gif', 'ico'].includes(ext))
  if (doc.isImage !== isImage) {
    updateDoc(doc, draft => draft.isImage = isImage)
  }

  function userReplacements (inputText) {
    settings?.replacements?.forEach(([remove, replace]) => {
      inputText = inputText.replace(remove, replace || '')
    })
    return inputText
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
        console.log('js set of cookie ' + value)
        return document.cookie = value.replaceAll(' ', '').split(';').filter(elem => !elem.startsWith('domain=')).join('; ')
      }
      return obj[prop] = value
    }
  })

  window.proxiedLoc = new Proxy({}, {
    get: function (obj, prop, receiver) {
      if (prop === Symbol.toPrimitive) {
           return undefined
      } else if (prop === 'toString') {
          return function toString () { return window.location.toString() }
      }
      return window.location[prop]
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
      window.location[prop] = value
      return true
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

    if (!doc.contentLength && body.length) {
      updateDoc(doc, draft => draft.contentLength = body.length)
    }

    // FIXME!
    waitUntil(commit(doc))
    return new Response(replacements(userReplacements(body)).replace('<head>', `<head>${inject}`), {
      status: res.status,
      statusText: res.statusText,
      headers: cleanResHeaders
    })
  }
  const isJs = res.headers.get('Content-Type')?.includes('application/javascript')

  if (isJs) {
    const body = await res.text()

    if (!doc.contentLength && body.length) {
      updateDoc(doc, draft => draft.contentLength = body.length)
    }

    waitUntil(commit(doc))
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

  waitUntil(commit(doc))
  return ress
}

// TODO: window.cookieStorage?
function replacements (text) {
  return text.replace(/[^\w\d](?:window\.location|document\.cookie)[^\w\d]/g, matched => {
    return matched.replace('location', 'proxiedLoc').replace('cookie', 'proxied.cookie')
  })
}

// handle msising, errors and redirects
