export default ({
  outputContext,
  followupEvent,
  messages
}) => {
  let followupEventInput
  if (followupEvent) {
    followupEventInput = {
      name: followupEvent.name,
      parameters: followupEvent.context
    }
  }

  return {
    outputContext,
    followupEventInput,
    fulfillmentMessages: messages
  }
}
