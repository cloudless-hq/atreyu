import {
  Observable,
  extractFromCache,
  getJsonPath,
  index,
  setPathValue
} from "./shared/chunk-G5BW7EMY.js";
import "./shared/chunk-PIWLZ6KC.js";

// app/src/lib/proxy-object.js
var errorHandlers = {
  deleteProperty() {
    console.error("error: calling `delete` on atreyu proxy.");
  },
  defineProperty(oTarget, sKey, oDesc) {
    console.error("error: calling `defineProperty` on atreyu proxy.");
  },
  getOwnPropertyDescriptor(oTarget, sKey) {
    console.error("error: calling `getOwnPropertyDescriptor` on atreyu proxy.");
    return { configurable: true, enumerable: false, value: 5 };
  },
  ownKeys(oTarget, sKey) {
    console.error("error: calling ownKeys on atreyu proxy not supported.");
    return ["ownKeys test"];
  },
  getPrototypeOf(target) {
    console.error("error: getting prototype on atreyu proxy not supported.");
    return Object;
  }
};
var _start = Symbol("start");
var _end = Symbol("end");
function clean(name, endRegex) {
  let cleanKey;
  let delim;
  let isPathEnd = false;
  const rxRes = endRegex.exec(name);
  if (rxRes) {
    isPathEnd = true;
    delim = rxRes[0];
    let suffixLen = name.length - rxRes.index;
    cleanKey = name.slice(0, -suffixLen);
  } else {
    cleanKey = name;
  }
  if (cleanKey !== "") {
    const maybeNumber = Number(cleanKey);
    cleanKey = !isNaN(maybeNumber) ? maybeNumber : cleanKey;
  }
  return { isPathEnd, cleanKey, delim };
}
function makeProxy({ from, get, set, call, delims = ["$"], id }) {
  const endRegex = new RegExp(`(\\${delims.join("|\\")})$`);
  function objProxy(rootPath, subObj, rev) {
    return new Proxy(subObj, {
      ...errorHandlers,
      has(target, key) {
        if (key === Symbol.iterator) {
          return;
        }
        if (key === "length") {
          return true;
        }
        console.log("has function trap not well supported", target, key);
        return true;
      },
      apply(target, thisArg, args) {
        const path = [...rootPath];
        path.pop();
        const cleanKey = rootPath[rootPath.length - 1];
        if (cleanKey === "slice") {
          const arr = {
            length: args[1] - args[0],
            // TODO: make end max length Math.min(end, items.length)
            [_start]: args[0],
            [_end]: args[1]
          };
          return objProxy(path, arr, rev);
        } else if (cleanKey === "forEach") {
          console.error("direct forEach call not allowed. please post your use case to get support.");
        } else if (cleanKey === "map") {
          console.error("direct map call not allowed. please post your use case to get support.");
          console.log(args, target, subObj);
        }
        if (cleanKey === "_loadRef") {
          const ref = args[0];
          if (ref?.length > 0) {
            return getJsonPath(thisArg, ref);
          } else {
            return thisArg;
          }
        }
        return call(rootPath, args, "", id);
      },
      set(target, key, newValue, subObjProxy) {
        const { cleanKey } = clean(key, endRegex);
        const path = [...rootPath, cleanKey];
        let delim = "";
        return set(path, newValue, delim, id);
      },
      get(obj, key) {
        if (key === Symbol.toPrimitive) {
          return (_hint) => {
            const path = [...rootPath];
            path.pop();
            const cleanKey2 = rootPath[rootPath.length - 1];
            return get(path, subObj[cleanKey2], cleanKey2, id);
          };
        }
        if (typeof key !== "string") {
          console.warn('did your forget the trailing "$"? Non string key access not supported yet, if needed, raise github issue explaining usecase ', { rootPath, key });
          return false;
        }
        let { isPathEnd, cleanKey, delim } = clean(key, endRegex);
        if (cleanKey === "map") {
          return (fun) => {
            if (typeof obj[_start] === "undefined") {
              console.error("map is not allowed on virtual unbounded arrays, you need to use slice first. Please read about non ataomic falcor arrays before you use this!");
              return [];
            }
            for (let i = 0; i < obj.length; i++) {
              obj[i] = fun(objProxy([...rootPath, i + obj[_start]], [], rev), i, i + obj[_start]);
            }
            return obj;
          };
        }
        if (cleanKey === "_rev" && typeof subObj[cleanKey] === "undefined") {
          return get([...rootPath, cleanKey], subObj, delim, id);
        }
        if (typeof obj?.[_start] !== "undefined") {
          if (!isNaN(cleanKey)) {
            cleanKey = cleanKey + obj[_start];
          } else if (cleanKey !== "length") {
            console.error("unexpected slice access, please raise github issue with your usecase");
          }
        }
        if (isPathEnd) {
          return get([...rootPath, cleanKey], subObj[cleanKey], delim, id);
        }
        if (typeof subObj[cleanKey] === "undefined") {
          if (cleanKey === "length") {
            return get([...rootPath, cleanKey], 0, delim, id);
          }
          return objProxy([...rootPath, cleanKey], from, rev);
        }
        if (typeof subObj[cleanKey] !== "object") {
          if (cleanKey === "length") {
            return get([...rootPath, cleanKey], subObj[cleanKey], delim, id);
          }
          return subObj[cleanKey];
        }
        return objProxy([...rootPath, cleanKey], subObj[cleanKey], rev);
      }
    });
  }
  return objProxy([], from, 0);
}

// app/src/store/service-worker-source.js
var ServiceWorkerSource = class {
  constructor({ wake }) {
    this._inflight = {};
    this._id = 0;
    this._active = 0;
    this._timer;
    const init = () => {
      this._worker = navigator.serviceWorker.controller;
      this._worker?.postMessage(JSON.stringify([-1, "hello mike"]));
    };
    if (!this._worker) {
      init();
    }
    navigator.serviceWorker.addEventListener("message", (e) => {
      if (e.data.startsWith("navigate:")) {
        return;
      }
      if (!this._worker) {
        init();
      }
      const { id, error, value, done, hello } = JSON.parse(e.data);
      if (hello) {
        setTimeout(() => {
          Object.values(this._inflight).forEach((stale) => stale("service worker restarted, canceled:", stale));
        }, 800);
      } else if (typeof this._inflight[id] === "function") {
        this._inflight[id](error, value, done);
      } else {
        console.log(e.data);
      }
    });
    if (wake) {
      this._waker = setInterval(() => {
        this._worker?.postMessage(JSON.stringify([-1, "waky waky"]));
      }, wake);
    }
  }
  isActive() {
    return this._active !== false;
  }
  get(paths) {
    return this._getResponse(["get", paths]);
  }
  set(jsonGraphEnvelope) {
    return this._getResponse(["set", jsonGraphEnvelope]);
  }
  call(callPath, args, pathSuffixes, paths) {
    return this._getResponse(["call", callPath, args, pathSuffixes, paths]);
  }
  // Creates an observable stream that will send a request
  // to a Model server, and retrieve the response.
  // The request and response are correlated using a unique
  // identifier which the client sends with the request and
  // the server echoes back along with the response.
  _getResponse(action) {
    const id = this._id++;
    if (action[1] !== "call" && action[1][0] !== "_sync") {
      this._active = this._active ? this._active + 1 : 1;
    }
    return Observable.create((subscriber) => {
      this._inflight[id] = (error, value, done) => {
        if (error) {
          subscriber.onError(error);
        } else if (done) {
          subscriber.onCompleted();
        } else {
          subscriber.onNext(value);
        }
      };
      this._worker.postMessage(JSON.stringify([id, ...action]));
      return () => {
        delete this._inflight[id];
        if (action[1] !== "call" && action[1][0] !== "_sync") {
          this._active--;
          if (this._timer) {
            clearTimeout(this._timer);
          }
          this._timer = setTimeout(() => {
            this._timer = null;
            if (this._active === 0) {
              this._active = false;
            }
          }, 30);
        }
      };
    });
  }
};
var service_worker_source_default = ServiceWorkerSource;

// app/src/store/data.js
var _undefined = Symbol("undefined");
var frameScheduler = class {
  schedule(action) {
    let id = requestAnimationFrame(action);
    return {
      dispose: () => {
        if (id) {
          cancelAnimationFrame(id);
          id = null;
        }
      }
    };
  }
  scheduleWithState(state, action) {
    let id = requestAnimationFrame(() => {
      action(this, state);
    });
    return {
      dispose: () => {
        if (id) {
          cancelAnimationFrame(id);
          id = null;
        }
      }
    };
  }
};
function makeDataStore({ source, maxSize, collectRatio, maxRetries, cache, onChange = () => {
}, onModelChange, errorSelector, onAccess } = {}) {
  if (typeof source === "undefined") {
    source = new service_worker_source_default({ wake: 2e4 });
  }
  const model = index({
    source: source || void 0,
    maxSize: maxSize || 5e5,
    collectRatio: collectRatio || 0.75,
    maxRetries: maxRetries || 1,
    // todo 0 requires fix in falcor due to falsy check
    // _useServerPaths: true,
    cache,
    scheduler: frameScheduler,
    // this is the internal scheduler, default to immediate
    // beforeInvalidate: paths => {
    //   console.log('before invalidate does not work', paths)
    //   // if (invalidationHandler) {
    //   //   invalidationHandler(paths)
    //   // }
    // },
    // Jafar Husain: we notify of changes but you can calculate what changed based on the version annotations from root to any level of detail when you need. this balances the cost of pushing all changes and the cost of polling in a change pull model.
    onChange: () => {
      update();
      onModelChange?.();
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
    errorSelector: function(path, error, c) {
      if (errorSelector) {
        errorSelector(path, error, c);
      } else {
        console.error(path, error, c);
      }
      return error;
    }
  }).treatErrorsAsValues().batch(new frameScheduler());
  const boxedModel = model.boxValues();
  const cacheMap = /* @__PURE__ */ new Map();
  let latestTick = 0;
  const lastUpdt = /* @__PURE__ */ new Map();
  let ticker = null;
  const deps = {};
  const keys = /* @__PURE__ */ new Map();
  const placeholders = /* @__PURE__ */ new Map();
  const duplicates = {};
  const delims = [
    "$",
    "$value",
    // $ is shorthand for $value
    "$not",
    // shorthand to be able to do if (x.a$not) instead of if (!x.a$ && !x.a$loading)
    "$loading",
    "$promise",
    // TODO:
    // FIXME: Also expose these as store init functions and allow importing a deep store instead of always the data root!
    // this allows skipping rerender without fixing the diff checking of svelte
    "$$",
    // dereference
    "$$unbox",
    // deref and unbox
    "$$unbatch",
    // etc. // deref and unbatch
    "$error",
    "$rev",
    "$ref",
    "$version",
    "$schema",
    "$timestamp",
    "$expires",
    "$size",
    "$type",
    "$key",
    "$refKey"
  ];
  const makeAyuProxy = (id, subModel) => makeProxy({
    id,
    from: () => {
    },
    get: (path, subVal, delim, id2) => {
      if (path[path.length - 1] === "") {
        path.pop();
      }
      path = subModel ? [...subModel.getPath(), ...path] : path;
      const name = path[path.length - 1];
      if (name === "length") {
        if (typeof subVal === "number" && subVal > 0) {
          return subVal;
        }
      }
      let boxKey = "";
      if (delim && !delims.includes(delim)) {
        boxKey = delim;
      }
      let curViewKey;
      if (delim === "$key" || delim == "$refKey") {
        curViewKey = path.slice(0, path.length - 1).join(".");
        if (delim === "$key") {
          path = path.concat("_id");
        }
      }
      const pathString = path.join(".") + (boxKey ? `.${boxKey}` : "");
      if (!deps[id2]) {
        deps[id2] = /* @__PURE__ */ new Map();
      }
      if (!deps[id2].has(pathString)) {
        deps[id2].set(pathString, { path });
      }
      if (boxKey !== "") {
        path = path.concat(boxKey);
      }
      let adjustedModel;
      if (boxKey !== "" || delim === "$ref" || delim === "$refKey") {
        adjustedModel = subModel ? subModel.boxValues() : boxedModel;
      } else {
        adjustedModel = subModel || model;
      }
      onAccess?.(path);
      let falcorCacheVal;
      if (delim === "$ref" || delim === "$refKey") {
        const cacheVEnvelope = getJsonPath(adjustedModel.getCache(path), path);
        if (cacheVEnvelope?.$type === "ref") {
          falcorCacheVal = cacheVEnvelope.value;
        } else if (cacheVEnvelope?.$type === "atom") {
          falcorCacheVal = cacheVEnvelope?.$value ? { $type: "error", value: { message: "tried using value as reference", val: cacheVEnvelope?.$value } } : _undefined;
        }
      } else {
        const falcorCacheRes = extractFromCache({ obj: adjustedModel._root.cache, path });
        falcorCacheVal = falcorCacheRes?.value === void 0 && falcorCacheRes?.$type === "atom" ? _undefined : falcorCacheRes.value;
      }
      let cacheVal;
      let existingProm;
      if (typeof falcorCacheVal !== "undefined") {
        cacheVal = falcorCacheVal;
      } else {
        [cacheVal, existingProm] = cacheMap.get(pathString) || [];
      }
      let key;
      if (!ticker) {
        ++latestTick;
        ticker = requestAnimationFrame(() => {
          ++latestTick;
          ticker = null;
          if (cacheMap.size > 7e5) {
            console.info("clearing data store cache");
            cacheMap.clear();
          }
        });
      }
      let newProm;
      if ((falcorCacheVal === void 0 || latestTick !== lastUpdt.get(pathString)) && delim !== "$refKey") {
        lastUpdt.set(pathString, latestTick);
        newProm = adjustedModel.getValue(path).then((val) => {
          if (typeof val === "undefined" || val?.$type === "atom" && val?.value === void 0) {
            cacheMap.set(pathString, [_undefined]);
            if (delim === "$key") {
              if (cacheVal && cacheVal !== _undefined) {
                const viewKeys = keys.get(cacheVal);
                if (viewKeys && viewKeys[curViewKey]) {
                  if ((viewKeys._maybeLatest?.latestTick || 0) < viewKeys[curViewKey].latestTick) {
                    viewKeys._maybeLatest = viewKeys[curViewKey];
                  }
                  delete viewKeys[curViewKey];
                  keys.set(cacheVal, viewKeys);
                }
              }
              placeholders.set(pathString, true);
            }
          } else {
            if (delim === "$ref") {
              if (val.$type === "ref") {
                val = val.value;
              }
            }
            if (delim === "$key") {
              if (key) {
                const previousViewKeys = keys.get(val) || {};
                if (!previousViewKeys[curViewKey]) {
                  previousViewKeys[curViewKey] = { key, latestTick };
                  keys.set(val, previousViewKeys);
                  keys.delete(pathString);
                }
              } else if (cacheVal === _undefined || placeholders.has(pathString)) {
                keys.delete(pathString);
              }
              placeholders.delete(pathString);
            }
            cacheMap.set(pathString, [val]);
          }
          return val;
        }).catch((err) => {
          return new Promise((_resolve, reject) => reject({
            message: "failed falcor get",
            path,
            err
          }));
        });
        cacheMap.set(pathString, [cacheVal, newProm]);
      }
      if (delim === "$key" || delim === "$refKey") {
        if (falcorCacheVal === void 0) {
          if (duplicates.firstIds) {
            const firstIdPath = cacheVal && cacheVal !== _undefined ? duplicates.firstIds.get(`${cacheVal}`) : true;
            if (firstIdPath && firstIdPath !== pathString) {
              placeholders.set(pathString, { fresh: true });
            }
          }
        }
        if (cacheVal === _undefined || falcorCacheVal === _undefined) {
          const placeholder = placeholders.get(pathString);
          if (placeholder?.fresh || !placeholder) {
            placeholders.set(pathString, { fresh: false });
            keys.delete(pathString);
          }
        }
        const pathOverride = keys.get(pathString);
        if (cacheVal && cacheVal !== _undefined) {
          if (delim === "$refKey") {
            cacheVal = cacheVal.join(".");
          }
          const valueOverrides = keys.get(cacheVal);
          const currentViewValueOverride = valueOverrides?.[curViewKey];
          const isExpired = currentViewValueOverride ? !(currentViewValueOverride.latestTick + 6 > latestTick) : null;
          const latestValueOverride = valueOverrides ? Object.values(valueOverrides).reduce(
            (biggest, current) => {
              if (current.latestTick > biggest.latestTick) {
                return current;
              }
              return biggest;
            },
            { latestTick: 0 }
          ) : null;
          if (falcorCacheVal !== void 0 && falcorCacheVal !== _undefined) {
            placeholders.delete(pathString);
            if (duplicates.curViewKey !== curViewKey) {
              duplicates.curViewKey = curViewKey;
              duplicates.firstIds = /* @__PURE__ */ new Map();
            }
            duplicates.firstIds.set(`${cacheVal}`, pathString);
          }
          const noOverrides = !valueOverrides && !pathOverride;
          if (noOverrides) {
            return cacheVal;
          }
          if (currentViewValueOverride && !isExpired && !pathOverride) {
            return currentViewValueOverride.key;
          }
          if (latestValueOverride && !pathOverride && !placeholders.has(pathString)) {
            return latestValueOverride.key;
          }
          if (!currentViewValueOverride && !placeholders.has(pathString)) {
            if (!valueOverrides) {
              keys.set(cacheVal, { [curViewKey]: { key: pathOverride, latestTick } });
            } else {
              valueOverrides[curViewKey] = { key: pathOverride, latestTick };
              keys.set(cacheVal, valueOverrides);
            }
            keys.delete(pathString);
            return pathOverride;
          }
        }
        if (pathOverride) {
          return pathOverride;
        }
        key = `first_seen_${pathString}_${latestTick} `;
        keys.set(pathString, key);
        return key;
      }
      let loadingFirstValue = true;
      let value;
      if (typeof cacheVal !== "undefined") {
        if (cacheVal === _undefined) {
          value = void 0;
          loadingFirstValue = false;
        } else {
          value = cacheVal;
          loadingFirstValue = false;
        }
      }
      if (delim === "$promise") {
        if (newProm) {
          return newProm;
        } else if (existingProm) {
          return existingProm;
        } else {
          return Promise.resolve(value);
        }
      } else if (delim === "$loading") {
        return loadingFirstValue;
      } else if (delim === "$not") {
        return loadingFirstValue ? { toString: () => {
          "";
        } } : !value;
      } else {
        if (value?.$type === "atom") {
          console.warn("Missing data in ayu data store at:", path);
          return "";
        }
        return loadingFirstValue ? "" : value;
      }
    },
    set: (path, newValue, delim, _id) => {
      if (path[path.length - 1] === "") {
        path.pop();
      }
      path = subModel ? [...subModel.getPath(), ...path] : path;
      let boxKey = "";
      if (delim && !delims.includes(delim)) {
        boxKey = delim;
      }
      let adjustedModel;
      if (boxKey !== "") {
        adjustedModel = subModel ? subModel.boxValues() : boxedModel;
        path = path.concat(boxKey);
      } else {
        adjustedModel = subModel || model;
      }
      const { parentAtom } = extractFromCache({ obj: adjustedModel._root.cache, path });
      if (parentAtom) {
        path = parentAtom.obj.$_absolutePath;
        newValue = setPathValue(parentAtom.obj.value, parentAtom.relPath, newValue);
      }
      adjustedModel.setValue(path, newValue).then(() => {
      }).catch((err) => console.error(err));
      return true;
    },
    call: (path, args, _delim, _id) => {
      return (subModel || model).call(path, args);
    },
    delims
  });
  const runQueue = /* @__PURE__ */ new Set();
  const subscribers = /* @__PURE__ */ new Set();
  function update() {
    if (subscribers.size > 0) {
      const queueOpener = !runQueue.size;
      subscribers.forEach(([run, invalidate, subscriptionProxy, id]) => {
        let changed = false;
        if (!deps[id]) {
          changed = true;
        } else {
          for (const [pathString, { lastVer, path }] of deps[id]) {
            const newVer = model.getVersion(path);
            if (newVer === -1 || !lastVer || lastVer !== newVer) {
              deps[id].set(pathString, { path, lastVer: newVer });
              changed = true;
            }
          }
        }
        if (changed) {
          invalidate();
          runQueue.add([run, subscriptionProxy]);
        }
      });
      if (queueOpener) {
        runQueue.forEach(([run, subscriptionProxy]) => {
          run(subscriptionProxy);
        });
        runQueue.clear();
      }
    }
  }
  let subscrCounter = 0;
  function subscribe(run, invalidate, subModel) {
    const id = `${subscribers.size}_${subscrCounter++}`;
    const subscriptionProxy = makeAyuProxy(id, subModel);
    const doRun = (..._args) => {
      return run(..._args);
    };
    const doInvalidate = (..._args) => {
      if (invalidate) {
        return invalidate(..._args);
      }
    };
    const subscriber = [doRun, doInvalidate, subscriptionProxy, id];
    subscribers.add(subscriber);
    run(subscriptionProxy);
    return () => {
      delete deps[id];
      return subscribers.delete(subscriber);
    };
  }
  let seq;
  let timeout;
  const doSync = async () => {
    try {
      const data = (await boxedModel.call(["_sync"], [seq]))?.json;
      seq = data?._seq.value || seq;
      onChange({ data, model, _where: "window" });
    } catch (err) {
      console.log(err);
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        timeout = null;
        doSync();
      }, 5);
    }
  };
  async function init() {
    const userId = await model.getValue(["_session", "userId"]);
    if (userId) {
      doSync();
    }
  }
  init();
  self.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      console.log("bf cache resume, retriggering _sync init");
      clearTimeout(timeout);
      init();
    }
  });
  return {
    deref: (paths) => {
      return paths.map((path) => {
        const subModel = model.deref({ "$__path": path });
        return {
          subscribe: (run, invalidate) => {
            return subscribe(run, invalidate, subModel);
          },
          set: () => {
          },
          falcor: subModel
        };
      });
    },
    subscribe,
    set: () => {
    },
    falcor: model,
    deps
  };
}
export {
  makeDataStore as default
};
