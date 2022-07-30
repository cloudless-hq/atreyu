import { urlLogger } from '../../lib/url-logger.js'

let ipfsMap
let inFlight
let cache = caches.open('ipfs').then(openedCache => cache = openedCache)

// TODO: make all offline avail. after finished initial page, cleanup unused ipfs hashes
export default async function ({ url, origUrl, event, ipfsGateway = '/'}) {
  let contentTypeOverride = null
  const path = url.pathname
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
  if (!ipfsMap || self.updating) {
    self.updating = false

    if (inFlight) {
      await inFlight
    } else {
      inFlight = (async () => {
        const manifestName = '/ipfs-map.json'
        let ipfsMapResponse
        try {
          ipfsMapResponse = await fetch(manifestName, { headers: {'Via': 'atreyu serviceworker'} })
        } catch (e) {
          console.log('map get error: ', e)
        }

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

        ipfsMap = await ipfsMapResponse.json()

        const ipfsPath = ipfsMapResponse.headers.get('x-ipfs-path').split('/')[2]

        self.ipfsHash = ipfsPath
        inFlight = null
      })()

      await inFlight
    }
  }

  // if (loggedOut) {
  //   return new Response('Logged Out', { status: 307, headers: { location: '/atreyu/accounts?logout' } })
  // }

  const hash = ipfsMap[path]

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
    const ifpsUrl = (ipfsGateway === '/' ? '' : ipfsGateway) + '/ipfs/' + hash // + `?filename=${fileName}`

    // TODO: make content type override not necessary with '/ipfs/appahsh/path' or filename.ext

    let response = await fetch(ifpsUrl, {
      headers: {'via': 'atreyu serviceworker'}
    })

    // if (response?.redirected) {
    //   return new Response('Logged Out', { status: 307, headers: { location: '/atreyu/accounts?logout' } })
    // }

    // FIXME: this is necessary until ipfs gateway get capable of custom content type hanling, they currently think 'xxx.svelte.js' is a text file, but js file type is necessray for js modules...

    if (response?.ok) {
      const headers = new Headers({
        'content-type': contentTypeOverride ? contentTypeOverride : response.headers.get('content-type'),
        'server': 'AtreyuServiceWorker',
        'content-length': response.headers.get('content-length'),
        'date': response.headers.get('date'),
        'etag': `"${hash}"`,
        'cache-control': 'public, must-revalidate, max-age=2',
        'x-ipfs-path': '/ipfs/' + hash,
        'cache-status': 'sw; miss'
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
      clone.headers.set('cache-status', 'sw; hit; stored')
      cache.put(hash, clone)
    }

    return response
  }

  return new Response('Forbidden or Missing: ' + path, {status: 500})
}
