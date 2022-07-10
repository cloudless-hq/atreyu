import { getKvStore } from '$kvs.js'
import wait from '../lib/wait.js'

export async function cachedReq (url, ns, { cacheKey, headers = {} }) {
  if (!cacheKey) {
    cacheKey = url
  }

  const kvs = getKvStore(ns)

  let response = await kvs.getWithMetadata(cacheKey, { type: 'arrayBuffer' }) // todo: streams are faster for non binaries

  if (response?.value) {
    response = new Response(response.value, response.metadata)
  } else {
    response = await fetch(url, { headers })

    if (response.ok) {
      // const resHeaders = Object.fromEntries(response.headers.entries())
      // resHeaders['cache-status'] = 'edge; hit'

      wait(
        (async () => {
          await kvs.put(cacheKey, await response.clone().arrayBuffer(), {
            metadata: {
              status: response.status,
              statusText: response.statusText,
              headers:  {
                'content-type': response.headers.get('content-type'),
                'content-length': response.headers.get('content-length'),
                'last-modified': response.headers.get('last-modified'),
                'cache-status': 'edge; hit'
              }
            }
          })
        })()
      )
    }
  }

  return response
}
