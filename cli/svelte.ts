import { join, basename, green } from '../deps-deno.ts'
import { recursiveReaddir } from './helpers.ts'
import { build, compile, transform, preprocess } from '../deps-deno.ts'
import { collectWindiClasses, makeGlobalWindi, windiParse } from './windi.ts'
import esbuildPlugin, { parseMetafile } from './esbuild-plugin.ts'
const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '')

// TODO: import type { OnLoadResult, Plugin, PluginBuild } from "esbuild"
// TODO: prefixed imported styles
// TODO: handle css files with auto js wrapper on import file.css?

function arrEqual (a: string[], b: string[]): boolean {
  return a?.length === b?.length && a.every((value, index) => value === b[index])
}

function svelteReplace (input: string) {
  const replacements: Record<string, string> = {
    'svelte/animate': `'/_ayu/build/deps/svelte-animate.js'`,
    'svelte': `'/_ayu/build/deps/svelte-internal.js'`,
    'svelte/transition': `'/_ayu/build/deps/svelte-transition.js'`,
    'svelte/store': `'/_ayu/build/deps/svelte-store.js'`,
    'svelte/internal': `'/_ayu/build/deps/svelte-internal.js'`
  }

  return input.replace(/["']\/?svelte\/?(?:store|animate|transition|internal)?["']/g, (matched: string) => {
    const cleaned = matched.slice(1,-1)
    return `${replacements[cleaned.startsWith('/') ? cleaned.slice(1) : cleaned]}`
  })
}

let buildResult
const buildCache = new Map()
const deps = new Map()

const globalStyles: {[key: string]: string} = {}
export default async function ({
  appFolder,
  input,
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
  const compNames: {[key: string]: boolean} = {}

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
  const batchFiles = batch?.map(fname => fname.startsWith('/') ? fname.substring(1, fname.length) : fname) // .filter(fname => fname.startsWith(inFolder))
  // FIXME: removed files filter try {
  // Deno.statSync(file) } catch (_e) {  return }

  const doPreprocess = (source: string, filenameArg: string) => preprocess(source, {
    style: ({ content, attributes, filename }: {content: string, attributes: {lang: string, global: boolean}, filename: string}) => {
      if (attributes.lang === 'postcss') {
        content = windiParse(content)
      }

      if (attributes.global) {
        globalStyles[filename] = content
        return { code: '' }
      } else if (!clean) {
        // CHECKME
        delete globalStyles[filename]
      }

      return { code: content }
    },
    markup: async ({ content }: { content: string, filename: string }) => {
      await collectWindiClasses(content)
    },
    script: async ({ content, attributes }: {content: string, attributes: {lang: string}, filename: string}) => {
      if (attributes.lang === 'ts') {
        const { code, map, warnings } = await transform(content, { loader: 'ts', sourcemap: true, treeShaking: false })

        if (warnings.length > 0) {
          warnings.forEach(console.warn)
        }

        return {
          code,
          map
          // dependencies
        }
      }
    }
  }, {
    filename: filenameArg
  })

  const entryPoints = files.filter(file => (file.endsWith('_page.svelte') || file.endsWith('_error.svelte') || file === 'app/src/main.js' || file === 'app/src/main.ts' || extraAppEntryPoints.includes(file)))

  if (!buildResult || !arrEqual(entryPoints, buildResult._entryPoints)) {
    buildResult?.rebuild?.dispose()

    buildResult = await build({
      entryPoints,
      outdir: outputTarget,
      entryNames: '[dir]/[name]',
      assetNames: '[dir]/[name]',
      chunkNames: 'shared/[name]-[hash]',
      outbase: 'app/src',
      splitting: true,
      // write: false,
      incremental: true,
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
        esbuildPlugin({ atreyuPath }),

        {
          name: 'svelte',
          setup (bld) {
            bld.onLoad({ filter: /\.svelte$/ }, async ({ path: curFileAbs }) => { // namespace: 'file', suffix: '', pluginData
              const curSubPath = curFileAbs.replace(inFolder, '')

              // if (buildCache.get(curSubPath)) {
              //   return { contents: buildCache.get(curSubPath) }
              // }

              const parent = join(curSubPath, '..')
              const grandParent = join(curSubPath, '..', '..')
              const origFilename = basename(curSubPath)
              const filename = origFilename === '_page.svelte' ? basename(grandParent) + '/' + basename(parent) : basename(parent) + '/' + origFilename

              const source = await Deno.readTextFile(curFileAbs)

              const convertMessage = ({ message, start, end } : {message: string, start: Record<string, number>, end: Record<string, number>}) => {
                let location
                if (start && end) {
                  const lineText = source.split(/\r\n|\r|\n/g)[start.line - 1]
                  const lineEnd = start.line === end.line ? end.column : lineText.length
                  location = {
                    file: filename,
                    line: start.line,
                    column: start.column,
                    length: lineEnd - start.column,
                    lineText
                  }
                }
                return { text: message, location }
              }

              const { code } = await doPreprocess(source, filename)
              // console.log(preprocessReult.dependencies)

              try {
                const { js, warnings } = compile(code, {
                  filename,
                  css: true,
                  dev,
                  generate: 'dom',
                  hydratable: false,
                  // immutable,
                  // ssr,
                  format: 'esm',
                  cssHash: ({ name }: {hash: string, css: string, name: string, filename: string}) => {
                    name = filename.toLowerCase().replace('.svelte', '').replace('/', '_')
                    if (compNames[name]) {
                      // console.warn('  ⚠️ component name seems to be not unique which can lead to stylebleed: ' + name)
                    } else {
                      compNames[name] = true
                    }

                    return `ayu_${name}`
                  },
                  legacy: false,
                  preserveComments: dev,
                  preserveWhitespace: dev,
                  sveltePath: '/svelte'
                })

                // external component css: if (comp.css?.code?.length > 0) {
                //   newEmits.push(basePath + '.postcss.css') ?
                //   await Deno.writeTextFile(
                //     join(outputTarget, subPath) + '.css',
                //     comp.css.code.concat('\n/*# sourceMappingURL=./' + basename(subPath) + '.css.map */')
                //   )
                // }

                const contents = svelteReplace(js.code) + `//# sourceMappingURL=` + js.map.toUrl()
                buildCache.set(curSubPath , contents)
                return { contents, warnings: warnings.map(convertMessage) }
              } catch (err) {
                return { errors: [ convertMessage(err) ] }
              }
            })
          }
        },

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
    buildResult._entryPoints = entryPoints
  } else {
    buildResult = await buildResult.rebuild()
  }
  // outputFiles[{path, contents, text}]
  // console.log(buildResult)
  const newBuildRes: { files: { [key: string]: { deps: string[], emits: string[], newEmits: string[] } } } = parseMetafile(buildResult?.metafile)

  const baseStylePath = `${appFolder}/build/base.css`
  const resetStylePath = `${appFolder}/build/resets.css`

  const { styles: wStyles, resets: wResets } = makeGlobalWindi(!dev)

  const baseStyleContent = wStyles + Object.entries(globalStyles).map(([filename, content]) => `\n\n/* ${filename} */\n${content}\n`).join('\n')
  if (baseStyleContent.length > 1) {
    await Deno.writeTextFile(join(Deno.cwd(), baseStylePath), baseStyleContent)
    newBuildRes.files[baseStylePath] = {
      emits: [baseStylePath],
      newEmits: [baseStylePath],
      deps: []
    }
    console.log(`    ${green('emitted:')} ` + baseStylePath)

    if (wResets) {
      await Deno.writeTextFile(join(Deno.cwd(), resetStylePath), wResets)
      newBuildRes.files[resetStylePath] = {
        emits: [resetStylePath],
        newEmits: [resetStylePath],
        deps: []
      }
      console.log(`    ${green('emitted:')} ` + resetStylePath)
    }
  }

  // const duration = (Math.floor(Date.now() / 100 - startTime / 100)); duration && console.log('  ' + duration + 's') / 10
  return newBuildRes
}
