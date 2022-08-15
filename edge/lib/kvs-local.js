const devCache = {}

const devKV = {
  // TODO: NOT implemented yet clone array buffer etc. for later use devCache[key] = { value, metadata }
  put: async (key, value, metadata = {}) => {},
  get: (key) => devCache[key] ? devCache[key].value : null,
  getWithMetadata: (key) => devCache[key] ? devCache[key] : { value: null, metadata: null }
}

export function getKvStore (name) {
  // if (!self[name]) {
  // console.warn('using in memory kv fallback for dev')
  return devKV
  // }
  // return self[name]
}

// async function handleRequest(request) {
//   event.waitUntil(namespace.put('first-key', stats));
//   const value = await namespace.get('first-key', 'json')
//   if (value === null) {
//     return new Response('Value not found', {status: 404})
//   }
//   return new Response(value)
// }
// return event.respondWith(handleRequest(event.request))
