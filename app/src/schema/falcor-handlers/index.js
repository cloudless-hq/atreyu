// TODO: warn Observable handlers cannot be async functions themselves
// TODO: filter out changes of own set/ call operations ?

let changes
function doSync (dbs, since, Observable, _model) {
  let id
  let i = 0
  function schedule (action) {
    if (i < 5) {
      i++
      if (id) {
        clearTimeout(id)
        id = null
      }
      id = setTimeout(action, 5)
    }
  }

  return Observable.create(subscriber => {
    //   const changes = db.changes({
    //     since: since,
    //     include_docs: true
    //   })
    //   const { results, last_seq } = await changes
    //   not necesarry for single shot: changes.cancel()
    //   if (results.length) {
    //     subscriber.onNext([
    //       { path: ['_seq'], value: { $type: 'atom', value: last_seq } },
    //       ...results.map(change => ({ path: ['_docs', change.id], value: { $type: 'atom', value: change.doc } }))
    //     ])
    //     return () => {}
    //   }

    let catchupFeed = false
    let usedFeed
    if (!changes) {
      console.log('creating pouch _sync changes feed', since)
      changes = dbs.pouch.changes({
        since: since || 'now',
        live: true,
        timeout: false,
        include_docs: true
      })

      if (since !== undefined) {
        changes.lastSeq = since
      }

      // dbs.pouch.info().then(info => {
      //   changes.lastSeq = info.update_seq
      // })
      usedFeed = changes
    } else {
      if (since !== undefined && since !== null && changes.lastSeq > since) {
        // TODO: catchup feed should be oneshot ?
        catchupFeed = true
        console.log('creating pouch _sync catchup feed for later client', since, changes.lastSeq)
        usedFeed = dbs.pouch.changes({
          since: since,
          live: true,
          timeout: false,
          include_docs: true
        })
      } else {
        usedFeed = changes
      }
    }

    const complListener = _info => {
      console.log("completeing change observable")
      subscriber.onCompleted()
    }

    const errListener = err => {
      subscriber.onError({ path: ['_seq'], value: { $type: 'error', value: err }})
    }

    const changeListener = change => {
      // FIXME: value: invalidated: true not working, and also jsong invalidations:
      // [ ['todos'] ], invalidate: [ ['todos'] ], invalidated: [ ['todos'] ]

      usedFeed.lastSeq = change.seq

      const jsonGE = {
        jsonGraph: {},
        paths: []
      }

      if (change.doc.type === 'system:counter' && change.doc.path) {
        const changePath = change.doc.path.split('.')
        jsonGE.paths.push(changePath)

        let target = jsonGE.jsonGraph
        let i = 0
        for (const key of changePath) {
          i ++
          if (!target[key]) {
            target[key] = {}
          }
          if (i === changePath.length) {
            target[key] = { value: change.doc.value, $type: 'atom' }
          } else {
            target = target[key]
          }
        }
      } else {
        jsonGE.paths.push(['_docs', change.id])
        jsonGE.jsonGraph._docs = {
          [change.id]: { $type: 'atom', value: change.doc, $expires: 1 }
        }
      }

      jsonGE.paths.push(['_seq'])
      jsonGE.jsonGraph._seq = { $type: 'atom', value: change.seq }

      // TODO: fix router to forward before complete for long running observable!
      subscriber.onNext(jsonGE)

      schedule(() => {
        if (!subscriber.isStopped) {
          complListener()
        }
      })
    }

    // console.log('attaching change listeners')
    usedFeed.on('change', changeListener)
    usedFeed.on('error', errListener)
    usedFeed.on('complete', complListener)

    return () => {
      // console.log('cleaning change listeners')
      if (catchupFeed) {
        // TODO: cancel changes when no active requests for a while,
        console.log('killing catchup feed')
        usedFeed.cancel()
      }

      usedFeed.removeListener('change', changeListener)
      usedFeed.removeListener('error', errListener)
      usedFeed.removeListener('complete', complListener)
    }
  })
}

export const _sync = ({ dbs, Observable, model }, [ since ]) => {
  return dbs && doSync(dbs, since, Observable, model)
}

export async function getDocs ({ ids, dbs }) {
  const docs = await dbs.sync.pullDocs(ids.filter(id => id), {includeDocs: true})

  const _docs = {}

  docs.forEach(doc => {
    const envelope = { $type: 'atom', value: doc, $expires: 1 }

    if (doc.type) {
      envelope.$schema = { $ref: doc.type }
    } else if (doc.types?.length === 1) {
      envelope.$schema = { $ref: doc.types[0].profile }
    } else if (doc.types?.length > 1) {
      envelope.$schema = { anyOf: doc.types.map(type => ({ '$ref': type.profile })) }
    }

    _docs[doc._id] = envelope
  })

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
