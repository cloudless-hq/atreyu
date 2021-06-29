/* global caches, addEventListener */
import falcorHandler from 'falcor-server'
import urlLogger from 'url-logger'
// import jwt from './jwt'

// TODO: handle background sync and push notifications
console.log('%cservice worker started!', 'color:darkgreen')

addEventListener('fetch', event => {
  // {
  //   credentials: 'include',
  //   mode: 'no-cors'
  // }

  // const token = 'sdf'

  // alg: "RS256"
  // kid: "asdf"
  // type: JWT

  // iss: https://cloudless.cloudflareaccess.com
  // aud[0] === '<app id>'
  // email
  // exp expiration
  // iat issuance date
  // nonce session id "..."
  // sub: user id "..."

  // const tokenParts = token.split('.')
  // console.log([tokenParts[0], tokenParts[1]].map(part => JSON.parse(atob(part))))

  // RSASHA256(
  //   String.join([tokenParts[0], tokenParts[1]], '.'),
  // )
  // jwt.verifyJWT(token, 'secret', 'HS256', (err, isValid) => {
  //   console.log(isValid, err)
  // })
  // jwt.verifyJWT(token, 'nosecret', 'HS256', (err, isValid) => {
  //   console.log(isValid, err)
  // })
  // jwt.decodeJWT(token)
  // jwt.parseJWT(token)

  // jwt(token, certs).then(res => {
  //   console.log(res)
  // })

  urlLogger({ method: event.request.method, url: event.request.url })

  if (event.request.url.match(/\/falcor.+/)) {
    return event.respondWith(falcorHandler({ event }))
  }

  // event.respondWith(
  //   caches.match(event.request)
  //     .then(function(response) {
  //       // Cache hit - return response
  //       if (response) {
  //         return response;
  //       }
  //       return fetch(event.request);
  //     }
  //   )

  // const cachedResponse = await caches.match(event.request);
  //   if (cachedResponse) return cachedResponse;
  //
  //   // Else, use the preloaded response, if it's there
  //   const response = await event.preloadResponse;
  //   if (response) return response;
  //
  //   // Else try the network.
  //   return fetch(event.request)

  // event.respondWith(async function() {
  //    // We're going to build a single request from multiple parts.
  //    const parts = [
  //      // The top of the page.
  //      caches.match('/article-top.include'),
  //      // The primary content
  //      fetch(includeURL)
  //        // A fallback if the network fails.
  //        .catch(() => caches.match('/article-offline.include')),
  //      // The bottom of the page
  //      caches.match('/article-bottom.include')
  //    ];
  //
  //    // Merge them all together.
  //    const {done, response} = await mergeResponses(parts);
  //    // Wait until the stream is complete.
  //    event.waitUntil(done);
  //    // Return the merged response.
  //    return response;
  //  }())
})

addEventListener('install', event => {
  console.log('worker installed')
  // event.waitUntil(
  //   caches.open(CACHE_NAME)
  //     .then(function(cache) {
  //       console.log('Opened cache')
  //       return cache.addAll(urlsToCache)
  //     })
})

addEventListener('activate', event => {
  // event.waitUntil(async function () {
  //   if (registration.navigationPreload) {
  //     await registration.navigationPreload.enable()
  //   }
  // }())

  console.log('new worker activation')

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('deleting cache' + cacheName)
          return caches.delete(cacheName)
        })
      )
    })
  )
})
