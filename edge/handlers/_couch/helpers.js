function hex (buffer) {
  const hexCodes = []
  const view = new DataView(buffer)
  for (let i = 0; i < view.byteLength; i += 4) {
    let value = view.getUint32(i)
    let stringValue = value.toString(16)
    let padding = '00000000'
    let paddedValue = (padding + stringValue).slice(-padding.length)
    hexCodes.push(paddedValue)
  }
  return hexCodes.join('')
}

async function hmacSignature (user) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(COUCHDB_TOKEN),
    { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(user))
  return hex(mac)
}

export async function authHeaders ({ userId, headers }) {
  const newHeaders = new Headers(headers)
  newHeaders.set('Content-Type', 'application/json') // obsolete?
  newHeaders.set('X-Auth-CouchDB-Roles', userId === '_admin' ? '_admin' : '')
  newHeaders.set('X-Auth-CouchDB-Username', userId)
  newHeaders.set('X-Auth-CouchDB-Token', await hmacSignature(userId))
  return newHeaders
}