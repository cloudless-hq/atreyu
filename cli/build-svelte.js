import { join, dirname, basename, compile, green } from '../deps-deno.js'

// TODO: auto fetch and compile sub imports of svelte components?

export async function recursiveReaddir(path) {
  const files = []
  const getFiles = async path => {
    for await (const dirEntry of Deno.readDir(path)) {
      if (dirEntry.isDirectory) {
        await getFiles(join(path, dirEntry.name))
      } else if (dirEntry.isFile) {
        files.push(join(path, dirEntry.name))
      }
    }
  };
  await getFiles(path)

  return files
}

export default async function ({
  input = ['app/src/components', 'app/src/pages'],
  output,
  dev = true,
  sveltePath = '/svelte'
}) {
  const compNames = {}

  const watchConf = {
    pattern: '**/*.svelte',
    files: {}
  }

  async function compileFolder (inFolder) {
    if (inFolder.endsWith('/')) {
      inFolder = inFolder.substring(0, inFolder.length - 1)
    }

    const outputTarget = output ? join(inFolder, '..', '..', 'build', basename(inFolder)) : join(inFolder, '..', '..', 'build', basename(inFolder))

    try {
      Deno.statSync(inFolder)
    } catch (_e) {
      return
    }

    console.log('  compiling svelte templates for:', inFolder)

    const files = await recursiveReaddir(inFolder)

    const fileCompilers = files.map(async file => {
      if (file.endsWith('.css')) {
      }

      if (file.endsWith('.svelte')) {
        // TODO: handle css files with auto js wrapper on import file.css
        let subPath = file.replace(inFolder, '')

        const template = await Deno.readTextFile(file)

        let comp
        try {
          comp = await compile(template, {
            filename: basename(subPath),
            css: true,
            dev,
            generate: 'dom', // TODO: ssr and hydratable support
            hydratable: false,
            format: 'esm',
            cssHash: ({ hash, css, name, filename }) => {
              name = name.toLowerCase()
              if (compNames[name]) {
                console.warn('component name seems to be not unique which can lead to stylebleed')
              } else {
                compNames[name] = true
              }

              return `ayu_${name}`
            },
            // immutable
            // customElement, accessors, tag
            legacy: false,
            preserveComments: dev,
            preserveWhitespace: dev,
            sveltePath
          })
        } catch (compErr) {
          console.log(compErr)
          console.log(file, subPath)
          return
        }
        // TODO: onwarn: (warning, handler) => {

        try {
          await Deno.mkdir(join(outputTarget, dirname(subPath)), { recursive: true })
        } catch (_e) { }

        if (comp.css && comp.css.code && comp.css.code.length > 0) {
          await Deno.writeTextFile(
            join(outputTarget, subPath) + '.css',
            comp.css.code
            .concat('\n/*# sourceMappingURL=./' + basename(subPath) + '.css.map */')
          )
        }
        comp.js.code = comp.js.code
        .replace('"/svelte/internal"', '"/atreyu/src/deps/svelte-internal.js"')
        .replace('"/svelte"', '"/atreyu/src/deps/svelte-internal.js"')
        .concat('\n/*# sourceMappingURL=./' + basename(subPath) + '.js.map */')

        await Promise.all([
          Deno.writeTextFile(outputTarget + subPath + '.js', comp.js.code),
          Deno.writeTextFile(outputTarget + subPath + '.js.map', comp.js.map)
        ])

        // TODO: console.log(preprocessRes.dependencies)
        watchConf.files[file] = comp.js.map.sources.map(path => path.replace('<file://', '').replace('>', ''))

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
// });