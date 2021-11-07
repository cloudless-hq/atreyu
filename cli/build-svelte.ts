import { join, dirname, basename, compile, preprocess, green } from '../deps-deno.js'
import { exec } from './exec.js'
import * as esbuild from 'https://deno.land/x/esbuild@v0.13.3/mod.js'
export async function recursiveReaddir (path: string) {
  const files: string[] = []
  const getFiles = async (path: string) => {
    for await (const dirEntry of Deno.readDir(path)) {
      if (dirEntry.isDirectory) {
        await getFiles(join(path, dirEntry.name))
      } else if (dirEntry.isFile) {
        files.push(join(path, dirEntry.name))
      }
    }
  }
  await getFiles(path)

  return files
}

export default async function ({
  input = [ 'app/src' ],
  batch,
  clean,
  // buildRes,
  // output,
  dev = true,
  sveltePath = '/svelte'
}: { input: string[], batch: string[], clean: boolean, dev: boolean, sveltePath: string }) {
  const compNames: {[key: string]: boolean} = {}
  let postcssComponents: string[] = []
  let deps = {}

  const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '')

  const newBuildRes: { files: { [key: string]: { deps: string[], emits: string[], newEmits: string[] } } } = {
    files: {}
  }

  async function compileFolder (inFolder: string) {
    if (inFolder.endsWith('/')) {
      inFolder = inFolder.substring(0, inFolder.length - 1)
    }

    const outputTarget = join(inFolder, '..', 'build') // output ? join(inFolder, '..', '..', 'build', basename(inFolder))

    try {
      if (clean) {
        console.log('  🐘 removing:', outputTarget)
        await Deno.remove(outputTarget, { recursive: true })
      }
    } catch (_e) {}

    try {
      Deno.statSync(inFolder)
    } catch (_e) {
      return
    }

    console.log('  compiling svelte templates:', join(inFolder, '/'))

    const files = batch ? batch.map(fname => fname.substring(1, fname.length)).filter(fname => fname.startsWith(inFolder)) : await recursiveReaddir(inFolder)

    const fileCompilers = files.map(async file => {
      let subPath = file.replace(inFolder, '')
      const newEmits = []
      try {
        Deno.statSync(file)
      } catch (_e) {
        return
      }
      try {
        await Deno.mkdir(join(outputTarget, dirname(subPath)), { recursive: true })
      } catch (_e) { }


      if (file.endsWith('.css')) {

      }

      if (file.endsWith('.ts')) {
        const { metafile } = await esbuild.build({
          entryPoints: [file],
          sourcemap: 'external',
          // splitting: true,
          treeShaking: false,
          metafile: true,
          // keepNames: true,
          outfile: outputTarget + subPath + '.js',
        })
        // console.log(metafile)
        // //# sourceMappingURL=make-product-type.ts.js.map
        newEmits.push(outputTarget + subPath + '.js')
        newEmits.push(outputTarget + subPath + '.js.map')
      }

      if (file.endsWith('.svelte')) {
        // TODO: handle css files with auto js wrapper on import file.css

        let comp
        // let forceGlobal
        try {
          const template = await Deno.readTextFile(file)
          const filename = basename(subPath) === 'index.svelte' ? basename(join(subPath, '..')) : basename(subPath)

          const { code } = await preprocess(template, {
            style: async ({ content, attributes, filename }) => {
              if (attributes.lang === 'postcss') {
                // if (!attributes.global) {
                //   console.error('🛑 Error: Svelte postcss supports only global styles at the moment, plase add the global attribute to the style tag and take care to avoid stylebleeds.')
                //   return {code: ''}
                // }
                const basePath = join(outputTarget, subPath).replace('/src/', '/build/')
                const absBasePath = join(Deno.cwd(), basePath)
                const inPath = absBasePath + '.postcss.css'
                const outPath = absBasePath + '.css'
                await Deno.writeTextFile(inPath, content)
                postcssComponents.push(inPath)
                let final = ''
                let sourcemap
                if (!attributes.global ) { // !clean ||
                  await exec(['npx', 'rollup', '-c', '-i', inPath, '-o', outPath])
                  final = await Deno.readTextFile(outPath)
                  sourcemap = await Deno.readTextFile(outPath + '.map')
                } else {
                  newEmits.push(basePath + '.postcss.css')
                }
                return { code: final, map: sourcemap }
              }
            },
            script: async ({ content, attributes }: {content: string, attributes: {lang: string}, filename: string}) => {
              if (attributes.lang === 'ts') {
                // const tsFilePath = outputTarget + subPath + '.ts'
                // const fileUri = `file://${join(Deno.cwd(), tsFilePath)}`
                // await Deno.writeTextFile(tsFilePath, content)

                const {code, map, warnings} = await esbuild.transform(content, { loader: 'ts', sourcemap: true, treeShaking: false })
                // console.log(esbuildO)
                // await Deno.writeTextFile(tsDep.replace('/src/', '/build/').replace('file://', ''), esbuildO)

                // const { files, diagnostics, stats  } = await Deno.emit(fileUri, {
                //   // bundle: 'module', // module  or classic
                //   check: false,
                //   compilerOptions: {
                //     checkJs: false,
                //     removeComments: true,
                //     allowUnreachableCode: true,
                //     suppressImplicitAnyIndexErrors: true,
                //     // baseUrl: './app/src', paths: { '/atreyu/': ['./app/'] }
                //   },
                //   importMapPath: atreyuPath + '/imports.json',
                //   importMap: {
                //     imports: {
                //       '/atreyu/src/deps/': './app/build/deps/',
                //       '/atreyu/': './app/',
                //       '/src/': join(Deno.cwd(), 'app', 'src/'),
                //       '/schema/': join(Deno.cwd(), 'app', 'schema/'),
                //       'svelte': './app/src/deps/svelte-internal.js',
                //       'svelte/internal': './app/src/deps/svelte-internal.js'
                //     }
                //   }
                // })

                // const allDeps = Object.keys(files)
                // const tsDeps = allDeps.filter(file => file.endsWith('.ts.js'))
                // await Promise.all(tsDeps.map(async tsDep => {
                //   if (!tsDep.endsWith(tsFilePath + '.js')) {
                //     // await Deno.writeTextFile(tsDep.replace('/src/', '/build/').replace('file://', ''), files[tsDep])
                //   }
                // }))

                if (warnings.length > 0) {
                  warnings.forEach(console.warn)
                }
                // const dependencies = allDeps
                //   .filter(file => file.endsWith('.ts.js') && !file.endsWith(tsFilePath + '.js'))
                //   .map(file => file.replace('/src/', '/build/').replace('file://', ''))

                // deps[subPath] = { files: dependencies, stats }
                // deps[subPath].stats[1][1] = dependencies.length + 1

                return {
                  code, // files[`${fileUri}.js`],
                  map, // files[`${fileUri}.js.map`],
                  // dependencies
                }
              }
            }
          }, {
            filename
          })

          comp = await compile(code, {
            filename,
            css: true,
            dev,
            generate: 'dom',
            hydratable: false,
            format: 'esm',
            cssHash: ({ name }: {hash: string, css: string, name: string, filename: string}) => {
              name = name.toLowerCase()
              if (compNames[name]) {
                console.warn('component name seems to be not unique which can lead to stylebleed: ' + name)
              } else {
                compNames[name] = true
              }

              return `ayu_${name}`
            },
            // immutable
            legacy: false,
            preserveComments: dev,
            preserveWhitespace: dev,
            sveltePath
          })

          // comp.ssr = await compile(template, { hydratable: true
        } catch (compErr) {
          console.log(compErr)
          console.log(file, subPath)
          return
        }

        if (comp.css && comp.css.code && comp.css.code.length > 0) {
          // const result = await postcss([postcsscss]).process(comp.css)
          await Deno.writeTextFile(
            join(outputTarget, subPath) + '.css',
            comp.css.code
              .concat('\n/*# sourceMappingURL=./' + basename(subPath) + '.css.map */')
          )
        }
        comp.js.code = comp.js.code
          .replaceAll(/[",']svelte\/transition[",']/ig, `'/atreyu/src/deps/svelte-transition.js'`)
          .replaceAll(/[",']\/?svelte\/internal[",']/ig, `'/atreyu/src/deps/svelte-internal.js'`)
          .replaceAll(/[",']\/?svelte\/store[",']/ig, `'/atreyu/src/deps/svelte-store.js'`)
          .replaceAll(/[",']\/?svelte[",']/ig, `'/atreyu/src/deps/svelte-internal.js'`)
          .concat('\n/*# sourceMappingURL=./' + basename(subPath) + '.js.map */')

        await Promise.all([
          Deno.writeTextFile(outputTarget + subPath + '.js', comp.js.code),
          Deno.writeTextFile(outputTarget + subPath + '.js.map', comp.js.map)
          // Deno.writeTextFile(outputTarget + subPath + '.ssr.js', comp.ssr.js)
          // ssr: ["js","css","ast","warnings","vars","stats"]
        ])

        newEmits.push(outputTarget + subPath + '.js')
        newEmits.push(outputTarget + subPath + '.js.map')

        if (comp.warnings?.length > 0) {
          comp.warnings.map((warning: {filename: string, toString: CallableFunction}) => {
            console.warn(warning.filename)
            console.warn(warning.toString())
          })
        }
        // TODO: console.log(preprocessRes.dependencies)
        newBuildRes.files[file] = {
          emits: [outputTarget + subPath + '.js', outputTarget + subPath + '.js.map'],
          newEmits,
          deps: comp.js.map.sources.map((path: string) => path.replace('<file://', '').replace('>', ''))
        }

        console.log(`  ${green('emitted:')} ` + outputTarget + subPath + '.js(.map)')

        deps[subPath]?.files.forEach((compDep, i) => {
          console.log(`    ├─ ${compDep.replace(Deno.cwd(), '')}`)
          if (deps[subPath]?.files.length === i + 1) {
            console.log(`    └─ ${deps[subPath]?.stats.map(stat => stat.join(': ')).join(', ')}`)
          }
        })
      }
    })

    return await Promise.all(fileCompilers)
  }

  if (typeof input === 'string') {
    await compileFolder(input)
  } else {
    await Promise.all(input.map(inp => compileFolder(inp)))
  }

  if (postcssComponents.length > 0 && clean) {
    let twContent = ''
    postcssComponents.forEach(twC => {
      twContent += `@import ".${twC.split('/build')[1]}";\n`
    })
    await Deno.writeTextFile(join(Deno.cwd(), 'app/build/components.postcss.css'), twContent)
  }

  return newBuildRes
}

// TODO: components/
//   base/
//       foo/
//          Button.vue
// The component name will be based on its own path directory and filename. Therefore, the component will be:
// <BaseFooButton />
// result: {
//   code: string,
//   dependencies: Array<string>
// } = await svelte.preprocess(
//   source: string,
//   preprocessors: Array<{
//     markup?: (input: { content: string, filename: string }) => Promise<{
//       code: string,
//       dependencies?: Array<string>
//     }>,
//     script?: (input: { content: string, markup: string, attributes: Record<string, string>, filename: string }) => Promise<{
//       code: string,
//       dependencies?: Array<string>
//     }>,
//     style?: (input: { content: string, markup: string, attributes: Record<string, string>, filename: string }) => Promise<{
//       code: string,
//       dependencies?: Array<string>
//     }>
//   }>,
//   options?: {
//     filename?: string
//   }
// )

// const MagicString = require('magic-string')
// const s = new MagicString(content, { filename }) s.overwrite(pos, pos + 3, 'bar', { storeName: true }) map: s.generateMap()
// import postcss from "https://deno.land/x/postcss/mod.js";
// import autoprefixer from "https://deno.land/x/postcss_autoprefixer/mod.js";
// postcss_import@0.1.4
// purgecss
// const result = await postcss([autoprefixer]).process(css);
// import { postcsscss } from '../deps-node.build.js'
// 'https://jspm.dev/postcsscss'
// TODO: auto fetch and compile sub imports of svelte components?
// TODO: prefixed imported styles