import { join, green } from '../deps-deno.js'

export default async function () {
  const appFolder = Deno.cwd() + '/app'
  const swPath = `${appFolder}/service-worker.js`

  const watchConf = {
    pattern: null,
    files: {}
  }

  try {
    Deno.statSync(swPath)
  } catch (_e) {
    return // console.warn('cannot open ' + swPath)
  }

  console.log('  compiling service worker: ' + swPath)

  const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '')
  // console.log(atreyuPath, swPath)

  const emitRes = await Deno.emit(swPath, {
    bundle: 'module', // module  or classic
    check: false,
    compilerOptions: {
      removeComments: true
    },
    importMapPath: atreyuPath + '/imports.json',
    importMap: {
      imports: {
        '/atreyu/': './app/'
      }
    }
  })

  const { files, diagnostics, stats } = emitRes

  if (diagnostics.length > 0) {
    diagnostics.map(di => console.warn(di))
  }

  await Promise.all([
    Deno.writeTextFile(`${appFolder}/service-worker.bundle.js`, files['deno:///bundle.js'] + `\n\n//# sourceMappingURL=./service-worker.bundle.js.map`),
    Deno.writeTextFile(`${appFolder}/service-worker.bundle.js.map`, files['deno:///bundle.js.map'])
  ])

  watchConf.files[swPath] = JSON.parse(files['deno:///bundle.js.map']).sources.map(path => path.replace('<file://', '').replace('>', ''))

  console.log( `  ${green('compiled:')} ${appFolder}/service-worker.bundle.js`)
  console.log(`  ${stats.map(stat => stat.join(': ')).join(', ')}`)

  return watchConf
}
