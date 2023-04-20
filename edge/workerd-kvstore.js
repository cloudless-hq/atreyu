const ifpsGateway = 'http://127.0.0.1:'

export default {
  fetch (req, { env, kvStore }, { passThroughOnException, waitUntil }) {
    // https://fake-host/ closr_jan: QmdhULvNjqJ4YeoJwyu8ZQgyZJt1hjjAM7KK9ULZChcUNf%2Fipfs-map.json ?urlencoded=true
    // https://fake-host/ closr_jan: QmdhULvNjqJ4YeoJwyu8ZQgyZJt1hjjAM7KK9ULZChcUNf/ipfs-map.json ?urlencoded=true
    // https://fake-host/ closr_jan: QmVLjnR5yZDYXMnWxu6hxb5KvKegmnz8gMoSM5ipmJhjrn ?urlencoded=true &cache_ttl=604800

    // application octetstream
    // const res = await
    // console.log({ req, env, text: await res.clone().text(), headers: [...res.headers.entries()] })
    // return res
    return kvStore.fetch(req)
  }
}
