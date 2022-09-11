import { getEnv } from '/_env.js'
const { _couchKey, _couchSecret, couchHost } = getEnv(['_couchKey', '_couchSecret', 'couchHost'])
export function handler ({ stats, app }) {
  // TODO: push couch metric to APM
  const newResponse = new Response(JSON.stringify({ stats, app }), {
    status: 200,
    statusText: 'OK',
    headers: {
      'content-type': 'application/json'
    }
  })

  return newResponse
}
