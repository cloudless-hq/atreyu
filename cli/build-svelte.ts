import { join, dirname, basename, compile, preprocess, green } from '../deps-deno.js'

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
  // output,
  dev = true,
  sveltePath = '/svelte'
}: { input: string[], batch: string[], clean: boolean, dev: boolean, sveltePath: string }) {
  const compNames: {[key: string]: boolean} = {}
  const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '')

  const watchConf: { pattern: string, files: { [key: string]: string[] } } = {
    pattern: '**/*.svelte',
    files: {}
  }

  async function compileFolder (inFolder: string) {
    if (inFolder.endsWith('/')) {
      inFolder = inFolder.substring(0, inFolder.length - 1)
    }

    const outputTarget = join(inFolder, '..', 'build') // output ? join(inFolder, '..', '..', 'build', basename(inFolder))

    try {
      if (clean) {
        console.log('remove', outputTarget)
        await Deno.remove(outputTarget, { recursive: true })
      }
    } catch (_e) {}

    try {
      Deno.statSync(inFolder)
    } catch (_e) {
      return
    }

    console.log('  compiling svelte templates for:', inFolder)

    const files = batch ? batch.map(fname => fname.substring(1, fname.length)).filter(fname => fname.startsWith(inFolder)) : await recursiveReaddir(inFolder)

    const fileCompilers = files.map(async file => {
      if (file.endsWith('.css')) {

      }

      if (file.endsWith('.svelte')) {
        // TODO: handle css files with auto js wrapper on import file.css
        let subPath = file.replace(inFolder, '')

        try {
          Deno.statSync(file)
        } catch (_e) {
          return
        }

        try {
          await Deno.mkdir(join(outputTarget, dirname(subPath)), { recursive: true })
        } catch (_e) { }

        let comp
        try {
          const template = await Deno.readTextFile(file)
          const filename = basename(subPath) === 'index.svelte' ? basename(join(subPath, '..')) : basename(subPath)

          const { code, dependencies } = await preprocess(template, {
            // markup: ({ content }) => {
            //   const s = new MagicString(content, { filename })
            //   s.overwrite(pos, pos + 3, 'bar', { storeName: true }) map: s.generateMap()

            script: async ({ content, attributes }: {content: string, attributes: {lang: string}, filename: string}) => {
              if (attributes.lang === 'ts') {
                const tsFilePath = outputTarget + subPath + '.ts'
                const fileUri = `file://${join(Deno.cwd(), tsFilePath)}`
                await Deno.writeTextFile(tsFilePath, content)

                const { files, diagnostics } = await Deno.emit(fileUri, {
                  // bundle: 'module', // module  or classic
                  check: false,
                  compilerOptions: {
                    checkJs: false,
                    removeComments: true,
                    allowUnreachableCode: true,
                    suppressImplicitAnyIndexErrors: true,
                    // baseUrl: './app/src', paths: { '/atreyu/': ['./app/'] }
                  },
                  importMapPath: atreyuPath + '/imports.json',
                  importMap: {
                    imports: {
                      '/atreyu/src/deps/': './app/build/deps/',
                      '/atreyu/': './app/',
                      '/src/': join(Deno.cwd(), 'app', 'src/'),
                      '/schema/': join(Deno.cwd(), 'app', 'schema/'),
                      'svelte': './app/src/deps/svelte-internal.js',
                      'svelte/internal': './app/src/deps/svelte-internal.js'
                    }
                  }
                })

                const deps = Object.keys(files)
                // const tsDeps = deps.filter(file => file.endsWith('.ts'))

                if (diagnostics.length > 0) {
                  console.log(Deno.formatDiagnostics(diagnostics))
                }

                return {
                  code: files[`${fileUri}.js`],
                  map: files[`${fileUri}.js.map`],
                  dependencies: deps
                    .filter(file => !file.endsWith('.map') && !file.endsWith('.js.js'))
                    .map(file => file.replace('file://', ''))
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
          // const result = await postcss([tailwindcss]).process(comp.css)

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

        if (comp.warnings?.length > 0) {
          comp.warnings.map((warning: {filename: string, toString: CallableFunction}) => {
            console.warn(warning.filename)
            console.warn(warning.toString())
          })
        }
        // TODO: console.log(preprocessRes.dependencies)
        watchConf.files[file] = comp.js.map.sources.map((path: string) => path.replace('<file://', '').replace('>', ''))

        console.log(`  ${green('compiled:')} ` + outputTarget + subPath + '.js(.map)')
      }
    })

    await Promise.all(fileCompilers)
  }

  if (typeof input === 'string') {
    await compileFolder(input)
  } else {
    await Promise.all(input.map(inp => compileFolder(inp)))
  }

  return watchConf
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
// const svelte = require('svelte/compiler');
// const MagicString = require('magic-string');
// const { code } = await svelte.preprocess(source, {
//   markup: ({ content, filename }) => {
//     const pos = content.indexOf('foo');
//     if(pos < 0) {
//       return { code: content }
//     }
//     const s = new MagicString(content, { filename })
//     s.overwrite(pos, pos + 3, 'bar', { storeName: true })
//     return {
//       code: s.toString(),
//       map: s.generateMap()
//     }
//   }
// }, {
//   filename: 'App.svelte'
// });
// const svelte = require('svelte/compiler');
// const sass = require('node-sass');
// const { dirname } = require('path');
// const { code, dependencies } = await svelte.preprocess(source, {
//   style: async ({ content, attributes, filename }) => {
//     // only process <style lang="sass">
//     if (attributes.lang !== 'sass') return;
//     const { css, stats } = await new Promise((resolve, reject) => sass.render({
//       file: filename,
//       data: content,
//       includePaths: [
//         dirname(filename),
//       ],
//     }, (err, result) => {
//       if (err) reject(err);
//       else resolve(result);
//     }))
//     return {
//       code: css.toString(),
//       dependencies: stats.includedFiles
//     };
//   }
// }, {
//   filename: 'App.svelte'
// })

// import postcss from "https://deno.land/x/postcss/mod.js";
// import autoprefixer from "https://deno.land/x/postcss_autoprefixer/mod.js";
// postcss_import@0.1.4
// purgecss
// const result = await postcss([autoprefixer]).process(css);
// import { tailwindcss } from '../deps-node.build.js'
// 'https://jspm.dev/tailwindcss'
// TODO: auto fetch and compile sub imports of svelte components?
// TODO: prefixed imported styles