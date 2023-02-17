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

const capitalizaations = {
  'partitioned': 'Partitioned',
  'httponly': 'HttpOnly',
  'secure': 'Secure',
  'priority': 'Priority',
  'version': 'Version',
  'samesite': 'SameSite',
  'domain': 'Domain',
  'max-age': 'Max-Age',
  'comment': 'Comment',
  'path': 'Path'
}
export function renderSetCookieString (cookie) {
  let cookieStr = `${cookie.name}=${cookie.value}`

  Object.entries(cookie).forEach(([key, val]) => {
    if (key === 'value' || key === 'name') {
      return
    }
    if (val === true) {
      cookieStr += `; ${capitalizaations[key] || key}`
    } else {
      cookieStr += `; ${capitalizaations[key] || key}=${val}`
    }
  })

  return cookieStr
}

export function setCookieParser (cookie) {
  const cookies = [ {} ]

  cookie.split(';').forEach(part => {
    parseCookiePart(part, cookies)
  })

  return cookies
}

function parseCookiePart (part, cookies) {
  const normalized = part.trim().toLowerCase()
  const current = cookies[cookies.length - 1]

  if (normalized.startsWith(',')) {
    cookies.push({})
    parseCookiePart(part.trim().slice(1), cookies)
  } else if (normalized.startsWith('expires')) {
    // val can have , but no =
    const equalParts = part.split('=')
    if (equalParts.length === 2) {
      current.expires = equalParts[1].trim()
    } else {
      equalParts.shift() // shift away ['expires', ...]
      const commaParts = equalParts.shift().split(',')
      const nextKey = commaParts.pop()
      current.expires = commaParts.join(',').trim()

      parseCookiePart(',' + nextKey + '=' + equalParts.join('='), cookies)
    }
  } else {
    for (const flag of ['partitioned', 'httponly', 'secure']) {
      if (normalized.startsWith(flag)) {
        current[flag] = true

        if (normalized.length > flag.length) {
          parseCookiePart(part.trim().slice(flag.length), cookies)
        }
        return
      }
    }

    for (const noCommaValueKey of ['priority', 'version', 'samesite', 'domain', 'max-age', 'comment', 'path']) {
      // FIXME: comment and path are not guaranteed comma free
      if (normalized.startsWith(noCommaValueKey)) {
        let noCommaValue
        let restPart
        if (normalized.includes(',')) {
          const commaParts = part.split(',')
          noCommaValue = commaParts.shift().split('=')[1].trim()
          restPart = ',' + commaParts.join(',')
        } else {
          noCommaValue = part.split('=')[1].trim()
        }
        current[noCommaValueKey] = noCommaValue

        if (restPart) {
          parseCookiePart(restPart, cookies)
        }
        return
      }
    }

    // FIXME: only using ', ' for cookie separation of main value, this might not always work on bad servers
    const equalParts = part.split('=')
    if (equalParts.length === 2) {
      current.value = equalParts[1].trim()
      current.name = equalParts[0].trim()
    } else {
      const key = equalParts.shift().trim()

      const commaParts = equalParts.join('=').split(', ')

      if (commaParts.length === 1) {
        current.value = equalParts.join('=').trim()
        current.name = key
      } else {
        current.value = commaParts.shift().trim()
        current.name = key
        parseCookiePart(', ' + commaParts.join(', '), cookies)
      }
    }
  }
}
