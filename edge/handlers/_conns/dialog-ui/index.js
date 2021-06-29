/* global Response  */
import { reqHandler } from 'atreyu/edge'

import templates from './templates'
import fulfillments from './fulfillments'
import toFacebook from './facebook_out'

reqHandler(async ({ parsedBody = {}, event, req }) => {
  const {
    action,
    payload = {},
    confidence,
    slots,
    raw,
    profile = {},
    context = {},
    queryText,
    channel,
    fulfillmentMessages
  } = parsedBody

  const pathParts = req.url.pathname.split('/')
  if (pathParts[pathParts.length - 2] === 'apps') {
    const appName = pathParts[pathParts.length - 1]
    if (req.method === 'GET') {
      const payload = {}

      for (const [key, value] of req.url.searchParams.entries()) {
        payload[key] = value
      }

      const { res } = await fulfillments[`get_${appName}_data`]({ event, payload })

      const newResponse = new Response(JSON.stringify(res), {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*'
        }
      })

      return newResponse
    } else if (req.method === 'POST') {
      const { res } = await fulfillments[`do_${appName}`]({ event, parsedBody })

      const newResponse = new Response(JSON.stringify(res), {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*'
        }
      })

      return newResponse
    } else if (req.method === 'OPTIONS') {

      const newResponse = new Response(null, {
        status: 204,
        statusText: 'OK',
        headers: {
          Allow: 'OPTIONS, GET, POST',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Headers': '*'
        }
      })

      return newResponse
    }
  }

  let response = {}

  const parentAction = action
  if (fulfillmentMessages && fulfillmentMessages[0] && fulfillmentMessages[0].text && fulfillmentMessages[0].text.startsWith('_')) {
    // allow dialogUI to handle slot filling, by interpreting fulfillment Text that start with _ as action
    action = fulfillmentMessages[0].text.substr(1)
  }

  let toChange

  if (queryText && queryText.startsWith('__change__')) {
    toChange = queryText.split('__change__')[1].split('__')
  }

  if (toChange) {
    toChange.forEach(param => {
      context[param] = ''
    })

    response = {
      followupEvent: {
        name: parentAction,
        context
      }
    }
  } else if (action) {
    if (fulfillments[action]) {
      const {
        res,
        templateName = action,
        followupEvent,
        outputContext,
        profileUpdate,
        end_interaction,
        session_entity_types
      } = await fulfillments[action]({ context, queryText, raw, event, slots, profile, confidence, parentAction, payload })

      response.outputContext = outputContext
      response.profileUpdate = profileUpdate

      if (followupEvent) {
        response.followupEvent = followupEvent
      } else {
        response.fulfillmentMessages = await templates({ context, slots, confidence, profile, payload, templateName, parentAction, res })
      }
    } else {
      response.fulfillmentMessages = await templates({ context, profile, slots, confidence, payload, templateName: action, parentAction })
    }

    response.fulfillmentMessages = response.fulfillmentMessages ? response.fulfillmentMessages.map(toFacebook) : undefined
  } else {
    // fallback to default fullfillment messages
    response = { fulfillmentMessages }
  }

  response.source = 'dialog-ui'

  const newResponse = new Response(JSON.stringify(response), {
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' }
  })

  return newResponse
})