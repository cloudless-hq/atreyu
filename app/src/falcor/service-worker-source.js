import { Observable } from '/_ayu/build/deps/falcor-observable.js'

/* eslint-disable functional/no-this-expression, functional/no-class */
class ServiceWorkerSource {
  constructor ({ wake, cache }) {
    this._inflight = {}
    this._id = 0 // Identifier used to correlate each Request to each response
    this._active = 0
    this._timer

    const init = () => {
      this._worker = navigator.serviceWorker.controller
      this._worker?.postMessage(JSON.stringify([-1, 'hello mike']))

      if (cache) {
        this._worker?.postMessage(JSON.stringify({ cache }))
      }
    }
    if (!this._worker) {
      init()
    }

    if (import.meta.hot) {
      import.meta.hot.on('vite:beforeFullReload', async () => {
        const reg = await navigator.serviceWorker.getRegistration()
        // FIXME: maybe needs to wait for activated state event before reloading
        // registration.active.onstatechange = e => {console.log(e)}
        // registration.onupdatefound = () => {}
        // throw 'aborting reload before sw update'
        reg?.update()
      })
    }

    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data.startsWith('navigate:')) {
        return
      }
      if (!this._worker) {
        init()
      }
      const { id, error, value, done, hello } = JSON.parse(e.data)

      if (hello) {
        // delete after timeout to not crash a message that was the reason for waking the worker...
        // TODO: find better solution?
        setTimeout(() => {
          Object.values(this._inflight).forEach(stale => stale('service worker restarted, canceled:', stale))
        }, 800)
      } else if (typeof this._inflight[id] === 'function') {
        this._inflight[id](error, value, done)
      } else {
        console.log(e.data)
      }
    })

    if (wake) {
      this._waker = setInterval(() => {
        this._worker?.postMessage(JSON.stringify([-1, 'waky waky']))
      }, wake)
    }
  }

  isActive () {
    // console.log('isactive', this._timer, Object.keys(this._inflight).length)
    // Object.keys(this._inflight).length > 1
    // console.log(this._active)
    return this._active !== false // this._timer !== null currently only the sync endoint is allowed to run forever
  }

  get (paths) {
    return this._getResponse(['get', paths])
  }

  set (jsonGraphEnvelope) {
    return this._getResponse(['set', jsonGraphEnvelope])
  }

  call (callPath, args, pathSuffixes, paths) {
    return this._getResponse(['call', callPath, args, pathSuffixes, paths])
  }

  // Creates an observable stream that will send a request
  // to a Model server, and retrieve the response.
  // The request and response are correlated using a unique
  // identifier which the client sends with the request and
  // the server echoes back along with the response.
  _getResponse (action) {
    const id = this._id++

    if (action[1] !== 'call' && action[1][0] !== '_sync') {
      // console.log('start', action)
      this._active = this._active ? this._active + 1 : 1
    }

    return Observable.create(subscriber => {
      this._inflight[id] = (error, value, done) => {
        if (error) {
          console.error([id, ...action])
          subscriber.onError(error)
        } else if (done) {
          subscriber.onCompleted()
        } else {
          subscriber.onNext(value)
        }
      }

      // FIXME: hanlde error case here to enable trace debugging where request originates console.error([id, ...action])

      this._worker.postMessage(JSON.stringify([id, ...action]))

      return () => {
        delete this._inflight[id]
        if (action[1] !== 'call' && action[1][0] !== '_sync') {
          this._active--

          if (this._timer) {
            clearTimeout(this._timer)
          }
          this._timer = setTimeout(() => {
            // console.log('finishing', action, this._active)
            this._timer = null
            if (this._active === 0) {
              this._active = false
            }
          }, 30)
        }
      }
    })
  }
}
/* eslint-enable functional/no-this-expression, functional/no-class */

export default ServiceWorkerSource
