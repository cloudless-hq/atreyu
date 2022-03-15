import { join, basename, green } from '../deps-deno.ts'
// import * as esbuild from 'https://deno.land/x/esbuild@v0.13.3/mod.js'

const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '')

export function buildWorkerConfig (schema: any) {
  const workers = {}

  Object.entries(schema.paths).forEach(([path, conf]) => {
    Object.entries(conf).forEach(([_method, { tags, operationId }]) => {
      if (tags?.includes('edge')) {
        const workerName = operationId.replace('.js', '').replaceAll('/', '__')
        if (!workers[workerName]) {
          workers[workerName] = {}
        }

        let base = []
        let filenames = []

        if (workerName.startsWith('_')) {
          base = [atreyuPath, 'edge']
          filenames = [`handlers/${operationId}.js`, `handlers/${operationId}/index.js`]
        } else {
          base = [Deno.cwd(), 'edge', 'handlers'] // configs[appKey].appPath,
          filenames = [operationId]
        }
        let codePath = join(...base, filenames[0])
        try {
          Deno.statSync(codePath)
        } catch (_e) {
          codePath = join(...base, filenames[1])
        }

        workers[workerName].codePath = codePath

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

async function compile ({ input, appName, workerName, output, buildName, publish }) {
  if (publish) {
    const cfRes = await Deno.emit(join(atreyuPath, 'edge', 'entry-cloudflare.js'), {
      bundle: 'module', // classic
      check: false,
      importMapPath: atreyuPath + '/atreyu',
      importMap: {
        'imports': {
          '/atreyu/': './app/src/',
          '$handler.js': input,
          '$env.js': './edge/lib/env.js'
        }
      }
    })
    if (cfRes.diagnostics.length > 0) {
      cfRes.diagnostics.map(di => console.warn(di))
    }
    await Promise.all([
      Deno.writeTextFile(output, cfRes.files['deno:///bundle.js'].replace('window.atob(', 'atob(').replace('<@buildName@>', buildName).replace('<@appName@>', appName) + `\n\n//# sourceMappingURL=./${workerName}.js.map`),
      Deno.writeTextFile(output + '.map', cfRes.files['deno:///bundle.js.map'])
    ])
  }

  const denoRes = await Deno.emit(input, {
    bundle: 'module',
    check: false,
    importMapPath: atreyuPath + '/atreyu',
    importMap: {
      'imports': {
        '/atreyu/': './app/src/',
        '$env.js': './edge/lib/env-local.js'
      }
    }
  })

  // const { metafile } =
  // await esbuild.build({
  //   entryPoints: [input],
  //   sourcemap: 'external',
  //   bundle: true,
  //   minify: false,
  //   treeShaking: false,
  //   metafile: true,
  //   outfile: output.replace('.js', '.d.js')
  // })

  if (denoRes.diagnostics.length > 0) {
    denoRes.diagnostics.map(di => console.warn(di))
  }

  await Promise.all([
    Deno.writeTextFile(output.replace('.js', '.d.js'), denoRes.files['deno:///bundle.js'] + `\n\n//# sourceMappingURL=./${workerName}.d.js.map`),
    Deno.writeTextFile(output.replace('.js', '.d.js') + '.map', denoRes.files['deno:///bundle.js.map'])
  ])

  return JSON.parse(denoRes.files['deno:///bundle.js.map']).sources
}

const deps = {}
export async function buildEdge ({ workers, buildName, batch, clean, publish }) {
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

    newDeps.filter(newDep => newDep.startsWith('file:///')).forEach(newDep => {
      const normalized = newDep
        .replace('file://' + atreyuPath, '/atreyu')
        .replace('file://' + projectFolder, '')

      if (!deps[normalized]) {
        deps[normalized] = []
      }
      deps[normalized].push(workerName)
    })
  }))

  return { files: {} } // emits[], newEmits[], deps: []
}
