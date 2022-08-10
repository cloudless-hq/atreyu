import { join, basename, green, build } from '../deps-deno.ts'
import { folderHandlers } from '../edge/handlers/index.js'
import esbuildPlugin from './esbuild-plugin.ts'

const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '')

export function buildWorkerConfig (schema: any) {
  const workers: Record<string, unknown> = {}

  Object.entries(schema.paths).forEach(([path, conf]) => {
    Object.entries(conf).forEach(([_method, { tags, operationId }]) => {
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

        workers[workerName].codePath = join(...base, filename)

        if (workers[workerName].routes) {
          workers[workerName].routes.push(path)
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
async function compile ({ input, appName, workerName, output, buildName, publish }) {
  if (publish) {
    await build({
      entryPoints: [join(atreyuPath, 'edge', 'entry-cloudflare.js')],
      plugins: [ esbuildPlugin({local: false, input, atreyuPath}) ],
      outfile: output,
      ...buildSettings
    }).catch(err => console.error(err))
  }

  const buildRes = await build({
    entryPoints: [input],
    plugins: [ esbuildPlugin({ local: true, input, atreyuPath }) ],
    outfile: output.replace('.js', '.d.js'),
    ...buildSettings
  }).catch(err => console.error(err))

  return Object.keys(buildRes.metafile.inputs).map(path => {
    if (path.includes('/atreyu/')) {
      return '/atreyu/' + path.split('/atreyu/')[1]
    } else {
      return path
    }
  })
}

const deps = {}
export async function buildEdge ({ workers, buildName, batch = [], clean, publish }) {
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

  let affectedWorkers = []
  if (!clean) {
    batch.forEach(change => {
      affectedWorkers = affectedWorkers.concat(deps[change])
    })
  }

  await Promise.all(Object.entries(workers).filter(([workerName]) => clean || affectedWorkers.includes(workerName)).map(async ([workerName, { codePath }]) => {
    const workerLogPath = codePath.replace(atreyuPath, '/atreyu').replace(projectFolder, '')
    console.log(`  building edge-worker: ${workerLogPath}`)

    const newDeps = await compile({ input: codePath, appName, workerName, output: join(buildPath, workerName) + '.js', buildName, publish })

    newDeps.forEach(newDep => {
      if (!deps[newDep]) {
        deps[newDep] = []
      }
      deps[newDep].push(workerName)
    })
  }))

  return { files: {} } // emits[], newEmits[], deps: []
}
