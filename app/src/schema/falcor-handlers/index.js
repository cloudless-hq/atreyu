// TODO: warn Observable handlers cannot be async functions themselves
// TODO: filter out changes of own set/ call operations

function doSync (dbs, since, Observable) {
  let id
  let i = 0
  function schedule (action) {
    if (i < 2) {
      i++
      if (id) {
        clearTimeout(id)
        id = null
      }
      id = setTimeout(action, 2)
    }
  }

  return Observable.create(subscriber => {
    // if (since) {
    //   const changes = db.changes({
    //     since: since,
    //     include_docs: true
    //   })

    //   // console.trace(changes, 'oneshot', changes.listenerCount())
    //   const { results, last_seq } = await changes
    //   // not necesarry for single shot: changes.cancel()

    //   if (results.length) {
    //     subscriber.onNext([
    //       { path: ['_seq'], value: { $type: 'atom', value: last_seq } },
    //       ...results.map(change => ({ path: ['_docs', change.id], value: { $type: 'atom', value: change.doc } }))
    //     ])

    //     return () => {}
    //   }
    // }

    const changes = dbs.pouch.changes({
      since: since || 'now',
      live: true,
      include_docs: true
    })

    function cleanup (changesInst) {
      changesInst.cancel()
      changesInst.removeListener('change', changeListener)
      changesInst.removeListener('error', errListener)
      changesInst.removeListener('complete', complListener)
    }

    const complListener = _info => {
      subscriber.onCompleted()
    }

    const errListener = err => {
      subscriber.onError({ path: ['_seq'], value: { $type: 'error', value: err }})
    }

    const changeListener = change => {
      // console.log('_sync handler change', change) // todo: debug realms with client side flags

      // TODO: generic and better invalidation strategy
      // { path: ['products', 'by_title', 'length'], value: { $expires: 0 } }) // immediately invalidate the length

      subscriber.onNext({ path: ['_seq'], value: { $type: 'atom', value: change.seq } })
      subscriber.onNext({ path: ['_docs', change.id], value: { $type: 'atom', value: change.doc } })

      schedule(() => {
        if (!subscriber.isStopped) {
          subscriber.onCompleted()
        }
      }) // TODO: fix router to forward before complete for long running observable!
    }

    changes.on('change', changeListener)
    changes.on('error', errListener)
    changes.on('complete', complListener)

    return () => {
      // todo: cancel changes when no active requests for a while
      cleanup(changes)
    }
  })
}

export const _sync = ({ dbs, Observable }, [ since ]) => {
  return dbs && doSync(dbs, since, Observable)
}

export async function getDocs ({ ids, _event, dbs, req }) {
  const pouchRes = await dbs?.pouch.allDocs({
    include_docs: true,
    conflicts: true,
    keys: ids.filter(id => id)
  })

  const missingIds = []
  const _docs = {}

  pouchRes?.rows?.forEach(row => {
    if (row.error || !row.doc) {
      if (row.error !== 'not_found') {
        console.error(row)
      }

      missingIds.push(row.key)
    } else {
      if (row.doc._conflicts) {
        console.warn('conflicts', row.doc)
      }

      _docs[row.key] = { $type: 'atom', value: row.doc }

      if (row.doc.type) {
        _docs[row.key].$schema = { $ref: row.doc.type }
      } else if (row.doc.types?.length === 1) {
        _docs[row.key].$schema = { $ref: row.doc.types[0].profile }
      } else if (row.doc.types?.length > 1) {
        _docs[row.key].$schema = { anyOf: _row.doc.types.map(type => ({ '$ref': type.profile })) }
      }
    }
  })

  if (missingIds.length > 0) {
    const freshDocs = await req(dbs.couch.name + '/_all_docs?include_docs=true&attachments=true', {
      headers: { 'content-type': 'application/json' },
      body: { 'keys': missingIds }
    })

    // event.waitUntil(
    freshDocs?.rows?.length && dbs.pouch.bulkDocs(freshDocs.rows.map(row => row.doc).filter(exists => exists), {
      new_edits: false
    })
    // )

    freshDocs?.rows?.forEach(row => {
      _docs[row.id] = { $type: 'atom', value: row.doc }
    })
  }

  return {
    jsonGraph: {
      _docs
    }
  }
}

// TODO: chan support
// doc.chans?.forEach(chan => {
//   paths.push(['contactsByChan', btoa(chan.href)])
//   contactsByChan[btoa(chan.href)] = { $type: 'ref', value: ['byId', row.id] }
// })
