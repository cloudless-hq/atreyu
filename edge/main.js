let cfData
let workerRoutes
export default {
  fetch (request, env, context) {
    if (!workerRoutes) {
      workerRoutes = Object.entries(JSON.parse(env.routes))
        .sort(([a], [b]) => {
          const aNumStar = (a.match(/\*/g) || []).length
          const bNumStar = (b.match(/\*/g) || []).length
    
          const aNumDash = (a.match(/\:/g) || []).length
          const bNumDash = (b.match(/\:/g) || []).length
    
          const aPrio = a.length + (bNumStar * 10) + (bNumDash * 5)
          const bPrio = b.length + (aNumStar * 10) + (aNumDash * 5)
    
          return bPrio - aPrio
        })
        .map(([pattern, workerName]) => [workerName, new URLPattern({ pathname: pattern })])
    }

    if (!cfData) {
      cfData = {}
      const prom = fetch('https://workers.cloudflare.com/cf.json').then(res => {
        return res.json().then(json => {
          cfData = {
            longitude: json.longitude,
            latitude: json.latitude,
            country: json.country,
            colo: json.colo,
            city: json.city,
            asOrganization: json.asOrganization
          }
        })
      }).catch(err => { console.log(err)} )
      context.waitUntil(prom)
    }

    const url = new URL(request.url)
    const localhostMatch = url.hostname.split('.localhost')
    const appName = localhostMatch.length > 1 ? localhostMatch[0] : 'ayu'
    const appKey = env.env === 'prod' ? appName : appName + '_' + env.env

    const [ workerName ] = workerRoutes.find(([_, pattern]) => pattern.test(url.href))

    // console.log({ workerName, url: request.url })

    // if (!app) {
    //  return new Response('App not found ' + appKey, { status: 400, headers: { server: 'atreyu', 'content-type': 'text/plain' } })
    // }

    if (env[workerName]?.fetch) {
      return env[workerName].fetch(request, { cf: cfData })
    } else {
      return new Response(JSON.stringify({ workerRoutes, workerName, url, cfData: cfData || {}, appKey, appName }), {
        headers: { 'content-type': 'application/json' }
      })
      // event.respondWith(fetch(event.request))
    }
  }
}

// import { makeValidator } from './lib/schema.js'
// import startWorker from './lib/start-worker.js'
// import { addPathTags } from '../app/src/schema/helpers.js'
// import defaultPaths from '../app/src/schema/default-routes.js'
// async function getApps () {
//   return (await (await fetch(ipfsApi + '/api/v0/files/ls?arg=/apps&long=true', { method: 'POST' })).json()).Entries
// }
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
