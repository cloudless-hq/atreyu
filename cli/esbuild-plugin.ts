import { dirname, join, green } from '../deps-deno.ts'
import { formatBytes } from '../app/src/lib/helpers.js'

function toPathObj (newPath: string) {
  const newPathObj = {
    path: newPath,
    namespace: newPath.startsWith('http') ? 'http-import' : undefined
  }

  return newPathObj
}

const responseCache: Record<string, Response> = {}
async function useResponseCacheElseLoad (path: string, headers: Headers) {
  if (responseCache[ path ]) {
    return responseCache[ path ]
  }

  return responseCache[ path ] = await fetch(path.split('?')[ 0 ], { headers })
}

interface pathConf { path: string, importer: string }
interface callbackArg { filter : RegExp, namespace?: string }

type callbackFun = (arg: pathConf) => { path: string, namespace?: string }
type onLoadcallbackFun = (arg: pathConf) => Promise<{ contents: string | Uint8Array, loader?: string }>
type lifecycleFun = (arg: callbackArg, arg2: callbackFun | onLoadcallbackFun) => pathConf


export default ({ local = true, input, atreyuPath, paramsValidation }: { local?: boolean, input?: string, atreyuPath: string, paramsValidation?: string }) => ({
  name: 'atreyu',

  setup: ({ onResolve, onLoad, initialOptions }: {onResolve: lifecycleFun, onLoad: lifecycleFun, initialOptions: { loader?: Record<string, string>} }) => {
    const pathConf = {
      kvs: { filter: /^\/\_kvs\.js/, fun: () => {
        return toPathObj(atreyuPath + (local ? '/edge/lib/kvs-local.js' : '/edge/lib/kvs.js'))
      } },
      env: { filter: /^\/\_env\.js/, fun: () => {
        return toPathObj(atreyuPath + (local ? '/edge/lib/env-local.js' : '/edge/lib/env.js'))
      }},

      handler: { filter: /^\/\_handler\.js/, fun: () => {
        return input ? toPathObj(input) : { contents: 'export default function handler () { }', loader: 'js' }
      }},
      validation: { filter: /^\/\_validation\.js/, fun: () => {
        return {
          contents: paramsValidation || 'export default function validate () { return true }',
          loader: 'js'
        }
      }},

      edge: { filter: /^\/\_edge\//, fun: ({ path }: pathConf) => {
        return toPathObj(path.replace('/_edge', atreyuPath + '/edge'))
      }},
      ayu: { filter: /^\/\_ayu\//, fun: ({ path }: pathConf) => {
        return toPathObj(path.replace('/_ayu', atreyuPath + '/app'))
      }},

      svelte: { filter: /^\/svelte?\//, fun: ({ path }: pathConf) => {
        const replacements: Record<string, string> = {
          '/svelte/animate': '/app/build/deps/svelte-animate.js',
          '/svelte': '/app/build/deps/svelte-internal.js',
          '/svelte/transition': '/app/build/deps/svelte-transition.js',
          '/svelte/store': '/app/build/deps/svelte-store.js',
          '/svelte/internal': '/app/build/deps/svelte-internal.js'
        }
        return toPathObj(atreyuPath + replacements[path])
      }}
    }

    onResolve({ filter: /^https?:\// }, ({ path }: pathConf) => {
      return { path, namespace: 'http-import' }
    })

    onResolve({ filter: pathConf.validation.filter }, ({ path }: pathConf) => {
      return { path, namespace: 'ajv' }
    })

    onResolve({ filter: /.*/, namespace: 'http-import' }, ({ path, importer }: pathConf) => {
      for (const conf of Object.values(pathConf)) {
        if (conf.filter.test(path)) {
          return conf.fun({ path, importer })
        }
      }
      return toPathObj(join( dirname(importer), path ))
    })

    onLoad({ filter: /.*/, namespace: 'http-import' }, async ({ path }: pathConf) => {
      const headers = new Headers()
      const source = await useResponseCacheElseLoad(path, headers)

      if (!source.ok) {
        console.error(`GET ${path} failed: status ${source.status}`)
        return {contents: ''}
      }

      const contents = await source.clone().text()
      const { pathname } = new URL(path)
      const loader = initialOptions.loader?.[ `.${pathname.split('.').at(-1)}` ] ?? (pathname.match(/[^.]+$/)?.[ 0 ])

      return {
        contents: [ 'binary', 'file', 'dataurl' ].includes(loader ?? 'default')
          ? new Uint8Array(await source.clone().arrayBuffer())
          : contents,
        loader
      }
    })

    onResolve({filter: pathConf.svelte.filter}, pathConf.svelte.fun)
    onResolve({filter: pathConf.ayu.filter}, pathConf.ayu.fun)
    onResolve({filter: pathConf.edge.filter}, pathConf.edge.fun)
    onResolve({filter: pathConf.env.filter }, pathConf.env.fun)
    onResolve({filter: pathConf.kvs.filter }, pathConf.kvs.fun)
    onResolve({filter: pathConf.handler.filter}, pathConf.handler.fun)

    onLoad({filter: pathConf.validation.filter, namespace: 'ajv'}, pathConf.validation.fun)
  }
})

export function parseMetafile (metafile, info) {
  function cleanBuildPath (buildPath: string) {
    if (buildPath.includes('/atreyu/')) {
      return '/atreyu/' + buildPath.split('/atreyu/')[1]
    } else {
      return buildPath
    }
  }

  metafile && Object.entries(metafile.outputs).forEach(([fileName, { imports, entryPoint, inputs, bytes }]) => { // exports
    if (!fileName.endsWith('.map')) {
      console.log(`    ${green('emitted:')} ${formatBytes(bytes)} ${entryPoint ? cleanBuildPath(entryPoint) + ' -> ' : ''}${cleanBuildPath(fileName)}`)
      const inputEntries = Object.entries(inputs)

      if (info) {
        if (imports?.length) {
          imports.forEach(({ path }, i) => {
            if (!inputEntries?.length && i === imports.length - 1) {
              console.log(`     └ imports > ${cleanBuildPath(path)}`)
            } else {
              console.log(`     ├ imports > ${cleanBuildPath(path)}`)
            }
          })
        }

        inputEntries.sort((a ,b) => { return b[1].bytesInOutput - a[1].bytesInOutput }).forEach(([inputName, { bytesInOutput }], i) => {
          const percentage = ((bytesInOutput / bytes) * 100).toFixed(1)
          if (i === inputEntries.length - 1) {
            console.log(`     └ ${formatBytes(bytesInOutput).padEnd(6, ' ')} ${percentage.padStart(4, ' ')} % ${cleanBuildPath(inputName)}\n`)
          } else {
            console.log(`     ├ ${formatBytes(bytesInOutput).padEnd(6, ' ')} ${percentage.padStart(4, ' ')} % ${cleanBuildPath(inputName)}`)
          }
        })
      }
    }
  })

  const newBuildRes = { files: {} }
  Object.entries(metafile.outputs || {}).forEach(([fileName, { imports, entryPoint, inputs }]) => {
    newBuildRes.files[entryPoint || fileName] = {
      emits: [
        fileName
      ],
      newEmits: [
        fileName
      ],
      deps: Object.keys(metafile.inputs || {}).map(path => {
        return cleanBuildPath(path)
      })
    }
  })

  // console.log(metafile.outputs)
  // console.log(metafile.inputs)

  // "app/src/pages/settings/_page.svelte": {
  //   bytes: 6280,
  //   imports: [
  //     {
  //       path: "../../cloudless/atreyu/app/build/deps/svelte-internal.js",
  //       kind: "import-statement"
  //     },
  //     {
  //       path: "app/src/pages/settings/table-of-content.svelte",
  //       kind: "import-statement"
  //     },
  //     { path: "app/src/pages/settings/styles.svelte", kind: "import-statement" }
  //   ]
  // },

  return newBuildRes
}
