import { join, green } from '../deps-deno.js'

export default async function ({ batch, buildRes, clean } = {}) {
  const fileName = `service-worker.js`
  const appFolder = join(Deno.cwd(), 'app')
  const swPath = join(appFolder, fileName)
  const projectPath = join('app', fileName)

  const newBuildRes = {
    files: {}
  }

  const deps = buildRes?.[1]?.files[projectPath]?.deps
  if (!clean && deps && !batch.some(elem => deps.includes(elem))) {
    if (buildRes?.[1]?.files[projectPath]?.newEmits) {
      buildRes[1].files[projectPath].newEmits = []
    }

    return buildRes?.[1] || newBuildRes
  }

  try {
    Deno.statSync(swPath)
  } catch (_e) {
    if (buildRes?.[1]?.files[projectPath]?.newEmits) {
      buildRes[1].files[projectPath].newEmits = []
    }
    return buildRes?.[1] || newBuildRes
  }

  console.log('  building service-worker: ' + projectPath)

  const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '')

  const emitRes = await Deno.emit(swPath, {
    bundle: 'module', // classic
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

  const { files, diagnostics, _stats, ignoredOptions } = emitRes

  if (ignoredOptions) {
    console.warn('ignored deno emit opts:', ignoredOptions)
  }

  if (diagnostics.length > 0) {
    diagnostics.map(di => console.warn(di))
  }

  await Promise.all([
    Deno.writeTextFile(`${appFolder}/service-worker.bundle.js`, files['deno:///bundle.js'] + `\n\n//# sourceMappingURL=./service-worker.bundle.js.map`),
    Deno.writeTextFile(`${appFolder}/service-worker.bundle.js.map`, files['deno:///bundle.js.map'])
  ])

  newBuildRes.files[projectPath] = {
    emits: [
      `app/service-worker.bundle.js`,
      `app/service-worker.bundle.js.map`
    ],
    newEmits: [
      `app/service-worker.bundle.js`,
      `app/service-worker.bundle.js.map`
    ],
    deps: JSON.parse(files['deno:///bundle.js.map']).sources.map(path => path.replace('file://', '').replace(Deno.cwd(), ''))
  }

  console.log(`  ${green('emitted:')} app/service-worker.bundle.js`)
  // console.log(`    └─ ${emitRes}`) // .map(stat => stat.join(': ')).join(', ') currently always empty

  return newBuildRes
}
