const workerRoutes = Object.entries(JSON.parse(routes))
  .map(([pattern, workerName]) => [workerName, new URLPattern({ pathname: pattern })])
  .sort(([patternA], [patternB]) => patternB.length - patternA.length)

let cfData
addEventListener('fetch', event => {
  if (!cfData) {
    event.waitUntil(fetch('https://workers.cloudflare.com/cf.json').then(async res => {
      const json = await res.json()
      cfData = {
        longitude: json.longitude,
        latitude: json.latitude,
        country: json.country,
        colo: json.colo,
        city: json.city,
        asOrganization: json.asOrganization
      }
    }))
  }

  const url = new URL(event.request.url)
  const localhostMatch = url.hostname.split('.localhost')
  const appName = localhostMatch.length > 1 ? localhostMatch[0] : 'ayu'
  const appKey = env === 'prod' ? appName : appName + '_' + env

  const [ workerName ] = workerRoutes.find(([_, pattern]) => pattern.test(url.href))

  // if (!app) {
  //  return new Response('App not found ' + appKey, { status: 400, headers: { server: 'atreyu', 'content-type': 'text/plain' } })
  // }

  if (self[workerName]?.fetch) {
    event.respondWith(self[workerName].fetch(event.request))
  } else {
    event.respondWith(new Response(JSON.stringify({ routes, workerName, url, cfData: cfData || {}, appKey, appName }), {headers: {'content-type': 'application/json'}}))

    // event.respondWith(fetch(event.request))
  }
})

// import { makeValidator } from './lib/schema.js'
// import startWorker from './lib/start-worker.js'
// import { addPathTags } from '../app/src/schema/helpers.js'
// import defaultPaths from '../app/src/schema/default-routes.js'
// async function getApps () {
//   return (await (await fetch(ipfsApi + '/api/v0/files/ls?arg=/apps&long=true', { method: 'POST' })).json()).Entries
// }
// const workers = {}
// const appData = {}
// let apps = []
// TODO: stat page for worker status etc.
// startWorker({
//   handler: async arg => {
//     const { req } = arg
//     apps = (await getApps()) || []
//     const app = apps.find(app => app.Name === appKey)
//     const ayuHash = apps.find(app => app.Name === 'atreyu_dev').Hash // TODO only use dev for ayudev execution?
//     TODO separate local envs into processes
//     app.ayuHash = ayuHash
//     app.appName = appName
//     arg.app = app
//     arg.stats.app = app
//     arg.event.request.cf = cfData
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
//     // TODO parsing params and handle requestBody
//     if (paramsValidation ) {
//       if (!paramsValidation({ headers: arg.req.headers })) {
//         return new Response(JSON.stringify(paramsValidation.errors), { status: 400, headers: { 'content-type': 'application/json' }})
//       }
//     }
//     return workers[workerKey].code.handler(arg)
//   }
// })
