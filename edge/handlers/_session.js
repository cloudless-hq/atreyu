// import { authHeaders } from '../couchdb/helpers'
// import maybeSetupUser from './setup'
import { getEnv } from '/_env.js'
import doReq from '../lib/req.js'
// eslint-disable-next-line no-restricted-imports
import { escapeId } from '../../app/src/lib/helpers.js'

// auth_domain
const {
  _couchKey,
  _couchSecret,
  couchHost,
  env,
  folderHash,
  appName,
  workerd
} = getEnv([
  '_couchKey',
  '_couchSecret',
  'couchHost',
  'env',
  'folderHash',
  'appName',
  'workerd'
])

const authHeaders = { 'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}` }

const local = (typeof self !== 'undefined' && !!self.Deno) || workerd

// function setCookie (name, value, days) {
//     let d = new Date
//     d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days)
//     document.cookie = name + "=" + value + ";path=/; Expires=" + d.toGMTString()
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

export default async function ({ req, stats, app }) {
  let jwt
  if (local && !req.headers['cf-access-jwt-assertion']) {
    jwt = getCookie('CF_Authorization', req.headers['cookie'])
  } else {
    jwt = req.headers['cf-access-jwt-assertion']
  }

  let jwtPayload = {}
  if (jwt) {
    jwtPayload = JSON.parse(atob(jwt.split('.')[1]))
  }

  if (req.url.search.startsWith('?logout')) { // req.method === 'delete' for deletion session doc?
    const headers = { 'Cache-Control': 'must-revalidate' };

    let continueParam = ''
    if (req.query.continue && req.query.continue !== '/' && req.query.continue !== 'null' && req.query.continue !== 'undefined') {
      continueParam = '?continue=' + encodeURIComponent(req.query.continue)
    }

    if (jwtPayload.dev_mock) {
      headers['Location'] = `/_ayu/accounts/${continueParam}`
      headers['Set-Cookie'] = 'CF_Authorization=deleted; Path=/_api; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly'
    } else if (jwtPayload.email) {
      const base = `/_ayu/accounts/${continueParam}`
      headers['Location'] = `/cdn-cgi/access/logout?returnTo=${encodeURIComponent(req.url.origin + base)}`
      headers['Set-Cookie'] = 'CF_Authorization=deleted; Path=/_api; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly'
      headers['Set-Cookie'] = 'AYU_SESSION_ID=deleted; Path=/_api; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly'
    } else {
      headers['Location'] = `/_ayu/accounts/?login`
      // headers['Set-Cookie'] = 'CF_Authorization=deleted; Path=/_api; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly'
    }

    return new Response('', {
      status: 302,
      headers
    })
  }

  let curSessionId
  let curOrg
  if (local) {
    curSessionId = jwtPayload.sessionId
    curOrg = jwtPayload.org
  } else {
    const sessionId = getCookie('AYU_SESSION_ID', req.headers['cookie'])
    const sessionIdParts = (sessionId && sessionId.split('__')) || []

    curSessionId = sessionIdParts[0]
    curOrg = sessionIdParts[1]
  }

  const userAgent = req.headers['user-agent']
  let browserName
  if (userAgent.includes('Edg')) {
    browserName = 'Edge'
  } else if (userAgent.includes('Chrome')) {
    browserName = 'Chrome'
  } else if (userAgent.includes('Safari')) {
    browserName = 'Safari'
  } else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox'
  }

  const cf = { ...req.raw.cf, tlsClientAuth: undefined, tlsExportedAuthenticator: undefined, tlsCipher: undefined, clientTcpRtt: undefined, edgeRequestKeepAliveStatus: undefined, requestPriority: undefined, clientAcceptEncoding: undefined, tlsVersion: undefined, httpProtocol: undefined }

  const email = jwtPayload.email || local && req.query.email
  const appDbName =  email && 'ayu_app_' + (env === 'prod' ? escapeId(appName) : escapeId(env + '__' + appName))
  // const orgDbName = org ? 'ayu_org_' + (env === 'prod' ? escapeId(org) : escapeId(env + '__' + org)) : null
  const userDbName = email && 'ayu_user_' + (env === 'prod' ? escapeId(email) : escapeId(env + '__' + email))
  const userSettingsId = email && 'lanes:settings_' + escapeId(email)

  if (req.url.search.startsWith('?login')) {
    if (!jwtPayload.email && !req.query?.email) {
      return new Response('forbidden', { status: 403 })
    }

    // TODO: if already logged in, logout or error
    // https://<your-team-name>.cloudflareaccess.com/cdn-cgi/access/get-identity
    // name: Ja Joh, idp: Data from your identity provider, user_uuid: The ID of the user.

    const newSession = {
      email: local ? req.query.email : jwtPayload.email,
      useSessionId: local ? req.query.sessionId : curSessionId,
      userDbName,
      userSettingsId,

      // TODO: validate org and setup user/org association
      org: req.query.org,
      sessionName: req.query.sessionName,

      app,
      cf,
      browserName
    }

    let newSessionId
    if (couchHost) {
      newSessionId = await ensureSession(newSession, { appDbName })
    } else {
      newSessionId = 'ephemeral:' + crypto.randomUUID()
    }

    if (local) {
      // NOTE: deno local is a fake test login with zero validation!

      const devJwt = 'dev.' + btoa(JSON.stringify({
        dev_mock: true,

        email: newSession.email,
        org: newSession.org,
        sessionId: newSessionId
      }))

      return new Response(null, {
        status: 302,
        headers: {
          'Cache-Control': 'must-revalidate',
          'Location': req.query.continue || '/' ,
          'Set-Cookie': `CF_Authorization=${devJwt}; Path=/_api; Expires=Tue, 19 Jan 2038 04:14:07 GMT; HttpOnly` //  Version=1;
        }
      })
    }

    // is logged in after redirect back from cf access, just need to set session id cookie and redirect back
    return new Response(null, {
      status: 302,
      headers: {
        'Cache-Control': 'must-revalidate',
        'Set-Cookie': `AYU_SESSION_ID=${newSessionId}${newSession.org ? '__' + newSession.org : ''}; Path=/_api; HttpOnly; Secure; Expires=Tue, 19 Jan 2038 04:14:07 GMT`, // Version=1;
        'Location': req.query.continue || '/'
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
    org: curOrg,
    env,
    appName: app.appName,
    appHash: folderHash,

    userDbName,
    userSettingsId,

    sessionId: curSessionId,

    // roles: [],
    cf,
    browserName,

    expiry: jwtPayload.exp,
    issued: jwtPayload.iat,

    cfAccessUserId: jwtPayload.sub
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

async function ensureSession ({ userSettingsId, useSessionId, email, org, sessionName, app, cf, browserName, userDbName }) { // , { appDbName }
  let newSessionDoc

  if (useSessionId) {
    const { json: existingSessionDoc } = await doReq(`${couchHost}/${userDbName}/${useSessionId}`, {
      headers: authHeaders
    })
    if (existingSessionDoc) {
      // TODO: error if any value changed or doc is unavailable, validation
      newSessionDoc = existingSessionDoc
    }
  }

  if (!newSessionDoc) {
    let { json: { error, update_seq } } = await doReq(`${couchHost}/${userDbName}`, { headers: authHeaders })
      
    // Create new user with session
    if (error === 'not_found') {
      // generate integer user id
      const lanesUserId = Date.now() + Math.floor(Math.random() * 10000)

      // users db is currently only used to enforcy unique usernames
      const userRes = await doReq(`${couchHost}` + '/_users', {
        method: 'POST',
        body: {
          _id: 'org.couchdb.user:' + lanesUserId,
          name: `${lanesUserId}`,
          userDbName,
          created_at: Date.now(),
          updated_at: Date.now(),
          userSettingsId,
          // "password": "apple"
          roles: [],
          type: "user"
        },
        headers: authHeaders
      })

      // just crash and let user try again
      if (!userRes?.json?.ok) {
        throw new Error('errror reserving user id')
      }

      await doReq(`${couchHost}/${userDbName}`, {
        method: 'PUT',
        headers: authHeaders
      })
  
      await doReq(`${couchHost}/${userDbName}` + '/_security', {
        method: 'PUT',
        body: {
          admins: {
            names: [],
            roles: []
          },
          members: {
            names: [], // lanesUserId
            roles: []
          }
        },
        headers: authHeaders
      })

      // TODO use couch username conversion Buffer.from(prefixedHexName.replace('userdb-', ''), 'hex').toString('utf8')
      // 'userdb-' + Buffer.from(name).toString('hex');
      const username = email.split('@')[0]

      // split username by any non-word character
      const wordParts = username.split(/\W+/)
      let initials
      if (wordParts.length > 1) {
        initials = (wordParts[0].slice(0, 1) + wordParts[1].slice(0, 1)).toUpperCase()
      } else {
        initials = username.slice(0, 2).toUpperCase()
      }

      await doReq(`${couchHost}/${userDbName}` + '/_bulk_docs', {
        method: 'POST',
        body: {
          docs: [
            {
                _id: userSettingsId,
                lanesUserId, // FIXME username is global unique per user
                username,
                name: username, // TODO: ask later? or ask at onboarding! + make unique on org level?
                initials,
                created_at: Date.now(),
                updated_at: Date.now(),
                time_zone: {
                  olson_name: "Europe/Helsinki", // TODO: send with onboarding name form data from client!
                  offset: "+02:00"
                }
            }
          ]
        },
        headers: authHeaders
      })
      
      // FIXME: setup replication from app db
      
     const retryRes = await doReq(`${couchHost}/${userDbName}`, { headers: authHeaders })
     update_seq = retryRes.json.update_seq
    }

    newSessionDoc = {
      _id: 'system:' + crypto.randomUUID(),
      sessionName: sessionName,
      org: org,
      email: email,
      title: `${email}${org ? ' (' + org + ')' : ''}`,
      created: Date.now(),
      cf,
      browserName,
      app,
      loginCount: 0,
      type: 'session',
      startSeq: update_seq
      // user-agent, saveToDevice
    }
  }

  newSessionDoc.lastLogin = Date.now()
  newSessionDoc.loginCount++

  await doReq(`${couchHost}/${userDbName}/${newSessionDoc._id}`, {
    method: 'PUT',
    body: newSessionDoc,
    headers: {
      'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}`
    }
  })

  return newSessionDoc._id
}
