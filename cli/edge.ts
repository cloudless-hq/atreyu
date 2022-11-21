import { join, basename, build } from '../deps-deno.ts'
import { folderHandlers } from '../edge/handlers/index.js'
import esbuildPlugin from './esbuild-plugin.ts'
import { makeValidator } from '../edge/lib/schema.js'

const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '')

export function buildWorkerConfig (schema: any) {
  const workers: Record<string, unknown> = {}

  Object.entries(schema.paths).forEach(([path, conf]) => {
    Object.entries(conf).forEach(([method, { tags, operationId, parameters }]) => {
      if (method === 'parameters') {
        // TODO: implement
        console.error('parameters only supported on path level instead of method')
        return
      }

      if (tags?.includes('edge')) {
        const workerName = operationId.replace('.js', '').replaceAll('/', '__')
        if (!workers[workerName]) {
          workers[workerName] = {}
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

        workers[workerName].paramsValidation = makeValidator({
          params: parameters, standalone: true
        })
        workers[workerName].codePath = join(...base, filename)

        if (workers[workerName].routes) {
          if (!workers[workerName].routes.includes(path)) {
            workers[workerName].routes.push(path)
          }
        } else {
          workers[workerName].routes = [path]
        }
      }
    })
  })

  return workers
}

const buildSettings = {
  sourcemap: 'linked',
  bundle: true,
  treeShaking: true,
  metafile: true,
  minify: false,
  sourceRoot: './',
  target: 'esnext',
  platform: 'neutral'
}
async function compile ({ input, appName, workerName, output, buildName, paramsValidation, publish }) {
  if (publish) {
    await build({
      entryPoints: [join(atreyuPath, 'edge', 'entry-cloudflare.js')],
      plugins: [ esbuildPlugin({ local: false, input, atreyuPath, paramsValidation }) ],
      outfile: output,
      ...buildSettings
    }).catch(err => console.error(err))
  }

  const buildRes = await build({
    entryPoints: [input],
    plugins: [ esbuildPlugin({ local: true, input, atreyuPath, paramsValidation }) ],
    outfile: output.replace('.js', '.deno.js'),
    ...buildSettings
  }).catch(err => console.error(err))

  return Object.keys(buildRes.metafile.inputs).map(path => {
    if (path.includes('/_ayu/')) {
      return '/_ayu/' + path.split('/_ayu/')[1]
    } else {
      return path
    }
  })
}

const deps = {}
export async function buildEdge ({ workers, buildName, batch = [], clean, publish }) {
  // const startTime = Date.now()
  const projectFolder = Deno.cwd()
  const appName = basename(projectFolder)
  const buildPath = join(projectFolder, 'edge/build')

  if (clean) {
    console.log('  🐘 recreating: edge/build')
    try {
      Deno.removeSync(buildPath, { recursive: true })
    } catch (_e) { }
    try {
      Deno.mkdirSync(buildPath, { recursive: true })
    } catch (_e) { }
  }
  console.log( `  compiling edge to: edge/build`)

  let affectedWorkers: string[] = []
  if (!clean) {
    batch.forEach(change => {
      affectedWorkers = affectedWorkers.concat(deps[change])
    })
  }

  await Promise.all(Object.entries(workers).filter(([workerName]) => clean || affectedWorkers.includes(workerName)).map(async ([workerName, { codePath, paramsValidation }]) => {
    const workerLogPath = codePath.replace(atreyuPath, '/atreyu').replace(projectFolder, '')
    console.log(`    building edge-worker: ${workerLogPath}`)

    const newDeps = await compile({ input: codePath, appName, paramsValidation, workerName, output: join(buildPath, workerName) + '.js', buildName, publish })

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
  // console.log('')

  return { files: {} }
}

// TODO: return
//   "files": {
//     "app/service-worker.js": {
//       "emits": [
//         "app/service-worker.bundle.js",
//         "app/service-worker.bundle.js.map"
//       ],
//       "newEmits": [],
//       "deps": [
//         "/atreyu/app/src/schema/helpers.js"