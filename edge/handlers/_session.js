// import { authHeaders } from '../couchdb/helpers'
// import maybeSetupUser from './setup'
import { getEnv } from '/$env.js'

let denoLocal = false
try {
  denoLocal = !!window.Deno
} catch (_e) { }

const { env, folderHash, orgId } = getEnv(['env', 'folderHash', 'orgId'])

// function setCookie (name, value, days) {
//     let d = new Date
//     d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days)
//     document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString()
// }
// function deleteCookie (name) { setCookie(name, '', -1) }

function getCookie (name, cookieString = '') {
  const v = cookieString.match('(^|;) ?' + name + '=([^;]*)(;|$)')
  return v ? v[2] : null
}


// TODO: create database if not existing

export function handler ({ req, stats, parsedBody, app }) {
  let jwt

  const authCookie = getCookie('CF_Authorization', req.headers['cookie'])
  if (denoLocal && !req.headers['cf-access-jwt-assertion'] && authCookie) {
    jwt = authCookie
  } else {
    jwt = req.headers['cf-access-jwt-assertion']
  }

  let payload = {}
  if (jwt) {
    payload = JSON.parse(atob(jwt.split('.')[1]))
  }

  // if (!payload.email && payload.common_name) {
  //   payload.email = payload.common_name + '@' + orgId
  // }

  if (req.url.search.startsWith('?login')) {
    const params = new URLSearchParams(req.url.search)
    if (payload.email) {
      return new Response(JSON.stringify({}), {
        status: 302,
        headers: {
          'Cache-Control': 'must-revalidate',
          'Location': params.get('continue') || '/',
          'Content-Type': 'application/json'
        }
      })
    }

    let Location = '/atreyu/accounts/'
    if (params.get('continue')) {
      Location += `?continue=${encodeURIComponent(params.get('continue'))}`
    }

    return new Response(JSON.stringify({}), {
      status: 302,
      headers: {
        'Cache-Control': 'must-revalidate',
        Location,
        'Content-Type': 'application/json'
      }
    })
  } else if (req.url.search.startsWith('?dev_login')) {
    // console.log(parsedBody)
    // {
    //   email: "dev_user@localhost",
    //   org: "",
    //   saveToDevice: "on",
    //   sessionName: "Google Chrome on macOS",
    //   raw: "email=dev_user%40localhost&org=&saveToDevice=on&sessionName=Google+Chrome+on+macOS"
    // }
    if (!denoLocal) {
      return new Response('forbidden', { status: 403 })
    }
    const params = new URLSearchParams(req.url.search)
    const devJwt = 'dev.' + btoa(JSON.stringify({ email: parsedBody.email, dev_mock: true }))

    return new Response(JSON.stringify({}), {
      status: 302,
      headers: {
        'Cache-Control': 'must-revalidate',
        'Location': params.get('continue') || '/' ,
        'Set-Cookie': `CF_Authorization=${devJwt}; Path=/; HttpOnly;`, // Version=1;?
        'Content-Type': 'application/json'
      }
    })
  } else if (req.url.search.startsWith('?logout')) { // req.method === 'delete' ||
    const params = new URLSearchParams(req.url.search)

    const headers = { 'Cache-Control': 'must-revalidate' }

    if (payload.dev_mock) {
      headers['Location'] = `/atreyu/accounts/${params.get('continue') ? '?continue=' + encodeURIComponent(params.get('continue')) : ''}`
      headers['Set-Cookie'] = 'CF_Authorization=deleted; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly;'
    } else if (payload.email) {
      headers['Location'] = `https://${orgId}.cloudflareaccess.com/cdn-cgi/access/logout?returnTo=${encodeURIComponent(req.url.origin)}`
      headers['Set-Cookie'] = 'CF_Authorization=deleted; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly;'
    } else {
      headers['Location'] = `/atreyu/accounts/?login`
      // headers['Set-Cookie'] = 'CF_Authorization=deleted; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly;'
    }

    return new Response('', {
      status: 302,
      headers
    })
  }

  // TODO: delete account and database

  // const dbUrl = `${dbHost}/user_${userId}`
  // const sessionsUrl = `${dbUrl}/_design/ntr/_view/lastSeen_by_userId?reduce=false`
  // const sessions = await req(sessionsUrl, {
  //   method: 'GET',
  //   headers: await authHeaders({ userId })
  // })
  // const sessionsBody = await sessions.json()
  // const setupRes = await maybeSetupUser({
  //   dbUrl,
  //   email,
  //   userId,
  //   sessionsBody
  // })

  return new Response(JSON.stringify({
    userId: payload.email || null,
    env,
    appName: app.appName,

    appHash: folderHash,

    // roles: [],
    // email,
    country: req.headers['cf-ipcountry'],

    expiry: payload.exp,
    issued: payload.iat,

    cfAccessSessionId: payload.nonce,
    cfAccessUserId: payload.sub,

    edgeVersion: stats.edgeVersion

    // setupRes,
    // sessionDocs: sessionsBody.rows
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
