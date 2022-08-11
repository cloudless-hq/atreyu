import ipfsHandler from './handlers/ipfs.js'
import corsHandler from './handlers/cors.js'
import makePouch from './make-pouch.js'
import makeFalcorServer from './falcor-server.js'
import { escapeId } from '../lib/escape-id.js'

// TODO: support addtional dataSources like apollo

export default function ({
  dbConf,
  dataSources,
  schema,
  originWhitelist = []
}) {

  if (dataSources) {
    console.warn('Additional data sources not implemented yet.')
  }

  if (schema.servers) {
    // TODO: parse schema for severs and set env according to origin
    console.warn('currently only dev and prod environments supported')
  }

  // we use an asynchronous updating object reference to do async initialisation in a synchronous function, this is not really nice practice, but is currently the most performant way to start the service worker without big refactor
  // TODO: clean recreatino of falcor and all session dependent modules

  self.session = {
    loaded: false,

    pendingInit: null,

    value: null,

    dbs: new Map(),

    clear: () => {
      self.session.value = null
      self.session.dbs.forEach(db => {
        db.ayuSync.cancel()
        db.close()
      })
      self.session.dbs.clear()
      self.session.loaded = false
    },

    logout: async () => {
      self.session.clear()

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
      let redirectOtherClients = null

      let newSession
      const sessionReq = await fetch('/_couch/_session', { redirect: 'manual' })
      if (sessionReq.ok) {
        newSession = await sessionReq.json()
      }
      // } catch (_) {
      //   newSession = { userId: null }
      // }

      if (!newSession?.userId ) {
        self.session.clear()

        redirectOtherClients = 'logout'
      } else if (newSession.userId !== self.session.value?.userId) {
        self.session.clear()

        let newDbConf
        if (typeof dbConf === 'function') {
          newDbConf = dbConf({ userId: newSession.userId, appName: newSession.appName, env: newSession.env, escapeId })
        } else {
          newDbConf = dbConf
        }

        await Promise.all(Object.entries(newDbConf).map(async ([dbName, designDocs]) => {
          const pouchSetup = await makePouch({
            dbName,
            designDocs
          })
          self.session.dbs.set(dbName, pouchSetup)
        }))

        if (newSession.userId && !self.session.loaded) {
          redirectOtherClients = 'continue'
        }
      }

      self.session.value = newSession

      if (redirectOtherClients) {
        clientsRes = await clients.matchAll()
        clientsRes.forEach(client => {
          const url = new URL(client.url)
          const params = new URLSearchParams(url.search)
          if (redirectOtherClients === 'continue') {
            if (url.pathname.startsWith('/atreyu/accounts')) {
              client.navigate(params.get('continue') || '/')
            }
          } else {
            let cont = ''
            if (url.pathname.length > 1 || url.hash || url.search > 0) {
              if (params.get('continue')) {
                cont = params.get('continue')
              } else {
                cont = `&continue=${encodeURIComponent(url.pathname + url.search + url.hash)}`
              }
            }
            if (!url.pathname.startsWith('/atreyu/accounts') && !url.pathname.startsWith('/_couch/_session?login')) {
              console.log('redirecting other clients', newSession)
              client.navigate(`/_couch/_session?login${cont}`)
            }
          }
        })
      }

      self.session.loaded = true
      self.session.pendingInit = null
      return newSession
    }
  }

  console.log('starting service worker...')

  const falcorServer = makeFalcorServer({dbs: self.session.dbs, schema})

  self.ayu = {
    dbs: self.session.dbs,
    falcorServer
  }

  clients.matchAll().then(res => {
    // send clients hello message on startup to know pending requests need to be restarted
    res.forEach(client => client.postMessage(JSON.stringify({ hello: 'joe' })))
  })

  const pending = {}
  function purgeClients () {
    clients.matchAll().then(res => {
      Object.keys(pending).forEach(clientId => {
        if (!res.find(el => el.id === clientId)) {
          console.log(clientId, 'disappeared')
          Object.entries(pending[clientId]).forEach(([reqId, exec]) => {
            exec?.unsubscribe()
            exec?.dispose()
            delete pending[clientId][reqId]
          })

          delete pending[clientId]
        }
      })
    })
  }
  setInterval(purgeClients, 2500)

  addEventListener('message', async e => {
    if ((!self.session.loaded || !self.session.value?.userId) && !self.session.pendingInit) {
      self.session.pendingInit = self.session.refresh({where: 'falcor', data: e.data}).then()
    }
    if (self.session.pendingInit) {
      await self.session.pendingInit
    }

    const data = JSON.parse(e.data)
    const clientId = e.source.id
    const reqId = data[0]

    if (!pending[clientId]) {
      pending[clientId] = {}
    }

    if (reqId === -1) {
      // hello message and heartbeat
      return
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
          exec?.unsubscribe()
          exec?.dispose()
          delete pending[clientId][reqId]
        }
      )
    pending[clientId][reqId] = exec
  })

  addEventListener('install', () => {
    console.log('worker installing, skip waiting')
    skipWaiting()
  })

  addEventListener('activate', event => {
    console.log('worker activating, claiming clients')
    event.waitUntil(clients.claim().then(() => {
      clients.matchAll().then(res => {
        res.forEach(client => client.postMessage(JSON.stringify({ worker: 'active' })))
      })
    }))
  })

  const bypass = []
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
    // TODO: handle forced login routes for fetch, currently all window fetches are public, only service worker can do authenticated subrequests and expose via falcor
    let url = new URL(event.request.url)
    const origUrl = new URL(event.request.url)

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

    if (url.pathname === '/_logout') {
      self.session.logout()
      return event.respondWith(new Response('OK'))
    }

    if (url.origin !== location.origin && !originWhitelist.includes(url.origin)) {
      return event.respondWith(corsHandler({ event, url, corsConf }))
    }

    if ((!self.session.loaded || !self.session.value?.userId) && !self.session.pendingInit) {
      self.session.pendingInit = self.session.refresh({where: 'fetch', data: event.request.url}).then()
    }

    if (event.request.method !== 'GET') {
      return
    }

    url = rewrite(url)

    // TODO: support registration.scope and non hash based client side routing
    // if (routes.includes(url.pathname)) {
    //   url.pathname = '/'
    // }

    return event.respondWith(ipfsHandler({ event, url, origUrl }))
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
