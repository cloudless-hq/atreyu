export default ({ stats, ivrEvent, tel }) => {
  const time = Number(ivrEvent.timestamp)
  return {
    _id: 'call_' + ivrEvent.properties.call_id,
    labels: [ 'active' ],
    created: time,
    sort: time,
    ivr_meta: {
      intent: ivrEvent.properties.intent,
      event_name: ivrEvent.name,
      queue_position: ivrEvent.properties.queue_position
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
    notify: {
      message: 'New Incoming Call: ' + ivrEvent.properties.intent + ' intent, ' + ivrEvent.name
    },
    dataflow: [
      {
        rel: 'sender',
        href: 'tel:' + tel,
        time: time
      },
      {
        rel: 'receiver',
        href: 'tel:ivr',
        time: time
      }
    ],
    types: [
      {
        profile: 'call',
        prime: 'labels.group'
      }
    ]
  }
}
