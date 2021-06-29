import { serve } from 'deno/http/server.ts'

const jsWorker = new Worker('./test-worker.js', { type: 'module' })

jsWorker.onmessage = async (e) => {
  console.log('received:')
  console.log(e)
}

const s = serve({ port: 80 })

const body = new TextEncoder().encode('Hello World 1\n')

console.log('\nrunning at: http://dev.local.ask-joe.co')

jsWorker.postMessage('hello')

for await (const req of s) {
  console.log(req)
  req.respond({ body })
}