import templates from './templates'
import fulfillments from './fulfillments'
import toFacebook from './facebook_out'
// import intrans from 'transformer/dialog-ui/dialogflow_in.js'

reqHandler(async ({ parsedBody = {}, event, req }) => {
  let response = {}

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
        profileUpdate
        // end_interaction,
        // session_entity_types
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

  const newResponse = new Response(JSON.stringify(response), {
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' }
  })

  return newResponse
})
