export default (parsedBody = {}) : {
  sessionId: string,
  responseId: string,
  queryText: string,
  action: string,
  parentAction: string,
  context: Record<string, string | number | boolean>,
  fulfillmentText: string,
  messages: any[],
  allRequiredParamsPresent: boolean,
  outputContexts: any[],
  intentId: string,
  intentName: string,
  toChange: string[],
  raw: any
} => {
  let {
    session: sessionId,
    responseId,
    queryResult: {
      queryText, // 'Kleidung nach Styles'
      action, // 'clothes_by_styles'
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

  const messages = origFulfillmentMessages.map((message: any) => ({ text: message?.text?.text, raw: message }))

  let subAction
  if (messages[0]?.text?.[0]?.startsWith?.('_')) {
    // allow dialogUI to handle slot filling, by interpreting fulfillment Text that start with _ as action
    subAction = messages[0].text[0].substr(1)
  }
  if (!action) {
    action = subAction
  }

  let toChange
  if (queryText && queryText.startsWith('__change__')) {
    toChange = queryText.split('__change__')[1].split('__')
  }

  // console.log(parsedBody)
  return {
    responseId,
    sessionId,
    queryText,
    action,
    subAction,
    context: { ...params },
    fulfillmentText,
    messages,
    allRequiredParamsPresent,
    outputContexts,
    intentId,
    intentName,
    toChange,
    raw: parsedBody
  }
}
