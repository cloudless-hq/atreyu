import { urlLogger } from '../../lib/url-logger.js'
let cache
export default async function ({ key, event, url, corsConf }) {
  // console.time('get cache: ' + key)
  // whitelist?
  // rewrite
  // TODO: third party lib and cookie and request handling project

  if (!cache) {
    cache = await caches.open('ext-cache')
  }

  if (!key) {
    key = url.href
  }

  const cached = await caches.match(key)

  urlLogger({ scope: 'ext', method: event.request.method, url: url.href, cached: !!cached, corsConf })

  if (cached) {
    return cached
  }

  let res
  try {
    // TODO use whitelisting or THIRD SHIELD PROXY, headers, methods, cookies etc.

    if (corsConf.mode === 'proxy') {
      res = await fetch(corsConf.server + '?' + encodeURIComponent(url.href))

      if (res?.redirected) {
        if (res?.url.contains('cloudflareaccess.com/cdn-cgi')) {
          return new Response('Logged Out', { status: 307, headers: { location: '/atreyu/accounts?logout' } })
        }
        return new Response()
      }
      if (res?.ok) {
        event.waitUntil(cache.put(key, res.clone()))
      }

    } else {
      console.warn('implement non proxy cors mode')
    }
  } catch (e) {
    console.error('error caching request', e)
    res = new Response()
  }

  return res
}
