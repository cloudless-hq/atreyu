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

    if (get && get.tags?.includes('falcor')) {
      handlers.get = function () {
        arguments[0].pouch = this.pouch
        arguments[0].userId = this.userId
        arguments[0].Observable = this.Observable
        return get.handler(...arguments)
      }
    }

    if (set && set.tags?.includes('falcor')) {
      handlers.set = function () {
        arguments[0].pouch = this.pouch
        arguments[0].userId = this.userId
        arguments[0].Observable = this.Observable
        return set.handler(...arguments)
      }
    }

    if (call && call.tags?.includes('falcor')) {
      const handler = getHandler(call)

      handlers.call = function () {
        arguments[0].pouch = this.pouch
        arguments[0].userId = this.userId
        arguments[0].Observable = this.Observable
        return handler(...arguments)
      }
    }

    if (Object.keys(handlers).length > 0) {
      routes.push({
        route: path,
        ...handlers
      })
    }
  })

  return routes
}

export function makeRouter (dataRoutes) {
  class AtreyuRouter extends Router.createClass(dataRoutes) {
    constructor ({ userId, pouch }) {
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
            // start end routes results
            let missing = false
            // console.log(e)
            if (e.routes.length < 1) {
              missing = true
            }

            // console.log(e)

            let paths = e.pathSets
            let duration = e.end - e.start

            if (paths && paths.length) {
              paths.forEach((path, i) => {
                let batchMarker = ''
                if (paths.length > 1) {
                  if (i === 0) {
                    batchMarker = ' (batched >'
                  } else if (i === paths.length - 1) {
                    batchMarker = ' < batched)'
                  } else {
                    batchMarker = ' ...'
                  }
                  let body = e.routes[i].results.map(res => res.value.jsonGraph || res.value.value)
                  duration = e.routes[i].end - e.routes[i].start
                  urlLogger({ missing, method: e.method.toUpperCase() + batchMarker, url: `falcor://${JSON.stringify(path)}`, duration, body })
                } else {
                  urlLogger({ missing, method: e.method.toUpperCase() + batchMarker, url: `falcor://${JSON.stringify(path)}`, duration, body: e.results[i].value.jsonGraph || e.results[i].value.value })
                }
              })
            } else {
              paths = e.callPath || e.jsonGraphEnvelope.paths
              let body = e.jsonGraphEnvelope || e.results.map(res => res.value.jsonGraph || res.value.value)
              urlLogger({ missing, method: e.method.toUpperCase(), url: `falcor://${JSON.stringify(paths)}`, body, duration, args: e.args })
            }
          }
        }
      })

      this.userId = userId
      this.pouch = pouch
      this.Observable = Observable
    }
  }

  return AtreyuRouter
}