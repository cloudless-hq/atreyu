const SENTRY_PROJECT_ID = '5168154'
const SENTRY_KEY = '<sentry key>'
const APP = '<app name>'
const ENV = 'dev'
const RELEASE = '0000aaaa1111bbbb2222cccc3333dddd'
const TAGS = { app: APP }
const SERVER_NAME = `${APP}-${ENV}`
const CLIENT_NAME = 'atreyu-cf-sentry'
const CLIENT_VERSION = '0.1.0'

export default (ex, request) => {
  const sentryUrl = `https://sentry.io/api/${SENTRY_PROJECT_ID}/store/`

  return fetch(sentryUrl, {
    body: JSON.stringify(toSentryEvent(ex, request)),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Sentry-Auth': [
        'Sentry sentry_version=7',
        `sentry_client=${CLIENT_NAME}/${CLIENT_VERSION}`,
        `sentry_key=${SENTRY_KEY}`
      ].join(', ')
    }
  })
}

// rest of file from https://github.com/bustle/cf-sentry, apache 2.0
function toSentryEvent (err, request) {
  const errType = err.name || (err.contructor || {}).name
  const frames = parse(err)
  const extraKeys = Object.keys(err).filter(key => !['name', 'message', 'stack'].includes(key))

  return {
    event_id: uuidv4(),
    project: SENTRY_PROJECT_ID,
    message: errType + ': ' + (err.message || '<no message>'),
    logger: 'javascript',
    exception: {
      values: [
        {
          type: errType,
          value: err.message,
          stacktrace: frames.length ? { frames: frames.reverse() } : undefined,
        }
      ]
    },
    extra: extraKeys.length
      ? {
          [errType]: extraKeys.reduce((obj, key) => ({ ...obj, [key]: err[key] }), {})
        }
      : undefined,
    tags: TAGS,
    platform: 'javascript',
    environment: ENV,
    server_name: SERVER_NAME,
    timestamp: Date.now() / 1000,
    request:
      request && request.url
        ? {
            method: request.method,
            url: request.url,
            query_string: request.query,
            headers: request.headers,
            data: request.body
          }
        : undefined,
    release: RELEASE
  }
}

function parse (err) {
  return (err.stack || '')
    .split('\n')
    .slice(1)
    .map(line => {
      if (line.match(/^\s*[-]{4,}$/)) {
        return { filename: line }
      }

      const lineMatch = line.match(/at (?:(.+)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/)
      if (!lineMatch) {
        return
      }

      return {
        function: lineMatch[1] || undefined,
        filename: lineMatch[2] || undefined,
        lineno: +lineMatch[3] || undefined,
        colno: +lineMatch[4] || undefined,
        in_app: lineMatch[5] !== 'native' || undefined,
      }
    })
    .filter(Boolean)
}

function uuidv4 () {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  return [...bytes].map(b => ('0' + b.toString(16)).slice(-2)).join('') // to hex
}
