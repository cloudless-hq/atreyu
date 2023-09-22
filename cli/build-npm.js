// import { build, emptyDir } from 'https://deno.land/x/dnt/mod.ts'
// import versions from './versions.json' assert { type: 'json' }
// await emptyDir('./npmt')

// await build({
//   entryPoints: ['./app/src/store/data.js'],
//   outDir: './npmt',
//   shims: {
//     deno: true
//   },
//   package: {
//     name: 'atreyu',
//     version: versions.ayuVersion,
//     description: 'Your package.',
//     license: 'Apache 2.0',
//     repository: {
//       type: 'git',
//       url: 'git+https://github.com/cloudless-hq/atreyu.git'
//     },
//     bugs: {
//       url: 'https://github.com/cloudless-hq/atreyu/issues'
//     }
//   },
//   postBuild () {}
// })


import { join, green } from '../deps-deno.ts'
import { recursiveReaddir } from './helpers.ts'
import { esbContext } from '../deps-deno.ts'

import { parseMetafile, ayuPlugin } from './esbuild-plugin-ayu.ts'
import { sveltePlugin } from './esbuild-plugin-svelte-tailwind.ts'
const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '')

// TODO: import type { OnLoadResult, Plugin, PluginBuild } from "esbuild"
// TODO: prefixed imported styles
// TODO: handle css files with auto js wrapper on import file.css?

function arrEqual (a, b) {
  return a?.length === b?.length && a.every((value, index) => value === b[index])
}

let buildCtx
const entryPoints = [
  './app/src/store/data.js',

  './app/src/service-worker/falcor-worker.js',
  './app/src/service-worker/start-worker.js',

  './app/src/falcor/service-worker-source.js',
  './app/src/falcor/router.js'
]

buildCtx = await esbContext({
  entryPoints,
  outdir: 'npm-dist',
  entryNames: '[name]',
  assetNames: '[name]',
  chunkNames: 'shared/[name]-[hash]',
  outbase: 'npm-dist',
  splitting: false, // FIXME: exclude for start-worker
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

    // sveltePlugin({
    //   dev,
    //   clean,
    //   inFolder,
    //   appFolder,
    //   addGlobalBuildRes: cb => {
    //     globalBuildRes = cb()
    //   }
    // }),

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

let buildResult
try {
  buildResult = await buildCtx.rebuild()
} catch (err) {
  console.error(err)
}

console.log(buildResult)

buildCtx.dispose()
