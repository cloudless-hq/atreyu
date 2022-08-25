// TODO: warn Observable handlers cannot be async functions themselves
// TODO: filter out changes of own set/ call operations
function userDb (dbs) {
  return dbs.entries().next().value?.[1]
}

export const _sync = ({ dbs, Observable }, [ since ]) => {
  let id
  function schedule (action) {
    if (id) {
      clearTimeout(id)
      id = null
    }
    id = setTimeout(action, 0)
  }

  return Observable.create(subscriber => {
    const changes = userDb(dbs).changes({
      since: since || 'now',
      live: true,
      include_docs: true
    })
      .on('change', change => {
        // { "changes": [ { "rev": "2-f0473cbda03b" } ] }
        // console.log('falcor handler', change) // todo: debug realms with client side flags

        // TODO: generic and better invalidation strategy
        // subscriber.onNext({ path: ['products', 'by_title', 'length'], value: { $expires: 0 } }) // immediately invalidate the length
        subscriber.onNext({ path: ['_seq'], value: { $type: 'atom', value: change.seq } })
        subscriber.onNext({ path: ['_docs', change.id], value: { $type: 'atom', value: change.doc } })
        schedule(() => {
          if (!subscriber.isStopped) {
            subscriber.onCompleted()
          }
        }) // TODO: fix router to forward before complete for long running observable!
      })
      .on('error', err => {
        subscriber.onError({ $type: 'error', value: err })
      })

    // .on('complete', function(info) {
    //   subscriber.onCompleted()
    // })

    return () => {
      changes.cancel()
    }
  })
}

export async function getDocs ({ ids, event, dbs }) {
  const paths = []

  const pouchRes = await userDb(dbs).allDocs({
    include_docs: true,
    keys: ids
  })

  const missingIds = []
  const byId = {}

  pouchRes.rows.forEach(row => {
    if (row.error === 'not_found') {
      missingIds.push(row.key)
    } else if (!row.error) {
      if (row.doc) {
        if (row.doc.chans) {
          row.doc.chans.forEach(chan => {
            paths.push(['contactsByChan', btoa(chan.href)])
            contactsByChan[btoa(chan.href)] = { $type: 'ref', value: ['byId', row.id] }
          })
        }

        paths.push(['byId', row.key])
        byId[row.key] = {
          $type: 'atom',
          value: row.doc
        }
      } else {
        console.error(row)
      }
    } else {
      console.error(row)
    }
  })

  if (missingIds.length > 0) {
    const freshDocs = await fetch('/_api/_couch/' + userDbName + '/_all_docs?include_docs=true&attachments=true', {
      method: 'POST',
      body: JSON.stringify({
        'keys': missingIds
      })
    }).then(res => res.json())

    event.waitUntil(pouch.bulkDocs(freshDocs.rows.map(row => row.doc), {
      new_edits: false
    }))

    freshDocs.rows.forEach(row => {
      // if (row.doc.chans) {
      //   row.doc.chans.forEach(chan => {
      //     paths.push(['contactsByChan', btoa(chan.href)])
      //     contactsByChan[btoa(chan.href)] = { $type: 'ref', value: ['byId', row.id] }
      //   })
      // }

      paths.push(['byId', row.id])
      byId[row.id] = {
        $type: 'atom',
        value: row.doc
      }
    })
  }

  return {
    paths,
    jsonGraph: {
      _docs
    }
  }
}
