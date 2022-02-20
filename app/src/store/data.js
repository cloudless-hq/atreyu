import { makeProxy } from '../lib/proxy-object.js'
import { falcor } from '/atreyu/src/deps/falcor.js'
import { extractFromCache } from './helpers.js'
import ServiceWorkerSource from './service-worker-source.js'

let _undefined = Symbol('undefined')

/* eslint-disable functional/no-this-expression, functional/no-class */
// Implemented like this for compatibilty with practices in falcor
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
/* eslint-enable functional/no-this-expression, functional/no-class */


function makeDataStore ({ source, maxSize, collectRatio, maxRetries, cache, onChange, errorSelector, onAccess }) {
  let changeHandler
  // let invalidationHandler
  if (typeof source === 'undefined') {
    source = new ServiceWorkerSource({ wake: 20_000 })
  }
  const model = falcor({
    source: source || undefined,
    maxSize: maxSize || 500000,
    collectRatio: collectRatio || 0.75,
    maxRetries: maxRetries || 0,
    // _useServerPaths: true,
    cache,
    scheduler: frameScheduler, // this is the internal scheduler, default to immediate
    // beforeInvalidate: paths => {
    //   console.log('before invalidate does not work', paths)
    //   // if (invalidationHandler) {
    //   //   invalidationHandler(paths)
    //   // }
    // },
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
    .batch((new frameScheduler())) // the batch scheduler default to timeout(1) we use the same frame scheduling as internal
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

  // TODO subscribe feature eg. $ { a.b + a.c }
  // TODO: skip double update in svelte subscriptions
  const delims = [
    '$', '$value', // $ is shorthand for $value
    '$not', // shorthand to be able to do if (x.a$not) instead of if (!x.a$ && !x.a$loading)
    '$loading',
    '$promise',

    // TODO:
    // FIXME: Also expose these as store init functions and allow importing a deep store instead of always the data root!
    // this allows skipping rerender without fixing the diff checking of svelte
    '$$', // dereference
    '$$unbox', // deref and unbox
    '$$unbatch', // etc. // deref and unbatch

    '$error', '$rev', '$ref', '$version', '$schema', '$timestamp', '$expires', '$size', '$type' ]
  const makeAyuProxy = (id, subModel) => makeProxy({
    id,
    from: () => {},
    get: (path, subVal, delim, id) => {
      if (!path[path.length - 1]) {
        path.pop()
      }
      path = subModel ? [...subModel.getPath(), ...path] : path

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

      if (delim && !delims.includes(delim)) {
        boxKey = delim
      }

      const pathString = path.join('.') + boxKey
      // TODO make dep path prefix configurable for performance vs memory optimization

      if (!deps[id]) {
        deps[id] = new Map()
      }

      if (!deps[id].has(pathString)) {
        deps[id].set(pathString, { path })
      }

      let adjustedModel
      if (boxKey !== '') {
        adjustedModel = subModel ? subModel.boxValues() : boxedModel
        path = path.concat(boxKey)
      } else {
        adjustedModel = subModel || model
      }

      const falcorCacheVal = extractFromCache(adjustedModel._root.cache, path)
      let cacheVal
      let existingProm
      if (typeof falcorCacheVal !== 'undefined') {
        cacheVal = falcorCacheVal
      } else {
        [ cacheVal, existingProm ] = cacheMap.get(pathString) || []
      }

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

      let newProm
      if (latestTick !== lastUpdt.get(pathString)) { // || typeof cacheVal === 'undefined'
        // TODO: instead of undefined delegating to falcor here we can make small
        // prom that returns from our model cache, gets load off falcor internals

        lastUpdt.set(pathString, latestTick)
        newProm = adjustedModel.getValue(path)
          .then(val => {
            if (typeof val === 'undefined') {
              cacheMap.set(pathString, [_undefined])
            } else {
              cacheMap.set(pathString, [val])
            }
            // loading = false
            return val
          })
          .catch(err => {
            // loading = false
            return new Promise((_resolve, reject) => reject({
              message: 'failed falcor get',
              path,
              err
            }))
          })
        // loading = true
        cacheMap.set(pathString, [cacheVal, newProm])
      }

      let loadingFirstValue = true
      let value

      // undefined means we don't know the value, _undefined means we know the value is undefined
      if (typeof cacheVal !== 'undefined') {
        if (cacheVal === _undefined) {
          value = undefined
          loadingFirstValue = false
        } else {
          value = cacheVal
          loadingFirstValue = false
        }
      }

      if (delim === '$promise') {
        if (newProm) {
          return newProm
        } else if (existingProm) {
          return existingProm
        } else {
          return Promise.resolve(value)
        }
      } else if (delim === '$loading') {
        return loadingFirstValue
      } else if (delim === '$not') {
        return loadingFirstValue ? { toString: () => {''} } : !value
      } else {
        return loadingFirstValue ? '' : value
      }
    },

    set: (path, newValue, _delim, _id) => {
      (subModel || model).setValue(path, newValue)
        .then(() => {})

      return true
    },

    call: (path, args, _delim, _id) => {
      return (subModel || model).call(path, args)
    },
    delims
  })

  const runQueue = new Set()
  const subscribers = new Set()
  function update (_changes) {
    // console.log('svelte store subscribers updating')
    if (subscribers.size > 0) {
      const queueOpener = !runQueue.size

      subscribers.forEach(([run, invalidate, subscriptionProxy, id]) => {
        let changed = false
        if (!deps[id]) {
          changed = true
        } else {
          for (const [pathString, { lastVer, path }] of deps[id]) {
            const newVer = model.getVersion(path) // FIXME: path inside atom object are all -1 instead of atom parent value

            if (newVer === -1 || !lastVer || lastVer !== newVer) {
              deps[id].set(pathString, { path, lastVer: newVer })
              changed = true
              // break ? how expensive is this vs store code subscriptions executions in svelte?
            }
          }
        }

        if (changed) {
          invalidate()
          runQueue.add([run, subscriptionProxy])
        }
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
  function subscribe (run, invalidate, subModel) {
    const id = `${subscribers.size}_${subscrCounter++}`
    const subscriptionProxy = makeAyuProxy(id, subModel)

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

  changeHandler = changes => {
    update(changes)
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
    deref: paths => {
      return paths.map(path => {
        const subModel = model.deref({ '$__path': path })

        return {
          subscribe: (run, invalidate) => {
            return subscribe(run, invalidate, subModel)
          },
          set: () => {},
          falcor: subModel
        }
      })
    },

    subscribe,
    set: () => {},
    falcor: model,
    // proxy: makeAyuProxy('_direct'), avoid debugging proxy creation, just use a manual subscription instead
    deps
  }
}

// TODO: if this should be configuratble, this needs to be function
export default makeDataStore({})
