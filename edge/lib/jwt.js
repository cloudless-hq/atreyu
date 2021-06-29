/* global crypto, TextEncoder, atob, fetch */
let certs = null
const tokenCache = {}

export async function decode (token) {
  if (tokenCache[token] && tokenCache[token].payload.exp * 1000 > Date.now()) {
    return tokenCache[token]
  }

  if (!certs) {
    certs = await (await fetch('https://cloudless.cloudflareaccess.com/cdn-cgi/access/certs')).json()
  }

  const parts = token.split('.')
  const header = JSON.parse(atob(parts[0]))
  const payload = JSON.parse(atob(parts[1]))

  const signature = atob(parts[2].replace(/_/g, '/').replace(/-/g, '+'))
  const finalSignature = new Uint8Array(Array.from(signature).map(c => c.charCodeAt(0)))

  const encoder = new TextEncoder()
  const data = encoder.encode([parts[0], parts[1]].join('.'))

  const key = certs.keys.find(key => key.kid === header.kid)
  const importedKey = await crypto.subtle.importKey(
    'jwk',
    key,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    [ 'verify' ]
  )

  const validToken = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', importedKey, finalSignature, data)
  const valid = validToken && payload.exp * 1000 > Date.now()
  const ret = {
    valid,
    payload
  }

  if (valid) {
    tokenCache[token] = ret
  }
  return ret
}
