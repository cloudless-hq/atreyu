const ipfsGateway = 'http://127.0.0.1:8080/ipfs/'

export default {
  async fetch (req, { kvStore }, { waitUntil }) {
    // console.log({ req, env, text: await res.clone().text(), headers: [...res.headers.entries()] })

    // https://fake-host/appName_envName:QmdhULvNjqJ4YeoJwyu8ZQgyZJt1hjjAM7KK9ULZChcUNf%2Fipfs-map.json?urlencoded=true&cache_ttl=604800
    const url = new URL(req.url)
    const { urlencoded, ttl } = new URLSearchParams(url.search)

    const path = urlencoded ? decodeURIComponent(url.pathname).split(':').pop() : url.pathname.split(':').pop()

    // console.log(ipfsGateway + path, urlencoded, url.search)
    // > application octetstream

    try {
      const res = await fetch(ipfsGateway + path) // kvStore.fetch(req)
      // console.log(res)
      return res
    } catch (err) {
      console.error(url, 'workerd kv store', err)
      return new Response('unexpected error', { status: 500 })
    }
  }
}
