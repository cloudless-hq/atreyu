// app/build/deps/falcor-observable.js
function getAugmentedNamespace(n) {
  if (n.__esModule)
    return n;
  var f = n.default;
  if (typeof f == "function") {
    var a = function a2() {
      if (this instanceof a2) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else
    a = {};
  Object.defineProperty(a, "__esModule", { value: true });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
function symbolObservablePonyfill(root2) {
  var result2;
  var Symbol2 = root2.Symbol;
  if (typeof Symbol2 === "function") {
    if (Symbol2.observable) {
      result2 = Symbol2.observable;
    } else {
      result2 = Symbol2("observable");
      Symbol2.observable = result2;
    }
  } else {
    result2 = "@@observable";
  }
  return result2;
}
var root;
if (typeof self !== "undefined") {
  root = self;
} else if (typeof window !== "undefined") {
  root = window;
} else if (typeof global !== "undefined") {
  root = global;
} else if (typeof module !== "undefined") {
  root = module;
} else {
  root = Function("return this")();
}
var result = symbolObservablePonyfill(root);
var es = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: result
});
var require$$0 = /* @__PURE__ */ getAugmentedNamespace(es);
var symbolError$1 = Symbol("try-catch-error");
var lastError = null;
function popError$1() {
  if (!lastError) {
    throw new Error("popError may only be called once");
  }
  const { e } = lastError;
  lastError = null;
  return e;
}
var tryCatch$1;
var tryCatchResult$1;
{
  const throwError = (e) => {
    throw e;
  };
  tryCatch$1 = function doTryCatch(f, ...args) {
    try {
      f.call(this, ...args);
    } catch (e) {
      setTimeout(() => {
        throwError(e);
      }, 0);
    }
  };
  tryCatchResult$1 = function doTryCatchResult(f, ...args) {
    try {
      return f.call(this, ...args);
    } catch (e) {
      lastError = { e };
      return symbolError$1;
    }
  };
}
var tryCatch_1 = { tryCatch: tryCatch$1, tryCatchResult: tryCatchResult$1, symbolError: symbolError$1, popError: popError$1 };
var symbolObservable = require$$0.default;
var {
  tryCatch,
  tryCatchResult,
  symbolError,
  popError
} = tryCatch_1;
function callNext(observer, value) {
  const { next } = observer;
  if (typeof next === "function") {
    next.call(observer, value);
  }
}
function callError(observer, errorValue) {
  const { error } = observer;
  if (typeof error === "function") {
    error.call(observer, errorValue);
  }
}
function callComplete(observer) {
  const { complete } = observer;
  if (typeof complete === "function") {
    complete.call(observer);
  }
}
function callStart(observer, subscription) {
  const { start } = observer;
  if (typeof start === "function") {
    start.call(observer, subscription);
  }
}
function callCleanup(subscription) {
  const cleanup = subscription._cleanup;
  if (typeof cleanup === "function") {
    subscription._cleanup = void 0;
    cleanup();
  } else if (typeof cleanup === "object" && cleanup !== null) {
    subscription._cleanup = void 0;
    cleanup.unsubscribe();
  }
}
var SubscriptionObserver = class {
  constructor(subscription) {
    this._subscription = subscription;
  }
  next(value) {
    const subscription = this._subscription;
    const observer = subscription._observer;
    if (typeof observer === "undefined") {
      return;
    }
    tryCatch(callNext, observer, value);
  }
  error(errorValue) {
    const subscription = this._subscription;
    const observer = subscription._observer;
    if (typeof observer === "undefined") {
      return;
    }
    subscription._observer = void 0;
    tryCatch(callError, observer, errorValue);
    tryCatch(callCleanup, subscription);
  }
  complete() {
    const subscription = this._subscription;
    const observer = subscription._observer;
    if (typeof observer === "undefined") {
      return;
    }
    subscription._observer = void 0;
    tryCatch(callComplete, observer);
    tryCatch(callCleanup, subscription);
  }
  get closed() {
    return typeof this._subscription._observer === "undefined";
  }
  onNext(value) {
    this.next(value);
  }
  onError(errorValue) {
    this.error(errorValue);
  }
  onCompleted() {
    this.complete();
  }
  get isStopped() {
    return this.closed;
  }
};
var Subscription$1 = class Subscription {
  constructor(subscriber, observer) {
    this._observer = observer;
    tryCatch(callStart, observer, this);
    if (typeof this._observer === "undefined") {
      return;
    }
    const subscriptionObserver = new SubscriptionObserver(this);
    const subscriberResult = tryCatchResult(subscriber, subscriptionObserver);
    if (subscriberResult === symbolError) {
      subscriptionObserver.error(popError());
      return;
    }
    const cleanup = subscriberResult;
    if (cleanup === null || typeof cleanup === "undefined") {
      return;
    }
    if (typeof cleanup !== "function" && typeof cleanup !== "object") {
      throw new TypeError(
        "unexpected subscriber result type " + typeof cleanup
      );
    }
    if (typeof cleanup === "object" && typeof cleanup.unsubscribe !== "function") {
      throw new TypeError("expected unsubscribe property to be a function");
    }
    this._cleanup = cleanup;
    if (typeof this._observer === "undefined") {
      tryCatch(callCleanup, this);
    }
  }
  unsubscribe() {
    const observer = this._observer;
    if (typeof observer === "undefined") {
      return;
    }
    this._observer = void 0;
    tryCatch(callCleanup, this);
  }
  get closed() {
    return typeof this._observer === "undefined";
  }
  dispose() {
    this.unsubscribe();
  }
  get isDisposed() {
    return this.closed;
  }
};
var EsObservable;
var BaseObservable$1 = class BaseObservable {
  constructor(subscriber) {
    if (typeof subscriber !== "function") {
      throw new TypeError("Function expected");
    }
    this._subscriber = subscriber;
  }
  // $FlowFixMe: No symbol or computed property support.
  [symbolObservable]() {
    return new EsObservable(this._subscriber);
  }
  // Flow doesn't support returning a differently parameterized this type so
  // specify types on subclasses instead.
  pipe(...operators) {
    return this.constructor.from(
      // $FlowFixMe: No symbol support.
      operators.reduce((acc, curr) => curr(acc), this[symbolObservable]())
    );
  }
  static of(...values) {
    return new this((observer) => {
      for (const value of values) {
        observer.next(value);
      }
      observer.complete();
    });
  }
  static from(input) {
    if (typeof input === "undefined" || input === null) {
      throw new TypeError();
    }
    if (typeof input === "object") {
      const observableProp = (
        // $FlowFixMe: No symbol support.
        input[symbolObservable]
      );
      if (typeof observableProp === "function") {
        const observable = observableProp.call(input);
        if (typeof observable !== "object" || observable === null) {
          throw new TypeError();
        }
        if (observable.constructor === this) {
          return observable;
        }
        if (observable instanceof BaseObservable) {
          return new this(observable._subscriber);
        }
        return new this((observer) => observable.subscribe(observer));
      }
      if (typeof input.subscribe === "function") {
        const classic = input;
        return new this((observer) => {
          const disposable = classic.subscribe(observer);
          return () => disposable.dispose();
        });
      }
      if (typeof input.then === "function") {
        const promiseLike = input;
        return new this((observer) => {
          promiseLike.then(
            (value) => {
              observer.next(value);
              observer.complete();
            },
            (errorValue) => {
              observer.error(errorValue);
            }
          );
        });
      }
    }
    if (typeof input[Symbol.iterator] === "function") {
      return new this((observer) => {
        for (const value of input) {
          observer.next(value);
        }
        observer.complete();
      });
    }
    throw new TypeError();
  }
  static fromClassicObservable(classic) {
    return this.from(classic);
  }
  static empty() {
    return new this((observer) => {
      observer.complete();
    });
  }
  static throw(errorValue) {
    return new this((observer) => {
      observer.error(errorValue);
    });
  }
  static defer(factory) {
    return new this((observer) => {
      const result2 = factory();
      const obs = this.from(result2);
      return new Subscription$1(obs._subscriber, observer);
    });
  }
};
EsObservable = class EsObservable2 extends BaseObservable$1 {
  subscribe(observerOrOnNext, onError, onComplete) {
    const observer = typeof observerOrOnNext === "object" && observerOrOnNext !== null ? observerOrOnNext : {
      next: observerOrOnNext,
      error: onError,
      complete: onComplete
    };
    return new Subscription$1(this._subscriber, observer);
  }
  // $FlowFixMe: No symbol or computed property support.
  [symbolObservable]() {
    return this;
  }
  // To pass ES Observable tests these static functions must work without this.
  static of(...values) {
    const C = typeof this === "function" ? this : EsObservable2;
    return super.of.call(C, ...values);
  }
  static from(input) {
    const C = typeof this === "function" ? this : EsObservable2;
    return super.from.call(C, input);
  }
};
var esObservable = {
  BaseObservable: BaseObservable$1,
  Observable: EsObservable,
  Subscription: Subscription$1
};
var { BaseObservable: BaseObservable2, Subscription: Subscription2 } = esObservable;
var EsFromClassicObserver = class {
  constructor(observer) {
    this._observer = observer;
  }
  next(value) {
    const observer = this._observer;
    const { onNext } = observer;
    if (typeof onNext === "function") {
      onNext.call(observer, value);
    }
  }
  error(errorValue) {
    const observer = this._observer;
    const { onError } = observer;
    if (typeof onError === "function") {
      onError.call(observer, errorValue);
    }
  }
  complete() {
    const observer = this._observer;
    const { onCompleted } = observer;
    if (typeof onCompleted === "function") {
      onCompleted.call(observer);
    }
  }
};
var ClassicObservable = class _ClassicObservable extends BaseObservable2 {
  subscribe(observerOrOnNext, onError, onCompleted) {
    const observer = typeof observerOrOnNext === "object" && observerOrOnNext !== null ? new EsFromClassicObserver(observerOrOnNext) : {
      next: observerOrOnNext,
      error: onError,
      complete: onCompleted
    };
    return new Subscription2(this._subscriber, observer);
  }
  static create(subscriber) {
    const C = typeof this === "function" ? this : _ClassicObservable;
    if (typeof subscriber !== "function") {
      throw new TypeError("Function expected");
    }
    return new C((observer) => {
      const cleanup = subscriber(observer);
      if (typeof cleanup !== "object" || cleanup === null) {
        return cleanup;
      }
      if (typeof cleanup.dispose === "function") {
        return () => {
          cleanup.dispose();
        };
      }
      return { unsubscribe: cleanup.dispose };
    });
  }
};
var classicObservable = { Observable: ClassicObservable };
var Observable = classicObservable.Observable;

// app/src/falcor/service-worker-source.js
var ServiceWorkerSource = class {
  constructor({ wake = 2e4, cache } = {}) {
    this._inflight = {};
    this._id = 0;
    this._active = 0;
    this._timer;
    const init = () => {
      this._worker = navigator.serviceWorker.controller;
      this._worker?.postMessage(JSON.stringify([-1, "hello mike"]));
      if (cache) {
        this._worker?.postMessage(JSON.stringify({ cache }));
      }
    };
    if (!this._worker) {
      init();
    }
    if (import.meta.hot) {
      import.meta.hot.on("vite:beforeFullReload", async () => {
        const reg = await navigator.serviceWorker.getRegistration();
        reg?.update();
      });
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
          console.error([id, ...action]);
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
export {
  service_worker_source_default as default
};
