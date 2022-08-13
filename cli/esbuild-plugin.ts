import { dirname, join } from '../deps-deno.ts'

function toPathObj (newPath) {
  const newPathObj = { path: newPath }

  if (newPath.startsWith('http')) {
    newPathObj.namespace = 'http-import'
  }
  return newPathObj
}

const responseCache = {}
async function useResponseCacheElseLoad (path, headers) {
  if (responseCache[ path ]) {
    return responseCache[ path ]
  }

  return responseCache[ path ] = await fetch(path.split('?')[ 0 ], { headers })
}

export default ({ local, input, atreyuPath }) => ({
  name: 'atreyu',

  setup: ({ onResolve, onLoad, initialOptions }) => {
    function subMatch (path) {

    }

    const pathConf = {
      kvs: { filter: /^\/\$kvs\.js/, fun: () => {
        return toPathObj(atreyuPath + (local ? '/edge/lib/kvs-local.js' : '/edge/lib/kvs.js'))
      } },
      env: { filter: /^\/\$env\.js/, fun: () => {
        return toPathObj(atreyuPath + (local ? '/edge/lib/env-local.js' : '/edge/lib/env.js'))
      }},
      handler: { filter: /^\/\$handler\.js/, fun: () => {
        return toPathObj(input)
      }},
      edge: { filter: /^\/\$edge\//, fun: ({ path }) => {
        return toPathObj(path.replace('/$edge', atreyuPath + '/edge/'))
      }},
      ayu: { filter: /^\/\$ayu\//, fun: ({ path }) => {
        return toPathObj(path.replace('/$ayu', atreyuPath + '/app/src/'))
      }},
      atreyu: { filter: /^\/atreyu\//, fun: ({ path }) => {
        return toPathObj(path.replace('/atreyu', atreyuPath))
      }}
    }

    onResolve({ filter: /^https?:\// }, ({ path }) => {
      return { path, namespace: 'http-import' }
    })

    onResolve({ filter: /.*/, namespace: 'http-import' }, ({ path, importer }) => {
      for (let conf of Object.values(pathConf)) {
        if (conf.filter.test(path)) {
          return conf.fun({ path, importer })
        }
      }
      return toPathObj(join( dirname(importer), path ))
    })

    onLoad({ filter: /.*/, namespace: 'http-import' }, async ({ path }) => {
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

    onResolve({filter: pathConf.atreyu.filter}, pathConf.atreyu.fun)
    onResolve({filter: pathConf.ayu.filter}, pathConf.ayu.fun)
    onResolve({filter: pathConf.edge.filter}, pathConf.edge.fun)
    onResolve({filter: pathConf.env.filter }, pathConf.env.fun)
    onResolve({filter: pathConf.kvs.filter }, pathConf.kvs.fun)
    onResolve({filter: pathConf.handler.filter}, pathConf.handler.fun)
  }
})
