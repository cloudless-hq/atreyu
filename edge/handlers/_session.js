// import { authHeaders } from '../couchdb/helpers'
// import maybeSetupUser from './setup'
import { getEnv } from '../lib/env.js'

const { env, userId } = getEnv([ 'env', 'userId'])

export async function handler ({ req, stats, dbHost }) {
  if (req.search === '?login') {
    return new Response(JSON.stringify({}), {
      status: 302,
      headers: {
        'Cache-Control': 'must-revalidate',
        'Location': '/',
        'Set-Cookie': 'CF_Authorization=${jwt}; Version=1; Path=/; HttpOnly',
        'Content-Type': 'application/json'
      }
    })
  } else if (req.method === 'delete') {
    return new Response(JSON.stringify({}), {
      status: 302,
      headers: {
        'Cache-Control': 'must-revalidate',
        'Location': '/',
        'Set-Cookie': 'CF_Authorization=; Version=1; Path=/; HttpOnly',
        'Content-Type': 'application/json'
      }
    })
  }
  console.log([userId, env, req.headers])
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
    userId,
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
