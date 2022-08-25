/* eslint-disable no-restricted-imports */
/* global EventSource */

// @deno-types="../../build/deps/pouchdb.d.ts"
import Pouchdb from '../../build/deps/pouchdb.js'

// import findPlugin from 'Pouchdb-find'
// PouchDB.plugin(findPlugin)

export default async function ({
  dbName,
  designDocs
}) {
  const dbProxyUrl = `${location.origin}/_api/_couch/${dbName}`
  const pouch = new Pouchdb(dbName)

  Pouchdb.replicate(pouch, dbProxyUrl, {
    live: true,
    retry: true,
    checkpoint: 'source'
  })
    .on('change', change => {
      // console.log('pouch change: ' + change.last_seq, change)
      const newDocs = []
      const updtDocs: Document[] = []
      change.docs.forEach(doc => {
        if (doc._revisions) {
          updtDocs.push(doc)
        } else {
          newDocs.push(doc)
        }
      })

      if (updtDocs.length > 0) {
        pouch.bulkGet({
          docs: updtDocs.map(doc => {
            return {
              id: doc._id,
              rev: `${doc._revisions.start - 1}-${doc._revisions.ids[1]}`
            }
          })
        }, (err, res) => {
          if (err) {
            console.error(err)
            return
          }

          const changes = []

          res.results.forEach((docChange, i) => {
            if (docChange.docs.length > 1) {
              console.warn('unexpected pouch changes event')
              console.warn(docChange)
            }
            if (docChange.docs[0].ok._id !== updtDocs[i]._id) {
              console.log('order error')
              console.log({ updtDocs, res })
            }

            changes.push({
              newDoc: updtDocs[i], oldDoc: docChange.docs[0].ok
            })
          })
        })
      }
    })
    .on('denied', denied => {
      console.error('pouch denied')
      console.log(denied)
    })
    .on('error', error => {
      console.log('pouch error:')
      console.log(error)
    })
    .on('complete', error => {
      console.error('pouch sync out quit:')
      console.error(error)
    })

  let sync = {
    _id: '_local/sync',
    last_seq: ''
  }
  try {
    // console.time('sync doc get')
    sync = await pouch.get('_local/sync')
    // console.timeEnd('sync doc get')
  } catch (err) {
    if (err && err.status === 404) {
      console.time('db info get')

      const headers = new Headers()
      headers.append('Authorization', 'Basic ' + btoa(CLOUDANT_KEY + ':' + CLOUDANT_SECRET))
      headers.append('content-type', 'application/json')
      const dbInfoRes = await fetch(cloudantDomain +`/${userDbName}`, { redirect: 'error', headers })
      const dbInfo = await dbInfoRes.json()
      console.timeEnd('db info get')

      sync.last_seq = dbInfo.update_seq
      const syncDocRes = await pouch.put(sync)
      sync._rev = syncDocRes.rev
    }
  }

  const changes = new EventSource(
    `${dbProxyUrl}/_changes?feed=eventsource&since=${sync.last_seq}&conflicts=true&style=all_docs&heartbeat=2500&seq_interval=1`,
    { withCredentials: true }
  )

  changes.addEventListener('error', err => {
    console.log('changes error:')
    console.log(err)
  }, { capture: true, passive: true })

  changes.addEventListener('message', e => {
    const change = JSON.parse(e.data)

    if (change.id.startsWith('session_')) {
      return
    }

    // console.log(change)

    function update ({ newDocs, oldDoc }) {
      // console.log({ updt, old })

      // pouch.lastChangeBatch.invalidated = [
      //   ['messages', 'd2hhdHNhcHA6NDkxNzcyODU5MDgw', ['active', 'all'], 'length']
      // ]

      // changes: [
      // {rev: "3-62aa0bb8c9b20f8f958f873a7fe3dbf7"}
      // deleted: true
      // id: "bXNnX2NydDE1NDQ2NjE4Mzc3OTl3aGF0c2FwcDo0OTE3NzI4NTkwODAxNg=="
      // seq: "2914-g1AAAAQJeJzN0z0OgkAQBeBVjB7BzgOYuEHYRe08gn9bG2bAELJqImjrcVQaj2LlcRSHR ]
      return pouch.bulkDocs(newDocs, { new_edits: false }, (err, docRes) => {
        if (err) {
          console.error(err)
        } else {
          // TODO: sync error handling
          // pouch.lastChangeBatch.
          // pouch.lastChangeBatch.jsonGraph.byId[updt[0]._id] = {
          //   $type: 'atom',
          //   value: updt[0]._deleted ? undefined : updt[0]
          // }

          sync.last_seq = change.seq

          clients.matchAll().then(clts => {
            clts.forEach(client => {
              client.postMessage({
                changes: [{
                  newDoc: newDocs[0], oldDoc
                }]
              })
            })
          })
          pouch.put(sync).then(syncDocRes => {
            sync._rev = syncDocRes.rev
          })
        }
      })
    }

    pouch.get(change.id, {
      revs_info: true
      // open_revs: 'all',
      // conflicts: true
    }, (err, doc) => {
      let unsynced = []
      let synced = []

      if (err && err.message === 'missing') {
        if (!change.deleted) {
          unsynced = change.changes.map(entr => entr.rev)
        }
      } else if (doc) {
        synced = doc._revs_info.map(entr => entr.rev)

        change.changes.forEach(cha => {
          if (!synced.includes(cha.rev)) {
            unsynced.push(cha.rev)
          }
        })
      } else if (err) {
        console.error(err)
      }

      if (unsynced.length > 0) {
        couch.bulkGet({
          docs: unsynced.map(rev => ({
            id: change.id,
            rev
          }))
        })
          .then(res => {
            update({
              newDocs: res.results.flatMap(result => result.docs.map(doc => doc.ok)),
              oldDoc: doc
            })
          })
          .catch(DocErr => {
            console.log(DocErr)
          })
      }
    })
  })

  pouch.ayuSync = () => {

  }

  return pouch
}
