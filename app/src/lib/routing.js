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
           // FIXME: firefox + safari support
          pattern: new URLPattern({ pathname: path }),
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
          // FIXME: firefox + safari support
          pattern: new URLPattern({ pathname: path }),
          operationId: '_bypass'
        })
      }
    })
  })

  // sort by path length and match more specific to less specific order more similar to cloudflare prio matching
  Object.keys(handlers).forEach(method => {
    handlers[method] = handlers[method].sort(({path: a}, {path: b}) => {
      const aNumStar = (a.match(/\*/g) || []).length
      const bNumStar = (b.match(/\*/g) || []).length

      const aNumDash = (a.match(/\:/g) || []).length
      const bNumDash = (b.match(/\:/g) || []).length

      const aPrio = a.length + (bNumStar * 10) + (bNumDash * 5)
      const bPrio = b.length + (aNumStar * 10) + (aNumDash * 5)

      return bPrio - aPrio
    })
  })

  return handlers
}

export function match (req, handlers) {  
  const method = req.method.toLowerCase()

  if (handlers[method]) {
    return handlers[method].find(({ pattern }) => pattern.test(req.url.href))
    // console.log({match, req.url.href})

    // for (let i = 0; i < handlers[method].length; i++) {
    //   if (handlers[method][i].path.endsWith('*')) {
    //     if (req.url.pathname.startsWith(handlers[method][i].path.slice(0, -1))) {
    //       return handlers[method][i]
    //       // workerName = handlers[method][i].operationId
    //       // paramsValidation = handlers[method][i].paramsValidation
    //       // requestBody: handlers[method][i].requestBody
    //       // break
    //     }
    //   } else {
    //     if (req.url.pathname === handlers[method][i].path) {
    //       return handlers[method][i]
    //       // workerName = handlers[method][i].operationId
    //       // paramsValidation = handlers[method][i].paramsValidation
    //       // requestBody: handlers[method][i].requestBody
    //       // break
    //     }
    //   }
    // }
  }

  // return {}
  // return // { workerName, paramsValidation }
}
