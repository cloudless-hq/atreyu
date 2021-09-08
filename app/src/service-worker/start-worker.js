import ipfsHandler from './handlers/ipfs.js'
import corsHandler from './handlers/cors.js'
import makePouch from './make-pouch.js'
import makeFalcorServer from './falcor-server.js'
import { escapeId } from '../../../edge/lib/escape-id.js'

export default function ({
    config,
    appName,
    dbs,
    schema
  }) {

  // TODO: parse schema for severs and set env according to origin
  if (schema.servers) {
    console.warn('currently only dev and prod environments supported')
  }

  let env
  if (location.hostname.endsWith('localhost')) {
    env = 'dev'
  } else if (location.hostname === appName) {
    env = 'prod'
  } else {
    env = location.hostname.replace('.' + appName, '')
  }

  const envConfig = config[env] ? config[env] : {}

  const { orgName, userName } = envConfig

  const {
    // couchKey, couchSecret, couchHost,
    IPFS_GATEWAY = 'http://127.0.0.1:8080'
  } = {...config, ...envConfig}

  let pouch
  let dbConf
  // TODO: how to handle mutliple or switch to consistently only handle one pouch
  if (typeof dbs === 'function') {
    dbConf = dbs({ orgName, userName, appName, env, escapeId })
  } else {
    dbConf = dbs
  }

  Object.entries(dbConf).forEach(([dbName, designDocs]) => {
    pouch = makePouch({
      dbName,
      designDocs,
      // couchKey, couchSecret, couchHost
    })
  })

  console.log('starting service worker...')

  const falcorServer = makeFalcorServer({pouch, schema})

  self.ayu = {
    pouch
  }

  clients.matchAll().then(res => {
    res.forEach(client => client.postMessage(JSON.stringify({ hello: 'joe' })))
  })

  const clientPorts = {}
  addEventListener('message', async e => {
    const data = JSON.parse(e.data)
    const clientId = e.source.id
    const reqId = data[0]
    if (reqId === -1) {
      // hello message and heartbeat
      return
    }

    const conId = clientId + reqId

    if (!clientPorts[conId]) {
      clientPorts[conId] = { client: e.source }
    }

    clientPorts[conId].sub = falcorServer.execute(data)
    .subscribe(
      result => {
        clientPorts[conId].client.postMessage(JSON.stringify({ id: reqId, value: result }))
      },
      error => {
        clientPorts[conId].client.postMessage(JSON.stringify({ id: reqId, error }))
      },
      async done => {
        await clientPorts[conId].client.postMessage(JSON.stringify({ id: reqId, done: true }))

        delete clientPorts[conId]
      }
    )

    const clientIds = (await clients.matchAll()).map(client => client.id)
    Object.entries(clientPorts).forEach(([cId, value]) => {
      if (!clientIds.includes(value.client.id)) {
        value.sub.unsubscribe()
        value.sub.dispose() // necesary ?
        delete clientPorts[cId]
      }
    })
  })

  addEventListener('install', _event => {
    skipWaiting()
    console.log('worker installing, skipping waiting')
  })

  addEventListener('activate', async (event) => {
    event.waitUntil(clients.claim().then(() => {
      console.log('worker activating, claiming clients')
    }))
  })

  let bypass = []
  let corsConf
  Object.entries(schema.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, oper]) => {
      if (oper.operationId === '_cors') {
        corsConf = {
          server: path.replace('*', ''),
          mode: 'proxy'
        }
      } else if (oper.operationId === '_bypass') {
        bypass.push(path)
      }
    })
  })

  // TODO: add navigation preloadoing for interesting routs, also possibly use it for couch syncing by setting header to seq
  addEventListener('fetch', event => {
    let url = new URL(event.request.url)

    const origUrl = new URL(event.request.url)

    if (url.origin !== location.origin) {
      return event.respondWith(
        corsHandler({ event, url, corsConf })
      )
    }

    url = rewrite(url)

    if (event.request.method !== 'GET') {
      return
    }

    const bypassing = bypass.filter(path => {
      if (path.endsWith('*')) {
        if (url.pathname.startsWith(path.replace('*', ''))) {
          return true
        }
      } else {
        if (path === url.pathname) {
          return true
        }
      }
    })
    if (bypassing.length > 0) {
      console.log(bypassing, '_bypassing ' + url.pathname)
      return
    }

    // registration.scope
    // if (routes.includes(url.pathname)) {
    //   url.pathname = '/'
    // }

    return event.respondWith(
      ipfsHandler({ event, url, ipfsGateway: IPFS_GATEWAY, origUrl })
    )
  })
}

// TODO: preload /manifest.json resources and other reqired resources for offline refresh and usage

function rewrite (url) {
  if (url.pathname.endsWith('/')) {
    url.pathname = url.pathname + 'index.html'
    return url
  }

  if (url.pathname.endsWith('.svelte')) {
    url.pathname = url.pathname.replace('src', 'build') + '.js'
  } else {
    url.pathname = url.pathname.replace('/src/deps/', '/build/deps/')
  }

  // if (url.pathname.startsWith('/atreyu')) {
  //   url.hostname = 'bafzbeihnkfyk5bnexkuvlr6nedykcwweftd4awlfd2jmxwg3rkgcqhjgdu.ipns.localhost'
  //   url.pathname = url.pathname.replace('/atreyu/', '/')
  // }

  // console.log('rewritten', url)
  return url
}

// startFeed({dbHost: `/_feed`})
// function startFeed ({dbHost, couchSecret, couchKey}) {
//   const dbName = 'convoi_igp'
//   const last_seq = 0
//   const url = `${dbHost}/${dbName}/_changes?feed=eventsource&since=${last_seq}&conflicts=true&style=all_docs&heartbeat=5000&seq_interval=1`
//   const changes = new EventSource(url, {
//     withCredentials: true
//   })
//   changes.addEventListener('error', err => {
//     // console.log('changes error:')
//     // console.log(err)
//   }, { capture: true, passive: true })
//   changes.addEventListener('heartbeat', e => {
//     // console.log(e)
//     // clients.matchAll().then(clts => {
//     //   clts.forEach(client => {
//     //     client.postMessage({
//     //       heartbeat: true
//     //     })
//     //   })
//     // })
//   }, { capture: true, passive: true })
//   // evtSource.addEventListener('ping', e => {
//   //   const time = JSON.parse(event.data).time
//   // })
//   changes.addEventListener('message', e => {
//     // const change = JSON.parse(e.data)
//     // if (change.id.startsWith('session_')) {
//     //   return
//     // }
//     // function update ({ newDocs, oldDoc }) {
//     //   // pouch.lastChangeBatch.invalidated = [
//     //   //   ['messages', 'aasd', ['active', 'all'], 'length']
//     //   // ]
//     //   // changes: [ {rev: "3-62aa0bb8c9b20f8f958f873a7fe3dbf7"}
//     //   // deleted: true
//     //   // id: "asd=="
//     //   // seq: "2914-asd ]
//     //   return pouch.bulkDocs(newDocs, { new_edits: false }, (err, docRes) => {
//     //     if (err) {
//     //       console.error(err)
//     //     } else {
//     //       // TODO: sync error handling
//     //       // pouch.lastChangeBatch.
//     //       // pouch.lastChangeBatch.jsonGraph.byId[updt[0]._id] = {
//     //       //   $type: 'atom',
//     //       //   value: updt[0]._deleted ? undefined : updt[0]
//     //       // }
//     //       sync.last_seq = change.seq
//     //       clients.matchAll().then(clts => {
//     //         clts.forEach(client => {
//     //           client.postMessage({
//     //             changes: [{
//     //               newDoc: newDocs[0], oldDoc
//     //             }]
//     //           })
//     //         })
//     //       })
//     //       pouch.put(sync).then(syncDocRes => {
//     //         sync._rev = syncDocRes.rev
//     //       })
//     //     }
//     //   })
//     // }
//     // pouch.get(change.id, {
//     //   revs_info: true
//     //   // open_revs: 'all',
//     //   // conflicts: true
//     // }, (err, doc) => {
//     //   let unsynced = []
//     //   let synced = []
//     //   if (err && err.message === 'missing') {
//     //     if (!change.deleted) {
//     //       unsynced = change.changes.map(entr => entr.rev)
//     //     }
//     //   } else if (doc) {
//     //     synced = doc._revs_info.map(entr => entr.rev)
//     //     change.changes.forEach(cha => {
//     //       if (!synced.includes(cha.rev)) {
//     //         unsynced.push(cha.rev)
//     //       }
//     //     })
//     //   } else if (err) {
//     //     console.error(err)
//     //   }
//     //   if (unsynced.length > 0) {
//     //     couch.bulkGet({
//     //       docs: unsynced.map(rev => ({
//     //         id: change.id,
//     //         rev
//     //       }))
//     //     })
//     //     .then(res => {
//     //       update({
//     //         newDocs: res.results.flatMap(result => result.docs.map(doc => doc.ok)),
//     //         oldDoc: doc
//     //       })
//     //     })
//     //     .catch(DocErr => {
//     //       console.log(DocErr)
//     //     })
//     //   }
//     // })
//   })
// }