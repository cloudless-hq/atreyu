export default ({
  outputContext,
  followupEvent,
  messages
}) => {
  return {
    outputContext,
    followupEvent,
    fulfillmentMessages: messages
  }
}



// {
//   "followupEventInput": {
//     "name": "event-name",
//     "parameters": {
//       "parameter-name-1": "parameter-value-1",
//       "parameter-name-2": "parameter-value-2"
//     }
//   }
// }
