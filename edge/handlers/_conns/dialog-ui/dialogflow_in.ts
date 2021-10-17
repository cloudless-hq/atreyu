export default (parsedBody: any): {
  sessionId: string,
  queryText: string,
  action: string,
  parentAction: string,
  params: Record<string, string | number | boolean>,
  fulfillmentText: string,
  fulfillmentMessages: Array<any>,
  allRequiredParamsPresent: boolean,
  outputContexts: Array<any>,
  intentId: string,
  intentName: String,
  toChange: Array<string>,
  raw: any
} => {
  const {
    // responseId,
    session: sessionId,
    queryResult: {
      queryText, // 'Kleidung nach Styles'
      action: parentAction, // '_clothes_by_styles'
      parameters: params, // 'gender': '','budget': '','style': ''
      fulfillmentText, // '_ask_gender', _ask_budget
      fulfillmentMessages: origFulfillmentMessages,
      allRequiredParamsPresent,
      outputContexts,
      intent: {
        name: intentId,
        displayName: intentName
      }
    }
  } = parsedBody

  const fulfillmentMessages = origFulfillmentMessages.map(message => ({text: message?.text?.text }))
  let action = parentAction
  if (fulfillmentMessages?.[0]?.text?.startsWith('_')) {
    // allow dialogUI to handle slot filling, by interpreting fulfillment Text that start with _ as action
    action = fulfillmentMessages[0].text.substr(1)
  }

  let toChange
  if (queryText && queryText.startsWith('__change__')) {
    toChange = queryText.split('__change__')[1].split('__')
  }

  return {
    sessionId,
    queryText,
    action,
    parentAction,
    params,
    fulfillmentText,
    fulfillmentMessages,
    allRequiredParamsPresent,
    outputContexts,
    intentId,
    intentName,
    toChange,
    raw: parsedBody
  }
}