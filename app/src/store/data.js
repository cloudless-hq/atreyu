import { makeProxy } from '../lib/proxy-object.js'
import { falcor } from '/atreyu/src/deps/falcor.js'
import { extractFromCache } from './helpers.js'
import ServiceWorkerSource from './service-worker-source.js'

let _undefined = Symbol('undefined')

class frameScheduler {
  schedule (action) {
    let id = requestAnimationFrame(action)
    return {
      dispose: () => {
        if (id) {
          cancelAnimationFrame(id)
          id = null
        }
      }
    }
  }
  scheduleWithState (state, action) {
    let id = requestAnimationFrame(() => {
      action(this, state)
    })
    return {
      dispose: () => {
        if (id) {
          cancelAnimationFrame(id)
          id = null
        }
      }
    }
  }
}


function makeDataStore ({ source, maxSize, collectRatio, maxRetries, cache, onChange, errorSelector, onAccess }) {
  let changeHandler
  // let invalidationHandler
  if (typeof source === 'undefined') {
    source = new ServiceWorkerSource({wake: 60_000})
  }
  const model = falcor({
    source: source || undefined,
    maxSize: maxSize || 500000,
    collectRatio: collectRatio || 0.75,
    maxRetries: maxRetries || 0,
    // _useServerPaths: true,
    cache,
    scheduler: frameScheduler, // this is the internal scheduler, default to immediate
    beforeInvalidate: paths => {
      console.log('before invalidate', paths)
      // if (invalidationHandler) {
      //   invalidationHandler(paths)
      // }
    },
    onChange: () => {
      if (changeHandler) {
        changeHandler()
      }
      if (onChange) {
        onChange()
      }
    },
    // comparator: (oldValEnv, newValEnv, path) => {
    //   if (oldValEnv === newValEnv) {
    //     return false
    //   }
    //   if (oldValEnv && oldValEnv.value && newValEnv && newValEnv.value) {
    //     if (
    //       oldValEnv.$type !== newValEnv.$type ||
    //       oldValEnv.$expires !== newValEnv.$expires
    //     ) {
    //       return true
    //     }
    //   }
    //   // HACK: because of probable falcor bug with unwrapperd newVal arg and path wrong
    //   const newVal = newValEnv && newValEnv.value ? newValEnv.value : newValEnv
    //   const oldVal = oldValEnv && oldValEnv.value ? oldValEnv.value : oldValEnv
    //   if (oldVal && oldVal._rev && newVal && newVal._rev) {
    //     if (oldVal._rev === newVal._rev) {
    //       return false
    //     } else {
    //       console.log('check cache changed')
    //       console.log({ oldValEnv, newValEnv })
    //       return true
    //     }
    //   }
    //   console.log({ oldVal, newVal, path })
    //   return newVal === oldVal
    // },
    errorSelector: function (x, y) {
      if (errorSelector) {
        errorSelector(x, y)
      } else {
        console.error(x, y)
      }

      return y
    }
  })
    .batch((new frameScheduler()))  // the batch scheduler default to timeout(1) we use the same frame scheduling as internal
    .treatErrorsAsValues()
  // TODO: make batch configurable for debugging
  //  errorSelector: function(error) {
  //     error.$expires = -1000 * 60 * 2;
  // }

  // TODO: model.progressively() instead of extract from cache?

  const boxedModel = model.boxValues()

  // used for serving stale data when falcor cache is invalidated and we do not want to remove all dependent dom nodes until data has been refetched
  const cacheMap = new Map()
  let latestTick = 0
  const lastUpdt = new Map()
  let ticker = null
  const deps = {}

  const makeAyuProxy = id => makeProxy({
    id,
    from: () => {},
    get: (path, subVal, delim, id) => {
      if (onAccess) {
        onAccess(path)
      }
      const name = path[path.length - 1]

      if (name === 'length') {
        // if an array was sliced before in the proxy it gives us the length of the slice
        if (typeof subVal === 'number' && subVal > 0) {
          return subVal
        }
      }

      let boxKey = ''

      if (delim && delim !== '$' && delim !== '$value') {
        boxKey = delim
      }

      const pathString = path.join('.') + boxKey
      // TODO make dep path prefix configurable for performance vs memory optimization

      if (!deps[id]) {
        deps[id] = new Set()
      }

      deps[id].add(pathString)

      // move all system keys to proxy?

      let adjustedModel
      if (boxKey !== '') {
        adjustedModel = boxedModel
        path = path.concat(boxKey)
      } else {
        adjustedModel = model
      }

      const falcorCacheVal = extractFromCache(adjustedModel._root.cache, path)
      const cacheVal = typeof falcorCacheVal !== 'undefined' ? falcorCacheVal : cacheMap.get(pathString)

      // TODO: properly respect invalidation and expiries
      if (!ticker) {
        // start new tick interval
        ++latestTick

        ticker = requestAnimationFrame(() => {
          // end the current tick interval, from now everything will request an update from falcor again
          ++latestTick
          // we dont need to tick every eventloop, but only the loops with ayu get requests
          ticker = null

          // at the end of each tick, check if cache got too big
          if (cacheMap.size > 700_000) {
            console.info('clearing data store cache')
            cacheMap.clear()
          }
        })
      }

      let prom
      if (latestTick !== lastUpdt.get(pathString)) { // || typeof cacheVal === 'undefined'
        // TODO: instead of undefined delegating to falcor here we can make small
        // prom that returns from our model cache, gets load off falcor internals

        lastUpdt.set(pathString, latestTick)
        // console.log('getting 1', path, pathString)
        prom = adjustedModel.getValue(path)
          .then(val => {
            if (typeof val === 'undefined') {
              cacheMap.set(pathString, _undefined)
            } else {
              cacheMap.set(pathString, val)
            }
            // prom._loading = false
            return val
          })
          .catch(err => {
            // prom._loading = false
            return new Promise((_resolve, reject) => reject({
              message: 'failed falcor get',
              path,
              err
            }))
          })
        // new Promise((resolve, reject) => { })
        prom._loading = true // todo unify with $loading?
        prom.toString = () => '' // to render empty stings as placeholders
        cacheMap.set(pathString, prom)
      }

      // undefined means we dont know the value, _undefined means we know the value is undefined
      // console.log('about to return', pathString, cacheVal)
      if (typeof cacheVal !== 'undefined') {
        if (cacheVal === _undefined) {
          return undefined
        } else {
          return cacheVal
        }
      }

      return prom
    },

    set: (path, newValue, _delim, _id) => {
      model.setValue(path, newValue)
        .then(() => {})

      return true
    },

    call: (path, args, _delim, _id) => {
      return model.call(path, args)
    },
    delims: ['$', '$value', '$error', '$ref', '$version', '$schema', '$timestamp', '$expires', '$size', '$type', '$loading']
  })

  const runQueue = new Set()
  const subscribers = new Set()
  function update () {
    // console.log('svelte store subscribers updating')
    if (subscribers.size > 0) {
      const queueOpener = !runQueue.size

      subscribers.forEach(([run, invalidate, subscriptionProxy, _id]) => {
        // TODO: get affected paths for current change and check with deps[id]
        invalidate()
        runQueue.add([run, subscriptionProxy])
      })

      if (queueOpener) {
        runQueue.forEach(([run, subscriptionProxy]) => {
          run(subscriptionProxy)
        })

        runQueue.clear()
      }
    }
  }
  let subscrCounter = 0
  function subscribe (run, invalidate, ..._args) {
    const id = `${subscribers.size}_${subscrCounter++}`
    const subscriptionProxy = makeAyuProxy(id)

    const doRun = (..._args) => {
      // console.log('run', id)
      return run(..._args)
    }

    const doInvalidate = (..._args) => {
      // console.log('invalidate', id)
      if (invalidate) {
        return invalidate(..._args)
      }
    }

    const subscriber = [doRun, doInvalidate, subscriptionProxy, id]

    subscribers.add(subscriber)
    // console.log('subscribe', id)

    run(subscriptionProxy)

    return () => {
      // console.log('unsubscribe', id)
      delete deps[id]
      return subscribers.delete(subscriber)
    }
  }

  changeHandler = () => {
    update()
  }
  // const cache = model.getCache()
  // const changes = {}
  // diffCache(cache, model).forEach(change => {
  //   changes[change[0]] = change[1]
  // })
  // console.log(changes)

  // const entries = Object.entries(changes)
  // for (let i = 0; i < entries.length; i++) {
  //   const entr = entries[i]
  //   const chPath = entr[0].split('.')
  //   const compPath = ['falcor', 'messages', contactId, view, 'length']
  //   while (chPath.length > 0) {
  //     if (chPath.shift() !== compPath.shift()) {
  //       break
  //     }
  //   }
  //   if (chPath.length === 0) {
  //     updatePage = true
  //     break
  //   }
  // ntr.app.set(changes)
  // invalidationHandler = paths => {
  //  invalidationCache = {}
  //  paths.forEach(path => {
  //  console.log(extractFromCache(model._root.cache, path).description)
  //  })

  return {
    subscribe,
    set: () => {
      // console.log('svelte store set')
    },
    falcor: model,
    proxy: makeAyuProxy('_direct'),
    deps
  }
}

// TODO: if this should be configuratble, this needs to be function
export default makeDataStore({})
