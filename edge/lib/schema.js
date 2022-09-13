export function exec ({ req, _parsedBody, _text }, subSchema, _rootSchema) {
  // in: "header",
  // name: "Content-Length",
  // schema: { type: "integer", maximum: 10000 },
  // required: true

  // TODO hanlde required form paraent and parsing etc.
  const errors = []
  subSchema.parameters?.map(param => {
    if (param.in === 'header') {
      param.validate(req.headers[param.name])

      if (param.validate.errors) {
        errors.push({ ...param, errors: param.validate.errors, validate: undefined })
      }
    } else {
      console.warn('only header param in schema validation supported for now')
    }
  })
  if (subSchema.requestBody) {
    console.warn('only paramets in schema validation supported for now, requestBody still missing')
  }

  return { errors }
}
