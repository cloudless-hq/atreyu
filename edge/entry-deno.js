import { join, basename } from '../deps-deno.ts'
import { makeValidator } from './lib/schema.js'
import startWorker from './lib/start-worker.js'
import { addPathTags } from '../app/src/schema/helpers.js'
import { parse, match } from '../app/src/lib/routing.js'
import { exec } from '../cli/helpers.ts'
import defaultPaths from '../app/src/schema/default-routes.js'

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
    // console.log(app)
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
        const schema = (await import(ipfsGateway + `/ipfs/${app.Hash}/schema/main.js`)).schema

        if (typeof schema === 'function') {
          appData[appKey] = { schema: schema({ defaultPaths, addPathTags }), appHash: app.Hash }
        } else {
          schema.paths = { ...defaultPaths, ...schema.paths }
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

      appData[appKey].edgeHandlers = parse(appData[appKey].schema, [ 'edge' ], makeValidator)
    }

    const {
      operationId: workerName,
      paramsValidation
    } = match(req, appData[appKey].edgeHandlers) || {}

    if (!workerName) {
      console.warn(`${req.method} ${req.url}`)
      return new Response('No matches found in schema: ' + appKey, { status: 400, headers: { server: 'atreyu', 'content-type': 'text/plain'} })
    }

    if (!appData[appKey].config) {
      try {
        appData[appKey].config = JSON.parse(Deno.readTextFileSync(homeDir + `/.atreyu/${appKey}.json`))
      } catch (err) {
        console.error({err, appKey, path: homeDir + `/.atreyu/${appKey}.json` })
      }
    }
    if (!appData[appKey]?.config?.repo) {
      console.error(`called edge function without environment app: ${appKey}, worker: ${workerName}`)
      return new Response('Error', { status: 500 })
    }

    const workerKey = `${workerName}__${appKey}`

    // console.log(workerKey, workers[workerKey])

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
        const [_1, fileHash, _2] = (await exec([...`ipfs add --only-hash --repo-dir=${appData[appKey].config.repo} ${denoCodePath}`.split(' ')], false)).split(' ')
        if (fileHash !== workers[workerKey]?.fileHash) {
          console.log(`  ${workers[workerKey] ? 're' : ''}loading worker script: ` + workerKey)
        }

        workers[workerKey] = { code: (await import('file:' + denoCodePath + `?${fileHash}`)), appHash: app.Hash, fileHash }
      } catch (err) {
        console.error('  could not load edge worker: ' + workerKey, err)
      }
    }

    // TODO parsing params and handle requestBody
    if (paramsValidation ) {
      if (!paramsValidation({ headers: arg.req.headers })) {
        return new Response(JSON.stringify(paramsValidation.errors), { status: 400, headers: { 'content-type': 'application/json' }})
      }
    }

    return workers[workerKey].code.handler(arg)
  }
})
