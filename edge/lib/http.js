/* global URL, fetch, Response, TransformStream */

export async function fetchAndStream (req, init) {
  let response = await fetch(req, init)

  let { readable, writable } = new TransformStream()
  streamBody(response.body, writable)
  return new Response(readable, response)
}

async function streamBody (readable, writable) {
  let reader = readable.getReader()
  let writer = writable.getWriter()

  // let encoder = new TextEncoder()
  // await writer.write(encoder.encode(' test '))

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    await writer.write(value)
  }

  await writer.close()
}

export async function bodyParser ({ event, clone }) {
  if (event.request.method !== 'POST' && event.request.method !== 'PUT') {
    return {}
  }
  let req

  if (clone) {
    req = event.request.clone()
  } else {
    req = event.request
  }

  const contentType = req.headers.get('content-type')
  if (contentType === 'application/json') {
    let text
    let ret
    try {
      text = await req.text()
      ret = JSON.parse(text)
    } catch (err) {
      ret = { error: 'invalid json', text }
    }
    return { parsedBody: ret, body: text }
  }
  if (contentType === 'application/x-www-form-urlencoded') {
    const body = await req.text()
    const bodyParts = body.split('&')
    const bodyObj = {}
    bodyParts.forEach(part => {
      let i = part.indexOf('=')
      let key = part.substring(0, i)
      let value = part.substring(i + 1)
      bodyObj[key] = decodeURIComponent(value.replace(/\+/g, ' '))
    })
    bodyObj.raw = body
    return { parsedBody: bodyObj, body }
  }
  const text = await req.text()
  return (text && text.length > 0) ? { text, body: text } : {}
}

export function parseReq (req) {
  const url = new URL(req.url)
  const reqHeaders = [...req.headers]
  const reqHeaderObj = {}
  reqHeaders.forEach(ent => {
    reqHeaderObj[ent[0]] = ent[1]
  })

  return {
    raw: req,
    method: req.method,
    headers: reqHeaderObj,
    url
  }
}

// TODO: security Headers
// 'X-Frame-Options' : 'DENY',
// 'X-Xss-Protection' : '1; mode=block',
// 'X-Content-Type-Options' : 'nosniff',
// 'Referrer-Policy' : 'strict-origin-when-cross-origin',
// 'Feature-Policy' : 'camera 'none'; geolocation 'none'; microphone 'none''

// TODO: Link: '</http2_push/h2p/test.css>; rel=preload;',