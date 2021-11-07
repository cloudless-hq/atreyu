import { join, basename, green } from '../deps-deno.js'
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

async function compile ({input, appName, workerName, output, buildName}) {
  const { files, diagnostics } = await Deno.emit(join(atreyuPath, 'edge', 'entry-cloudflare.js'), {
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

  if (diagnostics.length > 0) {
    diagnostics.map(di => console.warn(di))
  }

  await Promise.all([
    Deno.writeTextFile(output, files['deno:///bundle.js'].replace('<@buildName@>', buildName).replace('<@appName@>', appName) + `\n\n//# sourceMappingURL=./${workerName}.js.map`),
    Deno.writeTextFile(output + '.map', files['deno:///bundle.js.map']),

    Deno.writeTextFile(output.replace('.js', '.d.js'), denoRes.files['deno:///bundle.js'] + `\n\n//# sourceMappingURL=./${workerName}.d.js.map`),
    Deno.writeTextFile(output.replace('.js', '.d.js') + '.map', denoRes.files['deno:///bundle.js.map'])
  ])
}

export function buildEdge (workers, buildName) {
  // const projectFolder = Deno.cwd()
  const appName = basename(Deno.cwd())
  const buildPath = join(Deno.cwd(), 'edge/build')
  try {
    console.log('  removing edge/build')
    Deno.removeSync(buildPath, { recursive: true })
    Deno.mkdirSync(buildPath, { recursive: true })
  } catch (_e) { }

  Object.entries(workers).forEach(([workerName, { codePath }]) => {
    console.log('  building worker: ', workerName, codePath)

    if (!workerName.startsWith('_')) {
      compile({input: codePath, appName, workerName, output: join(buildPath, workerName) + '.js', buildName})
    } else {
      compile({ input: codePath, appName, workerName, output: join(buildPath, workerName) + '.js', buildName})
    }
  })

  console.log( `  ${green('compiled to:')} ${buildPath}`)
}
