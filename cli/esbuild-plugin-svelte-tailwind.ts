import { join, basename } from '../deps-deno.ts'
import { compile, transform, preprocess } from '../deps-deno.ts'
import { collectWindiClasses, makeGlobalWindi, windiParse } from './windi.ts'

const buildCache = new Map()
// const deps = new Map()

const globalStyles: {[key: string]: string} = {}

function svelteReplace (input: string) {
  const replacements: Record<string, string> = {
    'svelte/animate': `'/_ayu/build/deps/svelte-animate.js'`,
    'svelte': `'/_ayu/build/deps/svelte-internal.js'`,
    'svelte/transition': `'/_ayu/build/deps/svelte-transition.js'`,
    'svelte/easing': `'/_ayu/build/deps/svelte-easing.js'`,
    'svelte/store': `'/_ayu/build/deps/svelte-store.js'`,
    'svelte/internal': `'/_ayu/build/deps/svelte-internal.js'`
  }

  return input.replace(/["']\/?svelte\/?(?:store|animate|transition|internal)?["']/g, (matched: string) => {
    const cleaned = matched.slice(1,-1)
    return `${replacements[cleaned.startsWith('/') ? cleaned.slice(1) : cleaned]}`
  })
}

export function sveltePlugin ({ dev, clean, inFolder, appFolder, globalCssTarget, addGlobalBuildRes }: { dev: boolean, clean: boolean, inFolder: string, appFolder: string, globalCssTarget: string, addGlobalBuildRes }) {
  const compNames: {[key: string]: boolean} = {}

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

  return {
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

      bld.onEnd(async () => {
        let baseStylePath: string
        if (globalCssTarget) {
          baseStylePath = globalCssTarget
        } else {
          baseStylePath = `${appFolder}/build/base.css`
        }

        const resetStylePath = `${appFolder}/build/resets.css`

        const { styles: wStyles, resets: wResets } = makeGlobalWindi(!dev)

        const baseStyleContent = wStyles + Object.entries(globalStyles).map(([filename, content]) => `\n\n/* ${filename} */\n${content}\n`).join('\n')
        if (baseStyleContent.length > 1) {
          await Deno.writeTextFile(join(Deno.cwd(), baseStylePath), baseStyleContent)
          if (wResets) {
            Deno.writeTextFile(join(Deno.cwd(), resetStylePath), wResets) // TODO: missing await reacecondition?
          }

          addGlobalBuildRes?.(() => [
            {
              emits: [baseStylePath],
              newEmits: [baseStylePath],
              deps: []
            },
            {
              emits: [resetStylePath],
              newEmits: [resetStylePath],
              deps: []
            }
          ])
        }
      })
    }
  }
}
