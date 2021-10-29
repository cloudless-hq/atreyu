import { setEnv } from './lib/env.js'
import { join } from '../deps-deno.js'
import startWorker from './lib/start-worker.js'
import { toFalcorPaths, toWindowPaths } from '../app/src/schema/helpers.js'
import defaultPaths from '../app/src/schema/default-routes.js'

// TODO: use config and args from cli
const ipfsGateway = 'http://127.0.0.1:8080'
const ipfsApi = 'http://127.0.0.1:5001'
const homeDir = Deno.env.get('HOME')
const codespace = Deno.env.get('CODESPACE_NAME')
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

let apps
async function getApps () {
  apps = (await (await fetch(ipfsApi + '/api/v0/files/ls?arg=/apps&long=true', { method: 'POST' })).json()).Entries
}

const workers = {}
const configs = {}
const schemas = {}
startWorker(async arg => {
  const {
    req
    // stats,
    // parsedBody,
    // event,
    // wait
  } = arg

  if (req.url.hostname === 'localhost') {
    req.url.hostname = 'atreyu.localhost'
  }

  const appName = codespace && req.url.hostname.startsWith(codespace + '-80.') ? repoName : req.url.hostname.replace('.localhost', '')

  const appKey = appName + '_dev'

  // todo : cacheing strategy
  await getApps()

  let app = apps.find(app => app.Name === appKey)
  arg.app = app // TODO find generic solution for local and cf

  if (!app) {
    // await getApps()
    // app = apps.find(app => app.Name === appKey)
    // arg.app = app // TODO find generic solution for local and cf
    // if (!app) {
    return new Response('App not found ' + appKey, { status: 400, headers: { server: 'atreyu', 'content-type': 'text/plain' } })
    // }
  }

  // todo invalidate on hash update
  if (!schemas[appKey]) {
    try {
      const schema = (await Promise.any([
        import(ipfsGateway + `/ipfs/${app.Hash}/schema/index.js`),
        import(ipfsGateway + `/ipfs/${app.Hash}/schema.js`)
      ])).schema

      if (typeof schema === 'function') {
        schemas[appKey] = schema({ defaultPaths, toFalcorPaths, toWindowPaths })
      } else {
        schemas[appKey] = schema
      }
    } catch (e) {
      console.warn(` ⚠️ could not load schema for ${appKey}, falling back to default`)
      schemas[appKey] = { // TODO: make generic fallback for cloudflare and local
        paths: {
          '/*': {
            get: {
              tags: [ 'edge' ],
              operationId: '_ipfs'
            }
          }
        }
      }
    }
  }

  const handlers = {}
  Object.entries(schemas[appKey].paths).forEach(([path, value]) => {
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
      configs[appKey] = JSON.parse(await Deno.readTextFileSync(homeDir + `/.atreyu/${appKey}.json`))
      // env?
    }

    // todo: how to handle this reliably and less ugly?
    setEnv(configs[appKey])

    if (!workers[workerName]) {
      console.log('importing worker script: ' + workerName)

      let base = []
      let filenames = []
      if (workerName.startsWith('_')) {
        base = [import.meta.url.replace('file://', ''), '..']
        filenames = [`handlers/${workerName}.js`, `handlers/${workerName}/index.js`]
      } else {
        base = [configs[appKey].appPath, 'edge', 'handlers']
        filenames = [workerName]
      }
      // console.log(base, filenames[0])
      let codePath = join(...base, filenames[0])
      try {
        // console.log(codePath)
        Deno.statSync(codePath)
      } catch (_e) {
        // TODO: ts support
        codePath = join(...base, filenames[1])
      }
      // console.log(codePath)
      workers[workerName] = (await import(codePath))
    }

    return workers[workerName].handler(arg)
  } else {
    console.log(`${req.method} ${req.url}`)
    return new Response('No matches found in schema: ' + appKey, { status: 400, headers: { server: 'atreyu', 'content-type': 'text/plain'} })
  }
})
