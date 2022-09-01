// eslint-disable-next-line no-restricted-imports
import { urlLogger } from '../../lib/url-logger.js'

const ipfsMap = {
  app: { map: null, rootHash: null, inFlight: null },
  ayu: { map: null, rootHash: null, inFlight: null }
}

let cache = caches.open('ipfs').then(openedCache => cache = openedCache)

// TODO: make all offline avail. after finished initial page, cleanup unused ipfs hashes
export default async function ({ url, origUrl, event, ipfsGateway = '/'}) {
  const appPrefix = url.pathname.startsWith('/_ayu') ? 'ayu' : 'app'

  let contentTypeOverride = null
  const path = appPrefix === 'ayu' ? url.pathname.replace('/_ayu', '') : url.pathname
  // let loggedOut = false
  // const pathParts = path.split('/')
  // const fileName = pathParts[pathParts.length - 1]

  // TODO: move to edge proxy?
  if (path.endsWith('.js')) {
    contentTypeOverride = 'application/javascript'
  } else if (path.endsWith('.css')) {
    contentTypeOverride = 'text/css'
  } else if (path.endsWith('.ttf')) {
    contentTypeOverride = 'font/ttf'
  } else if (path.endsWith('.woff')) {
    contentTypeOverride = 'font/woff'
  } else if (path.endsWith('.woff2')) {
    contentTypeOverride = 'font/woff2'
  } else if (path.endsWith('.png')) {
    contentTypeOverride = 'image/png'
  }

  if (cache.then) {
    await cache
  }
  if (!ipfsMap[appPrefix].map || ipfsMap[appPrefix].inFlight || self.updating) {
    self.updating = false

    if (ipfsMap[appPrefix]?.inFlight) {
      await ipfsMap[appPrefix].inFlight
    } else {
      ipfsMap[appPrefix].inFlight = (async () => {
        const manifestName = appPrefix === 'ayu' ? '/_ayu/ipfs-map.json' : '/ipfs-map.json'
        let ipfsMapResponse

        ipfsMapResponse = await fetch(manifestName).catch(err => console.log('map get error: ', err))

        // if (ipfsMapResponse?.redirected) {
        //   ipfsMapResponse = null
        //   loggedOut = true
        //   return
        // }

        if (ipfsMapResponse?.ok) { // && !loggedOut
          cache.put(manifestName, ipfsMapResponse.clone())
        } else {
          ipfsMapResponse = await cache.match(manifestName)
        }

        ipfsMap[appPrefix].map = await ipfsMapResponse.json()
        const ipfsHash = ipfsMapResponse.headers.get('x-ipfs-path').split('/')[2]
        ipfsMap[appPrefix].rootHash = ipfsHash

        if (appPrefix === 'app') {
          self.ipfsHash = ipfsHash
        }

        ipfsMap[appPrefix].inFlight = null
      })()

      await ipfsMap[appPrefix].inFlight
    }
  }

  // if (loggedOut) {
  //   return new Response('Logged Out', { status: 307, headers: { location: '/_ayu/accounts?logout' } })
  // }

  const hash = ipfsMap[appPrefix].map[path]

  let match
  if (hash) {
    match = await cache.match(hash)
  }

  urlLogger({
    scope: 'ipfs',
    method: event.request.method,
    url: url.pathname + url.search + url.hash,
    origUrl: origUrl.pathname + origUrl.search + origUrl.hash,
    cached: !!match
  })

  if (match) {
    return match
  }

  if (hash) {
    const ifpsUrl = (ipfsGateway === '/' ? '' : ipfsGateway) + '/ipfs/' + ipfsMap[appPrefix].rootHash + path // hash // + `?filename=${fileName}`

    // TODO: make content type override not necessary with '/ipfs/appahsh/path' or filename.ext

    let response = await fetch(ifpsUrl)

    // if (response?.redirected) {
    //   return new Response('Logged Out', { status: 307, headers: { location: '/atreyu/accounts?logout' } })
    // }

    // FIXME: this is necessary until ipfs gateway get capable of custom content type hanling, they currently think 'xxx.svelte.js' is a text file, but js file type is necessray for js modules...

    if (response?.ok) {
      const headers = new Headers({
        'content-type': contentTypeOverride ? contentTypeOverride : response.headers.get('content-type'),
        'content-length': response.headers.get('content-length'),
        'date': response.headers.get('date'),
        'etag': `"${hash}"`,
        'cache-control': 'public, must-revalidate, max-age=2',
        'x-ipfs-path': '/ipfs/' + hash,
        'cache-status': 'sw-cache; miss'
      })

      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      })

      // const etag = response.headers.get('etag').replace(/"/g, '')
      // if (etag !== hash) {
      //   console.warn('ipfs hash inconsistency for ' + path + ' ' + etag + ' ' + hash)
      // }
      const clone = response.clone()
      clone.headers.set('cache-status', 'sw-cache; hit; stored')
      cache.put(hash, clone)
    }

    return response
  }

  return new Response(' Missing: ' + path, { status: 404 })
}
