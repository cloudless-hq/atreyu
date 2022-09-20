export function makeSubSchema (parameters) {
  // TODO hanlde required form paraent and parsing etc.
  const paramsSchema = {
    type: 'object',
    properties: {
      url: {},
      headers: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  }
  parameters.forEach(param => {
    // header, path, query, cookie
    if (param.in === 'header') {
      paramsSchema.properties.headers.properties[param.name] = param.schema
      if (param.required) {
        paramsSchema.properties.headers.required.push(param.name)
      }
    } else {
      console.log(param.in + ' not supported yet in param validation')
    }
  })

  return paramsSchema
}
