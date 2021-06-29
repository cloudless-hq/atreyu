/* global fetch */
import { authHeaders } from '../couchdb/helpers'
import ntrDsignDoc from 'couch/dist/ntr.json'
import cldesignDoc from 'couch/dist/cloudless.json'

async function setupDocs ({ adminHeaders, email, dbUrl }) {
  const meDoc = {
    _id: 'me',
    created: Date.now(),
    name: 'Jan',
    chans: [
      {
        'href': 'whatsapp:12312',
        'user_name': email
      },
      {
        'href': 'facebook:123',
        'user_id': '123',
        'user_name': email
      },
      {
        'href': 'mailto:jan@john',
        'user_id': 'jan@john',
        'user_name': 'jan',
        'real_name': 'Jan Reel'
      },
      {
        'href': 'mailto:jan@other'
      }
    ]
  }

  const welcomeMessage = {
    _id: 'welcome',
    created: Date.now(),
    sort: Date.now(),
    labels: [ 'active' ],
    dataflow: [
      {
        href: 'ntr:mia',
        time: Date.now(),
        rel: 'sender'
      },
      {
        time: Date.now(),
        rel: 'receiver'
      }
    ],
    types: [
      {
        profile: 'message',
        prime: 'labels.group'
      }
    ],
    content: [
      {
        'type': 'text/plain',
        'data': 'Hi'
      }
    ]
  }

  const miaDoc = {
    _id: 'mia',
    name: 'Mia',
    created: Date.now(),

    chans: [{
      href: 'ntr:mia'
    }],
    // foreign_ids: {
    //   whatsapp: profile.id
    // },
    // time: time,
    _attachments: {
      'icon.jpg': {
        content_type: 'image\/jpg',
        data: '77+977+977+977+9ABBKRklGAAEBAQBgAGAAAO+/ve+/vQBDAAcFBQYFBAcGBQYIBwcIChELCgkJChUPEAwRGBUaGRgVGBcbHichGx0lHRcYIi4iJSgpKywrGiAvMy8qMicqKyrvv73vv70AQwEHCAgKCQoUCwsUKhwYHCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioq77+977+9ABEIAFgAWAMBIgACEQEDEQHvv73vv70AHAAAAQUBAQEAAAAAAAAAAAAAAAIDBAUGBwEI77+977+9ADUQAAIBAwIEBAQEBQUAAAAAAAECAwAEEQUhBhIxQQcTUWEUInHvv70VI++/ve+/vUJSYu+/ve+/vTIzcu+/ve+/ve+/ve+/vQAaAQACAwEBAAAAAAAAAAAAAAADBAECBQYA77+977+9ACERAAMAAwADAAIDAAAAAAAAAAABAgMREgQhMRNRIiNC77+977+9AAwDAQACEQMRAD8AWxpl77+9FO+/vT3vv73vv71c1b8P77+9JDvvv70nT2Hvv71cNih5K++/vTsKaS3vv73vv70uIu+/vULvv70677+9HTJ3Ne+/ve+/ve+/vSLvv73vv70IFB7vv73cmu+/vWvvv73vv71S77+9SO+/ve+/ve+/vWoU77+977+9Te+/vSfftW1h77+977+9fdCl77+977+9Gig477+9DgXvv73vv73vv73vv70dKu+/vWVZY1fvv73vv73vv73vv71BB2Ir77+9CC7vv73vv704X++/ve+/vRjvv73vv71aThvvv71be1lh77+9bywr77+9GGPvv70377+977+9XjTvv73vv70+77+9x5Xvv73vv71f77+9V++/ve+/vUrvv73vv71U77+9eu+/ve+/vUDvv71D77+977+9MO+/ve+/vVPvv71qOu+/ve+/ve+/vTVG77+9JCnvv73vv70NFU3vv70+77+9fu+/ve+/ve+/vdSRL++/ve+/ve+/ve+/ve+/vXzvv73vv71gQe+/vVrvv707VGnvv73vv73vv70m77+9eO+/vUjvv71i77+9Mg0f77+977+977+977+9URc9Tu+/vW4577+9cO+/vde/77+977+977+977+9I++/vQ/vv73vv73vv71D77+977+9ft6U77+977+9Wu+/ve+/ve+/ve+/vRXvv70eYjAJOe+/vX3vv73vv71xGu+/vV7vv73vv73vv71P77+977+9FSPvv73vv73vv715QO+/ve+/vR5GTe+/ve+/ve+/ve+/ve+/ve+/vS8I77+9Du+/vcWOLjfvv73Ts++/ve+/vXXJkx1CDu+/ve+/vTt777+977+9x6Lvv70G77+977+9Wu+/veGwjmkdcSTvv70KJHfvv73vv709B++/ve+/vVLvv70pId6P77+9Ie+/ve+/vRIeLmHvv73vv73ernTvv71Jbu+/vQAt77+9We+/vWHvv73vv71D77+9Pwrvv71m77+977+977+9AO+/ve+/vRbvv73vv73vv73vv70M77+9Ee+/ve+/vQfvv73vv73vv71vbu+/ve+/ve+/vUYFZu+/vTHIje+/vTHvv70Yeu+/ve+/ve+/vRkxRnXvv73vv71I77+977+9Ne+/ve+/ve+/vVrvv71rMO+/ve+/ve+/vWXvv70wDj0Peu+/vQ1gVO+/ve+/ve+/ve+/vUPvv71o77+9aO+/ve+/vSQ3Su+/vXsh77+977+9eUdU77+977+977+9NS3vv71ULUkL77+977+9Kjrvv71Yf2o8L++/ve+/vW/RhA3KgHQ977+977+977+9b++/ve+/vXETLu+/ve+/ve+/vd+GK35MO++/ve+/vSPvv73vv73vv73vv73vv73vv70b77+977+9X0ZeIe+/ve+/vTdL77+977+977+977+9TO+/vUdeQAsQPe+/vRjvv73vv73vv711fW9a77+9D++/vR1HVTPvv70X77+9Ie+/ve+/ve+/vTbKu2FWIjkx77+977+977+977+977+977+977+9ADJnVWjvv73vv73vv70cESxRIu+/vSAKFUYAA++/vQB0Hu+/ve+/vWTvv70ia0vvv70k77+9Ru+/vUvvv71fTSAo77+977+977+977+9bu+/vRwHIDgEHu+/vT7vv73vv71a77+977+9cnfvv73vv73vv71aSe+/vQgQOnrvv71cJ++/vW4fXSPvv73vv73vv73vv705be+/vUDvv73vv73vv70mXHN/77+9YO+/vXNa77+9U1Pvv73vv71X77+9Hijvv70GWGbvv71+A0/vv71a77+9EO+/vVJUFj9SQe+/ve+/vSVHa3Xvv73vv73vv71bamdT77+9S++/vWTvv71X77+9JXVSSu+/vVl3I37vv71n3osb77+9Re+/vWnvv73vv71oT82l77+9fDsK77+9Wu+/ve+/vVTvv70xSduZ2Izvv71/77+977+977+9Yu+/ve+/ve+/ve+/ve+/vWjvv73vv70477+977+9Xu+/ve+/ve+/ve+/vX3vv73vv70277+9Mu+/vSMg77+9EU7vv702eu+/vWlO77+977+9bO+/ve+/vc+G77+9Je+/ve+/vdWSJBrvv73vv73vv73vv70k77+977+9blAK77+977+977+9CCPvv73vv71G77+977+9du+/ve+/vTrvv73vv73vv73vv70ABO+/ve+/ve+/ve+/ve+/ve+/vRVnWUHqp7rvv70M77+977+9O++/vXIOP++/ve+/ve+/ve+/vTjvv73Il3sNSkUMSceTN0Dvv71D77+9P2rvv70lJDLvv73vv73vv71a04zvv73vv71S77+9Lxrvv73vv71F77+9OGrvv71C77+977+9ESo177+9QmLvv73vv70jEe+/ve+/ve+/vTFnUe+/vXnvv70+77+9OO+/vVcSKXjvv71577+977+9Ajnvv73vv71kdRUf77+977+977+9Me+/ve+/vWkqdVk2I++/vQfvv716b23vv71ea++/vQDvv70OK++/vVVP77+9BUbvv73vv73vv70eHe+/ve+/vXHvv73WrX4aSy5Q34fvv70eSHDvv71z77+9ZyQc77+977+977+977+9eu+/ve+/vR1vDu+/vdi4Z1fvv73vv73vv70YW1bvv73vv73vv73vv71hQRoq77+977+977+977+977+9UO+/vXNjPdid77+9DVzvv73vv71177+9be+/vUkC77+9ZDnvv73vv73vv71+77+977+9Ju+/ve+/vUl3Mu+/ve+/ve+/vUcfTnY977+977+977+9U3nvv73vv71l77+9FO+/vWvvv73LtXsLTTNX77+977+906MR77+9RMORASQmQCRv77+9TUZRXu+/vSzvv703Ek8zc++/vSsXZu+/vSfvv70pRWXvv73vv702OO+/ve+/ve+/vVopaijvv71yW2Pvv73vv71hTu+/vUhhTu+/vS3vv70W77+9Lzrvv71I77+977+9GR9a77+9cO+/vRrvv705Sy1o77+977+9bR3vv73qnoHvv73vv73vv70AWu+/vRFIbe+/ve+/ve+/ve+/ve+/vWTvv70h77+977+977+9aO+/ve+/ve+/vUEq77+9VGY5Me+/vQg/77+9Ne+/vXx077+9Uu+/vciJT++/ve+/vSQB77+977+977+9b++/vVZw0JLfhu+/ve+/vSvvv73vv71JUjpnfFXvv73vv71P77+9Ax7vv700de+/ve+/ve+/vQRB77+9NW0/77+977+977+9e++/ve+/vVAxFBHvv73vv73vv73vv70/77+9cu+/vXde77+977+977+9Vmvvv70j77+9Pe+/ve+/vU/Kg++/ve+/ve+/vU/vv71b77+977+977+977+977+9DtuG77+9GO+/vTNkftWXAu+/vU3vv73vv73vv73vv73vv70q04ooC04q0LkJ0KUUU++/ve+/vVRyT0fvv73vv71o77+977+9aQrvv71Q77+977+9cu+/ve+/ve+/vWJ+77+9fe+/vVnvv73vv70nOUnvv71ZAybvv73vv71Cee+/ve+/vQAm77+977+9H++/vRRSUe+/ve+/vdyx77+977+977+977+9aO+/ve+/vRhE77+9LygbKB3vv73vv70pRUHeiinvv71d77+9GsaBae+/vUYW77+9Ju+/vUzvv71I77+9DO+/ve+/vd+n77+977+977+9au+/vRF3Yu+/vS3vv73vv73vv71EN++/ve+/ve+/ve+/ve+/ve+/vX7vv71RQu+/vcy277+9Y109Mz7vv71JE2JY77+9D++/vQrvv71W77+9Ku+/ve+/ve+/ve+/ve+/ve+/vSoe77+977+977+9RRRRQe+/ve+/ve+/vQ=='
      }
    },
    types: [
      {
        profile: 'contact',
        prime: 'labels.group'
      },
      {
        profile: '_chan',
        prime: 'labels.group'
      }
    ]
  }

  // const supportDoc = {
  //   _id: 'bob',
  //   name: 'Bob the Bot',
  //   created: Date.now(),
  //   modified: Date.now(),
  //   chans: [
  //     {
  //       href: 'ntr:bob',
  //       'user_name': 'Bob'
  //     }
  //   ],
  //   // foreign_ids: {
  //   //   whatsapp: profile.id
  //   // },
  //   // time: time,
  //   types: [
  //     {
  //       profile: 'contact',
  //       prime: 'labels.group'
  //     },
  //     {
  //       profile: '_chan',
  //       prime: 'labels.group'
  //     }
  //   ]
  // }

  const res = await fetch(dbUrl + '/_bulk_docs', {
    method: 'POST',
    body: JSON.stringify({
      docs: [
        ntrDsignDoc,
        cldesignDoc,
        meDoc,
        welcomeMessage,
        // supportDoc,
        miaDoc
      ]
    }),
    headers: adminHeaders
  })

  return res.json()
}

export default async function maybeSetupUser ({ sessionsBody, email, userId, dbUrl }) {
  if (!sessionsBody.error) {
    return
  }

  const adminHeaders = await authHeaders({ userId: '_admin' })

  if (sessionsBody.reason === 'Database does not exist.') {
    const dbRes = await fetch(dbUrl, {
      method: 'PUT',
      headers: adminHeaders
    })

    const secRes = await fetch(dbUrl + '/_security', {
      method: 'PUT',
      body: JSON.stringify({
        admins: {
          names: [],
          roles: []
        },
        members: {
          names: [ userId, 'connectors' ],
          roles: []
        }
      }),
      headers: adminHeaders
    })

    return {
      dDocRes: await setupDocs({ adminHeaders, email, dbUrl }),
      secRes: await secRes.json(),
      dbRes: await dbRes.json()
    }
  } else if (sessionsBody.reason === 'missing') {
    return { dDocRes: await setupDocs({ adminHeaders, email, dbUrl }) }
  } else {
    return { unknownError: sessionsBody }
  }
}
