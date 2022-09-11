// eslint-disable-next-line no-restricted-imports
import PouchDB from '../../build/deps/pouchdb.js'
// import findPlugin from 'pouchdb-find'; PouchDB.plugin(findPlugin)

export default async function ({
  clientDbName,
  serverDbName,
  sessionId,
  preload
}) {
  PouchDB.prefix = '_ayu_'
  const pouch = new PouchDB(clientDbName)
  const couch = new PouchDB(`${location.origin}/_api/_couch/${serverDbName}`)

  const sessionDoc = await couch.get(sessionId)
  await pouch.put({ _id: '_local/ayu', sessionId }).catch(() => {})

  if (preload?.length > 0 && !sessionDoc.replications) {
    // TODO: handle updates
    // Use batch instead
    console.log('preloading docs to new pouch...')
    await PouchDB.replicate(couch, pouch, { doc_ids: preload })
  }

  const sync = PouchDB.sync(pouch, couch, {
    live: true,
    sse: true,
    skipInitialBatch: true, // TODO: setup depending on time since last login?
    retry: true,
    heartbeat: 2500,
    conflicts: true, // TODO
    pull: {
      since: sessionDoc.startSeq,
      filter: (doc, opts) => {
        if (doc._conflicts) {
          console.warn(doc._conflicts)
        }
        // console.log('pull filter', { doc, opts })
        return true
        // return !doc._id.startsWith('_design/client')
      }
    },
    push: {
      filter: (doc, opts) => {
        if (doc._conflicts) {
          console.warn(doc._conflicts)
        }
        // console.log('push filter', { doc, opts })
        return true
        // return !doc._id.startsWith('_design/client')
      }
    }
    // back_off_function: delay => { return 1000 } // TODO integrate online/offline
  })
    .on('denied', err => {
      console.error('denied', err)
    })
    .on('error', err => {
      console.error(err)
    })
    .on('paused', (a) => {
      console.info('replication paused', a)
    })
    .on('active', ({ _direction }) => {
      init?.()
    })

  let init = () => {
    console.log('initting changes session doc')
    if (sync.pull.replicationId && sync.push.replicationId) {
      let updateReplications = false
      if (sessionDoc.replications) {
        if (sessionDoc.replications.pull !== sync.pull.replicationId) {
          console.error('pull replication id cahnged', sessionDoc, sync.pull)
          // TODO: remove old doc
          updateReplications = true
        }
        if (sessionDoc.replications.push !== sync.push.replicationId) {
          console.error('push replication id cahnged', sessionDoc, sync.push)
          // TODO: remove old doc
          updateReplications = true
        }
      }

      if (!sessionDoc.replications || updateReplications) {
        console.log('writing replications to session...')
        sessionDoc.replications = {
          pull: sync.pull.replicationId,
          push: sync.push.replicationId
        }
        couch.put(sessionDoc)
      }
      init = null
    }
  }

  function clear () {
    sync.cancel()
    pouch.close()
    couch.close()
  }

  return { pouch, couch, sync, clear }
}
