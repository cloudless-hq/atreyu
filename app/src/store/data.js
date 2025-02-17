import { makeProxy } from '../lib/proxy-object.js'
import { falcor } from '/_ayu/build/deps/falcor.js'
import { extractFromCache, setPathValue, getJsonPath } from './helpers.js'
import { TimeoutScheduler, FrameScheduler } from '../falcor/schedulers.js'

const _undefined = Symbol('undefined')

function getScheduler () {
  if (typeof requestAnimationFrame !== 'undefined') {
    return FrameScheduler
  } else {
    return TimeoutScheduler
  }
}

// return promise after sync part of first functions
// FIXME: $promise only needed for cold promise (or use c.then ?), for all other usecases we can detect await!!!
// let c = { get then() {  console.log('sdf'); return (a) => {console.log(a, a(1), 'sdf'); return 2 }} }
// undefined
// await a
// {}
// await c
// VM1210:1 sdf
// VM1210:1 ƒ () { [native code] } undefined 'sdf'
// 1

const ontick = typeof requestAnimationFrame === 'undefined' ? function (cb) { return setTimeout(cb, 0) } : requestAnimationFrame

export default function makeDataStore ({ source, batched = true, maxSize, collectRatio, maxRetries, cache, onChange = () => {}, onModelChange, errorSelector, onAccess } = {}) {
  // let invalidationHandler
  const subscribers = new Set()

  let model = falcor({
    source: source || undefined,
    maxSize: maxSize || 500000,
    collectRatio: collectRatio || 0.75,
    maxRetries: maxRetries || 1, // FIXME: 0 requires fix in falcor due to broken falsy check
    // _useServerPaths: true,
    cache,
    scheduler: batched ? getScheduler() : undefined, // this is the internal scheduler, default to timeout scheduler 1ms
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
      // setTimeout(() => update(), 100)
      update()
      onModelChange?.()
      source?._onChange?.()
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
      // return error.$expires = -1000 * 60 * 2 // let errors expire in two minutes, bug: does not work
    }
  })
    .treatErrorsAsValues()
     // the batch scheduler default to timeout(1) we use the same frame scheduling as internal

  if (source?.router) {
    source.router.model = model.withoutDataSource()
    source.router.model.getPageKey = function (path, from) {
      const listCache = extractFromCache({ path, obj: this._root.cache })

      for (let index = from; index > 0; index--) {
        if (listCache.value?.[index]?.$pageKey !== undefined) {
          return { pageKey: listCache.value[index].$pageKey, index }
        }
      }
      return { index: 0 }
    }
  } else if (source) {
    source.model = model.withoutDataSource()
  }


  if (batched) {
    const scheduler = getScheduler()
    model = scheduler ? model.batch(new scheduler()) : model.batch()
  }
  // .treatErrorsAsValues() + boxValues() as standard? how best to see what are errors...

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
  const placeholders = new Map()
  const duplicates = {}

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

    '$error', '$rev', '$ref', '$version', '$schema', '$timestamp', '$expires', '$size', '$type', '$key', '$refKey' ]
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
      if (delim === '$key' || delim == '$refKey') {
        curViewKey = path.slice(0, path.length - 1).join('.')

        if (delim === '$key') {
          path = path.concat('_id') // FIXME: for $ref case!
        }
      }

      const pathString = path.join('.') + (boxKey ? `.${boxKey}` : '')
      // TODO make dep path prefix configurable for performance vs memory optimization

      if (!deps[id]) {
        deps[id] = new Map()
      }

      if (!deps[id].has(pathString)) {
        deps[id].set(pathString, { path })
      }

      if (boxKey !== '') {
        path = path.concat(boxKey)
      }

      let adjustedModel
      if (boxKey !== '' || delim === '$ref' || delim === '$refKey') {
        adjustedModel = subModel ? subModel.boxValues() : boxedModel
      } else {
        adjustedModel = subModel || model
      }

      onAccess?.(path)

      let falcorCacheVal
      if (delim === '$ref' || delim === '$refKey') {
        const cacheVEnvelope = getJsonPath(adjustedModel.getCache(path), path)
        // console.log({cacheVEnvelope})
        if (cacheVEnvelope?.$type === 'ref') {
          falcorCacheVal = cacheVEnvelope.value
        } else if (cacheVEnvelope?.$type === 'atom') {
          falcorCacheVal = cacheVEnvelope?.$value ? { $type: 'error', value: { message: 'tried using value as reference', val: cacheVEnvelope?.$value } } : _undefined
        }
      } else {
        const falcorCacheRef = adjustedModel._root.cache
        // Object.keys is too expensive to check if falcor cache is initialized and _session is always set even when not used its an empty object
        const usePreCache = !falcorCacheRef?._session && cache
        const falcorCacheRes = extractFromCache({ obj: usePreCache ? cache : falcorCacheRef, path })
        falcorCacheVal = (falcorCacheRes?.value === undefined && falcorCacheRes?.$type === 'atom') ? _undefined : falcorCacheRes.value
      }

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

        ticker = ontick(() => {
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
      if ((falcorCacheVal === undefined || latestTick !== lastUpdt.get(pathString)) && delim !== '$refKey') {
        // TODO: instead of undefined delegating to falcor here we can make small
        // prom that returns from our model cache, gets load off falcor internals

        lastUpdt.set(pathString, latestTick)

        // TODO: use get() instead and use info about box, migrate all internals to envelopes and only unpack in last step
        newProm = adjustedModel.getValue(path)
          .then(val => {
            if (typeof val === 'undefined' || (val?.$type === 'atom' && val?.value === undefined)) {
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

                placeholders.set(pathString, true)
                // console.log('undefined value received', { pathString, key, val, curViewKey, keys: [...keys] })
              }
            } else {
              if (delim === '$ref') {
                if (val.$type === 'ref') {
                  val = val.value
                }
              }

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

      if (delim === '$key' || delim === '$refKey') {
        if (falcorCacheVal === undefined) { //
          // console.log('undefined value', { cacheVal, falcorCacheVal })
          if (duplicates.firstIds) {
            const firstIdPath = (cacheVal && cacheVal !== _undefined) ? duplicates.firstIds.get(`${cacheVal}`) : true
            if (firstIdPath && firstIdPath !== pathString) {
              // console.log('duplicate', pathString, duplicates.firstIds.get(`${cacheVal}`), cacheVal)
              placeholders.set(pathString, { fresh: true })
            }
          }
        }

        if (cacheVal === _undefined || falcorCacheVal === _undefined) {
          const placeholder = placeholders.get(pathString)
          // console.log('fresh _undef value')
          if (placeholder?.fresh || !placeholder) {
            placeholders.set(pathString, { fresh: false })
            keys.delete(pathString)
          }
        }

        const pathOverride = keys.get(pathString)

        if (cacheVal && cacheVal !== _undefined) {
          if (delim === '$refKey') {
            cacheVal = cacheVal.join('.')
          }
          const valueOverrides = keys.get(cacheVal)
          const currentViewValueOverride = valueOverrides?.[curViewKey]
          const isExpired = currentViewValueOverride ? !((currentViewValueOverride.latestTick + 6) > latestTick) : null
          const latestValueOverride = valueOverrides ? Object.values(valueOverrides).reduce(
            (biggest, current) => {
              if (current.latestTick > biggest.latestTick) {
                return current
              }
              return biggest
            }, { latestTick: 0 }
          ) : null

          if (falcorCacheVal !== undefined && falcorCacheVal !== _undefined) {
            placeholders.delete(pathString)
            if (duplicates.curViewKey !== curViewKey) {
              duplicates.curViewKey = curViewKey
              duplicates.firstIds = new Map()
            }

            duplicates.firstIds.set(`${cacheVal}`, pathString)
          }

          // console.log(pathString + ' have: ' , { cacheVal, falcorCacheVal, pathOverride, valueOverrides, currentViewValueOverride, isExpired, latestTick, latestValueOverride, placeholder: placeholders.get(pathString) })

          const noOverrides = !valueOverrides && !pathOverride
          if (noOverrides) {
            // console.log('used: cached value without key overrides', cacheVal)
            return cacheVal
          }

          if (currentViewValueOverride && !isExpired && !pathOverride) {
            // console.log('used: ' + currentViewValueOverride.key, { currentViewValueOverride })
            return currentViewValueOverride.key
          }

          if (latestValueOverride && !pathOverride && !placeholders.has(pathString)) {
            // console.log('used: ' + latestValueOverride.key, { latestValueOverride })
            return latestValueOverride.key
          }

          if (!currentViewValueOverride && !placeholders.has(pathString)) {
            if (!valueOverrides) {
              keys.set(cacheVal, { [curViewKey]: { key: pathOverride, latestTick } })
            } else {
              valueOverrides[curViewKey] = { key: pathOverride, latestTick }
              keys.set(cacheVal, valueOverrides)
            }

            keys.delete(pathString)

            // console.log('used after set valOverride and del pathString:', {pathOverride})
            return pathOverride
          }
        }

        if (pathOverride) {
          // console.log('used:', { pathOverride })
          return pathOverride
        }

        key = `first_seen_${pathString}_${latestTick} `
        // console.log('used: new temp id', { key })
        keys.set(pathString, key)
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
        // FIXME: needs lots of test cases!
        return loadingFirstValue ? '' : !value
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
        .then(res => res)

      return true
    },

    call: (path, args, _delim, _id) => {
      return (subModel || model).call(path, args, [])
        .then(res => res)
        .catch(error => {error})
    },
    delims
  })

  const runQueue = new Set()
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
            const newVer = model.getVersion(path) // FIXME: path inside atom object are all -1 instead of atom parent value use own getVersion

            // console.log({ newVer, data: model.getCache(path) })

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
    // console.log('subscribing store')
    const id = `${subscribers.size}_${subscrCounter++}`
    const subscriptionProxy = makeAyuProxy(id, subModel)

    const doRun = (..._args) => {
      return run(..._args)
    }

    const doInvalidate = (..._args) => {
      if (invalidate) {
        return invalidate(..._args)
      }
    }

    const subscriber = [doRun, doInvalidate, subscriptionProxy, id]

    subscribers.add(subscriber)

    run(subscriptionProxy)

    return () => {
      delete deps[id]
      return subscribers.delete(subscriber)
    }
  }

  let seq
  let timeout
  const doSync = async () => {
    try {
      // TODO: full support for long running observable subscriptions to avoid this loop
      const data = (await boxedModel.call(['_sync'], [seq]))?.json
      seq = data?._seq.value || seq

      // TODO: support invalidation and re-preloading by connecting to router
      // FIXME: rename to onSync
      onChange({ data, model, _where: 'window' })
    } catch (err) {
      console.log(err)
    } finally {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => {
        timeout = null
        doSync()
      }, 5)
    }
  }
  doSync()

  async function init () {
    // TODO: move to support non cf access sessions, add syncDb or similar more clear key to check for if sync loop should be started
    const userId = await model.getValue(['_session', 'userId'])
    // FIXME: do not count init change event for triggering SSR model completion, add new onFirstUpdate, that excludes init call
    if (userId) {
      doSync()
    }
  }
  init()

  // page was restored from the bfcache, sync is broken and needs to be re-initialized
  if (typeof self !== 'undefined') {
    self.addEventListener('pageshow', e => {
      if (e.persisted) {
        console.log('bf cache resume, retriggering _sync init')
        clearTimeout(timeout)
        init()
      }
    })
  }

  const dataStore = {
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
    // falcorL: falcor,
    deps
  }

  if (typeof window !== 'undefined') {
    // @ts-ignore
    window._ayu = dataStore
  }
  return dataStore
}

// change path detection feature postponed for performance reasons:
// const cache = model.getCache()
// const changes = {}
// diffCache(cache, model).forEach(change => {
//   changes[change[0]] = change[1]
// })
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
// invalidationHandler = paths => {
//  invalidationCache = {}
//  paths.forEach(path => {
//    console.log(extractFromCache({obj: model._root.cache, path}).description)
//  })
