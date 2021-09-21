import { join, basename, green } from '../deps-deno.js'

const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '')

export function buildWorkerConfig (schema) {
  const workers = {}

  Object.entries(schema.paths).forEach(([path, conf]) => {
    Object.entries(conf).forEach(([_method, { tags, operationId }]) => {
      if (tags?.includes('edge')) {
        let workerName = operationId.replace('.js', '').replaceAll('/', '__')
        if (!workers[workerName]) {
          workers[workerName] = {}
        }

        if (workerName.startsWith('_')) {
          let codePath = join('handlers', operationId + '.js')

          try {
            const testPath = join(atreyuPath, 'edge', codePath)
            // console.log(testPath)
            Deno.statSync(testPath)
          } catch (_e) {
            // console.log(_e)
            // TODO: ts support
            codePath = join('handlers', operationId, 'index.js')
          }

          workers[workerName].codePath = codePath
        } else {
          workers[workerName].codePath = join('app', 'workers', operationId)
        }
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

async function compile ({input, appName, workerName, output, buildName}) {
  const { files, diagnostics } = await Deno.emit(join(atreyuPath, 'edge', 'entry-cloudflare.js'), {
    bundle: 'module', // classic
    check: false,
    importMapPath: atreyuPath + '/atreyu',
    importMap: {
      "imports": {
        "/atreyu/": "./app/atreyu/",
        "$handler.js": input
      }
    }
  })

  if (diagnostics.length > 0) {
    diagnostics.map(di => console.warn(di))
  }

  await Promise.all([
    Deno.writeTextFile(output, files['deno:///bundle.js'].replace('<@buildName@>', buildName).replace('<@appName@>', appName) + `\n\n//# sourceMappingURL=./${workerName}.js.map`),
    Deno.writeTextFile(output + '.map', files['deno:///bundle.js.map'])
  ])
}

export async function buildEdge (workers, buildName) {
  const projectFolder = Deno.cwd()
  const appName = basename(Deno.cwd())
  const buildPath = join(Deno.cwd(), 'edge/build')
  try {
    Deno.mkdirSync(buildPath, { recursive: true })
  } catch (_e) { }

  Object.entries(workers).forEach(([workerName, {codePath}]) => {
    console.log({
      workerName, codePath
    })

    if (!workerName.startsWith('_')) {
      compile({input: join(Deno.cwd(), codePath), appName, workerName, output: join(buildPath, workerName) + '.js', buildName})
    } else {
      const systemHandlers = join(import.meta.url, '..', '..', 'edge/').replace('file:', '')
      compile({ input: join(systemHandlers, codePath), appName, workerName, output: join(buildPath, workerName) + '.js', buildName})
    }
  })

  console.log( `  ${green('compiled to:')} ${buildPath}`)
}
