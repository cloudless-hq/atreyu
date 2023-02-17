export function parse (schema, filterTags, makeValidator) {
  const handlers = {}

  Object.entries(schema.paths).forEach(([path, value]) => {
    Object.entries(value).forEach(([
      method, {operationId, tags, handler, parameters, _requestBody}
    ]) => {
      if (method === 'parameters') {
        // TODO: implement
        console.error('parameters only supported on path level instead of method')
        return
      }

      if (!filterTags || tags?.some(elem => filterTags.includes(elem))) {
        if (!handlers[method]) {
          handlers[method] = []
        }

        // parsedBody: {},
        handlers[method].push({
          path,
          operationId,
          handler,
          paramsValidation: makeValidator?.({ params: parameters })
          // requestBody: bodyValidation
        })
      } else if ((!filterTags || filterTags.includes('service-worker')) && tags?.includes('edge') && !tags?.includes('service-worker')) {
        // handlers that only work on edge should automatically bypass the sw, for now you cannot have separate sw and edge handlers for the same route
        if (!handlers[method]) {
          handlers[method] = []
        }
        handlers[method].push({
          path,
          operationId: '_bypass'
        })
      }
    })
  })

  // sort by path length and match more specific to less specific order more similar to cloudflare prio matching
  Object.keys(handlers).forEach(method => {
    handlers[method] = handlers[method].sort((first, second) => second.path.length - first.path.length)
  })

  return handlers
}

export function match (req, handlers) {
  const method = req.method.toLowerCase()

  if (handlers[method]) {
    for (let i = 0; i < handlers[method].length; i++) {
      if (handlers[method][i].path.endsWith('*')) {
        if (req.url.pathname.startsWith(handlers[method][i].path.slice(0, -1))) {
          return handlers[method][i]
          // workerName = handlers[method][i].operationId
          // paramsValidation = handlers[method][i].paramsValidation
          // requestBody: handlers[method][i].requestBody
          // break
        }
      } else {
        if (req.url.pathname === handlers[method][i].path) {
          return handlers[method][i]
          // workerName = handlers[method][i].operationId
          // paramsValidation = handlers[method][i].paramsValidation
          // requestBody: handlers[method][i].requestBody
          // break
        }
      }
    }
  }

  // return {}
  // return // { workerName, paramsValidation }
}
