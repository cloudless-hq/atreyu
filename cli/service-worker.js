import { join, build } from '../deps-deno.ts' // green
import { parseMetafile, ayuPlugin } from './esbuild-plugin-ayu.ts'

// TODO: use natural folder location and scope allowed headersResponse included "Service-Worker-Allowed : /"
// navigator.serviceWorker.register("/js/sw.js", { scope: "/" }).then(() => {
//   console.log("Install succeeded as the max allowed scope was overriden to '/'.");
// })

export default async function ({ appFolder, batch, buildRes, clean, info } = {}) {
  // const startTime = Date.now()
  const fileName = `service-worker.js`
  const appFolderAbs = join(Deno.cwd(), appFolder)
  const swPath = join(appFolderAbs, fileName)
  const projectPath = join(appFolder, fileName)

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

  const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '').replace('https:/', 'https://')

  const { metafile } = await build({ // errors, warnings,
    entryPoints: [ swPath ],
    sourcemap: 'linked',
    // splitting: true,
    bundle: true,
    treeShaking: true,
    metafile: true,
    minify: false,
    plugins: [ ayuPlugin({ atreyuPath }) ],
    sourceRoot: './',
    format: 'esm', // iife
    // keepNames: true,
    platform: 'browser',
    outfile: `${appFolderAbs}/service-worker.bundle.js`
  }).catch(e => { console.error(e) })

  parseMetafile(metafile, info)

  newBuildRes.files[projectPath] = {
    emits: [
      `app/service-worker.bundle.js`,
      `app/service-worker.bundle.js.map`
    ],
    newEmits: [
      `app/service-worker.bundle.js`,
      `app/service-worker.bundle.js.map`
    ],
    deps: Object.keys(metafile.inputs).map(path => {
      if (path.includes('/atreyu/')) {
        return '/atreyu/' + path.split('/atreyu/')[1]
      } else {
        return path
      }
    })
  }

  // console.log(`    ${green('emitted:')} app/service-worker.bundle.js`)
  // console.log(`    └─ ${emitRes}`) // .map(stat => stat.join(': ')).join(', ') currently always empty
  // const duration = (Math.floor(Date.now() / 100 - startTime / 100)) / 10
  // duration && console.log('  ' + duration + 's')
  // console.log('')
  return newBuildRes
}
