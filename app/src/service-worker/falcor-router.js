import { Router, Observable } from '../../build/deps/falcor.js' // @graphistry/
import { urlLogger } from '../lib/url-logger.js'
import * as systemHandlers from '../schema/falcor-handlers/index.js'

export function falcorTags (routes) {
  Object.keys(routes).forEach(key => {
    Object.keys(routes[key]).forEach(method => {
      const tags = routes[key][method].tags
      routes[key][method].tags = tags ? tags.push('falcor') : ['falcor']
    })
  })

  return routes
}

function getHandler (con) {
  if (con.handler) {
    return con.handler
  } else if (con.operationId) {
    return systemHandlers[con.operationId]
  }
}

export function toFalcorRoutes (schema) {
  const routes = []

  // The first case in 10 years that the semicolon was actually necessary!! (but only due to the bundler) :D
  ;([...Object.entries(schema.paths)]).forEach(([path, { get, call, set }]) => {
    const handlers = {}

    /* eslint-disable functional/no-this-expression */
    if (get && get.tags?.includes('falcor')) {
      handlers.get = function () {
        const path = [ ...arguments[0] ]

        arguments[0].dbs = this.dbs
        arguments[0].userId = this.userId
        arguments[0].Observable = this.Observable

        const getRes = get.handler(...arguments)

        if (getRes.value && !getRes.path) {
          getRes.path = path
        }

        return getRes
      }
    }

    if (set && set.tags?.includes('falcor')) {
      handlers.set = function () {
        arguments[0].dbs = this.dbs
        arguments[0].userId = this.userId
        arguments[0].Observable = this.Observable
        return set.handler(...arguments)
      }
    }

    if (call && call.tags?.includes('falcor')) {
      const handler = getHandler(call)

      handlers.call = function () {
        arguments[0].dbs = this.dbs
        arguments[0].userId = this.userId
        arguments[0].Observable = this.Observable
        return handler(...arguments)
      }
    }
    /* eslint-enable functional/no-this-expression */

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
    // console.log(pathString.replaceAll('[', '').replaceAll(']', ''), key.replaceAll('[', '').replaceAll(']', ''))
    if (pathString.replaceAll('[', '').replaceAll(']', '').startsWith(key.replaceAll('[', '').replaceAll(']', ''))) {
      return value
    }
  }
}

export function makeRouter (dataRoutes) {
  class AtreyuRouter extends Router.createClass(dataRoutes) { // eslint-disable-line functional/no-class
    constructor ({ userId, dbs }) {
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

                  let body = route.results?.map(res => res.value.jsonGraph || res.value.value)
                  duration = route.end && route.start ? route.end - route.start : 0
                  urlLogger({ missing: route.missing, method: e.method.toUpperCase() + batchMarker, url: `falcor://${JSON.stringify(route.pathSet)}`, duration, body })
                } else {
                  urlLogger({ missing: route.missing, method: e.method.toUpperCase() + batchMarker, url: `falcor://${JSON.stringify(route.pathSet)}`, duration, body: e.results[i].value.jsonGraph || e.results[i].value.value })
                }

                i++
              })
            } else {
              let missing = false
              if (e.routes.length < 1) {
                missing = true
              }
              paths = e.callPath || e.jsonGraphEnvelope.paths
              let body = e.jsonGraphEnvelope || e.results.map(res => res.value.jsonGraph || res.value.value)
              urlLogger({ missing, method: e.method.toUpperCase(), url: `falcor://${JSON.stringify(paths)}`, body, duration, args: e.args })
            }
          }
        }
      })

      /* eslint-disable functional/no-this-expression */
      this.userId = userId
      this.dbs = dbs
      this.Observable = Observable
      /* eslint-enable functional/no-this-expression */
    }
  }

  return AtreyuRouter
}
