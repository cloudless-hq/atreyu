// eslint-disable-next-line no-restricted-imports
import { Ajv, ajvStandaloneCode } from '../../deps-deno.ts'

let ajv

export function makeValidator ({ params, standalone }) {
  if (!params) {
    return
  }

  if (!ajv) {
    if (standalone) {
      ajv = new Ajv({ coerceTypes: true, useDefaults: true, code: { source: true, esm: true }})
    } else {
      ajv = new Ajv({ coerceTypes: true, useDefaults: true })
    }
  }

  if (standalone) {
    return ajvStandaloneCode(ajv, ajv.compile(makeSubSchema(params)))
  } else {
    return ajv.compile(makeSubSchema(params))
  }
}

export function makeSubSchema (params) {
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
  params.forEach(param => {
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
