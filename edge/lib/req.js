import { getKvStore } from '../lib/kv-store.js'
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

    if (response.status === 200) {
      const resHeaders = Object.fromEntries(response.headers.entries())
      resHeaders['cache-status'] = 'edge; hit'

      wait(
        (async () => {
          await kvs.put(cacheKey, await response.clone().arrayBuffer(), {
            metadata: {
              status: response.status,
              statusText: response.statusText,
              headers: resHeaders
            }
          })
        })()
      )
    }
  }

  return response
}
