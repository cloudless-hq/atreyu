import { join, green } from '../deps-deno.ts'
import { recursiveReaddir } from './helpers.ts'
import { esbContext } from '../deps-deno.ts'

import { parseMetafile, ayuPlugin } from './esbuild-plugin-ayu.ts'
import { sveltePlugin } from './esbuild-plugin-svelte-tailwind.ts'
const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '')

// TODO: import type { OnLoadResult, Plugin, PluginBuild } from "esbuild"
// TODO: prefixed imported styles
// TODO: handle css files with auto js wrapper on import file.css?

function arrEqual (a: string[], b: string[]): boolean {
  return a?.length === b?.length && a.every((value, index) => value === b[index])
}

let buildCtx
let buildResult = {}
let globalBuildRes

export default async function ({
  appFolder,
  input,
  info,
  outputTarget,
  batch,
  clean,
  // buildRes,
  // output,
  dev = true,
  // sveltePath = '/svelte',
  extraAppEntryPoints = []
}: { appFolder: string, input: string, batch: string[], clean: boolean, dev: boolean, sveltePath: string, extraAppEntryPoints?: string[], outputTarget: string }) {
  // const startTime = Date.now()

  let inFolder = input
  if (inFolder.endsWith('/')) {
    inFolder = inFolder.substring(0, inFolder.length - 1)
  }

  try {
    Deno.statSync(inFolder)
  } catch (_e) {
    return
  }

  console.log('  compiling svelte templates:', join(inFolder, '/'))

  const files = await recursiveReaddir(inFolder) // TODO: dont read dir if using batch files
  // const batchFiles = batch?.map(fname => fname.startsWith('/') ? fname.substring(1, fname.length) : fname) // .filter(fname => fname.startsWith(inFolder))
  // FIXME: removed files filter try {
  // Deno.statSync(file) } catch (_e) {  return }

  const entryPoints = files.filter(file => (file.endsWith('_page.svelte') || file.endsWith('_error.svelte') || file === 'app/src/main.js' || file === 'app/src/main.ts' || extraAppEntryPoints.includes(file)))

  if (!buildCtx || !arrEqual(entryPoints, buildResult._entryPoints)) {
    // buildCtx?.rebuild?.dispose()

    // console.log(inFolder, appFolder) // app/src  und app

    buildCtx = await esbContext({
      entryPoints,
      outdir: outputTarget,
      entryNames: '[dir]/[name]',
      assetNames: '[dir]/[name]',
      chunkNames: 'shared/[name]-[hash]',
      outbase: 'app/src',
      splitting: true,
      // write: false,
      // deprecated incremental: dev,
      target: 'esnext',
      platform: 'browser', // 'neutral',
      format: 'esm', // iife
      // minify: true,
      // keepNames: true,
      // absWorkingDir: join(Deno.cwd(), 'app'),
      // mainFields: ['module', browser, 'main'],
      sourcemap: 'external', // 'linked'
      treeShaking: true,
      metafile: true,
      bundle: true,
      external: [
        '/src/pages/_error.svelte',
        '*/schema/main.js',
        '/vendor/*'
      ],

      // importMapPath?: atreyuPath + '/imports.json',
      // watch
      // define: { },
      // alias: { },

      plugins: [
        ayuPlugin({ atreyuPath }),

        sveltePlugin({
          dev,
          clean,
          inFolder,
          appFolder,
          addGlobalBuildRes: cb => {
            globalBuildRes = cb()
          }
        }),

        {
          name: 'app resources',
          setup (bld) {
            bld.onResolve({ filter: /^\// }, args => {
              // not working yet: const result = await bld.resolve(args.path, { resolveDir, pluginData: { subresolve: true } })
              // if (result.external) return { path: args.path, external: true }
              // const external = [
              //   '/vendor/jsoneditor.min.js'
              // ]
              // external.includes(args.path)
              // FIXME: generic external support
              const isExternal = args.path.startsWith('/vendor/')
              return {
                path: isExternal ? args.path : join(Deno.cwd(), 'app', args.path),
                external: isExternal
              }
            })
          }
        }
      ]
    }).catch(() => {/* ingore */})

    try {
      buildResult = await buildCtx.rebuild()
    } catch (err) {
      console.error(err)
    }

    buildResult._entryPoints = entryPoints
  } else {
    try {
      buildResult = await buildCtx.rebuild()
    } catch (err) {
      console.error(err)
    }
  }
  // outputFiles[{path, contents, text}]
  // console.log(buildCtx)
  const newBuildRes: { files: { [key: string]: { deps: string[], emits: string[], newEmits: string[] } } } = buildResult?.metafile ? parseMetafile(buildResult.metafile, info) : { files: {}}

  globalBuildRes.forEach(buildRes => {
    newBuildRes.files[buildRes.emits[0]] = {
      emits: buildRes.emits,
      newEmits: buildRes.newEmits,
      deps: []
    }
    console.log(`    ${green('emitted:')} ` + buildRes.emits[0])
  })

  // const duration = (Math.floor(Date.now() / 100 - startTime / 100)); duration && console.log('  ' + duration + 's') / 10
  return newBuildRes
}
