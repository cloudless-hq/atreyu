addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  const service = url.hostname.replace('.localhost', '')

  console.log(url)
  event.respondWith(new Response('Hello workerd!'))
  // if (self[service]?.fetch) {
  //   event.respondWith(self[service].fetch(event.request))
  // } else {
  //   event.respondWith(fetch(event.request))
  // }
})
