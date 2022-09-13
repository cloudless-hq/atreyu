import { join, basename, Ajv } from '../deps-deno.ts'
import startWorker from './lib/start-worker.js'
import { addPathTags } from '../app/src/schema/helpers.js'
import { exec } from '../cli/helpers.ts'
import defaultPaths from '../app/src/schema/default-routes.js'
import { exec as execSchema } from './lib/schema.js'

const ajv = new Ajv({ coerceTypes: true, useDefaults: true })

// TODO: use config and args from cli
const ipfsGateway = 'http://127.0.0.1:8080'
const ipfsApi = 'http://127.0.0.1:5001'
const homeDir = Deno.env.get('HOME')
const env = Deno.env.get('env')
const repoName = Deno.env.get('RepositoryName')
const projectPath = Deno.cwd()
const cwd = basename(projectPath)

async function getApps () {
  return (await (await fetch(ipfsApi + '/api/v0/files/ls?arg=/apps&long=true', { method: 'POST' })).json()).Entries
}

let cfData = {}
fetch('https://workers.cloudflare.com/cf.json').then(async res => {
  const json = await res.json()

  cfData = {
    longitude: json.longitude,
    latitude: json.latitude,
    country: json.country,
    colo: json.colo,
    city: json.city,
    asOrganization: json.asOrganization
  }
})

const workers = {}
const appData = {}
let apps = []

// TODO: stat page for worker status etc.
startWorker({
  handler: async arg => {
    const { req } = arg

    const localhostMatch = req.url.hostname.split('.localhost')

    const appName = localhostMatch.length > 1 ? localhostMatch[0] : repoName || cwd
    const appKey = env === 'prod' ? appName : appName + '_' + env

    apps = (await getApps()) || []

    const app = apps.find(app => app.Name === appKey)

    if (!app) {
      return new Response('App not found ' + appKey, { status: 400, headers: { server: 'atreyu', 'content-type': 'text/plain' } })
    }

    const ayuHash = apps.find(app => app.Name === 'atreyu_dev').Hash // TODO only use dev for ayudev execution?

    // TODO find generic solution for local and cf, seperate local envs into processes
    app.ayuHash = ayuHash
    app.appName = appName
    arg.app = app
    arg.stats.app = app
    arg.event.request.cf = cfData
    arg.req.raw.cf = cfData // should be set by reference but check

    if (!appData[appKey]?.schema || appData[appKey].appHash !== app.Hash) {
      try {
        const schema = (await Promise.any([
          import(ipfsGateway + `/ipfs/${app.Hash}/schema/index.js`),
          import(ipfsGateway + `/ipfs/${app.Hash}/schema.js`)
        ])).schema

        if (typeof schema === 'function') {
          appData[appKey] = { schema: schema({ defaultPaths, addPathTags }), appHash: app.Hash }
        } else {
          appData[appKey] = { schema, appHash: app.Hash }
        }
      } catch (_err) {
        console.warn(`  could not load schemas for ${appKey}, using defaults`)
        // TODO: make generic fallback for cloudflare and local
        appData[appKey] = {
          schema: {
            paths: {
              '/*': {
                get: {
                  tags: [ 'edge' ],
                  operationId: '_ipfs'
                }
              }
            }
          },
          appHash: app.Hash
        }
      }

      const edgeHandlers = {}
      Object.entries(appData[appKey].schema.paths).forEach(([path, value]) => {
        Object.entries(value).forEach(([method, {operationId, tags, handler, parameters, requestBody}]) => {
          if (method === 'parameters') {
            // TODO: implement
            console.error('parameters only supported on path level instead of method')
            return
          }
          if (tags?.includes('edge')) {
            if (!edgeHandlers[method]) {
              edgeHandlers[method] = []
            }
            edgeHandlers[method].push({
              path,
              operationId,
              handler,

              // TODO: move to global validation of headers object? handle required
              // {
              //   "type": "object",
              //   "properties": {
              //     "a": { "type": "string" }
              //   },
              //   "required": ["a", "b"]
              // }
              parameters: parameters?.map(param => {
                param.validate = ajv.compile(param.schema)
                return param
              }),
              requestBody
            })
          }
        })
      })

      // sort by path length and match more specific to less specific order more similar to cloudflare prio matching
      Object.keys(edgeHandlers).forEach(method => {
        edgeHandlers[method] = edgeHandlers[method].sort((first, second) => {
          return second.path.length - first.path.length
        } )
      })

      appData[appKey].edgeHandlers = edgeHandlers
    }

    let workerName
    let subSchema
    const handlers = appData[appKey].edgeHandlers
    const method = req.method.toLowerCase()
    if (handlers[method]) {
      for (let i = 0; i < handlers[method].length; i++) {
        if (handlers[method][i].path.endsWith('*')) {
          if (req.url.pathname.startsWith(handlers[method][i].path.slice(0, -1))) {
            workerName = handlers[method][i].operationId
            subSchema = {
              parameters: handlers[method][i].parameters,
              requestBody: handlers[method][i].requestBody
            }
            break
          }
        } else {
          if (req.url.pathname === handlers[method][i].path) {
            workerName = handlers[method][i].operationId
            subSchema = {
              parameters: handlers[method][i].parameters,
              requestBody: handlers[method][i].requestBody
            }
            break
          }
        }
      }
    }

    if (!workerName) {
      console.warn(`${req.method} ${req.url}`)
      return new Response('No matches found in schema: ' + appKey, { status: 400, headers: { server: 'atreyu', 'content-type': 'text/plain'} })
    }

    if (!appData[appKey].config) {
      // console.log({appKey})
      appData[appKey].config = JSON.parse(Deno.readTextFileSync(homeDir + `/.atreyu/${appKey}.json`))
    }
    if (!appData[appKey]?.config?.repo) {
      console.error(`called edge function without environment app: ${appKey}, worker: ${workerName}`)
      return new Response('Error', { status: 500 })
    }

    const workerKey = `${workerName}__${appKey}`
    if (!workers[workerKey] || workers[workerKey].appHash !== app.Hash) {
      Deno.env.set('appKey', appKey)
      let base = []
      let filename
      if (workerName.startsWith('_')) {
        base = [appData[appKey].config.appPath, 'edge', 'build'] // [import.meta.url.replace('file://', ''), '..' ]
        filename = `${workerName}.js` // `build or handlers/${workerName}/index.js`
      } else {
        base = [appData[appKey].config.appPath, 'edge', 'build']
        filename = workerName
      }

      const codePath = join(...base, filename)
      const denoCodePath = codePath.replace('.js', '.deno.js')

      try {
        const [_1, fileHash, _2] = (await exec([...`ipfs add --only-hash --config=${appData[appKey].config.repo} ${denoCodePath}`.split(' ')], false)).split(' ')
        if (fileHash !== workers[workerKey]?.fileHash) {
          console.log(`  ${workers[workerKey] ? 're' : ''}loading worker script: ` + workerKey)
        }

        workers[workerKey] = { code: (await import('file:' + denoCodePath + `?${fileHash}`)), appHash: app.Hash, fileHash }
      } catch (err) {
        console.error('  could not load edge worker: ' + workerKey, err)
      }
    }

    if (subSchema?.parameters || subSchema?.requestBody ) {
      const { _params, errors } = execSchema(arg, subSchema, appData[appKey].schema) // errors
      if (errors?.length) {
        return new Response(JSON.stringify(errors), { status: 400, headers: { 'content-type': 'application/json' }})
      }
      // TODO parsing arg.params = params
    }

    return workers[workerKey].code.handler(arg)
  }
})
