import { join } from '../deps-deno.js'
import startWorker from './lib/start-worker.js'
import { toFalcorPaths, toWindowPaths } from '../app/src/schema/helpers.js'
import defaultPaths from '../app/src/schema/default-routes.js'

// TODO: use config and args from cli
const ipfsGateway = 'http://127.0.0.1:8080'
const ipfsApi = 'http://127.0.0.1:5001'
const homeDir = Deno.env.get('HOME')
const repoName = Deno.env.get('RepositoryName')

// bindings = bindingsFile.bindings.reduce((agr, ent) => {
//   agr[ent.name] = ent.text
//   return agr
// }, {})
// if (!caches || !caches.default) {
//   var caches = {
//     default: {
//     }
//   }
// }

async function getApps () {
  return (await (await fetch(ipfsApi + '/api/v0/files/ls?arg=/apps&long=true', { method: 'POST' })).json()).Entries
}

const workers = {}
const configs = {}
const schemas = {}
let apps = []
startWorker(async arg => {
  const {
    req
    // stats,
    // parsedBody,
    // event,
    // wait
  } = arg

  const localhostMatch = req.url.hostname.split('.localhost')

  const appName = localhostMatch.length > 1 ? localhostMatch[0] : repoName
  const appKey = appName + '_dev'

  apps = (await getApps()) || []

  let app = apps.find(app => app.Name === appKey)
  arg.app = app // TODO find generic solution for local and cf

  if (!app) {
    return new Response('App not found ' + appKey, { status: 400, headers: { server: 'atreyu', 'content-type': 'text/plain' } })
  }

  if (!schemas[appKey] || schemas[appKey].hash !== app.Hash) {
    try {
      const schema = (await Promise.any([
        import(ipfsGateway + `/ipfs/${app.Hash}/schema/index.js`),
        import(ipfsGateway + `/ipfs/${app.Hash}/schema.js`)
      ])).schema

      if (typeof schema === 'function') {
        schemas[appKey] = { data: schema({ defaultPaths, toFalcorPaths, toWindowPaths }), hash: app.Hash }
      } else {
        schemas[appKey] = { data: schema, hash: app.Hash }
      }
    } catch (e) {
      console.warn(` ⚠️ could not load schema for ${appKey}, falling back to default`)
      // TODO: make generic fallback for cloudflare and local
      schemas[appKey] = {
        data: {
          paths: {
            '/*': {
              get: {
                tags: [ 'edge' ],
                operationId: '_ipfs'
              }
            }
          }
        },
        hash: app.Hash
      }
    }
  }

  const handlers = {}
  Object.entries(schemas[appKey].data.paths).forEach(([path, value]) => {
    Object.entries(value).forEach(([method, {operationId, tags, handler}]) => {
      if (tags?.includes('edge')) {
        if (!handlers[method]) {
          handlers[method] = []
        }
        handlers[method].push({path, operationId, handler})
      }
    })
  })

  // sort by path length and match more specific to less specific order more similar to cloudflare prio matching
  Object.keys(handlers).forEach(method => {
    handlers[method] = handlers[method].sort((first, second) => {
      return second.path.length - first.path.length
    } )
  })

  let workerName
  const method = req.method.toLowerCase()
  if (handlers[method]) {
    for (let i = 0; i < handlers[method].length; i++) {
      if (handlers[method][i].path.endsWith('*')) {
        if (req.url.pathname.startsWith(handlers[method][i].path.slice(0, -1))) {
          workerName = handlers[method][i].operationId
          break
        }
      } else {
        if (req.url.pathname === handlers[method][i].path) {
          workerName = handlers[method][i].operationId
          break
        }
      }
    }
  }

  // TODO: stat page for worker status

  if (workerName) {
    if (!configs[appKey]) {
      configs[appKey] = JSON.parse(Deno.readTextFileSync(homeDir + `/.atreyu/${appKey}.json`))
    }

    // todo: how to handle this reliably and less ugly?
    // setEnv(configs[appKey])

    if (!workers[workerName] || workers[workerName].hash !== app.Hash) {
      console.log('reloading worker script: ' + workerName)
      Deno.env.set('appKey', appKey)
      let base = []
      let filenames = []
      if (workerName.startsWith('_')) {
        base = [configs[appKey].appPath, 'edge', 'build'] // [import.meta.url.replace('file://', ''), '..' ]
        filenames = [`${workerName}.js`] // `build or handlers/${workerName}/index.js`
      } else {
        base = [configs[appKey].appPath, 'edge', 'build']
        filenames = [workerName]
      }

      let codePath = join(...base, filenames[0])
      // try {
      //   // console.log(codePath)
      //   Deno.statSync(codePath)
      // } catch (_e) {
      //   // TODO: ts support
      //   codePath = join(...base, filenames[1])
      // }

      workers[workerName] = { code: (await import(codePath.replace('.js', '.d.js') + `?${app.Hash}`)), hash: app.Hash }
    }

    return workers[workerName].code.handler(arg)
  } else {
    console.log(`${req.method} ${req.url}`)
    return new Response('No matches found in schema: ' + appKey, { status: 400, headers: { server: 'atreyu', 'content-type': 'text/plain'} })
  }
})
