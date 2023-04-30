import worker from '/_handler.js'
import paramsValidation from '/_validation.js'
import { getEnv } from '/_env.js'
import log from './lib/log.js'
import { bodyParser } from './lib/http.js'
import { getWait } from './lib/wait.js'
// import apm from './apm.js'

const {
  env,
  folderHash,
  appName,
  ayuVersion,
  rootFolderHash,
  ayuHash
} = getEnv([
  'env',
  'folderHash',
  'appName',
  'ayuVersion',
  'rootFolderHash',
  'ayuHash'
])

const app = {
  Hash: folderHash,
  rootFolderHash: rootFolderHash,
  ayuVersion: ayuVersion,
  ayuHash: ayuHash,
  appName: appName,
  env: env
}

const stats = {
  workerId: Math.round(Math.random() * 10000000000000),
  reqs: 0,
  workerStart: (new Date()).toISOString(),
  app
}

addEventListener('fetch', event => {
  const fetchStart = Date.now()

  stats.lastActive = (new Date()).toISOString()
  stats.reqs++

  const { waitUntil } = getWait(event)

  const url = new URL(event.request.url)
  const req = {
    raw: event.request,
    method: event.request.method,
    headers: Object.fromEntries(event.request.headers.entries()),
    query: Object.fromEntries(url.searchParams.entries()),
    url
  }

  if (req.headers['content-length']) {
    req.headers['content-length'] = parseInt(req.headers['content-length'], 10)
  }
  if (req.headers['Content-Length']) {
    req.headers['Content-Length'] = parseInt(req.headers['Content-Length'], 10)
  }

  const traceId = req.headers.traceparent || Math.round(Math.random() * 10000000000000)
  // used for logging subrequests without having to pass stats just for that, should be replaced with apm solution
  event._traceId = traceId
  event._stats = stats

  event.respondWith((async () => {
    try {
      const { parsedBody, text } = event.request.body ? await bodyParser(event.request, { clone: true }) : {}

      if (paramsValidation) {
        if (!paramsValidation({ headers: req.headers })) {
          return new Response(JSON.stringify(paramsValidation.errors), { status: 400, headers: { 'content-type': 'application/json' }})
        }
      }

      // TODO move req parsed data to req object props for fetch instead of adding it other way round to raw
      return (
        worker.fetch?.(event.request, self, { waitUntil, stats, app, req, parsedBody, text })
        || worker({ stats, app, req, parsedBody, text, event, waitUntil })
      )
        .then(response => {
          const duration = (Date.now() - fetchStart)
          waitUntil(log({ req, response, stats, body: text, duration, traceId }))
          // try {
          //   // FIXME: requests have immutable headers
          //   response.headers.set('server-timing', 'edge;dur=' + duration)
          // } catch (_e) {
          //   // console.log('header immutable', response, req.url.href)
          // }

          return response
        })
    } catch (ex) {
      // waitUntil(apm(ex, event.request))

      return new Response(ex.message || 'An error occurred', { status: ex.statusCode || 500 })
    }
  })())
})

// TODO: cloudflare independent security headers?
// Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
// Cross-Origin-Embedder-Policy: require-corp
// Cross-Origin-Opener-Policy: same-origin
// Cross-Origin-Resource-Policy: same-origin
// Origin-Agent-Cluster: ?1
// Referrer-Policy: no-referrer
// Strict-Transport-Security: max-age=15552000; includeSubDomains
// X-Content-Type-Options: nosniff
// X-DNS-Prefetch-Control: off
// X-Download-Options: noopen
// X-Frame-Options: SAMEORIGIN
// X-Permitted-Cross-Domain-Policies: none
// X-XSS-Protection: 0

// import { makeValidator } from './lib/schema.js'
// import { addPathTags } from '../app/src/schema/helpers.js'
// import { parse, match } from '../app/src/lib/routing.js'
// import defaultPaths from '../app/src/schema/default-routes.js'

// // TODO: use config and args from cli
// const ipfsGateway = 'http://127.0.0.1:8080'
// const ipfsApi = 'http://127.0.0.1:5001'
// async function getApps () {
//   return (await (await fetch(ipfsApi + '/api/v0/files/ls?arg=/apps&long=true', { method: 'POST' })).json()).Entries
// }

// // TODO: stat page for worker status etc.
//     const appName = localhostMatch.length > 1 ? localhostMatch[0] : repoName || cwd
//     const appKey = env === 'prod' ? appName : appName + '_' + env
//     apps = (await getApps()) || []
//     const app = apps.find(app => app.Name === appKey)
//     // console.log(app)
//     if (!app) {
//       return new Response('App not found ' + appKey, { status: 400, headers: { server: 'atreyu', 'content-type': 'text/plain' } })
//     }
//     const ayuHash = apps.find(app => app.Name === 'atreyu_dev').Hash // TODO only use dev for ayudev execution?
//     // TODO seperate local envs into processes
//     arg.req.raw.cf = cfData // should be set by reference but check

//     if (!appData[appKey]?.schema || appData[appKey].appHash !== app.Hash) {
//       try {
//         const schema = (await import(ipfsGateway + `/ipfs/${app.Hash}/schema/main.js`)).schema

//         if (typeof schema === 'function') {
//           appData[appKey] = { schema: schema({ defaultPaths, addPathTags }), appHash: app.Hash }
//         } else {
//           schema.paths = { ...defaultPaths, ...schema.paths }
//           appData[appKey] = { schema, appHash: app.Hash }
//         }
//       } catch (_err) {
//         console.warn(`  could not load schemas for ${appKey}, using defaults`)
//         // TODO: make generic fallback for cloudflare and local
//         appData[appKey] = {
//           schema: {
//             paths: {
//               '/*': {
//                 get: {
//                   tags: [ 'edge' ],
//                   operationId: '_ipfs'
//                 }
//               }
//             }
//           },
//           appHash: app.Hash
//         }
//       }

//       appData[appKey].edgeHandlers = parse(appData[appKey].schema, [ 'edge' ], makeValidator)
//     }

//     const {
//       operationId: workerName,
//       paramsValidation
//     } = match(req, appData[appKey].edgeHandlers) || {}

//     if (!workerName) {
//       console.warn(`${req.method} ${req.url}`)
//       return new Response('No matches found in schema: ' + appKey, { status: 400, headers: { server: 'atreyu', 'content-type': 'text/plain'} })
//     }

//     if (!appData[appKey].config) {
//       try {
//         appData[appKey].config = JSON.parse(Deno.readTextFileSync(homeDir + `/.atreyu/${appKey}.json`))
//       } catch (err) {
//         console.error({err, appKey, path: homeDir + `/.atreyu/${appKey}.json` })
//       }
//     }
//     if (!appData[appKey]?.config?.repo) {
//       console.error(`called edge function without environment app: ${appKey}, worker: ${workerName}`)
//       return new Response('Error', { status: 500 })
//     }

//     const workerKey = `${workerName}__${appKey}`

//     // console.log(workerKey, workers[workerKey])

//     if (!workers[workerKey] || workers[workerKey].appHash !== app.Hash) {
//       Deno.env.set('appKey', appKey)
//       let base = []
//       let filename
//       if (workerName.startsWith('_')) {
//         base = [appData[appKey].config.appPath, 'edge', 'build'] // [import.meta.url.replace('file://', ''), '..' ]
//         filename = `${workerName}.js` // `build or handlers/${workerName}/index.js`
//       } else {
//         base = [appData[appKey].config.appPath, 'edge', 'build']
//         filename = workerName
//       }
//       try {
//         const [_1, fileHash, _2] = (await exec([...`ipfs add --only-hash --repo-dir=${appData[appKey].config.repo} ${denoCodePath}`.split(' ')], false)).split(' ')
//         if (fileHash !== workers[workerKey]?.fileHash) {
//           console.log(`  ${workers[workerKey] ? 're' : ''}loading worker script: ` + workerKey)
//         }
//         workers[workerKey] = { code: (await import('file:' + denoCodePath + `?${fileHash}`)), appHash: app.Hash, fileHash }
//       } catch (err) {
//         console.error('  could not load edge worker: ' + workerKey, err)
//       }
//     }
//     // TODO parsing params and handle requestBody
//     if (paramsValidation ) {
//       if (!paramsValidation({ headers: arg.req.headers })) {
//         return new Response(JSON.stringify(paramsValidation.errors), { status: 400, headers: { 'content-type': 'application/json' }})
//       }

