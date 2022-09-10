// import { authHeaders } from '../couchdb/helpers'
// import maybeSetupUser from './setup'
import { getEnv } from '/_env.js'
import doReq from '../lib/req.js'
// eslint-disable-next-line no-restricted-imports
import { escapeId } from '../../app/src/lib/helpers.js'

const { _couchKey, _couchSecret, couchHost, env, folderHash, auth_domain, appName } = getEnv(['_couchKey', '_couchSecret', 'couchHost', 'env', 'folderHash', 'auth_domain', 'appName'])

const denoLocal = typeof self !== 'undefined' && !!self.Deno

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

export async function handler ({ req, stats, parsedBody, app }) {
  let jwt
  let country = ''
  if (denoLocal && !req.headers['cf-access-jwt-assertion']) {
    const authCookie = getCookie('CF_Authorization', req.headers['cookie'])
    jwt = authCookie
    const res = await fetch('https://workers.cloudflare.com/cf.json')
    if (res.ok) {
      const json = await res.json()
      country = json.country
    }
  } else {
    jwt = req.headers['cf-access-jwt-assertion']
    country = req.headers['cf-ipcountry']
  }

  let jwtPayload = {}
  if (jwt) {
    jwtPayload = JSON.parse(atob(jwt.split('.')[1]))
  }

  if (req.url.search.startsWith('?login')) {
    // 'cookie: CF_Authorization=<user-token>' https://<your-team-name>.cloudflareaccess.com/cdn-cgi/access/get-identity
    // "name": "Jan Johannes"
    // TODO: how to do org support on cf access?
    // idp: Data from your identity provider.
    // user_uuid: The ID of the user.
    const params = new URLSearchParams(req.url.search)
    if (jwtPayload.email) {
      return new Response(JSON.stringify({}), {
        status: 302,
        headers: {
          'Cache-Control': 'must-revalidate',
          'Location': params.get('continue') || '/',
          'Content-Type': 'application/json'
        }
      })
    }

    let Location = '/_ayu/accounts/'
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
    if (!denoLocal) {
      return new Response('forbidden', { status: 403 })
    }
    // TODO: if allready logged in, logout?
    const newOrg = parsedBody?.org
    const newEmail = parsedBody?.email
    const existingSessionId = parsedBody?.sessionId

    let newSessionDoc = {
      sessionName: parsedBody?.sessionName,
      org: parsedBody?.org,
      email: parsedBody?.email,
      title: `${parsedBody?.email}${parsedBody?.org ? ' (' + parsedBody?.org + ')' : ''}`,
      country,
      created: Date.now(),
      stats,
      loginCount: 0,
      type: 'session'
      // todo: move to dev version of stats
      // `${json.city} ${json.country} ${json.asOrganization} ${json.colo}`longitude, latitude
      // "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
      // saveToDevice: "on"
    }

    const dbName = env === 'prod' ? escapeId(appName) : escapeId(env + '__' + appName)

    if (existingSessionId) {
      const { json: existingSessionDoc } = await doReq(`${couchHost}/${dbName}/${existingSessionId}`, {
        headers: { 'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}`}
      })
      if (existingSessionDoc) {
        // TODO: error if any value changed or doc is unavailable
        newSessionDoc = existingSessionDoc
      }
    }

    newSessionDoc.lastLogin = Date.now()
    newSessionDoc.loginCount++

    if (!newSessionDoc.startSeq) {
      const { json: { update_seq }} = await doReq(`${couchHost}/${dbName}`, {headers:{'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}`}})
      newSessionDoc.startSeq = update_seq
    }

    const params = new URLSearchParams(req.url.search)
    const newSessionId = existingSessionId || 'system:' + crypto.randomUUID()

    await doReq(`${couchHost}/${dbName}/${newSessionId}`, {
      method: 'PUT',
      body: newSessionDoc,
      headers: {
        'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}`
      }
    })

    const devJwt = 'dev.' + btoa(JSON.stringify({ email: newEmail, dev_mock: true, org: newOrg, sessionId: newSessionId }))

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

    if (jwtPayload.dev_mock) {
      headers['Location'] = `/_ayu/accounts/${params.get('continue') ? '?continue=' + encodeURIComponent(params.get('continue')) : ''}`
      headers['Set-Cookie'] = 'CF_Authorization=deleted; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly;'
    } else if (jwtPayload.email) {
      headers['Location'] = `https://${auth_domain}/cdn-cgi/access/logout?returnTo=${encodeURIComponent(req.url.origin)}`
      headers['Set-Cookie'] = 'CF_Authorization=deleted; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly;'
    } else {
      headers['Location'] = `/_ayu/accounts/?login`
      // headers['Set-Cookie'] = 'CF_Authorization=deleted; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly;'
    }

    return new Response('', {
      status: 302,
      headers
    })
  }

  // TODO: delete account and database
  // const sessionsUrl = `${`${dbHost}/user_${userId}`}/_design/ntr/_view/lastSeen_by_userId?reduce=false`
  // const sessions = await req(sessionsUrl)
  // const setupRes = await maybeSetupUser({
  //   dbUrl,
  //   email,
  //   userId,
  //   sessions

  return new Response(JSON.stringify({
    userId: jwtPayload.email,
    email: jwtPayload.email,
    org: jwtPayload.org,
    env,
    appName: app.appName,
    appHash: folderHash,

    sessionId: jwtPayload.sessionId,

    // roles: [],
    country,

    expiry: jwtPayload.exp,
    issued: jwtPayload.iat,

    cfAccessUserId: jwtPayload.sub,

    edgeVersion: stats.edgeVersion

    // setupRes,
    // sessionDocs: sessionsBody.rows
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
