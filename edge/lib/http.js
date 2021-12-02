// const msg = new TextEncoder().encode("data: hello\r\n")
//   let timerId: number | undefined
//   const body = new ReadableStream({
//     start(controller) {
//       timerId = setInterval(() => {
//         controller.enqueue(msg)
//       }, 1000)
//     },
//     cancel() {
//       if (typeof timerId === "number") {
//         clearInterval(timerId)
//       }
//     },
//   });
//   return new Response(body, {
//     headers: {
//       "Content-Type": "text/event-stream"
//     }
//   })

export async function fetchStream (url, reqConf) {
  const response = await fetch(url, reqConf)
  if (!response.ok) {
    return { response }
  }
  const reader = response.body.getReader()

  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  async function write (data) {
    await writer.write(encoder.encode(data))
  }

  async function processFeed () {
    while (true) {
      const { done, value } = await reader.read()

      await writer.write(value) // await ?

      if (done) {
        if (!readable.locked) {
          await readable.cancel()
        }

        await reader.cancel()

        break
      }
    }
  }

  processFeed()

  // to wait for streaming end in calling code: await writer.close()
  // use response in calling code like this: return new Response(readable, response)
  return { response, readable, reader, writable, writer, write }
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
// todo ensure gzip support!