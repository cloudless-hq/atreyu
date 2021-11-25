import ipfsHandler from './handlers/ipfs.js'
import corsHandler from './handlers/cors.js'
import makePouch from './make-pouch.js'
import makeFalcorServer from './falcor-server.js'
import { escapeId } from '../lib/escape-id.js'

export default function ({
  // clientConfig,
  appName,
  dbConf,
  schema
}) {

  if (schema.servers) {
    // TODO: parse schema for severs and set env according to origin
    console.warn('currently only dev and prod environments supported')
  }


  const IPFS_GATEWAY = '/'

  let dbs = new Map()
  async function initSession () {
    self.session = {
      logout: async () => {
        self.session.value = { userId: null }
        dbs.forEach(db => {
          db.ayuSync.cancel()
          db.close()
        })
        dbs.clear()
        clientsRes = await clients.matchAll()
        clientsRes.forEach(client => {
          const url = new URL(client.url)
          let cont = ''

          if (url.pathname.length > 1 || url.hash) {
            cont = `&continue=${encodeURIComponent(url.pathname + url.hash)}`
          }
          client.navigate(`/_couch/_session?logout${cont}`)
        })
      },
      refresh: async () => {
        let newSession
        let reloadClients = false

        let initDone
        dbs._pendingInit = new Promise(resolve => {
          initDone = resolve
        })

        try {
          const sessionRes = await fetch('/_couch/_session', { redirect: 'error' })
          newSession = await sessionRes.json()
        } catch (_) {
          newSession = { userId: null }
        }

        if (newSession.userId !== self.session.value.userId) {
          let newDbConf
          if (typeof dbConf === 'function') {
            newDbConf = dbConf({ userId: newSession.userId, appName, env: newSession.env, escapeId })
          } else {
            newDbConf = dbConf
          }

          // TODO: diff the dbs and close the unused!!
          dbs.clear()

          Object.entries(newDbConf).forEach(([dbName, designDocs]) => {
            dbs.set(dbName, makePouch({
              dbName,
              designDocs
            }))
          })

          reloadClients = true
          // console.log('session userid update', newDbConf, dbs, newSession.userId, self.session.value.userId)
        }

        self.session.value = newSession

        if (reloadClients) {
          clientsRes = await clients.matchAll()
          clientsRes.forEach(client => {
            const url = new URL(client.url)
            const params = new URLSearchParams(url.search)
            if (params.get('continue')) {
              client.navigate(params.get('continue')) // `${url.origin}/_couch/_session?login&continue=${}`
            }
          })
        }

        initDone?.()
        return newSession
      },
      value: {}
    }

    await self.session.refresh()
  }

  // we use an asynchronous updating object reference to do async initialisation in a synchronous function, this is not really nice practice, but is currently the most performant way to start the service worker without big refactor
  // TODO: clean recreatino of falcor and all session dependent modules
  initSession()

  console.log('starting service worker...')

  const falcorServer = makeFalcorServer({dbs, schema})

  self.ayu = {
    dbs,
    falcorServer
  }

  clients.matchAll().then(res => {
    res.forEach(client => client.postMessage(JSON.stringify({ hello: 'joe' })))
  })

  addEventListener('message', async e => {
    const data = JSON.parse(e.data)
    // const clientId = e.source.id
    // const clientIds = (await clients.matchAll()).map(client => client.id)

    const reqId = data[0]

    if (reqId === -1) {
      // hello message and heartbeat
      return
    }

    if (dbs.size < 1) {
      await dbs._pendingInit
    }

    const exec = falcorServer.execute(data)
      .subscribe(
        result => {
          e.source.postMessage(JSON.stringify({ id: reqId, value: result }))
        },
        error => {
          e.source.postMessage(JSON.stringify({ id: reqId, error }))
        },
        async _done => {
          await e.source.postMessage(JSON.stringify({ id: reqId, done: true }))
          exec.unsubscribe()
          exec.dispose()
        }
      )
  })

  addEventListener('install', () => {
    skipWaiting()
    console.log('worker installing, skipping waiting')
  })

  addEventListener('activate', event => {
    event.waitUntil(clients.claim().then(() => {
      clients.matchAll().then(res => {
        res.forEach(client => client.postMessage(JSON.stringify({ worker: 'active' })))
      })
      console.log('worker activating, claiming clients')
    }))
  })

  let bypass = []
  let corsConf
  Object.entries(schema.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([_method, { operationId, tags }]) => {
      if (operationId === '_cors') {
        corsConf = {
          server: path.replace('*', ''),
          mode: 'proxy'
        }
      } else if (operationId === '_bypass') {
        bypass.push(path)
      } else if (tags?.includes('edge') && !tags?.includes('service-worker')) {
        bypass.push(path)
      }
    })
  })

  // TODO: add navigation preloadoing for interesting routes, also possibly use it for couch syncing by setting header to seq
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

    if (bypassing.length > 0 || !(['http:', 'https:']).includes(url.protocol)) {
      console.info('bypassing: ' + url.href)
      return
    }

    // TODO: support registration.scope and non hash based client side routing
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

  if (url.pathname.endsWith('.svelte') || url.pathname.endsWith('.ts')) {
    url.pathname = url.pathname.replace('src', 'build') + '.js'
  } else if (url.pathname === '/svelte/store') {
    url.pathname = '/atreyu/build/deps/svelte-store.js'
    return url
  } else {
    url.pathname = url.pathname.replace('/src/deps/', '/build/deps/')
  }
  return url
}
