import ipfsHandler from './handlers/ipfs.js'
import proxyHandler from './handlers/proxy.js'

import makePouch from './make-pouch.js'
import makeFalcorServer from './falcor-server.js'
import { escapeId } from '../lib/helpers.js'
import { parse, match } from '../lib/routing.js'

// TODO: support addtional dataSources like apollo

export default function ({
  dbConf,
  dataSources,
  schema,
  originWhitelist,
  handlers: appHandlers
}) {
  if (dataSources) {
    console.warn('Additional data sources not implemented yet.')
  }

  // we use an asynchronous updating object reference to do async initialisation in a synchronous function, this is not really nice practice, but is currently the most performant way to start the service worker without big refactor
  // TODO: clean recreatino of falcor and all session dependent modules

  self.session = {
    loaded: false,
    pendingInit: null,
    value: null,
    dbs: null,
    falcorServer: null,

    clear () {
      self.session.value = null
      self.session.falcorServer = null // TODO: check if needs destroy or cleanup
      self.session.dbs?.clear()
      self.session.dbs = null
      self.session.loaded = false
    },

    async logout () {
      self.session.clear()

      clientsRes = await clients.matchAll()
      const logoutNavs = clientsRes.map(client => {
        const url = new URL(client.url)
        let cont = ''
        if (url.pathname.length > 1 || url.hash) {
          cont = `&continue=${encodeURIComponent(url.pathname + url.hash)}`
        }

        return client.postMessage(`navigate:/_api/_session?logout${cont}`)
        // client.navigate().catch(err => console.error(err))
      })

      await Promise.all(logoutNavs)
    },

    async refresh () {
      let redirectOtherClients = null

      let newSession
      const sessionReq = await fetch('/_api/_session', {
        redirect: 'error',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      }).catch(error => ({ ok: false, error }))
      if (sessionReq.ok) {
        newSession = await sessionReq.json()
      }

      if (!newSession?.userId ) {
        self.session.clear()
        redirectOtherClients = 'logout'
      } else if (newSession.userId !== self.session.value?.userId) {
        self.session.clear()

        // FIXME: this formmat and flow is awkward leftover from supporting any number of client dbs per user (now only one)
        let newDbConf
        if (typeof dbConf === 'function') {
          newDbConf = dbConf({ userId: newSession.userId, appName: newSession.appName, env: newSession.env, escapeId, org: newSession.org })
        } else {
          newDbConf = dbConf
        }
        const clientDbName = newDbConf.clientDbName
        const serverDbName = newDbConf.serverDbName

        self.session.dbs = await makePouch({
          clientDbName,
          serverDbName,
          sessionId: newSession.sessionId,
          preload: newDbConf.preload,
          clientDesignDocs: newDbConf[clientDbName]
        })
        // console.log('making falcor server')
        self.session.falcorServer = makeFalcorServer({ dbs: self.session.dbs, schema, session: newSession })

        if (newSession.userId && !self.session.loaded) {
          redirectOtherClients = 'continue'
        }
      }

      self.session.value = newSession

      if (redirectOtherClients) {
        clientsRes = await clients.matchAll()

        const clientNavigations = clientsRes.map(client => {
          const url = new URL(client.url)
          const query = new URLSearchParams(url.search)
          if (redirectOtherClients === 'continue') {
            if (url.pathname.startsWith('/_ayu/accounts')) {
              client.postMessage('navigate:' + (query.get('continue') || '/'))
              return waitForNavigation(client)
              // client.navigate().catch(err => console.error(err))
            }
          } else {
            let cont = ''
            if (url.pathname.length > 1 || url.hash || url.search > 0) {
              if (query.get('continue')) {
                cont = query.get('continue')
              } else {
                cont = `continue=${encodeURIComponent(url.pathname + url.search + url.hash)}`
              }
            }
            if (!url.pathname.startsWith('/_ayu/accounts') && !url.pathname.startsWith('/_api/_session?login')) {
              const url = `/_ayu/accounts/?${cont}` // `/_api/_session?login${cont}`
              console.log('redirecting client', url, newSession, client)

              client.postMessage('navigate:' + url)
              return waitForNavigation(client)
              // after safari support: client.navigate().catch(err => console.error(err))
            }
          }
        })

        await Promise.all(clientNavigations)
      }

      self.session.loaded = true
      self.session.pendingInit = null
      return newSession
    }
  }

  console.log('starting service worker...')

  clients.matchAll().then(res => {
    // send clients hello message on startup to know pending requests need to be restarted
    res.forEach(client => client.postMessage(JSON.stringify({ hello: 'joe' })))
  })

  // just assume the client navigated away if the id disappears
  async function waitForNavigation (targetClient, tries = 20) {
    const curClients = await clients.matchAll()
    // console.log(curClients.map(e => ([e.id, e.url])), targetClient.id, targetClient.url, tries)

    if (curClients.find(client => client.id === targetClient.id)) {
      if (tries) {
        await (new Promise(resolve => setTimeout(resolve, 500)))
        return waitForNavigation(targetClient, tries - 1)
      } else {
        console.error('could not navigate client ', targetClient)
        return false
      }
    }
    return true
  }

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
  setInterval(purgeClients, 2000)

  // .addEventListener('offline', e => {
  //   console.log('offline', e)
  // })
  // .addEventListener('online', e => {
  //   console.log('online', e)
  // })
  // self.addEventListener('periodicsync', (event) => {
  //   console.log(event)
  // })
  // self.addEventListener('sync', event => {
  //   console.log(event)
  // })
  // navigator.serviceWorker.ready.then(swRegistration => {
  //   return swRegistration.sync.register('myFirstSync')
  // })

  addEventListener('message', async e => {
    // TODO either expl. split refresh() into login and db / falcor setup or merge this behind one call + await
    if (self.session.pendingInit) {
      await self.session.pendingInit
    }
    if ((!self.session.loaded || !self.session.value?.userId) && !self.session.pendingInit) {
      self.session.pendingInit = self.session.refresh()
      await self.session.pendingInit
    }
    if (!self.session.falcorServer && !self.session.pendingInit) {
      self.session.pendingInit = self.session.refresh()
      await self.session.pendingInit
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
      // ignore hello message and heartbeat
      return
    }

    if (!self.session.falcorServer) {
      // really logged out not just expired or not fully inited
      //   self.session.refresh()
      return e.source.postMessage(JSON.stringify({ id: reqId, error: 'logged out / no falcor server session active' }))
    }

    const exec = self.session.falcorServer.execute(data)
      .subscribe(
        result => {
          e.source.postMessage(JSON.stringify({ id: reqId, value: result }))
        },
        error => {
          console.log('falcor error in executer', error)
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


  const handlerConf = parse(schema, ['service-worker'])
  console.log({ schema, handlerConf, appHandlers })

  // FIXME: implement same matching logic from specific to unspecific as in edge route matching!
  // TODO: add navigation preloadoing for interesting routes, also possibly use it for couch syncing by setting header to seq
  addEventListener('fetch', event => {
    // TODO: handle forced login routes for fetch, currently all window fetches are public, only service worker can do authenticated subrequests and expose via falcor
    const url = new URL(event.request.url)
    const req = {
      raw: event.request,
      method: event.request.method,
      headers: Object.fromEntries(event.request.headers.entries()),
      query: Object.fromEntries(url.searchParams.entries()),
      url
    }

    const matched = match(req, handlerConf)
    // console.log(url.href, matched)

    // allowing non http url schemes to prevent browser plugins from breaking
    if (!(['http:', 'https:']).includes(url.protocol)) {
      console.info('bypassing: ' + url.href)
      return
    }
    if (matched.operationId === '_bypass') {
      // console.info('bypassing: ' + url.href)
      return
    }

    if (url.origin !== location.origin) {
      // custom handling for cors requests
      if (originWhitelist && !originWhitelist.includes(url.origin)) {
        return event.respondWith(new Response('Cross origin request to this domain forbidden', { status: 403 }))
      } else if (originWhitelist) {
        return event.respondWith(proxyHandler({ event, req }))
      } else {
        return
      }
    }

    if (url.pathname === '/_api/_logout') {
      self.session.logout()
      return event.respondWith(new Response('OK'))
    }

    // TODO: support registration.scope and non hash based client side routing
    // if (routes.includes(url.pathname)) {
    //   url.pathname = '/'
    // }
    // TODO: support auth system without falcor server?
    // if ((!self.session.loaded || !self.session.value?.userId) && !self.session.pendingInit) {
    //   self.session.pendingInit = self.session.refresh()
    // }
    // TODO: actually handle and error non matching methods, if not configured in schema
    // if (event.request.method !== 'GET') {
    //   return
    // }
    let handlerRes
    if (matched.operationId === '_ipfs') {
      handlerRes = ipfsHandler({ event, url: rewrite(new URL(event.request.url)), origUrl: url })
    } else if (matched.operationId === '_proxy') {
      return event.respondWith(proxyHandler({ event, req }))
    } else if (matched.operationId) {
      handlerRes = appHandlers[matched.operationId]({ event, req })
    } else if (matched.handler) {
      handlerRes = matched.handler({ event, req })
    }

    return event.respondWith(handlerRes)
  })
}

// TODO: only applies to ipfs handler, so move there
// TODO: preload /manifest.json resources and other reqired resources for offline refresh and usage
function rewrite (url) {
  if (url.pathname.endsWith('/')) {
    url.pathname = url.pathname + 'index.html'
    return url
  }

  if (url.pathname.endsWith('.svelte') || url.pathname.endsWith('.ts')) {
    url.pathname = url.pathname.replace('src', 'build') + '.js'
  } else if (url.pathname === '/svelte/store') {
    url.pathname = '/_ayu/build/deps/svelte-store.js'
    return url
  } else {
    url.pathname = url.pathname.replace('/src/deps/', '/build/deps/')
  }
  return url
}
