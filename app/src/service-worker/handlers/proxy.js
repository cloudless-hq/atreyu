// eslint-disable-next-line no-restricted-imports
import { urlLogger } from '../../lib/url-logger.js'
// let cache
export default async function ({ req, _key, event }) {
  // console.time('get cache: ' + key)
  // whitelist?
  // rewrite
  // TODO: third party lib and cookie and request handling project

  // if (!cache) {
  //   cache = await caches.open('ext-cache')
  // }

  // if (!key) {
  //   key = req.url.href
  // }

  const cached = false // await caches.match(key)

  urlLogger({ scope: 'ext', method: event.request.method, url: req.url.href, cached: !!cached })

  // if (cached) {
  //   return cached
  // }

  let res
  try {
    // TODO use whitelisting or THIRD SHIELD PROXY, headers, methods, cookies etc.
    if (req.url.origin !== location.origin) {
      req.headers['forwarded'] = `host=${req.url.host}; proto=${req.url.protocol}; port=${req.url.port}`
      req.url.host = location.host
      req.url.protocol = location.protocol
      req.url.port = location.port
    }
    req.headers['x-via'] = 'ayu-sw-proxy'
    res = await fetch(req.url.href, { body: req.body, method: req.method, headers: req.headers, redirect: 'manual' })

    // console.log(res)
    if (res?.redirected) {
      // console.log(res?.url)
      if (res?.url?.contains?.('cloudflareaccess.com/cdn-cgi')) {
        return new Response('Logged Out', { status: 307, headers: { location: '/atreyu/accounts?logout' } })
      }
      // return new Response('Redirect Error', {status: 500})
    }
    if (res.type === 'opaqueredirect') {
      console.log('forwarding opaque redirect to window')
    } else if (!res?.ok) {
      console.error(req.url.href, res)
    } else {
      // event.waitUntil(cache.put(key, res.clone()))
    }
  } catch (err) {
    console.error('sw request request error', err)
    res = new Response('Error', { status: 500 })
  }

  return res
}
