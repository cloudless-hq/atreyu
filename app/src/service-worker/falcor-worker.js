import makePouch from '../make-pouch.js'
import { falcorTags } from '../falcor/router.js'
import makeFalcorServer from '../falcor/server.js'
// import serverSource from '../falcor/direct-source.js'
import { escapeId } from '../lib/helpers.js'
import { addPathTags } from '../schema/helpers.js'
import defaultPaths from '../schema/default-routes.js'

// TODO: support addtional dataSources
export default function ({
  dbConf = {},
  dataSources,
  schema,
  onChange,
  clientDbSeeds,
  localOnly = false
} = {}) {
  if (dataSources) {
    console.warn('Additional data sources not implemented yet.')
  }
  // TODO: gobally precompile schema on build time
  if (typeof schema === 'function') {
    schema = schema({ defaultPaths, addPathTags })
  } else if (schema) {
    schema.paths = { ...defaultPaths, ...falcorTags(schema.paths) }
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

      const clientsRes = await clients.matchAll()
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

      try {
        if (localOnly) {
          newSession = { sessionId: 'ephemeral:localOnlySession', userId: 'anonymous', env: 'dev', appName: 'ayuApp' } // appName, org
        } else {
          const sessionReq = await fetch('/_api/_session', {
            redirect: 'error',
            headers: {
              'X-Requested-With': 'XMLHttpRequest'
            }
          }).catch(error => ({ ok: false, error }))
          if (sessionReq.ok) {
            newSession = await sessionReq.json()
          }
        }

        if (!newSession?.userId || !newSession?.sessionId) {
          self.session.clear()
          redirectOtherClients = 'logout'
        } else if (newSession.userId !== self.session.value?.userId || newSession.sessionId !== self.session.value?.sessionId) {
          self.session.clear()

          // FIXME: this formmat and flow is awkward leftover from supporting any number of client dbs per user (now only one)
          let newDbConf
          if (typeof dbConf === 'function') {
            newDbConf = dbConf({ userId: newSession.userId, appName: newSession.appName, env: newSession.env, escapeId, org: newSession.org })
          } else {
            newDbConf = dbConf
          }

          // (pouchdb prefix already ayu_)
          const clientDbName = escapeId(newSession.userId + '__' + newSession.env + '__' + newSession.appName + ( newSession.org ? '__' + newSession.org : '__'))
          const serverDbName = 'ayu_' + (newSession.env === 'prod' ? escapeId(newSession.appName) : escapeId(newSession.env + '__' + newSession.appName))

          self.session.dbs = await makePouch({
            localOnly,
            clientDbSeeds,
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
          const clientsRes = await clients.matchAll()

          const clientNavigations = clientsRes.map(client => {
            const url = new URL(client.url)
            const query = new URLSearchParams(url.search)
            if (redirectOtherClients === 'continue') {
              if (url.pathname.startsWith('/_ayu/accounts')) {
                const navMessage = 'navigate:' + (query.get('continue') || '/')
                client.postMessage(navMessage)
                client._ayu_lastNavMessage = navMessage
                return waitForNavigation(client)
                // client.navigate().catch(err => console.error(err))
              }
            } else {
              let cont = ''
              if (url.pathname.length > 1 || url.hash || url.search > 0) {
                if (query.get('continue')) {
                  cont = `continue=${query.get('continue')}`
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
      } catch (err) {
        console.error(err)
      }

      self.session.pendingInit = null
      return newSession
    }
  }

  console.log('starting service worker...' + new Date().toGMTString())

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
            exec?.unsubscribe?.()
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
          if (data[1] === 'call' && data[2]?.[0] === '_sync') {
            onChange?.({
              model: self.session.falcorServer.dataSource._model,
              data: result.json,
              _where: 'service-worker'
            })
          }
          e.source.postMessage(JSON.stringify({ id: reqId, value: result }))
        },
        error => {
          // allreadcy logged as error before console.log('falcor error in executer', error)
          e.source.postMessage(JSON.stringify({ id: reqId, error }))
        },
        async _done => {
          await e.source.postMessage(JSON.stringify({ id: reqId, done: true }))
          exec?.unsubscribe?.()
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
}
