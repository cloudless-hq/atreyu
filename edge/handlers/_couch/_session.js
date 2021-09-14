// import { authHeaders } from '../couchdb/helpers'
// import maybeSetupUser from './setup'
import { getEnv } from '../../lib/env.js'

const { env, userId } = getEnv([ 'env', 'userId'])
const orgId = 'igp'

// TODO: dont crash on unexpected cookies:
// function setCookie (name, value, days) {
//     let d = new Date
//     d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days)
//     document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString()
// }
// function getCookie (name) {
//     let v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)')
//     return v ? v[2] : null
// }
// function deleteCookie (name) { setCookie(name, '', -1) }

export async function handler ({ req, stats }) {
  let jwt
  if (env === 'dev' && !req.headers['cf-access-jwt-assertion'] && req.headers['cookie']) {
    jwt = req.headers['cookie'].split('=')[1]
  } else {
    jwt = req.headers['cf-access-jwt-assertion']
  }

  let payload = {}
  if (jwt) {
    payload = JSON.parse(atob(jwt.split('.')[1]))
  }

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

    return new Response(JSON.stringify({}), {
      status: 302,
      headers: {
        'Cache-Control': 'must-revalidate',
        'Location': `/atreyu/accounts?continue=${encodeURIComponent(params.get('continue'))}`,
        'Content-Type': 'application/json'
      }
    })
  } else if (req.url.search.startsWith('?dev_login')) {
    if (env !== 'dev') {
      return new Response('forbidden', { status: 403 })
    }
    const params = new URLSearchParams(req.url.search)
    const devJwt = 'dev.' + btoa(JSON.stringify({ email: userId }))

    return new Response(JSON.stringify({}), {
      status: 302,
      headers: {
        'Cache-Control': 'must-revalidate',
        'Location': params.get('continue') || '/' ,
        'Set-Cookie': `CF_Authorization=${devJwt}; Version=1; Path=/; HttpOnly`,
        'Content-Type': 'application/json'
      }
    })
  } else if (req.url.search.startsWith('?logout')) { // req.method === 'delete' ||
    const params = new URLSearchParams(req.url.search)

    return new Response(JSON.stringify({}), {
      status: 302,
      headers: {
        'Cache-Control': 'must-revalidate',
        'Location': env === 'dev' ? `/atreyu/accounts${params.get('continue') ? '?continue=' + encodeURIComponent(params.get('continue')) : ''}` : `https://${orgId}.cloudflareaccess.com/cdn-cgi/access/logout?returnTo=${req.url.origin}`,
        'Set-Cookie': 'CF_Authorization=; Version=1; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
        'Content-Type': 'application/json'
      }
    })
  }

  // const dbUrl = `${dbHost}/user_${userId}`
  // const sessionsUrl = `${dbUrl}/_design/ntr/_view/lastSeen_by_userId?reduce=false`
  // const sessions = await fetch(sessionsUrl, {
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
