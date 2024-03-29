// eslint-disable-next-line no-restricted-imports
import { Observable } from '../../build/deps/falcor-observable.js' // @graphistry ?
// eslint-disable-next-line no-restricted-imports
import { Router } from '../../build/deps/falcor-router.js' // @graphistry ?
import { addPathTags } from '../schema/helpers.js'
import defaultPaths from '../schema/default-routes.js'

import { urlLogger } from '../lib/url-logger.js'
import * as systemHandlers from '../schema/falcor-handlers/index.js'
import req from '../lib/req.js'

export function falcorTags (routes) {
  Object.keys(routes).forEach(key => {
    Object.keys(routes[key]).forEach(method => {
      const tags = routes[key][method].tags
      routes[key][method].tags = tags ? tags : ['falcor'] // FIXME: how to add to existing tags ? .push?.('falcor')
    })
  })

  return routes
}

function maxRange (ranges) {
  let from
  let to
  ranges.forEach(range => {
    if (to === undefined) {
      to = range.to
    } else {
      to = Math.max(to, range.to)
    }

    if (from === undefined) {
      from = range.from
    } else {
      from = Math.min(from, range.from)
    }
  })

  return { from, to }
}

export function toFalcorRoutes (schema) {
  // The first case in 13 years that the semicolon was actually necessary!! (but only due to the bundler) :D
  const routes = [];

  [...Object.entries(schema.paths)].forEach(([path, handlerArgs]) => {
    const handlers = {}

    Object.entries(handlerArgs).forEach(([handlerType, handlerConf]) => {
      if (handlerConf.tags?.includes?.('falcor')) {
        if (!['get', 'set', 'call'].includes(handlerType)) {
          console.error('unsupported falcor handler type ' + handlerType)
        }

        const handler = handlerConf.handler || (handlerConf.operationId && systemHandlers[handlerConf.operationId])

        handlers[handlerType] = function () {
          /* eslint-disable functional/no-this-expression */
          arguments[0].dbs = this.dbs
          arguments[0].session = this.session
          arguments[0].Observable = this.Observable
          arguments[0].req = this.req
          arguments[0].fetch = this.fetch
          arguments[0].model = this.model
          /* eslint-enable functional/no-this-expression */

          arguments[0].maxRange = maxRange

          let getRes = handler(...arguments)

          if (handlerType === 'get') {
            const pathArg = arguments[0]

            const auoWrap = (paAr, res) => {
              if (res.jsonGraph) {
                return res
              }
              if (res?.length && res?.[0]?.path) {
                return res
              }
              if (['boolean', 'undefined', 'number', 'string'].includes(typeof res) || (!res.value && !res.path)) {
                res = { value: { $type: 'atom', value: res } }
              }
              if (res.value !== undefined && !res.path) {
                res.path = paAr.length ? [ ...paAr ] : [ paAr ]
              }

              return res
            }

            if (typeof getRes.then === 'function') {
              getRes = getRes.then(res => {
                return auoWrap(pathArg, res)
              })
            } else {
              getRes = auoWrap(pathArg, getRes)
            }
          }

          return getRes
        }
      }
    })

    if (Object.keys(handlers).length > 0) {
      routes.push({
        route: path,
        ...handlers
      })
    }
  })

  return routes
}

export function makeRouter ({ dataRoutes, schema }) {
  // TODO: gobally precompile schema on build time
  if (!dataRoutes && schema) {
    if (typeof schema === 'function') {
      schema = schema({ defaultPaths, addPathTags })
    } else if (schema) {
      // (allow omission of tags fro falcor routes)
      schema.paths = { ...defaultPaths, ...falcorTags(schema.paths) }
    }

    dataRoutes = toFalcorRoutes(schema)
  }

  class AtreyuRouter extends Router.createClass(dataRoutes) { // eslint-disable-line functional/no-class
    constructor ({ session, dbs, fetch: internalFetch }) {
      super({
        // FIXME: check why debug flag and path errors dont work!
        debug: false,
        hooks: {
          pathError: err => {
            console.error(err)
          },
          error: err => {
            console.error(err)
          },
          methodSummary: e => {
            const totalDuration = e.end - e.start

            e.routes?.forEach((route, i) => {
              let batchMarker = ''
              if (e.routes.length > 1) {
                if (i === 0) {
                  batchMarker = ' (batched >'
                } else if (i === e.routes.length - 1) {
                  batchMarker = ' < batched)'
                } else {
                  batchMarker = ' ...'
                }

                const body = route.results?.map(res => res.value.jsonGraph || res.value)
                const duration = route.end && route.start ? route.end - route.start : 0

                urlLogger({
                  method: e.method.toUpperCase() + batchMarker,
                  url: `falcor://${JSON.stringify(route.pathSet)}`,
                  duration,
                  error: route.error,
                  body
                })
              } else {
                urlLogger({
                  method: e.method.toUpperCase(),
                  url: `falcor://${JSON.stringify(route.pathSet)}`,
                  error: route.error,
                  duration: totalDuration,
                  body: e.results[i]?.value.jsonGraph || e.results[i]?.value.value
                })
              }
            })

            const reqPaths = [...(e.pathSets || []), ...(e.callPath ? [e.callPath] : []) , ...(e.jsonGraphEnvelope?.paths || [])]
            if (reqPaths.length > (e.routes?.length || 0)) {
              // console.log(e, reqPaths)

              reqPaths.slice(e.routes.length).forEach(pathSet => {
                urlLogger({
                  missing: true,
                  error: e.error,
                  method: e.method.toUpperCase(),
                  url: `falcor://${JSON.stringify(pathSet)}`,
                  duration: totalDuration,
                  args: e.args
                })
              })
            }
          }
        }
      })

      /* eslint-disable functional/no-this-expression */
      this.session = session
      this.dbs = dbs
      this.req = req
      this.fetch = internalFetch
      this.Observable = Observable
      /* eslint-enable functional/no-this-expression */
    }
  }

  return AtreyuRouter
}
