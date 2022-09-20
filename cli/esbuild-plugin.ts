import { dirname, join } from '../deps-deno.ts'

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


export default ({ local, input, atreyuPath, paramsValidation }: { local: boolean, input: string, atreyuPath: string, paramsValidation: string }) => ({
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
        return toPathObj(input)
      }},
      validation: { filter: /^\/\_validation\.js/, fun: () => {
        return {
          contents: paramsValidation || 'export default function validate () { return true }',
          loader: 'js'
        }
      }},
      edge: { filter: /^\/\_edge\//, fun: ({ path }: pathConf) => {
        return toPathObj(path.replace('/_edge', atreyuPath + '/edge/'))
      }},
      ayu: { filter: /^\/\_ayu\//, fun: ({ path }: pathConf) => {
        // console.log({atreyuPath, path})
        return toPathObj(path.replace('/_ayu', atreyuPath + '/app/'))
      }}

      // // TODO: deprecate
      // atreyu: { filter: /^\/atreyu\//, fun: ({ path }: pathConf) => {
      //   return toPathObj(path.replace('/atreyu', atreyuPath))
      // }}
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

    // onResolve({filter: pathConf.atreyu.filter}, pathConf.atreyu.fun)
    onResolve({filter: pathConf.ayu.filter}, pathConf.ayu.fun)
    onResolve({filter: pathConf.edge.filter}, pathConf.edge.fun)
    onResolve({filter: pathConf.env.filter }, pathConf.env.fun)
    onResolve({filter: pathConf.kvs.filter }, pathConf.kvs.fun)
    onResolve({filter: pathConf.handler.filter}, pathConf.handler.fun)

    onLoad({filter: pathConf.validation.filter, namespace: 'ajv'}, pathConf.validation.fun)
  }
})
