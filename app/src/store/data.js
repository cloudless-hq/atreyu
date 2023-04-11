import { makeProxy } from '../lib/proxy-object.js'
import { falcor } from '/_ayu/build/deps/falcor.js'
import { extractFromCache, setPathValue } from './helpers.js'
import ServiceWorkerSource from './service-worker-source.js'

const _undefined = Symbol('undefined')

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
  // let invalidationHandler

  if (typeof source === 'undefined') {
    source = new ServiceWorkerSource({ wake: 20_000 })
  }
  const model = falcor({
    source: source || undefined,
    maxSize: maxSize || 500000,
    collectRatio: collectRatio || 0.75,
    maxRetries: maxRetries || 1, // todo 0 requires fix in falcor due to falsy check
    // _useServerPaths: true,
    cache,
    scheduler: frameScheduler, // this is the internal scheduler, default to immediate
    // beforeInvalidate: paths => {
    //   console.log('before invalidate does not work', paths)
    //   // if (invalidationHandler) {
    //   //   invalidationHandler(paths)
    //   // }
    // },
    // Jafar Husain: we notify of changes but you can calculate what changed based on the version annotations from root to any level of detail when you need. this balances the cost of pushing all changes and the cost of polling in a change pull model.
    onChange: () => {
      // TODO: batch by frame or already done by internal scheduler?
      // console.log('falcor model change')
      update()
      onChange?.()
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
    errorSelector: function (path, error, c) {
      if (errorSelector) {
        errorSelector(path, error, c)
      } else {
        console.error(path, error, c)
      }
      return error
      // console.log('hasdfhfsdhfsdhdfs', error, path, c)
      // return error.$expires = -1000 * 60 * 2 // let errors expire in two minutes, bug: does not work
    }
  })
    .treatErrorsAsValues()
    .batch((new frameScheduler())) // the batch scheduler default to timeout(1) we use the same frame scheduling as internal

  // .treatErrorsAsValues() + boxValues() as standard!!, to se what are errors!

  // TODO: make batch configurable for debugging

  // TODO: model.progressively() instead of extract from cache?

  const boxedModel = model.boxValues()

  // used for serving stale data when falcor cache is invalidated and we do not want to remove all dependent dom nodes until data has been refetched
  const cacheMap = new Map()
  let latestTick = 0
  const lastUpdt = new Map()
  let ticker = null
  const deps = {}
  const keys = new Map()
  const placeholders = new Set()

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

    '$error', '$rev', '$ref', '$version', '$schema', '$timestamp', '$expires', '$size', '$type', '$key' ]
  const makeAyuProxy = (id, subModel) => makeProxy({
    id,
    from: () => {},
    get: (path, subVal, delim, id) => {
      if (path[path.length - 1] === '') {
        path.pop()
      }
      path = subModel ? [...subModel.getPath(), ...path] : path

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

      let curViewKey
      if (delim === '$key') {
        curViewKey = path.slice(0, path.length - 1).join('.')
        path = path.concat('_id')
      }

      const pathString = path.join('.') + (boxKey ? `.${boxKey}` : '')
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

      onAccess?.(path)

      const falcorCacheRes = extractFromCache({ obj: adjustedModel._root.cache, path })
      const falcorCacheVal = (falcorCacheRes.value === undefined && falcorCacheRes.$type === 'atom') ? _undefined : falcorCacheRes.value

      let cacheVal
      let existingProm
      if (typeof falcorCacheVal !== 'undefined') {
        cacheVal = falcorCacheVal
      } else {
        [ cacheVal, existingProm ] = cacheMap.get(pathString) || []
      }

      let key

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

      // if (pathString === 'todos.completed.date.length') {
      //   console.log({ cacheVal, existingProm, falcorCacheVal, latestTick, lastUpdt: lastUpdt.get(pathString) })
      // }
      // console.log(pathString, falcorCacheVal)
      let newProm
      if (falcorCacheVal === undefined || latestTick !== lastUpdt.get(pathString)) { // || typeof cacheVal === 'undefined'
        // TODO: instead of undefined delegating to falcor here we can make small
        // prom that returns from our model cache, gets load off falcor internals

        lastUpdt.set(pathString, latestTick)
        newProm = adjustedModel.getValue(path) // TODO: use get() instead and use info about box
          .then(val => {
            if (typeof val === 'undefined') {
              cacheMap.set(pathString, [_undefined])

              if (delim === '$key') {
                if (cacheVal && cacheVal !== _undefined) {
                  const viewKeys = keys.get(cacheVal)

                  if (viewKeys && viewKeys[curViewKey]) {
                    if ((viewKeys._maybeLatest?.latestTick || 0) < viewKeys[curViewKey].latestTick) {
                      viewKeys._maybeLatest = viewKeys[curViewKey]
                    }
                    delete viewKeys[curViewKey]
                    keys.set(cacheVal, viewKeys)
                  }
                }

                placeholders.add(pathString)
                // console.log('undefined value received', { pathString, key, val, curViewKey, keys: [...keys] })
              }
            } else {
              if (delim === '$key') {
                if (key) {
                  const previousViewKeys = keys.get(val) || {}
                  // if (keys.has(val)) {
                  //  console.log('existing view key', {previousViewKeys, curViewKey, key, val})
                  // }
                  if (!previousViewKeys[curViewKey]) {
                    previousViewKeys[curViewKey] = { key, latestTick }
                    keys.set(val, previousViewKeys)
                    keys.delete(pathString)
                  }
                } else if (cacheVal === _undefined || placeholders.has(pathString)) {
                  // force regeneration of temp ids for appended list entries,
                  // as otherwise the animation from hidden palceholder to new item is weird
                  // console.log('force regeneration of temp id', pathString)
                  keys.delete(pathString)
                }
                placeholders.delete(pathString)

                // console.log('value received', { pathString, key, val, curViewKey, keys: [...keys] })
              }

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

      if (delim === '$key') {
        if (cacheVal && cacheVal !== _undefined) {
          if (keys.has(cacheVal)) {
            const viewKeyOverrides = keys.get(cacheVal)
            let keyOverride

            if (viewKeyOverrides[curViewKey] && (viewKeyOverrides[curViewKey].latestTick + 6) > latestTick) {
              keyOverride = viewKeyOverrides[curViewKey]
            } else {
              const lastEntry = Object.values(viewKeyOverrides).reduce(
                (biggest, current) => {
                  if (current.latestTick > biggest.latestTick) {
                    return current
                  }
                  return biggest
                }, { latestTick: 0 }
              )

              keyOverride = lastEntry
            }

            // console.log({ viewKeyOverrides, keyOverride })

            if (!keys.has(pathString)) {
              // console.log('doc id cached', { keyOverride, cacheVal, falcorCacheVal, pathString, curViewKey, keys: [...keys]})
              return keyOverride.key
            } else {
              // console.log('doc id cached but from other view, using path override', { viewKeyOverrides, cacheVal, pathString, curViewKey, keys: [...keys]})
              if (!placeholders.has(pathString)) {
                return keys.get(pathString)
              }
            }
          } else if (!keys.has(pathString)) {
            // console.log('have cached id without temp id', cacheVal)
            return cacheVal
          } else {
            // the falcor promise did not fullfill yet but the value is allready populated in the cache
            if (!placeholders.has(pathString)) {
              const pathKeyOverride = keys.get(pathString)

              const previousViewKeys = { [curViewKey]: {key: pathKeyOverride, latestTick} }
              keys.set(cacheVal, previousViewKeys)
              keys.delete(pathString)

              // console.log('not set doc id cache yet but have:', { cacheVal, curViewKey, pathString,  keys: [...keys], pathKeyOverride } )
              return pathKeyOverride
            }
          }
        }

        const maybeKeyOverride = keys.get(pathString)
        if (maybeKeyOverride) {
          // console.log('path mapped to temp id', {maybeKeyOverride, pathString,  keys: [...keys]})
          return maybeKeyOverride
        }

        key = `id_${Math.floor(Math.random(10000) * 100000)}`
        keys.set(pathString, key)
        // console.log('new temp id', { key, pathString,  keys: [...keys] })
        return key
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
        if (value?.$type === 'atom') {
          console.warn('Missing data in ayu data store at:', path)
          return ''
        }
        return loadingFirstValue ? '' : value
      }
    },

    set: (path, newValue, delim, _id) => {
      if (path[path.length - 1] === '') {
        path.pop()
      }

      // console.log({ path, newValue, delim, _id })

      path = subModel ? [...subModel.getPath(), ...path] : path

      let boxKey = ''
      if (delim && !delims.includes(delim)) {
        boxKey = delim
      }

      let adjustedModel
      if (boxKey !== '') {
        adjustedModel = subModel ? subModel.boxValues() : boxedModel
        path = path.concat(boxKey)
      } else {
        adjustedModel = subModel || model
      }

      const { parentAtom } = extractFromCache({ obj: adjustedModel._root.cache, path })
      if (parentAtom) {
        path = parentAtom.obj.$_absolutePath
        newValue = setPathValue(parentAtom.obj.value, parentAtom.relPath, newValue)
      }

      adjustedModel.setValue(path, newValue)
        .then(() => {})
        .catch(err => console.error(err))

      return true
    },

    call: (path, args, _delim, _id) => {
      return (subModel || model).call(path, args)
    },
    delims
  })

  const runQueue = new Set()
  const subscribers = new Set()
  function update () {
    // console.log('svelte store subscribers updating')
    if (subscribers.size > 0) {
      const queueOpener = !runQueue.size

      subscribers.forEach(([run, invalidate, subscriptionProxy, id]) => {
        let changed = false
        if (!deps[id]) {
          changed = true
        } else {
          for (const [ pathString, { lastVer, path } ] of deps[id]) {
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
      // console.log('store invalidate', id)
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
  //  console.log(extractFromCache({obj: model._root.cache, path}).description)
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
