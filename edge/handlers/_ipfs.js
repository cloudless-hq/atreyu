import { getEnv } from '/_env.js'
import { getKvStore } from '/_kvs.js'
import doReq from '../lib/req.js'

const { IPFS_GATEWAY, env, appPath, appName } = getEnv(['IPFS_GATEWAY', 'env', 'appPath', 'appName'])

// appPath only set in local develpemnt, but not in cloudflare
const ipfsGateway = IPFS_GATEWAY || (appPath ? 'http://127.0.0.1:8080' : 'https://cloudless.mypinata.cloud')

const ipfsMaps = {}
const kvs = getKvStore('ipfs')

export async function handler ({ req, app, waitUntil }) {
  // TODO: header Server-Timing: miss, db;dur=53, app;dur=47.2
  // Cache-Status: CacheName; param; param=value; param..., CacheName2; param; param...
  // https://httptoolkit.tech/blog/status-targeted-caching-headers/
  let url = ''
  let ipfsPath
  let revalidate = false
  let disableCache = false

  const pinName = env === 'prod' ? appName : appName + '_' + env
  let kvPrefix = req.url.pathname.startsWith('/_ayu') ? 'ayu:' : pinName + ':'

  let ipfsMap
  let reqHash
  let ipfsMapCacheStatus = ''

  let appHash = req.url.pathname.startsWith('/_ayu') ? app.ayuHash : app.Hash
  let path = req.url.pathname.startsWith('/_ayu') ? req.url.pathname.replace('/_ayu', '') : req.url.pathname

  if (path.startsWith('/ayu@')) {
    if (path.startsWith('/ayu@latest')) {
      // return (new Response(JSON.stringify({ version: app.version, hash: app.rootFolderHash }), {
      //   status: 200,
      //   statusText: 'OK',
      //   headers: {
      //     'content-type': 'application/json'
      //   }
      // }))

      const folderPath = path.replace('/ayu@latest', '')

      reqHash = app.rootFolderHash + folderPath
      ipfsPath = `/ipfs/${reqHash}`
      url = ipfsGateway + ipfsPath
    } else {
      const pathArray = path.replace('/ayu@', '').split('/')
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
    if (path.startsWith('/ipfs/')) {
      // TODO: support ipfs folder requests
      const maybeHash = path.replace('/ipfs/', '')
      const ipfsPathParts = maybeHash.split('/')
      if (ipfsPathParts.length === 1) {
        reqHash = ipfsPathParts[0]
        url = ipfsGateway + path
        ipfsPath = path
      } else {
        // get ipfsmap, get hash
        const folderHash = ipfsPathParts[0]
        if (folderHash === app.ayuHash) {
          kvPrefix = 'ayu:'
          appHash = app.ayuHash
          path = path.replace(`/ipfs/${folderHash}`, '')
        } else if (folderHash === app.Hash) {
          path = path.replace(`/ipfs/${folderHash}`, '')
        } else {
          return new Response('Root hash not pinned, please update your application', { status: 404, statusText: 'Not Found' })
        }
      }
    }

    if (!reqHash) {
      if (path.endsWith('/')) {
        path += 'index.html'
      } else if (!path) {
        path = '/index.html'
      }

      if (
        path.endsWith('/index.html') ||
        path.endsWith('/ipfs-map.json') ||
        path.endsWith('/service-worker.bundle.js') ||
        req.url.pathname.startsWith('/_ayu/accounts')
      ) {
        disableCache = true
      }

      if (!ipfsMaps[appHash]) {
        const ipfsMapPath = appHash + '/ipfs-map.json'
        ipfsMaps[appHash] = await kvs.get(kvPrefix + ipfsMapPath, {type: 'json'})

        if (!ipfsMaps[appHash]) {
          ipfsMapCacheStatus = 'edge-mem; miss; stored, edge-kv; miss; stored'
          const { json: mapReq, error, ok, status } = await doReq(ipfsGateway + '/ipfs/' + ipfsMapPath)

          if (!ok) {
            console.error({ error, status, path: ipfsMapPath, ipfsGateway })
            ipfsMaps[appHash] = {}
          } else {
            ipfsMaps[appHash] = mapReq
          }

          if (ipfsMaps[appHash]) {
            waitUntil(kvs.put(kvPrefix + ipfsMapPath, JSON.stringify(ipfsMaps[appHash])))
          }
        } else {
          ipfsMapCacheStatus = 'edge-mem; miss; stored, edge-kv; hit'
        }
      } else {
        ipfsMapCacheStatus = 'edge-mem; hit'
      }
      ipfsMap = ipfsMaps[appHash]
      // console.log({ipfsMap, appHash, hash: app.Hash})

      const existingHash = req.headers['if-none-match']?.replaceAll('"', '').replace('W/', '')

      if (!ipfsMap?.[path] && !path.endsWith('/ipfs-map.json')) {
        return (new Response(null, { status: 404, statusText: 'Not Found'}))
      }

      if (!path.endsWith('/ipfs-map.json')) {
        // TODO: we can also 304 uncahnged ipfs maps + need to poll for hash update in ayu updater
        if (ipfsMap[path] === existingHash) {
          return (new Response(null, { status: 304, statusText: 'Not Modified', 'cache-status': 'browser-cache; hit' }))
        } else {
          reqHash = ipfsMap[path]
        }
      }

      revalidate = true
      ipfsPath = `/ipfs/${appHash}${path}`
      url = ipfsGateway + ipfsPath // `/ipfs/${reqHash}`
    }
  }

  let response
  if (path.endsWith('/ipfs-map.json')) {
    reqHash = appHash + '/ipfs-map.json'
    const bodyText = JSON.stringify(ipfsMaps[appHash])
    response = new Response(bodyText, {
      headers: {
        'content-type': 'application/json',
        'content-length': bodyText.length,
        'cache-status': ipfsMapCacheStatus
      }
    })
  } else {
    response = (await doReq(url, { cacheKey: kvPrefix + reqHash, cacheNs: 'ipfs', raw: true })).raw
  }

  if (!response.ok) {
    disableCache = true
  }

  let headers
  let contentType
  if (path.endsWith('.js')) {
    contentType = 'application/javascript'
  } else if (path.endsWith('.json')) {
    contentType = 'application/json'
  } else if (path.endsWith('.ts')) {
    contentType = 'application/typescript'
  }
  if (disableCache) {
    // TODO: But now that HTTP/1.1-conformant servers are widely deployed, there's no reason to ever use that max-age=0-and-must-revalidate combination — you should instead just use no-cache
    headers = new Headers({
      'content-type': contentType || response.headers.get('content-type'),
      'content-length': response.headers.get('content-length'),
      'etag': `"${reqHash}"`,
      'cache-control': 'public, must-revalidate, max-age=0',
      'x-ipfs-path': ipfsPath,
      'server': 'ipfs-edge-worker',
      'cache-status': response.headers.get('cache-status') || 'edge-kv; miss'
    })
  } else if (revalidate) {
    headers = new Headers({
      'content-type': contentType || response.headers.get('content-type'),
      'content-length': response.headers.get('content-length'),
      'etag': `"${reqHash}"`,
      'cache-control': 'public, must-revalidate, max-age=' + (env === 'prod' ? 3 * 60 * 60 : 4), // prod 3h, other 4s
      'x-ipfs-path': ipfsPath,
      'server': 'ipfs-edge-worker',
      'cache-status': response.headers.get('cache-status') || 'edge-kv; miss; stored'
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
      'cache-status': response.headers.get('cache-status') || 'edge-kv; miss; stored'
    })
  }

  return (new Response(await response.arrayBuffer(), {
    status: response.status,
    statusText: response.statusText,
    headers
  }))
}
