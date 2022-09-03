import { join, dirname, basename, green } from '../deps-deno.ts'
import { recursiveReaddir } from './helpers.ts'
import { build, compile, transform, preprocess } from '../deps-deno.ts'
import { collectWindiClasses, makeGlobalWindi, windiParse } from './windi.ts'

const globalStyles: {[key: string]: string} = {}
export default async function ({
  input = [ 'app/src' ],
  batch,
  clean,
  // buildRes,
  // output,
  dev = true,
  sveltePath = '/svelte'
}: { input: string[], batch: string[], clean: boolean, dev: boolean, sveltePath: string }) {
  const startTime = Date.now()
  const compNames: {[key: string]: boolean} = {}

  const deps: Record<string, {files: string[],stats: string[][]}> = {}

  // const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '')

  const newBuildRes: { files: { [key: string]: { deps: string[], emits: string[], newEmits: string[] } } } = {
    files: {}
  }

  async function compileFolder (inFolder: string) {
    if (inFolder.endsWith('/')) {
      inFolder = inFolder.substring(0, inFolder.length - 1)
    }

    const outputTarget = join(inFolder, '..', 'build')

    try {
      if (clean) {
        console.log('  🐘 recreating:', outputTarget)
        await Deno.remove(outputTarget, { recursive: true })
      }
    } catch (_e) { /* ignore */ }

    try {
      await Deno.mkdir(join(outputTarget), { recursive: true })
    } catch (_e) { /* ignore */ }

    try {
      Deno.statSync(inFolder)
    } catch (_e) {
      return
    }

    console.log('  compiling svelte templates:', join(inFolder, '/'))

    const files = batch ? batch.map(fname => fname.substring(1, fname.length)).filter(fname => fname.startsWith(inFolder)) : await recursiveReaddir(inFolder)

    const fileCompilers = files.map(async file => {
      const subPath = file.replace(inFolder, '')
      const newEmits = []
      try {
        Deno.statSync(file)
      } catch (_e) {
        return
      }

      await Deno.mkdir(join(outputTarget, dirname(subPath)), { recursive: true }).catch(_err => {})

      // if (file.endsWith('.css')) {
      // }

      if (file.endsWith('.ts')) {
        await build({ // const { metafile } =
          entryPoints: [file],
          sourcemap: 'external',
          // splitting: true,
          treeShaking: false,
          metafile: true,
          // keepNames: true,
          outfile: outputTarget + subPath + '.js'
        })
        // console.log(metafile)
        // # sourceMappingURL=make-product-type.ts.js.map
        newEmits.push(outputTarget + subPath + '.js')
        newEmits.push(outputTarget + subPath + '.js.map')
      }

      if (file.endsWith('.svelte')) {
        // TODO: handle css files with auto js wrapper on import file.css

        let comp
        try {
          const template = await Deno.readTextFile(file)

          const parent = join(subPath, '..')
          const grandParent = join(subPath, '..', '..')
          const origFilename = basename(subPath)
          const filename = origFilename === 'index.svelte' ? basename(grandParent) + '/' + basename(parent) : basename(parent) + '/' + origFilename

          const { code } = await preprocess(template, {
            style: ({ content, attributes, filename }: {content: string, attributes: {lang: string, global: boolean}, filename: string}) => {
              if (attributes.lang === 'postcss') {
                content = windiParse(content)
              }

              if (attributes.global) {
                globalStyles[filename] = content
                return { code: '' }
              } else if (!clean) {
                delete globalStyles[filename]
              }

              return { code: content }
            },
            markup: async ({ content }: { content: string, filename: string }) => {
              await collectWindiClasses(content)
            },
            script: async ({ content, attributes }: {content: string, attributes: {lang: string}, filename: string}) => {
              if (attributes.lang === 'ts') {
                // const tsFilePath = outputTarget + subPath + '.ts'
                // const fileUri = `file://${join(Deno.cwd(), tsFilePath)}`
                // await Deno.writeTextFile(tsFilePath, content)

                const {code, map, warnings} = await transform(content, { loader: 'ts', sourcemap: true, treeShaking: false })
                // await Deno.writeTextFile(tsDep.replace('/src/', '/build/').replace('file://', ''), esbuildO)

                // const { files, diagnostics, stats  } = await Deno.emit(fileUri, {
                //   // bundle: 'module', // module  or classic
                //   check: false,
                //   compilerOptions: {
                //     checkJs: false,
                //     removeComments: true,
                //     allowUnreachableCode: true,
                //     suppressImplicitAnyIndexErrors: true,
                //     // baseUrl: './app/src', paths: { '/_ayu/': ['./app/'] }
                //   },
                //   importMapPath: atreyuPath + '/imports.json',
                //   importMap: {
                //     imports: {
                //       '/_ayu/src/deps/': './app/build/deps/',
                //       '/_ayu/': './app/',
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
                  map // files[`${fileUri}.js.map`],
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
              name = filename.toLowerCase().replace('.svelte', '').replace('/', '_')
              if (compNames[name]) {
                console.warn('  ⚠️ component name seems to be not unique which can lead to stylebleed: ' + name)
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

        // if (comp.css && comp.css.code && comp.css.code.length > 0) {
        //   newEmits.push(basePath + '.postcss.css') ?
        //   await Deno.writeTextFile(
        //     join(outputTarget, subPath) + '.css',
        //     comp.css.code
        //     // .concat('\n/*# sourceMappingURL=./' + basename(subPath) + '.css.map */')
        //   )
        // }

        comp.js.code = comp.js.code
          .replaceAll(/[",']\/?svelte\/animate[",']/ig, `'/_ayu/build/deps/svelte-animate.js'`)
          .replaceAll(/[",']\/?svelte\/transition[",']/ig, `'/_ayu/build/deps/svelte-transition.js'`)
          .replaceAll(/[",']\/?svelte\/internal[",']/ig, `'/_ayu/build/deps/svelte-internal.js'`)
          .replaceAll(/[",']\/?svelte\/store[",']/ig, `'/_ayu/build/deps/svelte-store.js'`)
          .replaceAll(/[",']\/?svelte[",']/ig, `'/_ayu/build/deps/svelte-internal.js'`)
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

        console.log(`    ${green('emitted:')} ` + outputTarget + subPath + '.js')

        deps[subPath]?.files.forEach((compDep:string, i:number) => {
          console.log(`    ├─ ${compDep.replace(Deno.cwd(), '')}`)
          if (deps[subPath]?.files.length === i + 1) {
            console.log(`    └─ ${deps[subPath]?.stats.map((stat: string[]) => stat.join(': ')).join(', ')}`)
          }
        })
      }
    })

    return Promise.all(fileCompilers)
  }

  if (typeof input === 'string') {
    await compileFolder(input)
  } else {
    await Promise.all(input.map(inp => compileFolder(inp)))
  }

  const baseStylePath = 'app/build/base.css'
  const baseStyleContent = makeGlobalWindi(!dev) + Object.entries(globalStyles).map(([filename, content]) => `\n\n/* ${filename} */\n${content}\n`).join('\n')
  if (baseStyleContent.length > 1) {
    await Deno.writeTextFile(join(Deno.cwd(), baseStylePath), baseStyleContent)
    newBuildRes.files[baseStylePath] = {
      emits: [baseStylePath],
      newEmits: [baseStylePath],
      deps: []
    }

    console.log(`    ${green('emitted:')} ` + 'app/build/base.css')
  }

  const duration = (Math.floor(Date.now() / 100 - startTime / 100)) / 10
  // duration && console.log('  ' + duration + 's')
  // console.log('')
  return newBuildRes
}

// TODO: auto fetch and compile sub imports of svelte components?
// TODO: prefixed imported styles
