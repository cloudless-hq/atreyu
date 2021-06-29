// import { idEscape } from '../../../couchdb/helpers'

export default ({ parsedBody = {}, stats, event }) => {
  let content = []
  if (parsedBody['body-html'] && parsedBody['body-html'].length > 0) {
    content.push({
      type: 'text/html',
      data: parsedBody['body-html']
    })
  }

  if (parsedBody['body-plain'] && parsedBody['body-plain'].length > 0) {
    content.push({
      type: 'text/plain',
      data: parsedBody['body-plain']
    })
  }

  // {
  //   type: 'application/html',
  //   data: parsedBody['stripped-html']
  // },
  // {
  //   type: 'text/plain',
  //   data: parsedBody['stripped-text']
  // }
  function parseAdrr (raw) {
    let split = raw.replace('>', '').split('<')
    let email = split[1] || split[0]
    let name = split[0].replace(/"/g, '').trim()
    return { name, email }
  }

  let dataflow = []
  let sender = parseAdrr(parsedBody['from'])
  dataflow.push({
    rel: 'sender',
    href: 'mailto:' + sender.email,
    name: sender.name,
    time: new Date(parsedBody['Date']) / 1,
    info: parsedBody['stripped-signature']
  })

  if (parsedBody['X-Forwarded-For']) {
    dataflow.push({
      rel: 'receiver',
      href: 'mailto:' + parsedBody['X-Forwarded-For'].split(' ')[0],
      time: Date.now()
    })

    dataflow.push({
      rel: 'forward',
      href: 'mailto:' + parsedBody['X-Forwarded-To'],
      time: Date.now()
    })
  } else {
    parsedBody['To'].split(', ').map(toAddr => {
      const to = parseAdrr(toAddr)
      dataflow.push({
        rel: 'receiver',
        href: 'mailto:' + to.email,
        name: to.name,
        time: Date.now()
      })
    })
  }

  return {
    _id: 'mail_' + Date.now() + '_' + sender.email.replace(/[+@.=]/g, '') + '_' + event.request.headers.get('content-length'),
    name: parsedBody.subject,
    labels: [ 'active' ],
    foreign_ids: {
      mailgun: parsedBody['message-url'],
      orig: parsedBody['Message-Id']
    },
    created: Date.now(),
    sort: Date.now(),
    content,
    versions: [
      {
        rel: 'ingest',
        href: 'worker:' + stats.workerId,
        version: stats.version,
        trace_id: `${stats.traceId}`,
        time: Date.parse(stats.time)
      }
    ],
    dataflow,
    types: [
      {
        profile: 'message',
        prime: 'labels.group'
      }
    ]
  }
}

// if (rawMessage.rawMessage && rawMessage.rawMessage.attachments && rawMessage.rawMessage.attachments.length > 0) {
//   if (!result.foreign_attachments) {
//     result.foreign_attachments = []
//   }
//   rawMessage.rawMessage.attachments.forEach((fbAtt) => {
//     if (fbAtt.url && !fbAtt.payload ) {
//       result.text[0].content += '\n\n' + `<a class="link-att" target="_blanc" href="${fbAtt.url}">` + fbAtt.title + '</a>'
//     } else {
//       let att = {
//         content_type: 'image\/jpg', // TODO: handle fbAtt.type
//         href: fbAtt.payload.url
//       }
//       result.foreign_attachments.push(att)
//     }
//   })
// }
// attachments
// [{ "url": "https://storage.eu.mailgun.net/v3/domains/cloudless.one/messages/<id>/attachments/0",
//   "content-type": "image/png",
//   "name": "Bildschirmfoto 2018-11-09 um+22.03.13.png",
//   "size": 566831 }]
// content-id-map
// { "<166fb21fa296d5d7fe11>": "https://storage.eu.mailgun.net/v3/domains/cloudless.one/messages/<id>/attachments/0"}
