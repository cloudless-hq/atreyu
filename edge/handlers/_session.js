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

// TODO: logout detection:
// In order to receive a 401 for an expired session, add the following header to all AJAX requests:
// X-Requested-With: XMLHttpRequest

function getCookie (name, cookieString = '') {
  const v = cookieString.match('(^|;) ?' + name + '=([^;]*)(;|$)')
  return v ? v[2] : null
}

// TODO: create database if not existing

export async function handler ({ req, stats, parsedBody, app }) {
  let jwt
  if (denoLocal && !req.headers['cf-access-jwt-assertion']) {
    jwt = getCookie('CF_Authorization', req.headers['cookie'])
  } else {
    jwt = req.headers['cf-access-jwt-assertion']
  }

  let jwtPayload = {}
  if (jwt) {
    jwtPayload = JSON.parse(atob(jwt.split('.')[1]))
  }

  const sessionId = denoLocal ? jwtPayload.sessionId : getCookie('AYU_SESSION_ID', req.headers['cookie'])

  if (req.url.search.startsWith('?logout')) { // req.method === 'delete' for deletion session doc?
    const headers = { 'Cache-Control': 'must-revalidate' }

    if (jwtPayload.dev_mock) {
      headers['Location'] = `/_ayu/accounts/${req.params.continue ? '?continue=' + encodeURIComponent(req.params.continue) : ''}`
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

  // TODO: how to do org support on cf access?
  const org = jwtPayload.org || ''

  const cf = req.raw.cf

  if (req.url.search.startsWith('?login')) {
    // cookie: CF_Authorization= https://<your-team-name>.cloudflareaccess.com/cdn-cgi/access/get-identity
    // name: Jan Johannes, idp: Data from your identity provider, user_uuid: The ID of the user.
    if (jwtPayload.email) {
      const newSessionId = await ensureSession({ email: jwtPayload.email, app, stats, cf, useSessionId: sessionId })

      return new Response(null, {
        status: 302,
        headers: {
          'Cache-Control': 'must-revalidate',
          'Set-Cookie': `AYU_SESSION_ID=${newSessionId}; Path=/; HttpOnly; Version=1;`,
          'Location': req.params.continue || '/'
        }
      })
    }

    return new Response(null, {
      status: 302,
      headers: {
        'Cache-Control': 'must-revalidate',
        'Location': '/_ayu/accounts/' + (req.params.continue ? `?continue=${encodeURIComponent(req.params.continue)}` : '')
      }
    })
  }

  if (req.url.search.startsWith('?dev_login')) {
    if (!denoLocal) {
      return new Response('forbidden', { status: 403 })
    }
    // TODO: if allready logged in, logout?
    const newOrg = parsedBody?.org
    const newEmail = parsedBody?.email
    const newSessionId = await ensureSession({
      email: parsedBody?.email,
      org: parsedBody?.org,
      sessionName: parsedBody?.sessionName,
      useSessionId: parsedBody?.sessionId,
      app,
      stats,
      cf
    })

    const devJwt = 'dev.' + btoa(JSON.stringify({ email: newEmail, dev_mock: true, org: newOrg, sessionId: newSessionId }))

    return new Response(null, {
      status: 302,
      headers: {
        'Cache-Control': 'must-revalidate',
        'Location': req.params.continue || '/' ,
        'Set-Cookie': `CF_Authorization=${devJwt}; Path=/; HttpOnly; Version=1;`
      }
    })
  }

  // TODO: delete account and database
  // const sessions = await req(`${`${dbHost}/user_${userId}`}/_design/ntr/_view/lastSeen_by_userId?reduce=false`)
  // const setupRes = await maybeSetupUser({
  // dbUrl, email, userId, sessions

  return new Response(JSON.stringify({
    userId: jwtPayload.email,
    email: jwtPayload.email,
    org,
    env,
    appName: app.appName,
    appHash: folderHash,

    sessionId,

    // roles: [],
    cf,

    expiry: jwtPayload.exp,
    issued: jwtPayload.iat,

    cfAccessUserId: jwtPayload.sub
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

async function ensureSession ({ useSessionId, email, org, sessionName, app, stats, cf }) {
  const dbName = env === 'prod' ? escapeId(appName) : escapeId(env + '__' + appName)

  let newSessionDoc

  if (useSessionId) {
    const { json: existingSessionDoc } = await doReq(`${couchHost}/${dbName}/${useSessionId}`, {
      headers: { 'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}`}
    })
    if (existingSessionDoc) {
      // TODO: error if any value changed or doc is unavailable, validation
      newSessionDoc = existingSessionDoc
    }
  }

  if (!newSessionDoc) {
    const { json: { update_seq }} = await doReq(`${couchHost}/${dbName}`, {headers:{'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}`}})

    newSessionDoc = {
      _id: 'system:' + crypto.randomUUID(),
      sessionName: sessionName,
      org: org,
      email: email,
      title: `${email}${org ? ' (' + org + ')' : ''}`,
      created: Date.now(),
      stats,
      cf,
      app,
      loginCount: 0,
      type: 'session',
      startSeq: update_seq
      // user-agent, saveToDevice
    }
  }

  newSessionDoc.lastLogin = Date.now()
  newSessionDoc.loginCount++

  await doReq(`${couchHost}/${dbName}/${newSessionDoc._id}`, {
    method: 'PUT',
    body: newSessionDoc,
    headers: {
      'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}`
    }
  })

  return newSessionDoc._id
}
