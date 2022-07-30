import { getEnv } from '/$env.js'
import { fetchStream } from '../lib/http.js'

const env = getEnv(['_couchKey', '_couchSecret', '_couchHost'])


export async function handler ({event, req, app}) {
  const url = 'https://' + env._couchHost + '/' + req.url.href.split('_feed/')[1]

  const { readable, write } = await fetchStream(url, {
    headers: {
      Authorization: `Basic ${btoa(env._couchKey + ':' + env._couchSecret)}`
    }
  })

  // setInterval(async () => {
  //     end()
  write(`id: _start\nevent: heartbeat\ndata: hi\nretry: 4500\n\n\n`) //  ${JSON.stringify({})}
  // //   // console.log(done, decoder.decode(value))
  // }, 1000)
  // response.write('retry: 10000\n');

  return new Response(readable, {
    headers: {
      'content-type': 'text/event-stream',
      'server': 'feed-edge-worker'
    }
  })
}
