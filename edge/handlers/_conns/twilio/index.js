/* global Response, IVR_PASSWORD, IVR_USER, IVR_SECRET  */
import { create } from '../../../inbox/helpers'
import callIn from './call_in'
import smsOut from './sms_out'
import callUpdt from './call_updt'

export default aync function ({ req, finish, event, stats }) {
  const { parsedBody } = await req.parsedBody
  if (parsedBody.password) {
    if (parsedBody.password !== IVR_PASSWORD || parsedBody.username !== IVR_USER) {
      return finish(new Response(JSON.stringify({error: 'invalid_request'}),
        {
          status: 401,
          statusText: 'Unauthorized',
          headers: {
            'content-type': 'application/json'
          }
        }), parsedBody)
    }

    return finish(new Response(JSON.stringify({
      access_token: IVR_SECRET,
      expires_in: 1540000000
    }), {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json'
      }
    }), parsedBody)
  }

  if (req.headers['authorization'] !== `Bearer ${IVR_SECRET}`) {
    return finish(new Response(JSON.stringify({error: 'invalid_request'}),
      {
        status: 401,
        statusText: 'Unauthorized',
        headers: {
          'content-type': 'application/json'
        }
      }), parsedBody)
  }

  const tel = parsedBody.device.mdn
  const ivrEvent = parsedBody.event

  let doc
  if (ivrEvent.properties.call_type.toLocaleLowerCase() !== 'mobile') {
    return finish(new Response('OK', {
      status: 200,
      statusText: 'OK',
      headers: {}
    }), parsedBody)
  } else if (ivrEvent.name === 'call_received' || ivrEvent.name === 'call_started') {
    doc = callIn({tel, ivrEvent, stats})
  } else if (ivrEvent.name === 'conversation_initiated' || ivrEvent.name === 'busy_conversation_initiated') {
    doc = smsOut({tel, ivrEvent, stats})
  } else {
    event.waitUntil(callUpdt({tel, ivrEvent, stats}))

    return finish(new Response('OK', {
      status: 200,
      statusText: 'OK',
      headers: {}
    }), parsedBody)
  }

  return finish(create({
    doc,
    userId: 'connectors',
    dbUrl: 'https://couch.cloudless.one/user_jan'
  }), parsedBody)
}
