// eslint-disable-next-line no-restricted-imports
import { Observable } from '../../build/deps/falcor-observable.js' // @graphistry ?
// eslint-disable-next-line no-restricted-imports
import { Router } from '../../build/deps/falcor-router.js' // @graphistry ?
import { addPathTags } from '../schema/helpers.js'
import defaultPaths from '../schema/default-routes.js'

import { urlLogger } from '../lib/url-logger.js'
import * as systemHandlers from '../schema/falcor-handlers/index.js'
import { get, del, put, post, head, patch } from '../lib/req.js'

export function falcorTags (routes) {
  Object.keys(routes).forEach(key => {
    Object.keys(routes[key]).forEach(method => {
      if (typeof routes[key][method] === 'function') {
        routes[key][method] = { handler: routes[key][method], tags: ['falcor'] }
      } else {
        const tags = routes[key][method].tags
        routes[key][method].tags = tags ? tags : ['falcor'] // FIXME: how to best add to existing tags ? .push?.('falcor')
      }
    })
  })

  return routes
}

function withFetch (fn, customFetch) {
  return function (url, opts) {
    opts.fetch = customFetch
    return fn(url, opts)
  }
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
          arguments[0].ctx = this.ctx
          arguments[0].Observable = this.Observable

          arguments[0].get = this.http_get
          arguments[0].del = this.http_del
          arguments[0].put = this.http_put
          arguments[0].post = this.http_post
          arguments[0].head = this.http_head
          arguments[0].patch = this.http_patch

          arguments[0].model = this.model

          arguments[0].atom = this.model.constructor.atom
          arguments[0].ref = this.model.constructor.ref
          arguments[0].clientRef = (target) => ({ $type: 'atom', $meta: 'clientRef', value: target })
          arguments[0].pathValue = this.model.constructor.pathValue
          arguments[0].error = this.model.constructor.error
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
              if (res.$type) {
                res = { value: res }
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
      // (allow omission of tags for falcor routes)
      schema.paths = { ...defaultPaths, ...falcorTags(schema.paths) }
    }

    dataRoutes = toFalcorRoutes(schema)
  }

  // TODO: precompile and reuse dataRoutes!
  class AtreyuRouter extends Router.createClass(dataRoutes) { // eslint-disable-line functional/no-class
    constructor ({ session, dbs, fetch: internalFetch, debug, ctx = {} }) {
      super({
        // FIXME: check why debug flag and path errors dont work!
        debug,
        // FIXME: route unhandled paths to error handler routeUnhandledPathsT!
        hooks: {
          pathError: err => {
            console.error(err)
          },
          error: err => {
            console.error(err)
          },
          methodSummary: e => {
            // console.log(e)
            if (!debug) {
              // logging is quite expensive
              return
            }
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

            // FIXME: remove me for fallback observable
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
      this.ctx = ctx
      this.dbs = dbs

      this.http_get = withFetch(get, internalFetch)
      this.http_del = withFetch(del, internalFetch)
      this.http_put = withFetch(put, internalFetch)
      this.http_post = withFetch(post, internalFetch)
      this.http_head = withFetch(head, internalFetch)
      this.http_patch = withFetch(patch, internalFetch)

      this.Observable = Observable

      this._unhandled = {
        call: (...args) => {
          console.warn('Missing route for call: ' + JSON.stringify(args))
        },
        set: (...args) => {
          console.warn('Missing route for set: ' + JSON.stringify(args))
        },
        get: (...args) => {
          console.warn('Missing route for get: ' + JSON.stringify(args))
        }
      }
      /* eslint-enable functional/no-this-expression */
    }
  }

  return AtreyuRouter
}
