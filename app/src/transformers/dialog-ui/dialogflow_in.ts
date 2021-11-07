export default (parsedBody = {}) : {
  sessionId: string,
  queryText: string,
  action: string,
  context: any,
  parentAction: string,
  params: Record<string, string | number | boolean>,
  fulfillmentText: string,
  fulfillmentMessages: any[],
  allRequiredParamsPresent: boolean,
  outputContexts: any[],
  intentId: string,
  intentName: string,
  toChange: string[],
  raw: any
} => {
  const {
    // responseId,
    session: sessionId,
    context = {},
    queryResult: {
      queryText, // 'Kleidung nach Styles'
      action: parentAction, // '_clothes_by_styles'
      parameters: params, // 'gender': '','budget': '','style': ''
      fulfillmentText, // '_ask_gender', _ask_budget
      fulfillmentMessages: origFulfillmentMessages = [],
      allRequiredParamsPresent,
      outputContexts,
      intent: {
        name: intentId,
        displayName: intentName
      }
    }
  } = parsedBody

  const fulfillmentMessages = origFulfillmentMessages.map((message: any) => ({ text: message?.text?.text, raw: message }))
  let action = parentAction
  if (fulfillmentMessages[0]?.text?.[0]?.startsWith?.('_')) {
    // allow dialogUI to handle slot filling, by interpreting fulfillment Text that start with _ as action
    action = fulfillmentMessages[0].text[0].substr(1)
  }
  // console.log(action, parentAction, fulfillmentMessages)

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
    context,
    intentName,
    toChange,
    raw: parsedBody
  }
}
