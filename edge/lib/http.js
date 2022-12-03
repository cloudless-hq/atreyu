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
  // const decoder = new TextDecoder()

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

export async function bodyParser (request, { clone } = {}) {
  let req

  if (clone) {
    req = request.clone()
  } else {
    req = request
  }

  const contentType = req.headers.get('content-type')
  if (contentType === 'application/json' || contentType === 'application/csp-report') {
    let text
    let ret
    try {
      text = await req.text()
      ret = JSON.parse(text)
    } catch (_err) {
      ret = { error: 'invalid json', text }
    }
    return { parsedBody: ret, text }
  }
  if (contentType === 'application/x-www-form-urlencoded') {
    const text = await req.text()
    const bodyParts = text.split('&')
    const bodyObj = {}
    bodyParts.forEach(part => {
      const i = part.indexOf('=')
      const key = part.substring(0, i)
      const value = part.substring(i + 1)
      bodyObj[key] = decodeURIComponent(value.replace(/\+/g, ' '))
    })

    return { parsedBody: bodyObj, text }
  }
  const text = await req.text()

  return { text }
}

// TODO: security Headers
// 'X-Frame-Options' : 'DENY',
// 'X-Xss-Protection' : '1; mode=block',
// 'X-Content-Type-Options' : 'nosniff',
// 'Referrer-Policy' : 'strict-origin-when-cross-origin',
// 'Feature-Policy' : 'camera 'none'; geolocation 'none'; microphone 'none''

// TODO: Link: '</http2_push/h2p/test.css>; rel=preload;',
// todo ensure gzip support!
