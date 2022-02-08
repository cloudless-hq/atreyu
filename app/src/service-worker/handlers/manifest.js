// this is for preloading, updating, and afterloading
// TODO: preloading support
//   const response = await event.preloadResponse;
//   if (response) return response;
//   // Else try the network.

// http://localhost:5012/api/v0/ls?arg=/ipfs/asdf/

let cache
export let manifest = {
  '/api/_session': '/api/_session',
  'integrity': null
}
let waiting = []

self.manifest = manifest

async function init () {
  console.log('cache init')
  manifest.integrity = 'refreshing...'
  // navigator.storage.estimate().then(e => {
  //   console.log(e)
  // })
  //   // return cache.addAll(manifest)
  // })
  // event.waitUntil(
  //   caches.keys().then(cacheNames => {
  //     // return Promise.all(
  //     //   cacheNames.map(cacheName => {
  //     //     console.log('deleting cache' + cacheName)
  //     //     return caches.delete(cacheName)
  //     //   })
  //     // )
  //   })
  // )
  return cache.match('/manifest.json')
  .then(res => res.json())
  .then(res => {
    manifest.integrity = res['manifest.json'].integrity
    return updatedCache(res)
  })
  .finally(() => {
    if (waiting.length > 0) {
      waiting.forEach(resolver => {
        resolver()
      })
      waiting = []
    }
    checkUpdt()
  })
}

function updatedCache (res) {
  let proms = []

  Object.entries(res).forEach(resource => {
    let cacheSrc = ''
    if (resource[1].src === 'index.html') {
      cacheSrc = ''
    } else {
      cacheSrc = resource[1].src
    }

    if (
      (cacheSrc !== 'service-worker.js') &&
      (cacheSrc !== 'manifest.json')
    ) {
      let cacheKey = resource[1].integrity

      proms.push(cache.match(cacheKey).then(cacheRes => {
        if (!cacheRes) {
          console.log('new: /' + cacheSrc)
          return fetch('/' + cacheSrc, { redirect: 'manual' }).then(freshRes => {
            return cache.put(cacheKey, freshRes)
            .then(() => {
              console.log('installed update: /' + cacheSrc)
            })
          })
        }
      }))
    } else if (manifest['/service-worker.js'] && manifest['/service-worker.js'] !== resource[1].integrity) {
      console.log('updating service worker...')
      registration.update()
    }

    manifest['/' + cacheSrc] = resource[1].integrity
  })

  return Promise.all(proms)
}

// if online
// TODO: transition to IPFS https://ipfs.io/api/v0/ls?arg=/ipns/ipfs.io/&headers=true&resolve-type=true&size=true
function checkUpdt () {
  let clone
  fetch('/manifest.json', { redirect: 'manual' }).then(res => {
    clone = res.clone()
    return res.json()
  })
  .then(res => {
    if (res['manifest.json'].integrity !== manifest.integrity) {
      cache.put('/manifest.json', clone)
      manifest.integrity = res['manifest.json'].integrity

      updatedCache(res)
      .then(() => {
        // console.log('prod mode manifest update check...')
        // setTimeout(function () {
        //   checkUpdt()
        // }, 3000)
      })
    }
    // else {
      // console.log('prod mode manifest update check...')
      // setTimeout(function () {
      //   checkUpdt()
      // }, 3000)
    // }
  })
  .catch(warning => {
    console.warn(warning)

    // setTimeout(function () {
    //   checkUpdt()
    // }, 5000)
  })
}

// function cleanCache () {
//
// }

export async function fileHandler ({ key, event, url }) {
  if (!cache) {
    cache = await caches.open('files')
  }

  if (manifest.integrity === 'refreshing...') {
    await new Promise((resolve) => { waiting.push(resolve) })
    // console.warn('TODO: implement pending requets while installing:')
    // console.warn(url.href)
    // return fetch(url.href.replace('files/', ''), { redirect: 'error' })
  }

  if (!manifest.integrity) {
    await init()
  }

  if (!key) {
    key = manifest[url.pathname.replace('files/', '')] || url.pathname.replace('files/', '')
  }

  const cached = await caches.match(key)
  // console.timeEnd('get cache: ' + key)

  urlLogger({ scope: 'files', method: event.request.method, url: event.request.url, cached: !!cached })

  if (cached) {
    return cached
  }

  const res = await fetch(url.href.replace('files/', ''), { redirect: 'manual' })

  if (res.status === 200) {
    event.waitUntil(cache.put(key, res.clone()))
  } else {
    console.warn({ err: 'unhandled res type', res, request: event.request })
  }

  return res
}
