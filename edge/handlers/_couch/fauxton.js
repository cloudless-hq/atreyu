/* global fetch, Headers, caches, Response */
const utils = 'https://storage.googleapis.com/cloudless-public/fauxton/release'

export default async function ({ req, event }) {
  let path = req.url.pathname.replace('/_utils', '')
  let search = req.url.serach ? req.url.serach : ''

  if (path === '/') {
    path = '/index.html'
  }

  async function refreshCache () {
    let response = await fetch(utils + path + search, event.request)

    if (response.status === 200) {
      const modifiedHeaders = new Headers({
        'etag': response.headers.get('etag'),
        'Content-Type': response.headers.get('Content-Type'),
        'Cache-Control': 'public; max-age=86400', // one day -> use content hash and immutable in the future
        'Content-Length': response.headers.get('Content-Length'),
        'date': response.headers.get('date'),
        'last-modified': response.headers.get('last-modified'),
        'cache-status': 'edge; hit'
      })

      const init = {
        status: 200,
        statusText: response.statusText,
        headers: modifiedHeaders
      }

      const cacheResponse = new Response(response.clone().body, init)
      event.waitUntil(caches.default.put(event.request, cacheResponse))
      return new Response(response.body, init)
    } else {
      return response
    }
  }
  let response = await caches.default.match(event.request)

  if (!response) {
    response = await refreshCache()
  } else {
    event.waitUntil(refreshCache())
  }

  return response
}
