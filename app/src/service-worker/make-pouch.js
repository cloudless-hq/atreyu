// eslint-disable-next-line no-restricted-imports
import PouchDB from '../../build/deps/pouchdb.js'
// import findPlugin from 'pouchdb-find'; PouchDB.plugin(findPlugin)
// import req from '../lib/req.js'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const awaitableApis = ['/_view/', '/_search/', '/_all_docs', '/_design_docs', '/_find']
let activePush
let pushResolver

async function rateRetryFetch (url, opts, awaitable, count = 1) {
  if (activePush && awaitable) {
    await activePush
  }

  const res = await PouchDB.fetch(url, opts)

  if (res.status === 429 && count < 4) {
    console.warn('rate limited, retry no ' + count)
    await sleep(count * 800)
    return rateRetryFetch(url, opts, awaitable, count++)
  }
  return res
}

// since we know how our checkpoint docs work and they can only be from
// pouch to couch we can cache all GETS and save 2 get requests per sync checkpoint vs normal pouchdb default

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
  const checkpointCache = new Map()
  const viewCache = new Map()
  const pulledIds = new Set
  const hasCouch = !sessionId.startsWith('ephemeral:')
  let initResolver
  let inited

  await pouch.bulkDocs([ { _id: '_local/ayu', sessionId }, ...(clientDbSeeds || []) ]).catch(() => {})

  if (hasCouch) {
    couch = new PouchDB(`${location.origin}/_api/_couch/${serverDbName}`, {
      fetch: async (url, opts) => {
        opts.redirect = 'error'
        opts.headers.set('X-Requested-With', 'XMLHttpRequest')

        const awaitable = awaitableApis.some(elem => url.includes(elem))
        let viewReqKey = null
        if (awaitable && (opts.method === 'GET' || !opts.method)) {
          const pUrl = new URL(url)
          viewReqKey = pUrl.pathname +[...(new URLSearchParams(pUrl.search))].sort().join('_')

          if (activePush) {
            await activePush
          }

          const maybeCached = viewCache.get(viewReqKey)
          if (maybeCached) {
            // console.log(viewReqKey, '< cached')
            return Promise.resolve(new Response(maybeCached, { headers: { 'content-type': 'application/json' }}))
          }
          // console.log(viewReqKey)
        }

        let checkpointReqKey = null
        const [_, idSuffix] = url.split('/_local/')

        if (idSuffix) {
          const checkpointDocId = '_local/' + decodeURIComponent(idSuffix)
          // console.log(opts.method, {checkpointDocId, checkpointCache})
          if (checkpointDocId === sync.pull.replicationId || checkpointDocId === sync.push.replicationId) {
            checkpointReqKey = checkpointDocId

            if (opts.method === 'GET' || !opts.method) {
              const maybeCached = checkpointCache.get(checkpointDocId)
              if (maybeCached) {
                // FIXME: add etag?
                if (maybeCached._status === 404) {
                  return Promise.resolve(new Response('{}', { status: 404, headers: { 'content-type': 'application/json' }}))
                }
                return Promise.resolve(new Response(JSON.stringify(maybeCached), { headers: { 'content-type': 'application/json' }}))
              }
            }
          }
        }

        return rateRetryFetch(url, opts, awaitable).then(async res => {
          if (res.status === 401 || res.redirected || res.type === 'opaqueredirect') {
            self.session?.refresh()
          }

          if (checkpointReqKey) {
            if (res.ok || res.status === 404) {
              if (res.status === 404) {
                checkpointCache.set(checkpointReqKey, { _status: 404 })
              } else {
                const json = await res.clone().json()

                if ((opts.method === 'GET' || !opts.method) && json._rev) {
                  checkpointCache.set(checkpointReqKey, json)
                } else if (opts.method === 'PUT' && json.ok) {
                  const newCheckpoint = JSON.parse(opts.body)
                  newCheckpoint._rev = json.rev
                  checkpointCache.set(checkpointReqKey, newCheckpoint)
                }
              }
            } else {
              checkpointCache.delete(checkpointReqKey)
            }
          } else if (viewReqKey) {
            if (res.ok) {
              viewCache.set(viewReqKey, await res.clone().text())
            } else {
              viewCache.delete(viewReqKey)
            }
          }

          return res
        })
        // .catch(error => {
        //   console.error({error})
        //   return Promise.reject(error)
        // })
      },
      skip_setup: true
    })

    const pullDocs = async function (ids, { includeDocs = false } = {}) {
      // TODO: skip this and assume not there? // dont pullDocs from queries but only set references there?
      const pouchRes = await pouch.allDocs({
        include_docs: includeDocs,
        conflicts: false,
        keys: ids
      })

      const docs = []
      const missingIds = []
      pouchRes?.rows?.forEach(row => {
        if (row.error || !row.value) {
          if (row.error !== 'not_found') {
            console.error(row)
          }

          missingIds.push(row.key)
        } else if (row.doc) {
          docs.push(row.doc)
        }
      })

      if (hasCouch && missingIds.length > 0) {
        const freshRows = await couch.allDocs({ keys: missingIds, conflicts: true, include_docs: true, attachments: true })
        // await req(couch.name + '/_all_docs?include_docs=true&attachments=true&conflicts=true', {
        //   body: { 'keys': missingIds }
        // })

        const freshDocs = freshRows.rows?.filter(row => !!row.doc).map(row => {
          pulledIds.add(row.doc._id)
          if (includeDocs) {
            docs.push(row.doc)
          }
          return row.doc
        })

        freshDocs?.length && pouch.bulkDocs(freshDocs, {
          new_edits: false
        })
      }

      return includeDocs ? docs : true
    }

    const [ sessionDoc ] = await pullDocs([sessionId], { includeDocs: true }) // await couch.get(sessionId)

    if (!sessionDoc.replications) {
      if (preload?.length > 0) {
         // TODO: handle updates
        // Use batch instead
        console.log('preloading docs to new pouch...', preload)
        await PouchDB.replicate(couch, pouch, { doc_ids: preload })
      }

      inited = new Promise((resolve) => { initResolver = resolve })
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

          // design docs have to always be installed via client seeds, never sync push or pull
          if (doc._id.startsWith('_design/')) {
            return false
          }

          if (doc.type !== 'session') {
            // console.log('getting couch change', doc)
            viewCache.clear()
          }

          return true
        }
      },
      push: {
        filter: (doc, _opts) => {
          if (doc._conflicts) {
            console.warn(doc._conflicts)
          }

          if (doc._id.startsWith('count_')) {
            return false
          }

          if (pulledIds.has(doc._id)) {
            pulledIds.delete(doc._id)
            // console.log('pull doc only change')
            return false
          }

          if (doc._id.startsWith('_design/')) {
            return false
          }

          if (doc.type !== 'session') {
            // console.log('pushing doc change', doc)
            viewCache.clear()
          }

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
        initResolver?.()
        initResolver = null
      })
      .on('active', ({ direction }) => {
        if (direction === 'push') {
          // TODO: add timeout?
          activePush = new Promise((resolve) => { pushResolver = resolve })
        }
        // console.info('replication active', direction)
        init?.()
      })

    let init = async () => {
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
          await pouch.put(sessionDoc)
        }
      }
    }

    sync.pullDocs = pullDocs
  }

  function clear () {
    if (hasCouch) {
      sync.cancel()
      couch.close()
      checkpointCache.clear()
    }
    pouch.close()
  }

  if (inited) {
    await inited
  }

  return { pouch, couch, sync, clear }
}
