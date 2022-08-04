import { getEnv } from '/$env.js'
import { getKvStore } from '/$kvs.js'
import wait from '../lib/wait.js'
import { cachedReq } from '../lib/req.js'

const { IPFS_GATEWAY, env } = getEnv(['IPFS_GATEWAY', 'env'])

const ipfsGateway = IPFS_GATEWAY || 'http://127.0.0.1:8080'

let ipfsMaps = {}
const kvs = getKvStore('ipfs')

export async function handler ({ req, app }) {
  // TODO: header Server-Timing: miss, db;dur=53, app;dur=47.2
  // Cache-Status: CacheName; param; param=value; param..., CacheName2; param; param...
  // https://httptoolkit.tech/blog/status-targeted-caching-headers/
  let url = ''
  let ipfsPath
  let revalidate = false
  let disableCache = false
  let ipfsMap
  let reqHash
  // console.log(req.url.pathname)

  if (req.url.pathname.startsWith('/ipfs/')) {
    // TODO: support ipfs folder requests
    url = ipfsGateway + req.url.pathname
    reqHash = req.url.pathname.replace('/ipfs/', '')
    ipfsPath = req.url.pathname
  } else if (req.url.pathname.startsWith('/ayu@')) {
    if (req.url.pathname.startsWith('/ayu@latest')) {
      // return (new Response(JSON.stringify({ version: app.version, hash: app.rootFolderHash }), {
      //   status: 200,
      //   statusText: 'OK',
      //   headers: {
      //     'content-type': 'application/json'
      //   }
      // }))

      const folderPath = req.url.pathname.replace('/ayu@latest', '')

      reqHash = app.rootFolderHash + folderPath
      ipfsPath = `/ipfs/${reqHash}`
      url = ipfsGateway + ipfsPath
    } else {
      const pathArray = req.url.pathname.replace('/ayu@', '').split('/')
      const version = pathArray.shift()
      if (version === app.version) {
        reqHash = app.rootFolderHash + (pathArray.length ? '/' + pathArray.join('/') : '')
        ipfsPath = `/ipfs/${reqHash}`
        url = ipfsGateway + ipfsPath
      } else {
        // TODO: other version support
      }
    }
  } else {
    if (req.url.pathname.endsWith('/')) {
      req.url.pathname += 'index.html'
      disableCache = true
    } else if (!req.url.pathname) {
      req.url.pathname = '/index.html'
      disableCache = true
    } else if (
      req.url.pathname.startsWith('/atreyu/accounts') ||
      req.url.pathname.endsWith('/ipfs-map.json') ||
      req.url.pathname.endsWith('/service-worker.bundle.js')
    ) {
      disableCache = true
    }
    if (!ipfsMaps[app.Hash]) {
      const ipfsMapPath = '/ipfs/' + app.Hash + '/ipfs-map.json'
      ipfsMaps[app.Hash] = await kvs.get(ipfsMapPath, {type: 'json'})

      if (!ipfsMaps[app.Hash]) {
        try {
          ipfsMaps[app.Hash] = await (await fetch(ipfsGateway + ipfsMapPath, {headers: { 'user-agent': 'atreyu edge worker' } })).json()
        } catch (e) {
          console.log(e)
        }

        if (ipfsMaps[app.Hash]) {
          wait(kvs.put(ipfsMapPath, JSON.stringify(ipfsMaps[app.Hash])))
        }
      }
    }
    ipfsMap = ipfsMaps[app.Hash]

    const existingHash = req.headers['if-none-match']?.replaceAll('"', '').replace('W/', '')

    if (!ipfsMap?.[req.url.pathname] && !req.url.pathname.endsWith('/ipfs-map.json')) {
      return (new Response(null, { status: 404, statusText: 'Not Found'}))
    }

    if (!req.url.pathname.endsWith('/ipfs-map.json')) {
      if (ipfsMap[req.url.pathname] === existingHash) {
        return (new Response(null, { status: 304, statusText: 'Not Modified' }))
      } else {
        reqHash = ipfsMap[req.url.pathname]
      }
    }

    revalidate = true
    ipfsPath = `/ipfs/${app.Hash}${req.url.pathname}`
    url = ipfsGateway + ipfsPath // `/ipfs/${reqHash}`
  }

  let response
  if (req.url.pathname.endsWith('/ipfs-map.json')) {
    const bodyText = JSON.stringify(ipfsMaps[app.Hash])
    response = new Response(bodyText, {
      headers: {
        'content-type': 'application/json',
        'content-length': bodyText.length,
        // 'x-edge-cache-status': 'HIT'
        'cache-status': 'ipfs-edge; hit'
      }
    })
  } else {
    response = await cachedReq(url, 'ipfs', {cacheKey: reqHash})
  }

  if (!response.ok) {
    disableCache = true
  }

  let headers
  let contentType
  if (req.url.pathname.endsWith('.js')) {
    contentType = 'application/javascript'
  } else if (req.url.pathname.endsWith('.json')) {
    contentType = 'application/json'
  } else if (req.url.pathname.endsWith('.ts')) {
    contentType = 'application/typescript'
  }
  if (disableCache) {
    headers = new Headers({
      'content-type': contentType || response.headers.get('content-type'),
      'content-length': response.headers.get('content-length'),
      'etag': `"${reqHash}"`,
      'cache-control': 'public, must-revalidate, max-age=0',
      'x-ipfs-path': ipfsPath,
      'server': 'ipfs-edge-worker',
      // 'x-env': env,
      // 'x-edge-cache-status': response.headers.get('x-edge-cache-status') || 'MISS'
      'cache-status': response.headers.get('cache-status') || 'ipfs-edge; miss; stored'
    })
  } else if (revalidate) {
    headers = new Headers({
      'content-type': contentType || response.headers.get('content-type'),
      'content-length': response.headers.get('content-length'),
      'etag': `"${reqHash}"`,
      'cache-control': 'public, must-revalidate, max-age=' + (env === 'prod' ? 3 * 60 * 60 : 4), // prod 3h, other 4s
      'x-ipfs-path': ipfsPath,
      'server': 'ipfs-edge-worker',
      // 'x-env': env,
      // 'x-edge-cache-status': response.headers.get('x-edge-cache-status') || 'MISS'
      'cache-status': response.headers.get('cache-status') || 'ipfs-edge; miss; stored'
    })
  } else {
    headers = new Headers({
      'etag': `"${reqHash}"`,
      'content-type': contentType || response.headers.get('content-type'),
      'cache-control': 'public, max-age=29030400, immutable, private=Set-Cookie',
      'content-length': response.headers.get('content-length'),
      'last-modified': response.headers.get('last-modified'),
      'x-ipfs-path': ipfsPath,
      'server': 'ipfs-edge-worker',
      // 'x-env': env,
      // 'x-edge-cache-status': response.headers.get('x-edge-cache-status') || 'MISS'
      'cache-status': response.headers.get('cache-status') || 'ipfs-edge; miss; stored'
    })
  }

  return (new Response(await response.arrayBuffer(), {
    status: response.status,
    statusText: response.statusText,
    headers
  }))
}
