export default ({ stats, ivrEvent, tel }) => {
  const time = Number(ivrEvent.timestamp)
  const id = 'sms_' + ivrEvent.properties.call_id + '_' + ivrEvent.timestamp

  const init = Math.random().toString(36).substring(2, 15)
  let trackingId = []
  for (let i = 0; i < init.length; i++) {
    const char = init.charAt(i)
    if (isNaN(char)) {
      if (Math.random() >= 0.5) {
        trackingId.push(char)
      } else {
        trackingId.push(char.toUpperCase())
      }
    } else {
      trackingId.push(char)
    }
  }
  trackingId = trackingId.join('')

  return {
    _id: id,
    labels: [ 'active' ],
    created: time,
    sort: time,
    ivr_meta: {
      intent: ivrEvent.properties.intent,
      event_name: ivrEvent.name,
      queue_position: ivrEvent.properties.queue_position,
      trackingId
    },
    foreign_ids: {
      ivr: ivrEvent.properties.call_id
    },
    versions: [
      {
        rel: 'ingest',
        href: 'worker:' + stats.workerId,
        version: stats.version,
        trace_id: `${stats.traceId}`,
        time: Date.parse(stats.time)
      }
    ],
    content: [
      {
        data: `Klick hier starten: https://landing.cloudless.one?call=${trackingId}`,
        type: 'text/plain'
      }
    ],
    dataflow: [
      {
        rel: 'sender',
        href: 'tel:ivr',
        time: time,
        agent: {
          href: 'ntr:ivr'
        }
      },
      {
        rel: 'receiver',
        href: 'tel:' + tel,
        status: 'pending',
        time: time
      }
    ],
    types: [
      {
        profile: 'message',
        prime: 'labels.group'
      }
    ]
  }
}
