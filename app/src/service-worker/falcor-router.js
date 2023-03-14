// eslint-disable-next-line no-restricted-imports
import { Observable } from '../../build/deps/falcor-observable.js' // @graphistry ?
// eslint-disable-next-line no-restricted-imports
import { Router } from '../../build/deps/falcor-router.js' // @graphistry ?

import { urlLogger } from '../lib/url-logger.js'
import * as systemHandlers from '../schema/falcor-handlers/index.js'
import req from '../lib/req.js'

export function falcorTags (routes) {
  Object.keys(routes).forEach(key => {
    Object.keys(routes[key]).forEach(method => {
      const tags = routes[key][method].tags
      routes[key][method].tags = tags ? tags.push('falcor') : ['falcor']
    })
  })

  return routes
}

export function toFalcorRoutes (schema) {
  // The first case in 13 years that the semicolon was actually necessary!! (but only due to the bundler) :D
  const routes = [];

  [...Object.entries(schema.paths)].forEach(([path, handlerArgs]) => {
    const handlers = {}

    Object.entries(handlerArgs).forEach(([handlerType, handlerConf]) => {
      if (handlerConf.tags?.includes('falcor')) {
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
          /* eslint-enable functional/no-this-expression */

          const getRes = handler(...arguments)

          if (handlerType === 'get') {
            const pathArg = arguments[0]

            if (getRes.value && !getRes.path) {
              getRes.path = pathArg.length ? [ ...pathArg ] : [ pathArg ]
            } else if (typeof getRes.then === 'function') {
              getRes.then(res => {
                if (res.value && !res.path) {
                  res.path = pathArg.length ? [ ...pathArg ] : [ pathArg ]
                }

                return res
              })
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

function find (map, pathString) {
  for ([key, value] of map.entries()) {
    if (pathString.replaceAll('[', '').replaceAll(']', '').startsWith(key.replaceAll('[', '').replaceAll(']', ''))) {
      return value
    }
  }
}

export function makeRouter (dataRoutes) {
  class AtreyuRouter extends Router.createClass(dataRoutes) { // eslint-disable-line functional/no-class
    constructor ({ session, dbs }) {
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
            // console.log(e)

            const routes = new Map()

            e.routes.forEach(route => {
              routes.set(JSON.stringify(route.pathSet), route)
            })

            e.pathSets?.forEach(pathSet => {
              if (Array.isArray(pathSet) && Array.isArray(pathSet[0])) {
                pathSet[0].forEach(path => {
                  const route = find(routes, JSON.stringify([path]))
                  if (!route) {
                    routes.set(JSON.stringify([path]), { pathSet: [path], missing: true })
                  }
                })
                if (pathSet.length > 1) {
                  console.error('unsupported path set format for logging', pathSet)
                }
              } else {
                const route = find(routes, JSON.stringify(pathSet))
                if (!route) {
                  routes.set(JSON.stringify(pathSet), { pathSet, missing: true })
                }
              }
            })

            let duration = e.end - e.start

            if (routes.size) {
              let i = 0
              routes.forEach(route => {
                let batchMarker = ''
                if (routes.size > 1) {
                  if (i === 0) {
                    batchMarker = ' (batched >'
                  } else if (i === routes.size - 1) {
                    batchMarker = ' < batched)'
                  } else {
                    batchMarker = ' ...'
                  }

                  const body = route.results?.map(res => res.value.jsonGraph || res.value.value)
                  duration = route.end && route.start ? route.end - route.start : 0
                  urlLogger({ missing: route.missing, method: e.method.toUpperCase() + batchMarker, url: `falcor://${JSON.stringify(route.pathSet)}`, duration, body })
                } else {
                  urlLogger({ missing: route.missing, method: e.method.toUpperCase() + batchMarker, url: `falcor://${JSON.stringify(route.pathSet)}`, duration, body: e.results[i]?.value.jsonGraph || e.results[i]?.value.value })
                }

                i++
              })
            } else {
              let missing = false
              if (e.routes.length < 1) {
                missing = true
              }
              const paths = e.callPath || e.jsonGraphEnvelope.paths
              const body = e.jsonGraphEnvelope || e.results.map(res => res.value.jsonGraph || res.value.value)
              urlLogger({ missing, method: e.method.toUpperCase(), url: `falcor://${JSON.stringify(paths)}`, body, duration, args: e.args })
            }
          }
        }
      })

      /* eslint-disable functional/no-this-expression */
      this.session = session
      this.dbs = dbs
      this.req = req
      this.Observable = Observable
      /* eslint-enable functional/no-this-expression */
    }
  }

  return AtreyuRouter
}
