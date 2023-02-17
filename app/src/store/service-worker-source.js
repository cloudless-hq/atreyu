import { Observable } from '/_ayu/build/deps/falcor-observable.js'

/* eslint-disable functional/no-this-expression, functional/no-class */
class ServiceWorkerSource {
  constructor ({ wake }) {
    this._inflight = {}

    this._id = 0 // Identifier used to correlate each Request to each response

    const init = () => {
      this._worker = navigator.serviceWorker.controller
      this._worker?.postMessage(JSON.stringify([-1, 'hello mike' ]))
    }
    if (!this._worker) {
      init()
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
          Object.values(this._inflight).forEach(stale => stale('service worker restarted...'))
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
    const { _worker, _inflight } = this
    const id = this._id++

    return Observable.create(subscriber => {
      _inflight[id] = (error, value, done) => {
        if (error) {
          subscriber.onError(error)
        } else if (done) {
          subscriber.onCompleted()
        } else {
          subscriber.onNext(value)
        }
      }

      _worker.postMessage(JSON.stringify([id, ...action]))

      return () => {
        delete _inflight[id]
      }
    })
  }
}
/* eslint-enable functional/no-this-expression, functional/no-class */

export default ServiceWorkerSource
