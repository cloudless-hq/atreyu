startFeed({dbHost: `/_feed`})
function startFeed ({dbHost, couchSecret, couchKey}) {
  const dbName = 'convoi_igp'
  const last_seq = 0
  const url = `${dbHost}/${dbName}/_changes?feed=eventsource&since=${last_seq}&conflicts=true&style=all_docs&heartbeat=5000&seq_interval=1`
  const changes = new EventSource(url, {
    withCredentials: true
  })
  changes.addEventListener('error', err => {
    // console.log('changes error:')
    // console.log(err)
  }, { capture: true, passive: true })
  changes.addEventListener('heartbeat', e => {
    // console.log(e)
    // clients.matchAll().then(clts => {
    //   clts.forEach(client => {
    //     client.postMessage({
    //       heartbeat: true
    //     })
    //   })
    // })
  }, { capture: true, passive: true })
  // evtSource.addEventListener('ping', e => {
  //   const time = JSON.parse(event.data).time
  // })
  changes.addEventListener('message', e => {
    // const change = JSON.parse(e.data)
    // if (change.id.startsWith('session_')) {
    //   return
    // }
    // function update ({ newDocs, oldDoc }) {
    //   // pouch.lastChangeBatch.invalidated = [
    //   //   ['messages', 'aasd', ['active', 'all'], 'length']
    //   // ]
    //   // changes: [ {rev: "3-62aa0bb8c9b20f8f958f873a7fe3dbf7"}
    //   // deleted: true
    //   // id: "asd=="
    //   // seq: "2914-asd ]
    //   return pouch.bulkDocs(newDocs, { new_edits: false }, (err, docRes) => {
    //     if (err) {
    //       console.error(err)
    //     } else {
    //       // TODO: sync error handling
    //       // pouch.lastChangeBatch.
    //       // pouch.lastChangeBatch.jsonGraph.byId[updt[0]._id] = {
    //       //   $type: 'atom',
    //       //   value: updt[0]._deleted ? undefined : updt[0]
    //       // }
    //       sync.last_seq = change.seq
    //       clients.matchAll().then(clts => {
    //         clts.forEach(client => {
    //           client.postMessage({
    //             changes: [{
    //               newDoc: newDocs[0], oldDoc
    //             }]
    //           })
    //         })
    //       })
    //       pouch.put(sync).then(syncDocRes => {
    //         sync._rev = syncDocRes.rev
    //       })
    //     }
    //   })
    // }
    // pouch.get(change.id, {
    //   revs_info: true
    //   // open_revs: 'all',
    //   // conflicts: true
    // }, (err, doc) => {
    //   let unsynced = []
    //   let synced = []
    //   if (err && err.message === 'missing') {
    //     if (!change.deleted) {
    //       unsynced = change.changes.map(entr => entr.rev)
    //     }
    //   } else if (doc) {
    //     synced = doc._revs_info.map(entr => entr.rev)
    //     change.changes.forEach(cha => {
    //       if (!synced.includes(cha.rev)) {
    //         unsynced.push(cha.rev)
    //       }
    //     })
    //   } else if (err) {
    //     console.error(err)
    //   }
    //   if (unsynced.length > 0) {
    //     couch.bulkGet({
    //       docs: unsynced.map(rev => ({
    //         id: change.id,
    //         rev
    //       }))
    //     })
    //     .then(res => {
    //       update({
    //         newDocs: res.results.flatMap(result => result.docs.map(doc => doc.ok)),
    //         oldDoc: doc
    //       })
    //     })
    //     .catch(DocErr => {
    //       console.log(DocErr)
    //     })
    //   }
    // })
  })
}