import ipfsHandler from './handlers/ipfs.js'
import corsHandler from './handlers/cors.js'
import makePouch from './make-pouch.js'
import makeFalcorServer from './falcor-server.js'
import { escapeId } from '../../../edge/lib/escape-id.js'

export default function ({
    clientConfig,
    appName,
    dbConf,
    schema
  }) {

  if (schema.servers) {
    // TODO: parse schema for severs and set env according to origin
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

  const envConfig = clientConfig[env] ? clientConfig[env] : {}

  const {
    IPFS_GATEWAY = '/'
  } = {...clientConfig, ...envConfig}

  let dbs = new Map()
  async function initSession (dbs) {
    self.session = {
      refresh: async () => {
        let newSession
        let reloadClients = false

        try {
          const sessionRes = await fetch('/_couch/_session', { redirect: 'error' })
          newSession = await sessionRes.json()
        } catch (_) {
          newSession = { userId: null }
        }

        if (newSession.userId !== self.session.value.userId) {
          let newDbConf
          if (typeof dbConf === 'function') {
            newDbConf = dbConf({ userId: newSession.userId, appName, env, escapeId })
          } else {
            newDbConf = dbConf
          }

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

        // TODO: logout other windows: if (reloadClients) {
        //   clientsRes = await clients.matchAll()
        //   clientsRes.forEach(client => {
        //     const url = new URL(client.url)
        //     client.navigate(`${url.origin}/_couch/_session?login&contiue=${encodeURIComponent(client.url)}`)
        //   })
        // }

        return newSession
      },
      value: {}
    }

    await self.session.refresh()
  }

  // we use an asynchronous updating object reference to do async initialisation in a synchronous function, this is not really nice practice, but is currently the most performant way to start the service worker without big refactor
  // TODO: clean recreatino of falcor and all session dependent modules
  initSession(dbs)

  console.log('starting service worker...')

  const falcorServer = makeFalcorServer({dbs, schema})

  self.ayu = {
    dbs,
    falcorServer
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
    Object.entries(methods).forEach(([method, { operationId, tags }]) => {
      if (operationId === '_cors') {
        corsConf = {
          server: path.replace('*', ''),
          mode: 'proxy'
        }
      } else if (operationId === '_bypass') {
        bypass.push(path)
      } else if (tags.includes('edge') && !tags.includes('service-worker')) {
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

  if (url.pathname.endsWith('.svelte')) {
    url.pathname = url.pathname.replace('src', 'build') + '.js'
  } else {
    url.pathname = url.pathname.replace('/src/deps/', '/build/deps/')
  }
  return url
}