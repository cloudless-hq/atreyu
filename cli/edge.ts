import { join, esbContext } from '../deps-deno.ts' // basename,
import { folderHandlers } from '../edge/handlers/index.js'
import { parseMetafile, ayuPlugin } from './esbuild-plugin-ayu.ts'
import { makeValidator } from '../edge/lib/schema.js'

const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '')

export function buildServices (schema: unknown) {
  const services: Record<string, unknown> = {}

  Object.entries(schema.paths).forEach(([path, conf]) => {
    Object.entries(conf).forEach(([method, { tags, operationId, parameters }]) => {
      if (method === 'parameters') {
        // TODO: implement
        console.error('parameters only supported on path level instead of method')
        return
      }

      if (tags?.includes('edge')) {
        const workerName = operationId.replace('.js', '').replaceAll('/', '__')
        if (!services[workerName]) {
          services[workerName] = {}
        }

        let base = []
        let filename

        if (workerName.startsWith('_')) {
          base = [atreyuPath, 'edge']
          filename = folderHandlers.includes(operationId) ? `handlers/${operationId}/index.js` : `handlers/${operationId}.js`
        } else {
          base = [Deno.cwd(), 'edge', 'handlers'] // configs[appKey].appPath,
          filename = operationId
        }

        services[workerName].paramsValidation = makeValidator({
          params: parameters, standalone: true
        })
        services[workerName].codePath = join(...base, filename)

        if (services[workerName].routes) {
          if (!services[workerName].routes.includes(path)) {
            services[workerName].routes.push(path)
          }
        } else {
          services[workerName].routes = [path]
        }
      }
    })
  })

  return services
}

const deps = {}
export async function buildEdge ({ services, info, batch = [], clean }) {
  // buildName
  // const startTime = Date.now()
  // const appName = basename(projectFolder)

  const projectFolder = Deno.cwd()
  const buildPath = join(projectFolder, 'edge/build')

  if (clean) {
    console.log('  🐘 recreating: edge/build')
    try {
      Deno.removeSync(buildPath, { recursive: true })
    } catch (_e) { /* ignore */ }
    try {
      Deno.mkdirSync(buildPath, { recursive: true })
    } catch (_e) {  /* ignore */ }
  }
  console.log( `  compiling edge to: edge/build`)

  let affectedWorkers: string[] = []
  if (!clean) {
    batch.forEach(change => {
      affectedWorkers = affectedWorkers.concat(deps[change])
    })
  }

  await Promise.all(Object.entries(services).filter(([workerName]) => clean || affectedWorkers.includes(workerName)).map(async ([workerName, { codePath, paramsValidation }]) => {
    // const workerLogPath = codePath.replace(atreyuPath, '/atreyu').replace(projectFolder, '')
    // console.log(`    building edge-worker: ${workerLogPath}`)
    // entryPoints: [codePath],
    // plugins: [ ayuPlugin({ local: true,input: codePath, atreyuPath, paramsValidation }) ],
    // outfile: join(buildPath, workerName) + '.js'.replace('.js', '.deno.js'),
    // ...buildSettings

    const buildCtx = await esbContext({
      entryPoints: [join(atreyuPath, 'edge', 'entry.js')],
      plugins: [ ayuPlugin({ local: false, input: codePath, atreyuPath, paramsValidation }) ],
      outfile: join(buildPath, workerName) + '.js',
      sourcemap: 'linked',
      bundle: true,
      treeShaking: true,
      // write: false,
      metafile: true,
      minify: false,
      sourceRoot: './',
      target: 'esnext',
      platform: 'neutral'
    }).catch(() => {/* ignore */})

    const buildRes = await buildCtx.rebuild()

    buildCtx.dispose()

    // console.log(buildRes)

    parseMetafile(buildRes.metafile, info)

    const newDeps = Object.keys(buildRes.metafile.inputs).map(path => {
      if (path.includes('/_ayu/')) {
        return '/_ayu/' + path.split('/_ayu/')[1]
      } else {
        return path
      }
    })

    // NOTE: obsolete deps are not removed until restart
    newDeps.forEach(newDep => {
      if (!deps[newDep]) {
        deps[newDep] = []
      }
      deps[newDep].push(workerName)
    })
  }))

  // const duration = (Math.floor(Date.now() / 100 - startTime / 100)) / 10
  // duration && console.log('  ' + duration + 's')
  return { files: {} }
}

// TODO: return
//   "files": {
//     "app/service-worker.js": {
//       "emits": [
//         "app/build/service-worker.js",
//         "app/build/service-worker.js.map"
//       ],
//       "newEmits": [],
//       "deps": [
//         "/docs/atreyu/app/src/schema/helpers.js"
