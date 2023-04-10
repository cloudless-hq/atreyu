// eslint-disable-next-line no-restricted-imports
import PouchDB from '../../build/deps/pouchdb.js'
// import findPlugin from 'pouchdb-find'; PouchDB.plugin(findPlugin)

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const awaitableApis = ['/_view/', '/_search/', '/_all_docs', '/_design_docs', '/_find']
let activePush
let pushResolver

async function rateRetryFetch (url, opts, count = 1) {
  if (activePush && awaitableApis.some(elem => url.includes(elem))) {
    await activePush
  }

  const res = await PouchDB.fetch(url, opts)

  if (res.status === 429 && count < 4) {
    console.warn('rate limited, retry no ' + count)
    await sleep(count * 800)
    return rateRetryFetch(url, opts, count++)
  }
  return res
}

// since we know how our checkpoint docs work and they can only be from
// pouch to couch we can cache all GETS and save 2 get requests per sync checkpoint vs normal pouchdb default
const checkpointCache = new Map()

export default async function ({
  clientDbName,
  serverDbName,
  clientDbSeeds,
  sessionId,
  preload
}) {
  PouchDB.prefix = '_ayu_'
  const pouch = new PouchDB(clientDbName, { revs_limit: 200, auto_compaction: true, deterministic_revs: true })
  let couch
  let sync
  const hasCouch = !sessionId.startsWith('ephemeral:')

  await pouch.bulkDocs([ { _id: '_local/ayu', sessionId }, ...(clientDbSeeds || []) ]).catch(() => {})

  if (hasCouch) {
    couch = new PouchDB(`${location.origin}/_api/_couch/${serverDbName}`, {
      fetch: (url, opts) => {
        opts.redirect = 'error'
        opts.headers.set('X-Requested-With', 'XMLHttpRequest')

        let checkpointReq = null
        const [_, idSuffix] = url.split('/_local/')

        if (idSuffix) {
          const checkpointDocId = '_local/' + decodeURIComponent(idSuffix)

          if (checkpointCache.has(checkpointDocId)) {
            checkpointReq = checkpointDocId

            if (opts.method === 'GET' || !opts.method) {
              const maybeCached = checkpointCache.get(checkpointDocId)
              if (maybeCached) {
                // FIXME: add etag?
                return Promise.resolve(new Response(JSON.stringify(maybeCached), { headers: { 'content-type': 'application/json' }}))
              }
            }
          }
        }

        return rateRetryFetch(url, opts).then(res => {
          if (res.status === 401 || res.redirected || res.type === 'opaqueredirect') {
            self.session?.refresh()
          }
          if (checkpointReq) {
            if (res.ok) {
              res.clone().json().then(json => {
                if ((opts.method === 'GET' || !opts.method) && json._rev) {
                  checkpointCache.set(checkpointReq, json)
                } else if (opts.method === 'PUT' && json.ok) {
                  newCheckppint = JSON.parse(opts.body)
                  newCheckppint._rev = json.rev
                  checkpointCache.set(checkpointReq, newCheckppint)
                }
              })
            } else {
              checkpointCache.delete(checkpointReq)
            }
          }

          return res
        })
        // .catch(error => {
        //   console.error({error})
        //   return Promise.reject(error)
        // })
      }
      // skip_setup: true TODO: this breaks startup why?
    })

    const sessionDoc = await couch.get(sessionId)
    if (sessionDoc?.replications) {
      checkpointCache.set(sessionDoc.replications.push)
      checkpointCache.set(sessionDoc.replications.pull)
    }

    if (preload?.length > 0 && !sessionDoc.replications) {
      // TODO: handle updates
      // Use batch instead
      console.log('preloading docs to new pouch...')
      await PouchDB.replicate(couch, pouch, { doc_ids: preload })
    }

    if (!sessionDoc.startSeq) {
      console.warn('missing session doc start seq, fallback to fullsync', sessionDoc)
    }

    sync = PouchDB.sync(pouch, couch, {
      live: true,
      sse: true,
      skipInitialBatch: true, // TODO: setup depending on time since last login?
      retry: true,
      heartbeat: 2500,
      batch_size: 50,
      conflicts: true, // TODO
      pull: {
        since: sessionDoc.startSeq,
        filter: (doc, _opts) => {
          if (doc._conflicts) {
            console.warn(doc._conflicts)
          }
          // console.log('pull filter', { doc, opts })
          return true
          // return !doc._id.startsWith('_design/client')
        }
      },
      push: {
        filter: (doc, _opts) => {
          if (doc._conflicts) {
            console.warn(doc._conflicts)
          }
          if (doc._id.startsWith('count:')) {
            return false
          }
          // console.log('push filter', { doc, opts })
          return true
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
      .on('paused', () => {
        pushResolver?.()
        activePush = null
        pushResolver = null
        // console.info('replication paused')
      })
      .on('active', ({ direction }) => {
        if (direction === 'push') {
          // TODO: add timeout?
          activePush = new Promise((resolve) => { pushResolver = resolve })
        }
        // console.info('replication active', direction)
        init?.()
      })

    let init = () => {
      init = null
      // console.log('initting changes session doc')
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
          // console.log('writing replications to session...')
          sessionDoc.replications = {
            pull: sync.pull.replicationId,
            push: sync.push.replicationId
          }
          couch.put(sessionDoc)
        }

        if (!checkpointCache.has(sessionDoc.replications.push)) {
          checkpointCache.set(sessionDoc.replications.push)
        }
        if (!checkpointCache.has(sessionDoc.replications.pull)) {
          checkpointCache.set(sessionDoc.replications.pull)
        }
      }
    }
  }

  function clear () {
    if (hasCouch) {
      sync.cancel()
      couch.close()
      checkpointCache.clear()
    }
    pouch.close()
  }

  return { pouch, couch, sync, clear }
}
