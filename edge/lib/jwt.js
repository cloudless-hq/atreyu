/* global crypto, TextEncoder, atob, fetch */
const keys = {}
let certs = null
const tokenCache = {}

export async function decode (token) {
  if (tokenCache[token] && tokenCache[token].payload.exp * 1000 > Date.now()) {
    return tokenCache[token]
  }
  
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return { valid: false, payload: null }
  }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token structure' }
    }

    const header = JSON.parse(atob(parts[0]))
    const payload = JSON.parse(atob(parts[1]))

    if (!payload.iss || !payload.aud || !payload.sub || !payload.exp || !payload.iat) {
      return { valid: false, error: 'Missing required claims' }
    }

    const now =  Math.floor(Date.now() / 1000)
    if (payload.iat > now + 300) { // 5 min clock skew allowance
      return { valid: false, error: 'Invalid iat claim' }
    }
    if (payload.exp <= now) {
      return { valid: false, error: 'Token expired' }
    }
    if (payload.nbf && payload.nbf > now) {
      return { valid: false, error: 'Token not yet valid' }
    }

    // Validate issuer
    if (payload.iss !== 'https://lanespm.cloudflareaccess.com') {
      return { valid: false, error: 'Invalid issuer' }
    }

    if (!keys[header.kid]) {
      if (!certs) {
        certs = await (await fetch('https://lanespm.cloudflareaccess.com/cdn-cgi/access/certs')).json()
      }

      const key = certs.keys.find(key => key.kid === header.kid)
      if (!key) {
        return { valid: false, error: 'Key not found' }
      }
      keys[header.kid] = await crypto.subtle.importKey(
        'jwk',
        key,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256'
        },
        false,
        [ 'verify' ]
      )
    }

    const signature = atob(parts[2].replace(/_/g, '/').replace(/-/g, '+'))
    const finalSignature = new Uint8Array(Array.from(signature).map(c => c.charCodeAt(0)))

    const encoder = new TextEncoder()
    const data = encoder.encode([parts[0], parts[1]].join('.'))

    const validToken = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', keys[header.kid], finalSignature, data)
    const valid = validToken
    const ret = {
      valid,
      payload
    }

    if (valid) {
      tokenCache[token] = ret
    }
    return ret
  } catch (e) {
    console.error(e)
    return { valid: false, payload: null }
  }
}
