import { getEnv } from '../lib/env.js'
// todo ensure gzip support!

const env = getEnv(['cloudantKey', 'cloudantSecret', 'cloudantDomain'])

export async function handler ({event, req, app}) {
    const url = 'https://' + env.cloudantDomain + '/' + req.url.href.split('_feed/')[1]

    const cloudantFeed = (await fetch(url, {
        headers: {
            Authorization: `Basic ${btoa(env.cloudantKey + ':' + env.cloudantSecret)}`
        }
    })).body.getReader()

    const { readable, writable } = new TransformStream()
    const encoder = new TextEncoder()
    // const decoder = new TextDecoder()
    const writer = writable.getWriter()

    async function processFeed () {
        const { done, value } = await cloudantFeed.read()
        writer.write(value)
        if (done) {
            return end()
        }
        processFeed()
    }
    processFeed()

    // setInterval(async () => {
    //     end()
    writer.write(encoder.encode(`id: _start\nevent: heartbeat\ndata: hi\nretry: 4500\n\n\n`)) //  ${JSON.stringify({})}
    // //   // console.log(done, decoder.decode(value))
    // }, 1000)
    // response.write('retry: 10000\n');

    function end () {
        readable.cancel()
        cloudantFeed.cancel()
    }

    return new Response(readable, {
        headers: {
            'content-type': 'text/event-stream',
            'server': 'feed-edge-worker'
        }
    })
}