/* global atob, fetch, Response */
import { authHeaders } from '../couchdb/helpers'
import maybeSetupUser from './setup'

export default async function ({ req, stats, email, userId, dbHost }) {
  const jwt = req.headers['cf-access-jwt-assertion']
  let payload = {}
  if (jwt) {
    payload = JSON.parse(atob(jwt.split('.')[1]))
  }

  const dbUrl = `${dbHost}/user_${userId}`
  const sessionsUrl = `${dbUrl}/_design/ntr/_view/lastSeen_by_userId?reduce=false`

  const sessions = await fetch(sessionsUrl, {
    method: 'GET',
    headers: await authHeaders({ userId })
  })

  const sessionsBody = await sessions.json()
  const setupRes = await maybeSetupUser({
    dbUrl,
    email,
    userId,
    sessionsBody
  })

  return new Response(JSON.stringify({
    userId,
    roles: [],
    email,
    country: req.headers['cf-ipcountry'],

    expiry: payload.exp,
    issued: payload.iat,

    setupRes,

    cfAccessSessionId: payload.nonce,
    cfAccessUserId: payload.sub,

    edgeVersion: stats.version,
    sessionDocs: sessionsBody.rows
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
