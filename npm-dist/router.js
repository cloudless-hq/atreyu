var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// app/build/deps/falcor-observable.js
function getAugmentedNamespace(n2) {
  if (n2.__esModule)
    return n2;
  var f = n2.default;
  if (typeof f == "function") {
    var a2 = function a3() {
      if (this instanceof a3) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a2.prototype = f.prototype;
  } else
    a2 = {};
  Object.defineProperty(a2, "__esModule", { value: true });
  Object.keys(n2).forEach(function(k) {
    var d2 = Object.getOwnPropertyDescriptor(n2, k);
    Object.defineProperty(a2, k, d2.get ? d2 : {
      enumerable: true,
      get: function() {
        return n2[k];
      }
    });
  });
  return a2;
}
function symbolObservablePonyfill(root3) {
  var result3;
  var Symbol2 = root3.Symbol;
  if (typeof Symbol2 === "function") {
    if (Symbol2.observable) {
      result3 = Symbol2.observable;
    } else {
      result3 = Symbol2("observable");
      Symbol2.observable = result3;
    }
  } else {
    result3 = "@@observable";
  }
  return result3;
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
  const { e: e2 } = lastError;
  lastError = null;
  return e2;
}
var tryCatch$1;
var tryCatchResult$1;
{
  const throwError = (e2) => {
    throw e2;
  };
  tryCatch$1 = function doTryCatch(f, ...args) {
    try {
      f.call(this, ...args);
    } catch (e2) {
      setTimeout(() => {
        throwError(e2);
      }, 0);
    }
  };
  tryCatchResult$1 = function doTryCatchResult(f, ...args) {
    try {
      return f.call(this, ...args);
    } catch (e2) {
      lastError = { e: e2 };
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
        const observable2 = observableProp.call(input);
        if (typeof observable2 !== "object" || observable2 === null) {
          throw new TypeError();
        }
        if (observable2.constructor === this) {
          return observable2;
        }
        if (observable2 instanceof BaseObservable) {
          return new this(observable2._subscriber);
        }
        return new this((observer) => observable2.subscribe(observer));
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
      const result3 = factory();
      const obs = this.from(result3);
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

// app/build/deps/falcor-router.js
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getAugmentedNamespace2(n2) {
  if (n2.__esModule)
    return n2;
  var f = n2.default;
  if (typeof f == "function") {
    var a2 = function a3() {
      if (this instanceof a3) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a2.prototype = f.prototype;
  } else
    a2 = {};
  Object.defineProperty(a2, "__esModule", { value: true });
  Object.keys(n2).forEach(function(k) {
    var d2 = Object.getOwnPropertyDescriptor(n2, k);
    Object.defineProperty(a2, k, d2.get ? d2 : {
      enumerable: true,
      get: function() {
        return n2[k];
      }
    });
  });
  return a2;
}
var prefix$1 = String.fromCharCode(30);
var prefix = prefix$1;
var Keys$6 = {
  ranges: prefix + "ranges",
  integers: prefix + "integers",
  keys: prefix + "keys",
  named: prefix + "named",
  name: prefix + "name",
  match: prefix + "match"
};
var Keys_1 = Keys$6;
var isArray$4 = Array.isArray;
var convertPathKeyTo$3 = function convertPathKeyTo(onRange3, onKey2) {
  return function converter(keySet) {
    var isKeySet = typeof keySet === "object";
    var out = [];
    if (isKeySet) {
      if (isArray$4(keySet)) {
        var reducer = null;
        keySet.forEach(function(key) {
          if (typeof key === "object") {
            reducer = onRange3(out, key, reducer);
          } else {
            reducer = onKey2(out, key, reducer);
          }
        });
      } else {
        onRange3(out, keySet);
      }
    } else {
      onKey2(out, keySet);
    }
    return out;
  };
};
var isNumber$2 = function(x) {
  return String(Number(x)) === String(x) && typeof x !== "object";
};
var convertPathKeyTo$2 = convertPathKeyTo$3;
var isNumber$1 = isNumber$2;
function onRange$2(out, range3) {
  out[out.length] = range3;
}
function keyReduce(out, key, range3) {
  if (!isNumber$1(key)) {
    return range3;
  }
  key = +key;
  if (range3) {
    if (key - 1 === range3.to) {
      range3.to = key;
    } else if (key + 1 === range3.from) {
      range3.from = key;
    } else {
      range3 = null;
    }
  }
  if (!range3) {
    range3 = { to: key, from: key };
    out[out.length] = range3;
  }
  return range3;
}
var convertPathKeyToRange$1 = convertPathKeyTo$2(onRange$2, keyReduce);
var rangeToArray$2 = function onRange(range3) {
  var out = [];
  var i2 = range3.from;
  var to = range3.to;
  var outIdx = out.length;
  for (; i2 <= to; ++i2, ++outIdx) {
    out[outIdx] = i2;
  }
  return out;
};
var convertPathKeyTo$1 = convertPathKeyTo$3;
var isNumber = isNumber$2;
var rangeToArray$1 = rangeToArray$2;
function onRange$1(out, range3) {
  var len = out.length - 1;
  rangeToArray$1(range3).forEach(function(el) {
    out[++len] = el;
  });
}
function onKey$1(out, key) {
  if (isNumber(key)) {
    out[out.length] = key;
  }
}
var convertPathKeyToIntegers$1 = convertPathKeyTo$1(onRange$1, onKey$1);
var convertPathKeyTo2 = convertPathKeyTo$3;
var rangeToArray = rangeToArray$2;
function onKey(out, key) {
  out[out.length] = key;
}
function onRange2(out, range3) {
  var len = out.length - 1;
  rangeToArray(range3).forEach(function(el) {
    out[++len] = el;
  });
}
var convertPathKeyToKeys$1 = convertPathKeyTo2(onRange2, onKey);
var Keys$5 = Keys_1;
var convertPathKeyToRange = convertPathKeyToRange$1;
var convertPathKeyToIntegers = convertPathKeyToIntegers$1;
var convertPathKeyToKeys = convertPathKeyToKeys$1;
var isArray$3 = Array.isArray;
var convertPathToRoute$1 = function convertPathToRoute(path, route) {
  var matched = [];
  for (var i2 = 0, len = route.length; i2 < len; ++i2) {
    if (route[i2].type) {
      var virt = route[i2];
      switch (virt.type) {
        case Keys$5.ranges:
          matched[i2] = convertPathKeyToRange(path[i2]);
          break;
        case Keys$5.integers:
          matched[i2] = convertPathKeyToIntegers(path[i2]);
          break;
        case Keys$5.keys:
          matched[i2] = convertPathKeyToKeys(path[i2]);
          break;
        default:
          var err = new Error("Unknown route type.");
          err.throwToNext = true;
          break;
      }
      if (virt.named) {
        matched[virt.name] = matched[matched.length - 1];
      }
    } else {
      if (isArray$3(route[i2]) && !isArray$3(path[i2])) {
        matched[matched.length] = [path[i2]];
      } else {
        matched[matched.length] = path[i2];
      }
    }
  }
  return matched;
};
var isPathValue$1 = function(x) {
  return x.hasOwnProperty("path") && x.hasOwnProperty("value");
};
var slice$1 = function slice(args, index) {
  var len = args.length;
  var out = [];
  var j = 0;
  var i2 = index;
  while (i2 < len) {
    out[j] = args[i2];
    ++i2;
    ++j;
  }
  return out;
};
var convertPathToRoute2 = convertPathToRoute$1;
var isPathValue = isPathValue$1;
var slice2 = slice$1;
var isArray$2 = Array.isArray;
function createNamedVariables(route, action) {
  return function innerCreateNamedVariables(matchedPath) {
    var convertedArguments;
    var len = -1;
    var restOfArgs = slice2(arguments, 1);
    var isJSONObject = !isArray$2(matchedPath);
    if (isJSONObject) {
      restOfArgs = [];
      convertedArguments = matchedPath;
    } else if (isPathValue(matchedPath[0])) {
      convertedArguments = [];
      matchedPath.forEach(function(pV) {
        pV.path = convertPathToRoute2(pV.path, route);
        convertedArguments[++len] = pV;
      });
    } else {
      convertedArguments = convertPathToRoute2(matchedPath, route);
    }
    return action.apply(this, [convertedArguments].concat(restOfArgs));
  };
}
var actionWrapper$1 = createNamedVariables;
var tokenizer = { exports: {} };
var TokenTypes$6 = {
  token: "token",
  dotSeparator: ".",
  commaSeparator: ",",
  openingBracket: "[",
  closingBracket: "]",
  openingBrace: "{",
  closingBrace: "}",
  escape: "\\",
  space: " ",
  colon: ":",
  quote: "quote",
  unknown: "unknown"
};
var TokenTypes_1 = TokenTypes$6;
var TokenTypes$5 = TokenTypes_1;
var DOT_SEPARATOR = ".";
var COMMA_SEPARATOR = ",";
var OPENING_BRACKET = "[";
var CLOSING_BRACKET = "]";
var OPENING_BRACE = "{";
var CLOSING_BRACE = "}";
var COLON = ":";
var ESCAPE = "\\";
var DOUBLE_OUOTES = '"';
var SINGE_OUOTES = "'";
var SPACE = " ";
var SPECIAL_CHARACTERS = `\\'"[]., `;
var EXT_SPECIAL_CHARACTERS = `\\{}'"[]., :`;
var Tokenizer$2 = tokenizer.exports = function(string, ext) {
  this._string = string;
  this._idx = -1;
  this._extended = ext;
  this.parseString = "";
};
Tokenizer$2.prototype = {
  /**
   * grabs the next token either from the peek operation or generates the
   * next token.
   */
  next: function() {
    var nextToken = this._nextToken ? this._nextToken : getNext(this._string, this._idx, this._extended);
    this._idx = nextToken.idx;
    this._nextToken = false;
    this.parseString += nextToken.token.token;
    return nextToken.token;
  },
  /**
   * will peak but not increment the tokenizer
   */
  peek: function() {
    var nextToken = this._nextToken ? this._nextToken : getNext(this._string, this._idx, this._extended);
    this._nextToken = nextToken;
    return nextToken.token;
  }
};
Tokenizer$2.toNumber = function toNumber(x) {
  if (!isNaN(+x)) {
    return +x;
  }
  return NaN;
};
function toOutput(token, type, done) {
  return {
    token,
    done,
    type
  };
}
function getNext(string, idx, ext) {
  var output = false;
  var token = "";
  var specialChars = ext ? EXT_SPECIAL_CHARACTERS : SPECIAL_CHARACTERS;
  var done;
  do {
    done = idx + 1 >= string.length;
    if (done) {
      break;
    }
    var character = string[idx + 1];
    if (character !== void 0 && specialChars.indexOf(character) === -1) {
      token += character;
      ++idx;
      continue;
    } else if (token.length) {
      break;
    }
    ++idx;
    var type;
    switch (character) {
      case DOT_SEPARATOR:
        type = TokenTypes$5.dotSeparator;
        break;
      case COMMA_SEPARATOR:
        type = TokenTypes$5.commaSeparator;
        break;
      case OPENING_BRACKET:
        type = TokenTypes$5.openingBracket;
        break;
      case CLOSING_BRACKET:
        type = TokenTypes$5.closingBracket;
        break;
      case OPENING_BRACE:
        type = TokenTypes$5.openingBrace;
        break;
      case CLOSING_BRACE:
        type = TokenTypes$5.closingBrace;
        break;
      case SPACE:
        type = TokenTypes$5.space;
        break;
      case DOUBLE_OUOTES:
      case SINGE_OUOTES:
        type = TokenTypes$5.quote;
        break;
      case ESCAPE:
        type = TokenTypes$5.escape;
        break;
      case COLON:
        type = TokenTypes$5.colon;
        break;
      default:
        type = TokenTypes$5.unknown;
        break;
    }
    output = toOutput(character, type, false);
    break;
  } while (!done);
  if (!output && token.length) {
    output = toOutput(token, TokenTypes$5.token, false);
  }
  if (!output) {
    output = { done: true };
  }
  return {
    token: output,
    idx
  };
}
var tokenizerExports = tokenizer.exports;
var exceptions$1 = {
  indexer: {
    nested: "Indexers cannot be nested.",
    needQuotes: "unquoted indexers must be numeric.",
    empty: "cannot have empty indexers.",
    leadingDot: "Indexers cannot have leading dots.",
    leadingComma: "Indexers cannot have leading comma.",
    requiresComma: "Indexers require commas between indexer args.",
    routedTokens: "Only one token can be used per indexer when specifying routed tokens."
  },
  range: {
    precedingNaN: "ranges must be preceded by numbers.",
    suceedingNaN: "ranges must be suceeded by numbers."
  },
  routed: {
    invalid: "Invalid routed token.  only integers|ranges|keys are supported."
  },
  quote: {
    empty: "cannot have empty quoted keys.",
    illegalEscape: "Invalid escape character.  Only quotes are escapable."
  },
  unexpectedToken: "Unexpected token.",
  invalidIdentifier: "Invalid Identifier.",
  invalidPath: "Please provide a valid path.",
  throwError: function(err, tokenizer2, token) {
    if (token) {
      throw err + " -- " + tokenizer2.parseString + " with next token: " + token;
    }
    throw err + " -- " + tokenizer2.parseString;
  }
};
var Tokenizer$1 = tokenizerExports;
var TokenTypes$4 = TokenTypes_1;
var E$4 = exceptions$1;
var range$1 = function range(tokenizer2, openingToken, state, out) {
  var token = tokenizer2.peek();
  var dotCount = 1;
  var done = false;
  var inclusive = true;
  var idx = state.indexer.length - 1;
  var from2 = Tokenizer$1.toNumber(state.indexer[idx]);
  var to;
  if (isNaN(from2)) {
    E$4.throwError(E$4.range.precedingNaN, tokenizer2);
  }
  while (!done && !token.done) {
    switch (token.type) {
      case TokenTypes$4.dotSeparator:
        if (dotCount === 3) {
          E$4.throwError(E$4.unexpectedToken, tokenizer2);
        }
        ++dotCount;
        if (dotCount === 3) {
          inclusive = false;
        }
        break;
      case TokenTypes$4.token:
        to = Tokenizer$1.toNumber(tokenizer2.next().token);
        if (isNaN(to)) {
          E$4.throwError(E$4.range.suceedingNaN, tokenizer2);
        }
        done = true;
        break;
      default:
        done = true;
        break;
    }
    if (!done) {
      tokenizer2.next();
      token = tokenizer2.peek();
    } else {
      break;
    }
  }
  state.indexer[idx] = { from: from2, to: inclusive ? to : to - 1 };
};
var TokenTypes$3 = TokenTypes_1;
var E$3 = exceptions$1;
var quoteE = E$3.quote;
var quote$1 = function quote(tokenizer2, openingToken, state, out) {
  var token = tokenizer2.next();
  var innerToken = "";
  var openingQuote = openingToken.token;
  var escaping = false;
  var done = false;
  while (!token.done) {
    switch (token.type) {
      case TokenTypes$3.token:
      case TokenTypes$3.space:
      case TokenTypes$3.dotSeparator:
      case TokenTypes$3.commaSeparator:
      case TokenTypes$3.openingBracket:
      case TokenTypes$3.closingBracket:
      case TokenTypes$3.openingBrace:
      case TokenTypes$3.closingBrace:
        if (escaping) {
          E$3.throwError(quoteE.illegalEscape, tokenizer2);
        }
        innerToken += token.token;
        break;
      case TokenTypes$3.quote:
        if (escaping) {
          innerToken += token.token;
          escaping = false;
        } else if (token.token !== openingQuote) {
          innerToken += token.token;
        } else {
          done = true;
        }
        break;
      case TokenTypes$3.escape:
        escaping = true;
        break;
      default:
        E$3.throwError(E$3.unexpectedToken, tokenizer2);
    }
    if (done) {
      break;
    }
    token = tokenizer2.next();
  }
  if (innerToken.length === 0) {
    E$3.throwError(quoteE.empty, tokenizer2);
  }
  state.indexer[state.indexer.length] = innerToken;
};
var RoutedTokens$2 = {
  integers: "integers",
  ranges: "ranges",
  keys: "keys"
};
var TokenTypes$2 = TokenTypes_1;
var RoutedTokens$1 = RoutedTokens$2;
var E$2 = exceptions$1;
var routedE = E$2.routed;
var routed$1 = function routed(tokenizer2, openingToken, state, out) {
  var routeToken = tokenizer2.next();
  var named = false;
  var name = "";
  switch (routeToken.token) {
    case RoutedTokens$1.integers:
    case RoutedTokens$1.ranges:
    case RoutedTokens$1.keys:
      break;
    default:
      E$2.throwError(routedE.invalid, tokenizer2);
      break;
  }
  var next = tokenizer2.next();
  if (next.type === TokenTypes$2.colon) {
    named = true;
    next = tokenizer2.next();
    if (next.type !== TokenTypes$2.token) {
      E$2.throwError(routedE.invalid, tokenizer2);
    }
    name = next.token;
    next = tokenizer2.next();
  }
  if (next.type === TokenTypes$2.closingBrace) {
    var outputToken = {
      type: routeToken.token,
      named,
      name
    };
    state.indexer[state.indexer.length] = outputToken;
  } else {
    E$2.throwError(routedE.invalid, tokenizer2);
  }
};
var TokenTypes$1 = TokenTypes_1;
var E$1 = exceptions$1;
var idxE = E$1.indexer;
var range2 = range$1;
var quote2 = quote$1;
var routed2 = routed$1;
var indexer$1 = function indexer(tokenizer2, openingToken, state, out) {
  var token = tokenizer2.next();
  var done = false;
  var allowedMaxLength = 1;
  var routedIndexer = false;
  state.indexer = [];
  while (!token.done) {
    switch (token.type) {
      case TokenTypes$1.token:
      case TokenTypes$1.quote:
        if (state.indexer.length === allowedMaxLength) {
          E$1.throwError(idxE.requiresComma, tokenizer2);
        }
        break;
    }
    switch (token.type) {
      case TokenTypes$1.openingBrace:
        routedIndexer = true;
        routed2(tokenizer2, token, state);
        break;
      case TokenTypes$1.token:
        var t2 = +token.token;
        if (isNaN(t2)) {
          E$1.throwError(idxE.needQuotes, tokenizer2);
        }
        state.indexer[state.indexer.length] = t2;
        break;
      case TokenTypes$1.dotSeparator:
        if (!state.indexer.length) {
          E$1.throwError(idxE.leadingDot, tokenizer2);
        }
        range2(tokenizer2, token, state);
        break;
      case TokenTypes$1.space:
        break;
      case TokenTypes$1.closingBracket:
        done = true;
        break;
      case TokenTypes$1.quote:
        quote2(tokenizer2, token, state);
        break;
      case TokenTypes$1.openingBracket:
        E$1.throwError(idxE.nested, tokenizer2);
        break;
      case TokenTypes$1.commaSeparator:
        ++allowedMaxLength;
        break;
      default:
        E$1.throwError(E$1.unexpectedToken, tokenizer2);
        break;
    }
    if (done) {
      break;
    }
    token = tokenizer2.next();
  }
  if (state.indexer.length === 0) {
    E$1.throwError(idxE.empty, tokenizer2);
  }
  if (state.indexer.length > 1 && routedIndexer) {
    E$1.throwError(idxE.routedTokens, tokenizer2);
  }
  if (state.indexer.length === 1) {
    state.indexer = state.indexer[0];
  }
  out[out.length] = state.indexer;
  state.indexer = void 0;
};
var TokenTypes = TokenTypes_1;
var E = exceptions$1;
var indexer2 = indexer$1;
var head$1 = function head(tokenizer2) {
  var token = tokenizer2.next();
  var state = {};
  var out = [];
  while (!token.done) {
    switch (token.type) {
      case TokenTypes.token:
        var first = +token.token[0];
        if (!isNaN(first)) {
          E.throwError(E.invalidIdentifier, tokenizer2);
        }
        out[out.length] = token.token;
        break;
      case TokenTypes.dotSeparator:
        if (out.length === 0) {
          E.throwError(E.unexpectedToken, tokenizer2);
        }
        break;
      case TokenTypes.space:
        break;
      case TokenTypes.openingBracket:
        indexer2(tokenizer2, token, state, out);
        break;
      default:
        E.throwError(E.unexpectedToken, tokenizer2);
        break;
    }
    token = tokenizer2.next();
  }
  if (out.length === 0) {
    E.throwError(E.invalidPath, tokenizer2);
  }
  return out;
};
var Tokenizer = tokenizerExports;
var head2 = head$1;
var RoutedTokens = RoutedTokens$2;
var parser = function parser2(string, extendedRules) {
  return head2(new Tokenizer(string, extendedRules));
};
var src = parser;
parser.fromPathsOrPathValues = function(paths, ext) {
  if (!paths) {
    return [];
  }
  var out = [];
  for (var i2 = 0, len = paths.length; i2 < len; i2++) {
    if (typeof paths[i2] === "string") {
      out[i2] = parser(paths[i2], ext);
    } else if (typeof paths[i2].path === "string") {
      out[i2] = {
        path: parser(paths[i2].path, ext),
        value: paths[i2].value
      };
    } else {
      out[i2] = paths[i2];
    }
  }
  return out;
};
parser.fromPath = function(path, ext) {
  if (!path) {
    return [];
  }
  if (typeof path === "string") {
    return parser(path, ext);
  }
  return path;
};
parser.RoutedTokens = RoutedTokens;
var Keys$4 = Keys_1;
var convertTypes$1 = function convertTypes(virtualPath) {
  virtualPath.route = virtualPath.route.map(function(key) {
    if (typeof key === "object") {
      switch (key.type) {
        case "keys":
          key.type = Keys$4.keys;
          break;
        case "integers":
          key.type = Keys$4.integers;
          break;
        case "ranges":
          key.type = Keys$4.ranges;
          break;
        default:
          var err = new Error("Unknown route type.");
          err.throwToNext = true;
          break;
      }
    }
    return key;
  });
};
var Keys$3 = Keys_1;
var prettifyRoute$1 = function prettifyRoute(route) {
  var length = 0;
  var str = [];
  for (var i2 = 0, len = route.length; i2 < len; ++i2, ++length) {
    var value = route[i2];
    if (typeof value === "object") {
      value = value.type;
    }
    if (value === Keys$3.integers) {
      str[length] = "integers";
    } else if (value === Keys$3.ranges) {
      str[length] = "ranges";
    } else if (value === Keys$3.keys) {
      str[length] = "keys";
    } else {
      if (Array.isArray(value)) {
        str[length] = JSON.stringify(value);
      } else {
        str[length] = value;
      }
    }
  }
  return str;
};
var exceptions = {
  innerReferences: "References with inner references are not allowed.",
  unknown: "Unknown Error",
  routeWithSamePrecedence: "Two routes cannot have the same precedence or path.",
  circularReference: "There appears to be a circular reference, maximum reference following exceeded."
};
function cloneArray$2(arr, index) {
  var a2 = [];
  var len = arr.length;
  for (var i2 = index || 0; i2 < len; i2++) {
    a2[i2] = arr[i2];
  }
  return a2;
}
var cloneArray_1$1 = cloneArray$2;
var Keys$2 = Keys_1;
var actionWrapper = actionWrapper$1;
var pathSyntax = src;
var convertTypes2 = convertTypes$1;
var prettifyRoute2 = prettifyRoute$1;
var errors$1 = exceptions;
var cloneArray$1 = cloneArray_1$1;
var ROUTE_ID = -3;
var parseTree$1 = function parseTree(routes) {
  var pTree = {};
  var parseMap = {};
  routes.forEach(function forEachRoute(route) {
    if (typeof route.route === "string") {
      route.prettyRoute = route.route;
      route.route = pathSyntax(route.route, true);
      convertTypes2(route);
    }
    if (route.get) {
      route.getId = ++ROUTE_ID;
    }
    if (route.set) {
      route.setId = ++ROUTE_ID;
    }
    if (route.call) {
      route.callId = ++ROUTE_ID;
    }
    setHashOrThrowError(parseMap, route);
    buildParseTree(pTree, route, 0);
  });
  return pTree;
};
function buildParseTree(node, routeObject, depth) {
  var route = routeObject.route;
  var get2 = routeObject.get;
  var set2 = routeObject.set;
  var call2 = routeObject.call;
  var el = route[depth];
  el = !isNaN(+el) && +el || el;
  var isArray2 = Array.isArray(el);
  var i2 = 0;
  do {
    var value = el;
    var next;
    if (isArray2) {
      value = value[i2];
    }
    if (typeof value === "object") {
      var routeType = value.type;
      next = decendTreeByRoutedToken(node, routeType, value);
    } else {
      next = decendTreeByRoutedToken(node, value);
      if (next) {
        route[depth] = { type: value, named: false };
      } else {
        if (!node[value]) {
          node[value] = {};
        }
        next = node[value];
      }
    }
    if (depth + 1 === route.length) {
      var matchObject = next[Keys$2.match] || {};
      if (!next[Keys$2.match]) {
        next[Keys$2.match] = matchObject;
      }
      matchObject.prettyRoute = routeObject.prettyRoute;
      if (get2) {
        matchObject.get = actionWrapper(route, get2);
        matchObject.getId = routeObject.getId;
      }
      if (set2) {
        matchObject.set = actionWrapper(route, set2);
        matchObject.setId = routeObject.setId;
      }
      if (call2) {
        matchObject.call = actionWrapper(route, call2);
        matchObject.callId = routeObject.callId;
      }
    } else {
      buildParseTree(next, routeObject, depth + 1);
    }
  } while (isArray2 && ++i2 < el.length);
}
function setHashOrThrowError(parseMap, routeObject) {
  var route = routeObject.route;
  var get2 = routeObject.get;
  var set2 = routeObject.set;
  var call2 = routeObject.call;
  getHashesFromRoute(route).map(function mapHashToString(hash) {
    return hash.join(",");
  }).forEach(function forEachRouteHash(hash) {
    if (get2 && parseMap[hash + "get"] || set2 && parseMap[hash + "set"] || call2 && parseMap[hash + "call"]) {
      throw new Error(errors$1.routeWithSamePrecedence + " " + prettifyRoute2(route));
    }
    if (get2) {
      parseMap[hash + "get"] = true;
    }
    if (set2) {
      parseMap[hash + "set"] = true;
    }
    if (call2) {
      parseMap[hash + "call"] = true;
    }
  });
}
function decendTreeByRoutedToken(node, value, routeToken) {
  var next = null;
  switch (value) {
    case Keys$2.keys:
    case Keys$2.integers:
    case Keys$2.ranges:
      next = node[value];
      if (!next) {
        next = node[value] = {};
      }
      break;
  }
  if (next && routeToken) {
    next[Keys$2.named] = routeToken.named;
    next[Keys$2.name] = routeToken.name;
  }
  return next;
}
function getHashesFromRoute(route, depth, hashes, hash) {
  depth = depth || 0;
  hashes = hashes || [];
  hash = hash || [];
  var routeValue = route[depth];
  var isArray2 = Array.isArray(routeValue);
  var length = isArray2 && routeValue.length || 0;
  var idx = 0;
  var value;
  if (typeof routeValue === "object" && !isArray2) {
    value = routeValue.type;
  } else if (!isArray2) {
    value = routeValue;
  }
  do {
    if (isArray2) {
      value = routeValue[idx];
    }
    if (value === Keys$2.integers || value === Keys$2.ranges) {
      hash[depth] = "__I__";
    } else if (value === Keys$2.keys) {
      hash[depth] = "__K__";
    } else {
      hash[depth] = value;
    }
    if (depth + 1 !== route.length) {
      getHashesFromRoute(route, depth + 1, hashes, hash);
    } else {
      hashes.push(cloneArray$1(hash));
    }
  } while (isArray2 && ++idx < length);
  return hashes;
}
var Precedence$1 = {
  specific: 4,
  ranges: 2,
  integers: 2,
  keys: 1
};
var Precedence_1 = Precedence$1;
var iterateKeySet$1;
var hasRequiredIterateKeySet;
function requireIterateKeySet() {
  if (hasRequiredIterateKeySet)
    return iterateKeySet$1;
  hasRequiredIterateKeySet = 1;
  var isArray2 = Array.isArray;
  iterateKeySet$1 = function iterateKeySet2(keySet, note) {
    if (note.isArray === void 0) {
      initializeNote(keySet, note);
    }
    if (note.isArray) {
      var nextValue;
      do {
        if (note.loaded && note.rangeOffset > note.to) {
          ++note.arrayOffset;
          note.loaded = false;
        }
        var idx = note.arrayOffset, length = keySet.length;
        if (idx >= length) {
          note.done = true;
          break;
        }
        var el = keySet[note.arrayOffset];
        var type = typeof el;
        if (type === "object") {
          if (!note.loaded) {
            initializeRange(el, note);
          }
          if (note.empty) {
            continue;
          }
          nextValue = note.rangeOffset++;
        } else {
          ++note.arrayOffset;
          nextValue = el;
        }
      } while (nextValue === void 0);
      return nextValue;
    } else if (note.isObject) {
      if (!note.loaded) {
        initializeRange(keySet, note);
      }
      if (note.rangeOffset > note.to) {
        note.done = true;
        return void 0;
      }
      return note.rangeOffset++;
    } else {
      note.done = true;
      return keySet;
    }
  };
  function initializeRange(key, memo) {
    var from2 = memo.from = key.from || 0;
    var to = memo.to = key.to || (typeof key.length === "number" && memo.from + key.length - 1 || 0);
    memo.rangeOffset = memo.from;
    memo.loaded = true;
    if (from2 > to) {
      memo.empty = true;
    }
  }
  function initializeNote(key, note) {
    note.done = false;
    var isObject2 = note.isObject = !!(key && typeof key === "object");
    note.isArray = isObject2 && isArray2(key);
    note.arrayOffset = 0;
  }
  return iterateKeySet$1;
}
var toTree;
var hasRequiredToTree;
function requireToTree() {
  if (hasRequiredToTree)
    return toTree;
  hasRequiredToTree = 1;
  var iterateKeySet2 = requireIterateKeySet();
  toTree = function toTree2(paths) {
    return paths.reduce(function(acc, path) {
      innerToTree(acc, path, 0);
      return acc;
    }, {});
  };
  function innerToTree(seed, path, depth) {
    var keySet = path[depth];
    var iteratorNote = {};
    var key;
    var nextDepth = depth + 1;
    key = iterateKeySet2(keySet, iteratorNote);
    do {
      var next = seed[key];
      if (!next) {
        if (nextDepth === path.length) {
          seed[key] = null;
        } else {
          next = seed[key] = {};
        }
      }
      if (nextDepth < path.length) {
        innerToTree(next, path, nextDepth);
      }
      if (!iteratorNote.done) {
        key = iterateKeySet2(keySet, iteratorNote);
      }
    } while (!iteratorNote.done);
  }
  return toTree;
}
var hasIntersection$1;
var hasRequiredHasIntersection$1;
function requireHasIntersection$1() {
  if (hasRequiredHasIntersection$1)
    return hasIntersection$1;
  hasRequiredHasIntersection$1 = 1;
  var iterateKeySet2 = requireIterateKeySet();
  hasIntersection$1 = function hasIntersection2(tree, path, depth) {
    var current = tree;
    var intersects = true;
    for (; intersects && depth < path.length; ++depth) {
      var key = path[depth];
      var keyType = typeof key;
      if (key && keyType === "object") {
        var note = {};
        var innerKey = iterateKeySet2(key, note);
        var nextDepth = depth + 1;
        do {
          var next = current[innerKey];
          intersects = next !== void 0;
          if (intersects) {
            intersects = hasIntersection2(next, path, nextDepth);
          }
          innerKey = iterateKeySet2(key, note);
        } while (intersects && !note.done);
        break;
      }
      current = current[key];
      intersects = current !== void 0;
    }
    return intersects;
  };
  return hasIntersection$1;
}
var pathsComplementFromTree;
var hasRequiredPathsComplementFromTree;
function requirePathsComplementFromTree() {
  if (hasRequiredPathsComplementFromTree)
    return pathsComplementFromTree;
  hasRequiredPathsComplementFromTree = 1;
  var hasIntersection2 = requireHasIntersection$1();
  pathsComplementFromTree = function pathsComplementFromTree2(paths, tree) {
    var out = [];
    var outLength = -1;
    for (var i2 = 0, len = paths.length; i2 < len; ++i2) {
      if (!hasIntersection2(tree, paths[i2], 0)) {
        out[++outLength] = paths[i2];
      }
    }
    return out;
  };
  return pathsComplementFromTree;
}
var pathsComplementFromLengthTree;
var hasRequiredPathsComplementFromLengthTree;
function requirePathsComplementFromLengthTree() {
  if (hasRequiredPathsComplementFromLengthTree)
    return pathsComplementFromLengthTree;
  hasRequiredPathsComplementFromLengthTree = 1;
  var hasIntersection2 = requireHasIntersection$1();
  pathsComplementFromLengthTree = function pathsComplementFromLengthTree2(paths, tree) {
    var out = [];
    var outLength = -1;
    for (var i2 = 0, len = paths.length; i2 < len; ++i2) {
      var path = paths[i2];
      if (!hasIntersection2(tree[path.length], path, 0)) {
        out[++outLength] = path;
      }
    }
    return out;
  };
  return pathsComplementFromLengthTree;
}
var toPaths = { exports: {} };
var hasRequiredToPaths;
function requireToPaths() {
  if (hasRequiredToPaths)
    return toPaths.exports;
  hasRequiredToPaths = 1;
  var isArray2 = Array.isArray;
  var typeOfObject = "object";
  var typeOfString = "string";
  var typeOfNumber = "number";
  var MAX_SAFE_INTEGER = 9007199254740991;
  var MAX_SAFE_INTEGER_DIGITS = 16;
  var MIN_SAFE_INTEGER_DIGITS = 17;
  var abs = Math.abs;
  var safeNumberRegEx = /^(0|(\-?[1-9][0-9]*))$/;
  toPaths.exports = function toPaths2(lengths) {
    var pathmap;
    var allPaths = [];
    var allPathsLength = 0;
    for (var length in lengths) {
      if (isSafeNumber(length) && isObject2(pathmap = lengths[length])) {
        var paths = collapsePathMap(pathmap, 0, parseInt(length, 10)).sets;
        var pathsIndex = -1;
        var pathsCount = paths.length;
        while (++pathsIndex < pathsCount) {
          allPaths[allPathsLength++] = collapsePathSetIndexes(paths[pathsIndex]);
        }
      }
    }
    return allPaths;
  };
  function isObject2(value) {
    return value !== null && typeof value === typeOfObject;
  }
  function collapsePathMap(pathmap, depth, length) {
    var key;
    var code = getHashCode(String(depth));
    var subs = /* @__PURE__ */ Object.create(null);
    var codes = [];
    var codesIndex = -1;
    var codesCount = 0;
    var pathsets = [];
    var pathsetsCount = 0;
    var subPath, subCode, subKeys, subKeysIndex, subKeysCount, subSets, subSetsIndex, subSetsCount, pathset, pathsetIndex, pathsetCount, firstSubKey, pathsetClone;
    subKeys = [];
    subKeysIndex = -1;
    if (depth < length - 1) {
      subKeysCount = getSortedKeys(pathmap, subKeys);
      while (++subKeysIndex < subKeysCount) {
        key = subKeys[subKeysIndex];
        subPath = collapsePathMap(pathmap[key], depth + 1, length);
        subCode = subPath.code;
        if (subs[subCode]) {
          subPath = subs[subCode];
        } else {
          codes[codesCount++] = subCode;
          subPath = subs[subCode] = {
            keys: [],
            sets: subPath.sets
          };
        }
        code = getHashCode(code + key + subCode);
        isSafeNumber(key) && subPath.keys.push(parseInt(key, 10)) || subPath.keys.push(key);
      }
      while (++codesIndex < codesCount) {
        key = codes[codesIndex];
        subPath = subs[key];
        subKeys = subPath.keys;
        subKeysCount = subKeys.length;
        if (subKeysCount > 0) {
          subSets = subPath.sets;
          subSetsIndex = -1;
          subSetsCount = subSets.length;
          firstSubKey = subKeys[0];
          while (++subSetsIndex < subSetsCount) {
            pathset = subSets[subSetsIndex];
            pathsetIndex = -1;
            pathsetCount = pathset.length;
            pathsetClone = new Array(pathsetCount + 1);
            pathsetClone[0] = subKeysCount > 1 && subKeys || firstSubKey;
            while (++pathsetIndex < pathsetCount) {
              pathsetClone[pathsetIndex + 1] = pathset[pathsetIndex];
            }
            pathsets[pathsetsCount++] = pathsetClone;
          }
        }
      }
    } else {
      subKeysCount = getSortedKeys(pathmap, subKeys);
      if (subKeysCount > 1) {
        pathsets[pathsetsCount++] = [subKeys];
      } else {
        pathsets[pathsetsCount++] = subKeys;
      }
      while (++subKeysIndex < subKeysCount) {
        code = getHashCode(code + subKeys[subKeysIndex]);
      }
    }
    return {
      code,
      sets: pathsets
    };
  }
  function collapsePathSetIndexes(pathset) {
    var keysetIndex = -1;
    var keysetCount = pathset.length;
    while (++keysetIndex < keysetCount) {
      var keyset = pathset[keysetIndex];
      if (isArray2(keyset)) {
        pathset[keysetIndex] = collapseIndex(keyset);
      }
    }
    return pathset;
  }
  function collapseIndex(keyset) {
    var keyIndex = -1;
    var keyCount = keyset.length - 1;
    var isSparseRange = keyCount > 0;
    while (++keyIndex <= keyCount) {
      var key = keyset[keyIndex];
      if (!isSafeNumber(key)) {
        isSparseRange = false;
        break;
      }
      keyset[keyIndex] = parseInt(key, 10);
    }
    if (isSparseRange === true) {
      keyset.sort(sortListAscending);
      var from2 = keyset[0];
      var to = keyset[keyCount];
      if (to - from2 <= keyCount) {
        return {
          from: from2,
          to
        };
      }
    }
    return keyset;
  }
  function sortListAscending(a2, b) {
    return a2 - b;
  }
  function getSortedKeys(map2, keys, sort) {
    var len = 0;
    for (var key in map2) {
      keys[len++] = key;
    }
    if (len > 1) {
      keys.sort(sort);
    }
    return len;
  }
  function getHashCode(key) {
    var code = 5381;
    var index = -1;
    var count = key.length;
    while (++index < count) {
      code = (code << 5) + code + key.charCodeAt(index);
    }
    return String(code);
  }
  function isSafeNumber(val) {
    var num = val;
    var type = typeof val;
    if (type === typeOfString) {
      var length = val.length;
      if (length === 0 || length > MIN_SAFE_INTEGER_DIGITS) {
        return false;
      }
      if (!safeNumberRegEx.test(val)) {
        return false;
      }
      if (length < MAX_SAFE_INTEGER_DIGITS) {
        return true;
      }
      num = +val;
    } else if (type !== typeOfNumber) {
      return false;
    }
    return num % 1 === 0 && abs(num) <= MAX_SAFE_INTEGER;
  }
  toPaths.exports._isSafeNumber = isSafeNumber;
  return toPaths.exports;
}
var collapse$1;
var hasRequiredCollapse;
function requireCollapse() {
  if (hasRequiredCollapse)
    return collapse$1;
  hasRequiredCollapse = 1;
  var toPaths2 = requireToPaths();
  var toTree2 = requireToTree();
  collapse$1 = function collapse2(paths) {
    var collapseMap = paths.reduce(function(acc, path) {
      var len = path.length;
      if (!acc[len]) {
        acc[len] = [];
      }
      acc[len].push(path);
      return acc;
    }, {});
    Object.keys(collapseMap).forEach(function(collapseKey) {
      collapseMap[collapseKey] = toTree2(collapseMap[collapseKey]);
    });
    return toPaths2(collapseMap);
  };
  return collapse$1;
}
var cloneArray_1;
var hasRequiredCloneArray;
function requireCloneArray() {
  if (hasRequiredCloneArray)
    return cloneArray_1;
  hasRequiredCloneArray = 1;
  function cloneArray2(arr, index) {
    var a2 = [];
    var len = arr.length;
    for (var i2 = index || 0; i2 < len; i2++) {
      a2[i2] = arr[i2];
    }
    return a2;
  }
  cloneArray_1 = cloneArray2;
  return cloneArray_1;
}
var catAndSlice$1;
var hasRequiredCatAndSlice$1;
function requireCatAndSlice$1() {
  if (hasRequiredCatAndSlice$1)
    return catAndSlice$1;
  hasRequiredCatAndSlice$1 = 1;
  catAndSlice$1 = function catAndSlice2(a2, b, slice3) {
    var next = [], i2, j, len;
    for (i2 = 0, len = a2.length; i2 < len; ++i2) {
      next[i2] = a2[i2];
    }
    for (j = slice3 || 0, len = b.length; j < len; ++j, ++i2) {
      next[i2] = b[j];
    }
    return next;
  };
  return catAndSlice$1;
}
var types$1;
var hasRequiredTypes$1;
function requireTypes$1() {
  if (hasRequiredTypes$1)
    return types$1;
  hasRequiredTypes$1 = 1;
  types$1 = {
    $ref: "ref",
    $atom: "atom",
    $error: "error"
  };
  return types$1;
}
var errors;
var hasRequiredErrors;
function requireErrors() {
  if (hasRequiredErrors)
    return errors;
  hasRequiredErrors = 1;
  errors = {
    innerReferences: "References with inner references are not allowed.",
    circularReference: "There appears to be a circular reference, maximum reference following exceeded."
  };
  return errors;
}
var followReference$1;
var hasRequiredFollowReference$1;
function requireFollowReference$1() {
  if (hasRequiredFollowReference$1)
    return followReference$1;
  hasRequiredFollowReference$1 = 1;
  var cloneArray2 = requireCloneArray();
  var $ref = requireTypes$1().$ref;
  var errors2 = requireErrors();
  followReference$1 = function followReference2(cacheRoot, ref, maxRefFollow) {
    var current = cacheRoot;
    var refPath = ref;
    var depth = -1;
    var length = refPath.length;
    var key, next, type;
    var referenceCount = 0;
    while (++depth < length) {
      key = refPath[depth];
      next = current[key];
      type = next && next.$type;
      if (!next || type && type !== $ref) {
        current = next;
        break;
      }
      if (type && type === $ref && depth + 1 < length) {
        var err = new Error(errors2.innerReferences);
        err.throwToNext = true;
        throw err;
      }
      if (depth + 1 === length) {
        if (type === $ref) {
          depth = -1;
          refPath = next.value;
          length = refPath.length;
          next = cacheRoot;
          referenceCount++;
        }
        if (referenceCount > maxRefFollow) {
          throw new Error(errors2.circularReference);
        }
      }
      current = next;
    }
    return [current, cloneArray2(refPath)];
  };
  return followReference$1;
}
var optimizePathSets$1;
var hasRequiredOptimizePathSets$1;
function requireOptimizePathSets$1() {
  if (hasRequiredOptimizePathSets$1)
    return optimizePathSets$1;
  hasRequiredOptimizePathSets$1 = 1;
  var iterateKeySet2 = requireIterateKeySet();
  var cloneArray2 = requireCloneArray();
  var catAndSlice2 = requireCatAndSlice$1();
  var $types = requireTypes$1();
  var $ref = $types.$ref;
  var followReference2 = requireFollowReference$1();
  optimizePathSets$1 = function optimizePathSets2(cache, paths, maxRefFollow) {
    var optimized = [];
    paths.forEach(function(p) {
      optimizePathSet(cache, cache, p, 0, optimized, [], maxRefFollow);
    });
    return optimized;
  };
  function optimizePathSet(cache, cacheRoot, pathSet, depth, out, optimizedPath, maxRefFollow) {
    if (cache === void 0) {
      out[out.length] = catAndSlice2(optimizedPath, pathSet, depth);
      return;
    }
    if (cache === null || cache.$type && cache.$type !== $ref || typeof cache !== "object") {
      return;
    }
    if (cache.$type === $ref && depth === pathSet.length) {
      return;
    }
    var keySet = pathSet[depth];
    var isKeySet = typeof keySet === "object";
    var nextDepth = depth + 1;
    var iteratorNote = false;
    var key = keySet;
    if (isKeySet) {
      iteratorNote = {};
      key = iterateKeySet2(keySet, iteratorNote);
    }
    var next, nextOptimized;
    do {
      next = cache[key];
      var optimizedPathLength = optimizedPath.length;
      if (key !== null) {
        optimizedPath[optimizedPathLength] = key;
      }
      if (next && next.$type === $ref && nextDepth < pathSet.length) {
        var refResults = followReference2(cacheRoot, next.value, maxRefFollow);
        next = refResults[0];
        nextOptimized = cloneArray2(refResults[1]);
      } else {
        nextOptimized = optimizedPath;
      }
      optimizePathSet(
        next,
        cacheRoot,
        pathSet,
        nextDepth,
        out,
        nextOptimized,
        maxRefFollow
      );
      optimizedPath.length = optimizedPathLength;
      if (iteratorNote && !iteratorNote.done) {
        key = iterateKeySet2(keySet, iteratorNote);
      }
    } while (iteratorNote && !iteratorNote.done);
  }
  return optimizePathSets$1;
}
var pathCount;
var hasRequiredPathCount;
function requirePathCount() {
  if (hasRequiredPathCount)
    return pathCount;
  hasRequiredPathCount = 1;
  function getRangeOrKeySize(rangeOrKey) {
    if (rangeOrKey == null) {
      return 1;
    } else if (Array.isArray(rangeOrKey)) {
      throw new Error("Unexpected Array found in keySet: " + JSON.stringify(rangeOrKey));
    } else if (typeof rangeOrKey === "object") {
      return getRangeSize(rangeOrKey);
    } else {
      return 1;
    }
  }
  function getRangeSize(range3) {
    var to = range3.to;
    var length = range3.length;
    if (to != null) {
      if (isNaN(to) || parseInt(to, 10) !== to) {
        throw new Error("Invalid range, 'to' is not an integer: " + JSON.stringify(range3));
      }
      var from2 = range3.from || 0;
      if (isNaN(from2) || parseInt(from2, 10) !== from2) {
        throw new Error("Invalid range, 'from' is not an integer: " + JSON.stringify(range3));
      }
      if (from2 <= to) {
        return to - from2 + 1;
      } else {
        return 0;
      }
    } else if (length != null) {
      if (isNaN(length) || parseInt(length, 10) !== length) {
        throw new Error("Invalid range, 'length' is not an integer: " + JSON.stringify(range3));
      } else {
        return length;
      }
    } else {
      throw new Error("Invalid range, expected 'to' or 'length': " + JSON.stringify(range3));
    }
  }
  function getPathCount(pathSet) {
    if (pathSet.length === 0) {
      throw new Error("All paths must have length larger than zero.");
    }
    var numPaths = 1;
    for (var i2 = 0; i2 < pathSet.length; i2++) {
      var segment = pathSet[i2];
      if (Array.isArray(segment)) {
        var numKeys = 0;
        for (var j = 0; j < segment.length; j++) {
          var keySet = segment[j];
          numKeys += getRangeOrKeySize(keySet);
        }
        numPaths *= numKeys;
      } else {
        numPaths *= getRangeOrKeySize(segment);
      }
    }
    return numPaths;
  }
  pathCount = getPathCount;
  return pathCount;
}
var lib;
var hasRequiredLib;
function requireLib() {
  if (hasRequiredLib)
    return lib;
  hasRequiredLib = 1;
  lib = {
    iterateKeySet: requireIterateKeySet(),
    toTree: requireToTree(),
    pathsComplementFromTree: requirePathsComplementFromTree(),
    pathsComplementFromLengthTree: requirePathsComplementFromLengthTree(),
    hasIntersection: requireHasIntersection$1(),
    toPaths: requireToPaths(),
    collapse: requireCollapse(),
    optimizePathSets: requireOptimizePathSets$1(),
    pathCount: requirePathCount()
  };
  return lib;
}
var iterateKeySet = requireLib().iterateKeySet;
var specific = function specificMatcher(keySet, currentNode) {
  var iteratorNote = {};
  var nexts = [];
  var key = iterateKeySet(keySet, iteratorNote);
  do {
    if (currentNode[key]) {
      nexts[nexts.length] = key;
    }
    if (!iteratorNote.done) {
      key = iterateKeySet(keySet, iteratorNote);
    }
  } while (!iteratorNote.done);
  return nexts;
};
var isArray$1 = Array.isArray;
var pluckIntergers = function pluckIntegers(keySet) {
  var ints = [];
  if (typeof keySet === "object") {
    if (isArray$1(keySet)) {
      keySet.forEach(function(key) {
        if (typeof key === "object") {
          ints[ints.length] = key;
        } else if (!isNaN(+key)) {
          ints[ints.length] = +key;
        }
      });
    } else {
      ints[ints.length] = keySet;
    }
  } else if (!isNaN(+keySet)) {
    ints[ints.length] = +keySet;
  }
  return ints;
};
var isRoutedToken$1 = function isRoutedToken(obj) {
  return obj.hasOwnProperty("type") && obj.hasOwnProperty("named");
};
var CallNotFoundError$1 = { exports: {} };
var hasRequiredCallNotFoundError;
function requireCallNotFoundError() {
  if (hasRequiredCallNotFoundError)
    return CallNotFoundError$1.exports;
  hasRequiredCallNotFoundError = 1;
  var MESSAGE = "function does not exist.";
  var CallNotFoundError2 = CallNotFoundError$1.exports = function CallNotFoundError3() {
    this.message = MESSAGE;
    this.stack = new Error().stack;
  };
  CallNotFoundError2.prototype = new Error();
  return CallNotFoundError$1.exports;
}
var Keys$1 = Keys_1;
var Precedence = Precedence_1;
var cloneArray = cloneArray_1$1;
var specificMatcher2 = specific;
var pluckIntegers2 = pluckIntergers;
var pathUtils = requireLib();
var collapse = pathUtils.collapse;
var isRoutedToken2 = isRoutedToken$1;
var CallNotFoundError = requireCallNotFoundError();
var intTypes = [{
  type: Keys$1.ranges,
  precedence: Precedence.ranges
}, {
  type: Keys$1.integers,
  precedence: Precedence.integers
}];
var keyTypes = [{
  type: Keys$1.keys,
  precedence: Precedence.keys
}];
var allTypes = intTypes.concat(keyTypes);
var get = "get";
var set = "set";
var call = "call";
var matcher$1 = function matcher(rst) {
  return function innerMatcher(method, paths) {
    var matched = [];
    var missing = [];
    match(rst, paths, method, matched, missing);
    if (method === call && matched.length === 0) {
      var err = new CallNotFoundError();
      err.throwToNext = true;
      throw err;
    }
    var reducedMatched = matched.reduce(function(acc, matchedRoute) {
      if (!acc[matchedRoute.id]) {
        acc[matchedRoute.id] = [];
      }
      acc[matchedRoute.id].push(matchedRoute);
      return acc;
    }, {});
    var collapsedMatched = [];
    Object.keys(reducedMatched).forEach(function(k) {
      var reducedMatch = reducedMatched[k];
      if (reducedMatch.length === 1) {
        collapsedMatched.push(reducedMatch[0]);
        return;
      }
      var collapsedResults = collapse(
        reducedMatch.map(function(x) {
          return x.requested;
        })
      );
      collapsedResults.forEach(function(path, i2) {
        var collapsedMatch = reducedMatch[i2];
        var reducedVirtualPath = collapsedMatch.virtual;
        path.forEach(function(atom, index) {
          if (!isRoutedToken2(reducedVirtualPath[index])) {
            reducedVirtualPath[index] = atom;
          }
        });
        collapsedMatch.requested = path;
        collapsedMatched.push(reducedMatch[i2]);
      });
    });
    return collapsedMatched;
  };
};
function match(curr, path, method, matchedFunctions, missingPaths, depth, requested, virtual, precedence) {
  if (!curr) {
    return;
  }
  depth = depth || 0;
  requested = requested || [];
  virtual = virtual || [];
  precedence = precedence || [];
  matchedFunctions = matchedFunctions || [];
  var atEndOfPath = path.length === depth;
  var isSet = method === set;
  var isCall = method === call;
  var methodToUse = method;
  if ((isCall || isSet) && !atEndOfPath) {
    methodToUse = get;
  }
  var currentMatch = curr[Keys$1.match];
  if (currentMatch && isSet && !currentMatch[set]) {
    methodToUse = get;
  }
  if (currentMatch && currentMatch[methodToUse]) {
    matchedFunctions[matchedFunctions.length] = {
      // Used for collapsing paths that use routes with multiple
      // string indexers.
      id: currentMatch[methodToUse + "Id"],
      requested: cloneArray(requested),
      prettyRoute: currentMatch.prettyRoute,
      action: currentMatch[methodToUse],
      authorize: currentMatch.authorize,
      virtual: cloneArray(virtual),
      precedence: +precedence.join(""),
      suffix: path.slice(depth),
      isSet: atEndOfPath && isSet,
      isCall: atEndOfPath && isCall
    };
  }
  if (depth === path.length) {
    return;
  }
  var keySet = path[depth];
  var i2, len, key, next;
  var specificKeys = specificMatcher2(keySet, curr);
  for (i2 = 0, len = specificKeys.length; i2 < len; ++i2) {
    key = specificKeys[i2];
    virtual[depth] = key;
    requested[depth] = key;
    precedence[depth] = Precedence.specific;
    match(
      curr[specificKeys[i2]],
      path,
      method,
      matchedFunctions,
      missingPaths,
      depth + 1,
      requested,
      virtual,
      precedence
    );
    virtual.length = depth;
    requested.length = depth;
    precedence.length = depth;
  }
  var ints = pluckIntegers2(keySet);
  var keys = keySet;
  var intsLength = ints.length;
  allTypes.filter(function(typeAndPrecedence) {
    var type = typeAndPrecedence.type;
    if (type === Keys$1.integers || type === Keys$1.ranges) {
      return curr[type] && intsLength;
    }
    return curr[type];
  }).forEach(function(typeAndPrecedence) {
    var type = typeAndPrecedence.type;
    var prec = typeAndPrecedence.precedence;
    next = curr[type];
    virtual[depth] = {
      type,
      named: next[Keys$1.named],
      name: next[Keys$1.name]
    };
    if (type === Keys$1.integers || type === Keys$1.ranges) {
      requested[depth] = ints;
    } else {
      requested[depth] = keys;
    }
    precedence[depth] = prec;
    match(
      next,
      path,
      method,
      matchedFunctions,
      missingPaths,
      depth + 1,
      requested,
      virtual,
      precedence
    );
    virtual.length = depth;
    requested.length = depth;
    precedence.length = depth;
  });
}
var JSONGraphError$2 = { exports: {} };
var JSONGraphError$1 = JSONGraphError$2.exports = function JSONGraphError(typeValue) {
  this.typeValue = typeValue;
};
JSONGraphError$1.prototype = new Error();
var JSONGraphErrorExports = JSONGraphError$2.exports;
var Observable2 = {};
var root$1 = {};
var hasRequiredRoot;
function requireRoot() {
  if (hasRequiredRoot)
    return root$1;
  hasRequiredRoot = 1;
  (function(exports) {
    exports.root = typeof window == "object" && window.window === window && window || typeof self == "object" && self.self === self && self || typeof commonjsGlobal == "object" && commonjsGlobal.global === commonjsGlobal && commonjsGlobal;
    if (!exports.root) {
      throw new Error("RxJS could not find any global context (window, self, global)");
    }
  })(root$1);
  return root$1;
}
var toSubscriber = {};
var Subscriber = {};
var isFunction = {};
var hasRequiredIsFunction;
function requireIsFunction() {
  if (hasRequiredIsFunction)
    return isFunction;
  hasRequiredIsFunction = 1;
  function isFunction$1(x) {
    return typeof x === "function";
  }
  isFunction.isFunction = isFunction$1;
  return isFunction;
}
var Subscription3 = {};
var isArray = {};
var hasRequiredIsArray;
function requireIsArray() {
  if (hasRequiredIsArray)
    return isArray;
  hasRequiredIsArray = 1;
  isArray.isArray = Array.isArray || function(x) {
    return x && typeof x.length === "number";
  };
  return isArray;
}
var isObject = {};
var hasRequiredIsObject;
function requireIsObject() {
  if (hasRequiredIsObject)
    return isObject;
  hasRequiredIsObject = 1;
  function isObject$1(x) {
    return x != null && typeof x === "object";
  }
  isObject.isObject = isObject$1;
  return isObject;
}
var tryCatch2 = {};
var errorObject = {};
var hasRequiredErrorObject;
function requireErrorObject() {
  if (hasRequiredErrorObject)
    return errorObject;
  hasRequiredErrorObject = 1;
  errorObject.errorObject = { e: {} };
  return errorObject;
}
var hasRequiredTryCatch;
function requireTryCatch() {
  if (hasRequiredTryCatch)
    return tryCatch2;
  hasRequiredTryCatch = 1;
  var errorObject_1 = requireErrorObject();
  var tryCatchTarget;
  function tryCatcher() {
    try {
      return tryCatchTarget.apply(this, arguments);
    } catch (e2) {
      errorObject_1.errorObject.e = e2;
      return errorObject_1.errorObject;
    }
  }
  function tryCatch$12(fn) {
    tryCatchTarget = fn;
    return tryCatcher;
  }
  tryCatch2.tryCatch = tryCatch$12;
  return tryCatch2;
}
var UnsubscriptionError = {};
var hasRequiredUnsubscriptionError;
function requireUnsubscriptionError() {
  if (hasRequiredUnsubscriptionError)
    return UnsubscriptionError;
  hasRequiredUnsubscriptionError = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var UnsubscriptionError$1 = function(_super) {
    __extends(UnsubscriptionError2, _super);
    function UnsubscriptionError2(errors2) {
      _super.call(this);
      this.errors = errors2;
      var err = Error.call(this, errors2 ? errors2.length + " errors occurred during unsubscription:\n  " + errors2.map(function(err2, i2) {
        return i2 + 1 + ") " + err2.toString();
      }).join("\n  ") : "");
      this.name = err.name = "UnsubscriptionError";
      this.stack = err.stack;
      this.message = err.message;
    }
    return UnsubscriptionError2;
  }(Error);
  UnsubscriptionError.UnsubscriptionError = UnsubscriptionError$1;
  return UnsubscriptionError;
}
var hasRequiredSubscription;
function requireSubscription() {
  if (hasRequiredSubscription)
    return Subscription3;
  hasRequiredSubscription = 1;
  var isArray_1 = requireIsArray();
  var isObject_1 = requireIsObject();
  var isFunction_1 = requireIsFunction();
  var tryCatch_12 = requireTryCatch();
  var errorObject_1 = requireErrorObject();
  var UnsubscriptionError_1 = requireUnsubscriptionError();
  var Subscription$12 = function() {
    function Subscription4(unsubscribe) {
      this.closed = false;
      this._parent = null;
      this._parents = null;
      this._subscriptions = null;
      if (unsubscribe) {
        this._unsubscribe = unsubscribe;
      }
    }
    Subscription4.prototype.unsubscribe = function() {
      var hasErrors = false;
      var errors2;
      if (this.closed) {
        return;
      }
      var _a = this, _parent = _a._parent, _parents = _a._parents, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
      this.closed = true;
      this._parent = null;
      this._parents = null;
      this._subscriptions = null;
      var index = -1;
      var len = _parents ? _parents.length : 0;
      while (_parent) {
        _parent.remove(this);
        _parent = ++index < len && _parents[index] || null;
      }
      if (isFunction_1.isFunction(_unsubscribe)) {
        var trial = tryCatch_12.tryCatch(_unsubscribe).call(this);
        if (trial === errorObject_1.errorObject) {
          hasErrors = true;
          errors2 = errors2 || (errorObject_1.errorObject.e instanceof UnsubscriptionError_1.UnsubscriptionError ? flattenUnsubscriptionErrors(errorObject_1.errorObject.e.errors) : [errorObject_1.errorObject.e]);
        }
      }
      if (isArray_1.isArray(_subscriptions)) {
        index = -1;
        len = _subscriptions.length;
        while (++index < len) {
          var sub = _subscriptions[index];
          if (isObject_1.isObject(sub)) {
            var trial = tryCatch_12.tryCatch(sub.unsubscribe).call(sub);
            if (trial === errorObject_1.errorObject) {
              hasErrors = true;
              errors2 = errors2 || [];
              var err = errorObject_1.errorObject.e;
              if (err instanceof UnsubscriptionError_1.UnsubscriptionError) {
                errors2 = errors2.concat(flattenUnsubscriptionErrors(err.errors));
              } else {
                errors2.push(err);
              }
            }
          }
        }
      }
      if (hasErrors) {
        throw new UnsubscriptionError_1.UnsubscriptionError(errors2);
      }
    };
    Subscription4.prototype.add = function(teardown) {
      if (!teardown || teardown === Subscription4.EMPTY) {
        return Subscription4.EMPTY;
      }
      if (teardown === this) {
        return this;
      }
      var subscription = teardown;
      switch (typeof teardown) {
        case "function":
          subscription = new Subscription4(teardown);
        case "object":
          if (subscription.closed || typeof subscription.unsubscribe !== "function") {
            return subscription;
          } else if (this.closed) {
            subscription.unsubscribe();
            return subscription;
          } else if (typeof subscription._addParent !== "function") {
            var tmp = subscription;
            subscription = new Subscription4();
            subscription._subscriptions = [tmp];
          }
          break;
        default:
          throw new Error("unrecognized teardown " + teardown + " added to Subscription.");
      }
      var subscriptions = this._subscriptions || (this._subscriptions = []);
      subscriptions.push(subscription);
      subscription._addParent(this);
      return subscription;
    };
    Subscription4.prototype.remove = function(subscription) {
      var subscriptions = this._subscriptions;
      if (subscriptions) {
        var subscriptionIndex = subscriptions.indexOf(subscription);
        if (subscriptionIndex !== -1) {
          subscriptions.splice(subscriptionIndex, 1);
        }
      }
    };
    Subscription4.prototype._addParent = function(parent) {
      var _a = this, _parent = _a._parent, _parents = _a._parents;
      if (!_parent || _parent === parent) {
        this._parent = parent;
      } else if (!_parents) {
        this._parents = [parent];
      } else if (_parents.indexOf(parent) === -1) {
        _parents.push(parent);
      }
    };
    Subscription4.EMPTY = function(empty2) {
      empty2.closed = true;
      return empty2;
    }(new Subscription4());
    return Subscription4;
  }();
  Subscription3.Subscription = Subscription$12;
  function flattenUnsubscriptionErrors(errors2) {
    return errors2.reduce(function(errs, err) {
      return errs.concat(err instanceof UnsubscriptionError_1.UnsubscriptionError ? err.errors : err);
    }, []);
  }
  return Subscription3;
}
var Observer = {};
var hasRequiredObserver;
function requireObserver() {
  if (hasRequiredObserver)
    return Observer;
  hasRequiredObserver = 1;
  Observer.empty = {
    closed: true,
    next: function(value) {
    },
    error: function(err) {
      throw err;
    },
    complete: function() {
    }
  };
  return Observer;
}
var rxSubscriber = {};
var hasRequiredRxSubscriber;
function requireRxSubscriber() {
  if (hasRequiredRxSubscriber)
    return rxSubscriber;
  hasRequiredRxSubscriber = 1;
  var root_1 = requireRoot();
  var Symbol2 = root_1.root.Symbol;
  rxSubscriber.$$rxSubscriber = typeof Symbol2 === "function" && typeof Symbol2.for === "function" ? Symbol2.for("rxSubscriber") : "@@rxSubscriber";
  return rxSubscriber;
}
var hasRequiredSubscriber;
function requireSubscriber() {
  if (hasRequiredSubscriber)
    return Subscriber;
  hasRequiredSubscriber = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var isFunction_1 = requireIsFunction();
  var Subscription_1 = requireSubscription();
  var Observer_1 = requireObserver();
  var rxSubscriber_1 = requireRxSubscriber();
  var Subscriber$1 = function(_super) {
    __extends(Subscriber2, _super);
    function Subscriber2(destinationOrNext, error, complete) {
      _super.call(this);
      this.syncErrorValue = null;
      this.syncErrorThrown = false;
      this.syncErrorThrowable = false;
      this.isStopped = false;
      switch (arguments.length) {
        case 0:
          this.destination = Observer_1.empty;
          break;
        case 1:
          if (!destinationOrNext) {
            this.destination = Observer_1.empty;
            break;
          }
          if (typeof destinationOrNext === "object") {
            if (destinationOrNext instanceof Subscriber2) {
              this.destination = destinationOrNext;
              this.destination.add(this);
            } else {
              this.syncErrorThrowable = true;
              this.destination = new SafeSubscriber(this, destinationOrNext);
            }
            break;
          }
        default:
          this.syncErrorThrowable = true;
          this.destination = new SafeSubscriber(this, destinationOrNext, error, complete);
          break;
      }
    }
    Subscriber2.prototype[rxSubscriber_1.$$rxSubscriber] = function() {
      return this;
    };
    Subscriber2.create = function(next, error, complete) {
      var subscriber = new Subscriber2(next, error, complete);
      subscriber.syncErrorThrowable = false;
      return subscriber;
    };
    Subscriber2.prototype.next = function(value) {
      if (!this.isStopped) {
        this._next(value);
      }
    };
    Subscriber2.prototype.error = function(err) {
      if (!this.isStopped) {
        this.isStopped = true;
        this._error(err);
      }
    };
    Subscriber2.prototype.complete = function() {
      if (!this.isStopped) {
        this.isStopped = true;
        this._complete();
      }
    };
    Subscriber2.prototype.unsubscribe = function() {
      if (this.closed) {
        return;
      }
      this.isStopped = true;
      _super.prototype.unsubscribe.call(this);
    };
    Subscriber2.prototype._next = function(value) {
      this.destination.next(value);
    };
    Subscriber2.prototype._error = function(err) {
      this.destination.error(err);
      this.unsubscribe();
    };
    Subscriber2.prototype._complete = function() {
      this.destination.complete();
      this.unsubscribe();
    };
    Subscriber2.prototype._unsubscribeAndRecycle = function() {
      var _a = this, _parent = _a._parent, _parents = _a._parents;
      this._parent = null;
      this._parents = null;
      this.unsubscribe();
      this.closed = false;
      this.isStopped = false;
      this._parent = _parent;
      this._parents = _parents;
      return this;
    };
    return Subscriber2;
  }(Subscription_1.Subscription);
  Subscriber.Subscriber = Subscriber$1;
  var SafeSubscriber = function(_super) {
    __extends(SafeSubscriber2, _super);
    function SafeSubscriber2(_parentSubscriber, observerOrNext, error, complete) {
      _super.call(this);
      this._parentSubscriber = _parentSubscriber;
      var next;
      var context = this;
      if (isFunction_1.isFunction(observerOrNext)) {
        next = observerOrNext;
      } else if (observerOrNext) {
        context = observerOrNext;
        next = observerOrNext.next;
        error = observerOrNext.error;
        complete = observerOrNext.complete;
        if (isFunction_1.isFunction(context.unsubscribe)) {
          this.add(context.unsubscribe.bind(context));
        }
        context.unsubscribe = this.unsubscribe.bind(this);
      }
      this._context = context;
      this._next = next;
      this._error = error;
      this._complete = complete;
    }
    SafeSubscriber2.prototype.next = function(value) {
      if (!this.isStopped && this._next) {
        var _parentSubscriber = this._parentSubscriber;
        if (!_parentSubscriber.syncErrorThrowable) {
          this.__tryOrUnsub(this._next, value);
        } else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
          this.unsubscribe();
        }
      }
    };
    SafeSubscriber2.prototype.error = function(err) {
      if (!this.isStopped) {
        var _parentSubscriber = this._parentSubscriber;
        if (this._error) {
          if (!_parentSubscriber.syncErrorThrowable) {
            this.__tryOrUnsub(this._error, err);
            this.unsubscribe();
          } else {
            this.__tryOrSetError(_parentSubscriber, this._error, err);
            this.unsubscribe();
          }
        } else if (!_parentSubscriber.syncErrorThrowable) {
          this.unsubscribe();
          throw err;
        } else {
          _parentSubscriber.syncErrorValue = err;
          _parentSubscriber.syncErrorThrown = true;
          this.unsubscribe();
        }
      }
    };
    SafeSubscriber2.prototype.complete = function() {
      if (!this.isStopped) {
        var _parentSubscriber = this._parentSubscriber;
        if (this._complete) {
          if (!_parentSubscriber.syncErrorThrowable) {
            this.__tryOrUnsub(this._complete);
            this.unsubscribe();
          } else {
            this.__tryOrSetError(_parentSubscriber, this._complete);
            this.unsubscribe();
          }
        } else {
          this.unsubscribe();
        }
      }
    };
    SafeSubscriber2.prototype.__tryOrUnsub = function(fn, value) {
      try {
        fn.call(this._context, value);
      } catch (err) {
        this.unsubscribe();
        throw err;
      }
    };
    SafeSubscriber2.prototype.__tryOrSetError = function(parent, fn, value) {
      try {
        fn.call(this._context, value);
      } catch (err) {
        parent.syncErrorValue = err;
        parent.syncErrorThrown = true;
        return true;
      }
      return false;
    };
    SafeSubscriber2.prototype._unsubscribe = function() {
      var _parentSubscriber = this._parentSubscriber;
      this._context = null;
      this._parentSubscriber = null;
      _parentSubscriber.unsubscribe();
    };
    return SafeSubscriber2;
  }(Subscriber$1);
  return Subscriber;
}
var hasRequiredToSubscriber;
function requireToSubscriber() {
  if (hasRequiredToSubscriber)
    return toSubscriber;
  hasRequiredToSubscriber = 1;
  var Subscriber_1 = requireSubscriber();
  var rxSubscriber_1 = requireRxSubscriber();
  var Observer_1 = requireObserver();
  function toSubscriber$1(nextOrObserver, error, complete) {
    if (nextOrObserver) {
      if (nextOrObserver instanceof Subscriber_1.Subscriber) {
        return nextOrObserver;
      }
      if (nextOrObserver[rxSubscriber_1.$$rxSubscriber]) {
        return nextOrObserver[rxSubscriber_1.$$rxSubscriber]();
      }
    }
    if (!nextOrObserver && !error && !complete) {
      return new Subscriber_1.Subscriber(Observer_1.empty);
    }
    return new Subscriber_1.Subscriber(nextOrObserver, error, complete);
  }
  toSubscriber.toSubscriber = toSubscriber$1;
  return toSubscriber;
}
var observable = {};
var hasRequiredObservable$1;
function requireObservable$1() {
  if (hasRequiredObservable$1)
    return observable;
  hasRequiredObservable$1 = 1;
  var root_1 = requireRoot();
  function getSymbolObservable(context) {
    var $$observable;
    var Symbol2 = context.Symbol;
    if (typeof Symbol2 === "function") {
      if (Symbol2.observable) {
        $$observable = Symbol2.observable;
      } else {
        $$observable = Symbol2("observable");
        Symbol2.observable = $$observable;
      }
    } else {
      $$observable = "@@observable";
    }
    return $$observable;
  }
  observable.getSymbolObservable = getSymbolObservable;
  observable.$$observable = getSymbolObservable(root_1.root);
  return observable;
}
var hasRequiredObservable;
function requireObservable() {
  if (hasRequiredObservable)
    return Observable2;
  hasRequiredObservable = 1;
  var root_1 = requireRoot();
  var toSubscriber_1 = requireToSubscriber();
  var observable_1 = requireObservable$1();
  var Observable$1 = function() {
    function Observable3(subscribe) {
      this._isScalar = false;
      if (subscribe) {
        this._subscribe = subscribe;
      }
    }
    Observable3.prototype.lift = function(operator) {
      var observable2 = new Observable3();
      observable2.source = this;
      observable2.operator = operator;
      return observable2;
    };
    Observable3.prototype.subscribe = function(observerOrNext, error, complete) {
      var operator = this.operator;
      var sink = toSubscriber_1.toSubscriber(observerOrNext, error, complete);
      if (operator) {
        operator.call(sink, this.source);
      } else {
        sink.add(this._trySubscribe(sink));
      }
      if (sink.syncErrorThrowable) {
        sink.syncErrorThrowable = false;
        if (sink.syncErrorThrown) {
          throw sink.syncErrorValue;
        }
      }
      return sink;
    };
    Observable3.prototype._trySubscribe = function(sink) {
      try {
        return this._subscribe(sink);
      } catch (err) {
        sink.syncErrorThrown = true;
        sink.syncErrorValue = err;
        sink.error(err);
      }
    };
    Observable3.prototype.forEach = function(next, PromiseCtor) {
      var _this = this;
      if (!PromiseCtor) {
        if (root_1.root.Rx && root_1.root.Rx.config && root_1.root.Rx.config.Promise) {
          PromiseCtor = root_1.root.Rx.config.Promise;
        } else if (root_1.root.Promise) {
          PromiseCtor = root_1.root.Promise;
        }
      }
      if (!PromiseCtor) {
        throw new Error("no Promise impl found");
      }
      return new PromiseCtor(function(resolve, reject) {
        var subscription = _this.subscribe(function(value) {
          if (subscription) {
            try {
              next(value);
            } catch (err) {
              reject(err);
              subscription.unsubscribe();
            }
          } else {
            next(value);
          }
        }, reject, resolve);
      });
    };
    Observable3.prototype._subscribe = function(subscriber) {
      return this.source.subscribe(subscriber);
    };
    Observable3.prototype[observable_1.$$observable] = function() {
      return this;
    };
    Observable3.create = function(subscribe) {
      return new Observable3(subscribe);
    };
    return Observable3;
  }();
  Observable2.Observable = Observable$1;
  return Observable2;
}
var queue = {};
var QueueAction = {};
var AsyncAction = {};
var Action = {};
var hasRequiredAction;
function requireAction() {
  if (hasRequiredAction)
    return Action;
  hasRequiredAction = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Subscription_1 = requireSubscription();
  var Action$1 = function(_super) {
    __extends(Action2, _super);
    function Action2(scheduler, work) {
      _super.call(this);
    }
    Action2.prototype.schedule = function(state, delay) {
      return this;
    };
    return Action2;
  }(Subscription_1.Subscription);
  Action.Action = Action$1;
  return Action;
}
var hasRequiredAsyncAction;
function requireAsyncAction() {
  if (hasRequiredAsyncAction)
    return AsyncAction;
  hasRequiredAsyncAction = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var root_1 = requireRoot();
  var Action_1 = requireAction();
  var AsyncAction$1 = function(_super) {
    __extends(AsyncAction2, _super);
    function AsyncAction2(scheduler, work) {
      _super.call(this, scheduler, work);
      this.scheduler = scheduler;
      this.work = work;
      this.pending = false;
    }
    AsyncAction2.prototype.schedule = function(state, delay) {
      if (delay === void 0) {
        delay = 0;
      }
      if (this.closed) {
        return this;
      }
      this.state = state;
      this.pending = true;
      var id = this.id;
      var scheduler = this.scheduler;
      if (id != null) {
        this.id = this.recycleAsyncId(scheduler, id, delay);
      }
      this.delay = delay;
      this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);
      return this;
    };
    AsyncAction2.prototype.requestAsyncId = function(scheduler, id, delay) {
      if (delay === void 0) {
        delay = 0;
      }
      return root_1.root.setInterval(scheduler.flush.bind(scheduler, this), delay);
    };
    AsyncAction2.prototype.recycleAsyncId = function(scheduler, id, delay) {
      if (delay === void 0) {
        delay = 0;
      }
      if (delay !== null && this.delay === delay) {
        return id;
      }
      return root_1.root.clearInterval(id) && void 0 || void 0;
    };
    AsyncAction2.prototype.execute = function(state, delay) {
      if (this.closed) {
        return new Error("executing a cancelled action");
      }
      this.pending = false;
      var error = this._execute(state, delay);
      if (error) {
        return error;
      } else if (this.pending === false && this.id != null) {
        this.id = this.recycleAsyncId(this.scheduler, this.id, null);
      }
    };
    AsyncAction2.prototype._execute = function(state, delay) {
      var errored = false;
      var errorValue = void 0;
      try {
        this.work(state);
      } catch (e2) {
        errored = true;
        errorValue = !!e2 && e2 || new Error(e2);
      }
      if (errored) {
        this.unsubscribe();
        return errorValue;
      }
    };
    AsyncAction2.prototype._unsubscribe = function() {
      var id = this.id;
      var scheduler = this.scheduler;
      var actions = scheduler.actions;
      var index = actions.indexOf(this);
      this.work = null;
      this.delay = null;
      this.state = null;
      this.pending = false;
      this.scheduler = null;
      if (index !== -1) {
        actions.splice(index, 1);
      }
      if (id != null) {
        this.id = this.recycleAsyncId(scheduler, id, null);
      }
    };
    return AsyncAction2;
  }(Action_1.Action);
  AsyncAction.AsyncAction = AsyncAction$1;
  return AsyncAction;
}
var hasRequiredQueueAction;
function requireQueueAction() {
  if (hasRequiredQueueAction)
    return QueueAction;
  hasRequiredQueueAction = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var AsyncAction_1 = requireAsyncAction();
  var QueueAction$1 = function(_super) {
    __extends(QueueAction2, _super);
    function QueueAction2(scheduler, work) {
      _super.call(this, scheduler, work);
      this.scheduler = scheduler;
      this.work = work;
    }
    QueueAction2.prototype.schedule = function(state, delay) {
      if (delay === void 0) {
        delay = 0;
      }
      if (delay > 0) {
        return _super.prototype.schedule.call(this, state, delay);
      }
      this.delay = delay;
      this.state = state;
      this.scheduler.flush(this);
      return this;
    };
    QueueAction2.prototype.execute = function(state, delay) {
      return delay > 0 || this.closed ? _super.prototype.execute.call(this, state, delay) : this._execute(state, delay);
    };
    QueueAction2.prototype.requestAsyncId = function(scheduler, id, delay) {
      if (delay === void 0) {
        delay = 0;
      }
      if (delay !== null && delay > 0 || delay === null && this.delay > 0) {
        return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
      }
      return scheduler.flush(this);
    };
    return QueueAction2;
  }(AsyncAction_1.AsyncAction);
  QueueAction.QueueAction = QueueAction$1;
  return QueueAction;
}
var QueueScheduler = {};
var AsyncScheduler = {};
var Scheduler = {};
var hasRequiredScheduler;
function requireScheduler() {
  if (hasRequiredScheduler)
    return Scheduler;
  hasRequiredScheduler = 1;
  var Scheduler$1 = function() {
    function Scheduler2(SchedulerAction, now) {
      if (now === void 0) {
        now = Scheduler2.now;
      }
      this.SchedulerAction = SchedulerAction;
      this.now = now;
    }
    Scheduler2.prototype.schedule = function(work, delay, state) {
      if (delay === void 0) {
        delay = 0;
      }
      return new this.SchedulerAction(this, work).schedule(state, delay);
    };
    Scheduler2.now = Date.now ? Date.now : function() {
      return +/* @__PURE__ */ new Date();
    };
    return Scheduler2;
  }();
  Scheduler.Scheduler = Scheduler$1;
  return Scheduler;
}
var hasRequiredAsyncScheduler;
function requireAsyncScheduler() {
  if (hasRequiredAsyncScheduler)
    return AsyncScheduler;
  hasRequiredAsyncScheduler = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Scheduler_1 = requireScheduler();
  var AsyncScheduler$1 = function(_super) {
    __extends(AsyncScheduler2, _super);
    function AsyncScheduler2() {
      _super.apply(this, arguments);
      this.actions = [];
      this.active = false;
      this.scheduled = void 0;
    }
    AsyncScheduler2.prototype.flush = function(action) {
      var actions = this.actions;
      if (this.active) {
        actions.push(action);
        return;
      }
      var error;
      this.active = true;
      do {
        if (error = action.execute(action.state, action.delay)) {
          break;
        }
      } while (action = actions.shift());
      this.active = false;
      if (error) {
        while (action = actions.shift()) {
          action.unsubscribe();
        }
        throw error;
      }
    };
    return AsyncScheduler2;
  }(Scheduler_1.Scheduler);
  AsyncScheduler.AsyncScheduler = AsyncScheduler$1;
  return AsyncScheduler;
}
var hasRequiredQueueScheduler;
function requireQueueScheduler() {
  if (hasRequiredQueueScheduler)
    return QueueScheduler;
  hasRequiredQueueScheduler = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var AsyncScheduler_1 = requireAsyncScheduler();
  var QueueScheduler$1 = function(_super) {
    __extends(QueueScheduler2, _super);
    function QueueScheduler2() {
      _super.apply(this, arguments);
    }
    return QueueScheduler2;
  }(AsyncScheduler_1.AsyncScheduler);
  QueueScheduler.QueueScheduler = QueueScheduler$1;
  return QueueScheduler;
}
var hasRequiredQueue;
function requireQueue() {
  if (hasRequiredQueue)
    return queue;
  hasRequiredQueue = 1;
  var QueueAction_1 = requireQueueAction();
  var QueueScheduler_1 = requireQueueScheduler();
  queue.queue = new QueueScheduler_1.QueueScheduler(QueueAction_1.QueueAction);
  return queue;
}
var defer$1 = {};
var defer = {};
var DeferObservable = {};
var subscribeToResult = {};
var isPromise = {};
var hasRequiredIsPromise;
function requireIsPromise() {
  if (hasRequiredIsPromise)
    return isPromise;
  hasRequiredIsPromise = 1;
  function isPromise$1(value) {
    return value && typeof value.subscribe !== "function" && typeof value.then === "function";
  }
  isPromise.isPromise = isPromise$1;
  return isPromise;
}
var iterator = {};
var hasRequiredIterator;
function requireIterator() {
  if (hasRequiredIterator)
    return iterator;
  hasRequiredIterator = 1;
  var root_1 = requireRoot();
  function symbolIteratorPonyfill(root3) {
    var Symbol2 = root3.Symbol;
    if (typeof Symbol2 === "function") {
      if (!Symbol2.iterator) {
        Symbol2.iterator = Symbol2("iterator polyfill");
      }
      return Symbol2.iterator;
    } else {
      var Set_1 = root3.Set;
      if (Set_1 && typeof new Set_1()["@@iterator"] === "function") {
        return "@@iterator";
      }
      var Map_1 = root3.Map;
      if (Map_1) {
        var keys = Object.getOwnPropertyNames(Map_1.prototype);
        for (var i2 = 0; i2 < keys.length; ++i2) {
          var key = keys[i2];
          if (key !== "entries" && key !== "size" && Map_1.prototype[key] === Map_1.prototype["entries"]) {
            return key;
          }
        }
      }
      return "@@iterator";
    }
  }
  iterator.symbolIteratorPonyfill = symbolIteratorPonyfill;
  iterator.$$iterator = symbolIteratorPonyfill(root_1.root);
  return iterator;
}
var InnerSubscriber = {};
var hasRequiredInnerSubscriber;
function requireInnerSubscriber() {
  if (hasRequiredInnerSubscriber)
    return InnerSubscriber;
  hasRequiredInnerSubscriber = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Subscriber_1 = requireSubscriber();
  var InnerSubscriber$1 = function(_super) {
    __extends(InnerSubscriber2, _super);
    function InnerSubscriber2(parent, outerValue, outerIndex) {
      _super.call(this);
      this.parent = parent;
      this.outerValue = outerValue;
      this.outerIndex = outerIndex;
      this.index = 0;
    }
    InnerSubscriber2.prototype._next = function(value) {
      this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++, this);
    };
    InnerSubscriber2.prototype._error = function(error) {
      this.parent.notifyError(error, this);
      this.unsubscribe();
    };
    InnerSubscriber2.prototype._complete = function() {
      this.parent.notifyComplete(this);
      this.unsubscribe();
    };
    return InnerSubscriber2;
  }(Subscriber_1.Subscriber);
  InnerSubscriber.InnerSubscriber = InnerSubscriber$1;
  return InnerSubscriber;
}
var hasRequiredSubscribeToResult;
function requireSubscribeToResult() {
  if (hasRequiredSubscribeToResult)
    return subscribeToResult;
  hasRequiredSubscribeToResult = 1;
  var root_1 = requireRoot();
  var isArray_1 = requireIsArray();
  var isPromise_1 = requireIsPromise();
  var isObject_1 = requireIsObject();
  var Observable_1 = requireObservable();
  var iterator_1 = requireIterator();
  var InnerSubscriber_1 = requireInnerSubscriber();
  var observable_1 = requireObservable$1();
  function subscribeToResult$1(outerSubscriber, result3, outerValue, outerIndex) {
    var destination = new InnerSubscriber_1.InnerSubscriber(outerSubscriber, outerValue, outerIndex);
    if (destination.closed) {
      return null;
    }
    if (result3 instanceof Observable_1.Observable) {
      if (result3._isScalar) {
        destination.next(result3.value);
        destination.complete();
        return null;
      } else {
        return result3.subscribe(destination);
      }
    } else if (isArray_1.isArray(result3)) {
      for (var i2 = 0, len = result3.length; i2 < len && !destination.closed; i2++) {
        destination.next(result3[i2]);
      }
      if (!destination.closed) {
        destination.complete();
      }
    } else if (isPromise_1.isPromise(result3)) {
      result3.then(function(value2) {
        if (!destination.closed) {
          destination.next(value2);
          destination.complete();
        }
      }, function(err) {
        return destination.error(err);
      }).then(null, function(err) {
        root_1.root.setTimeout(function() {
          throw err;
        });
      });
      return destination;
    } else if (result3 && typeof result3[iterator_1.$$iterator] === "function") {
      var iterator2 = result3[iterator_1.$$iterator]();
      do {
        var item = iterator2.next();
        if (item.done) {
          destination.complete();
          break;
        }
        destination.next(item.value);
        if (destination.closed) {
          break;
        }
      } while (true);
    } else if (result3 && typeof result3[observable_1.$$observable] === "function") {
      var obs = result3[observable_1.$$observable]();
      if (typeof obs.subscribe !== "function") {
        destination.error(new TypeError("Provided object does not correctly implement Symbol.observable"));
      } else {
        return obs.subscribe(new InnerSubscriber_1.InnerSubscriber(outerSubscriber, outerValue, outerIndex));
      }
    } else {
      var value = isObject_1.isObject(result3) ? "an invalid object" : "'" + result3 + "'";
      var msg = "You provided " + value + " where a stream was expected. You can provide an Observable, Promise, Array, or Iterable.";
      destination.error(new TypeError(msg));
    }
    return null;
  }
  subscribeToResult.subscribeToResult = subscribeToResult$1;
  return subscribeToResult;
}
var OuterSubscriber = {};
var hasRequiredOuterSubscriber;
function requireOuterSubscriber() {
  if (hasRequiredOuterSubscriber)
    return OuterSubscriber;
  hasRequiredOuterSubscriber = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Subscriber_1 = requireSubscriber();
  var OuterSubscriber$1 = function(_super) {
    __extends(OuterSubscriber2, _super);
    function OuterSubscriber2() {
      _super.apply(this, arguments);
    }
    OuterSubscriber2.prototype.notifyNext = function(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
      this.destination.next(innerValue);
    };
    OuterSubscriber2.prototype.notifyError = function(error, innerSub) {
      this.destination.error(error);
    };
    OuterSubscriber2.prototype.notifyComplete = function(innerSub) {
      this.destination.complete();
    };
    return OuterSubscriber2;
  }(Subscriber_1.Subscriber);
  OuterSubscriber.OuterSubscriber = OuterSubscriber$1;
  return OuterSubscriber;
}
var hasRequiredDeferObservable;
function requireDeferObservable() {
  if (hasRequiredDeferObservable)
    return DeferObservable;
  hasRequiredDeferObservable = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Observable_1 = requireObservable();
  var subscribeToResult_1 = requireSubscribeToResult();
  var OuterSubscriber_1 = requireOuterSubscriber();
  var DeferObservable$1 = function(_super) {
    __extends(DeferObservable2, _super);
    function DeferObservable2(observableFactory) {
      _super.call(this);
      this.observableFactory = observableFactory;
    }
    DeferObservable2.create = function(observableFactory) {
      return new DeferObservable2(observableFactory);
    };
    DeferObservable2.prototype._subscribe = function(subscriber) {
      return new DeferSubscriber(subscriber, this.observableFactory);
    };
    return DeferObservable2;
  }(Observable_1.Observable);
  DeferObservable.DeferObservable = DeferObservable$1;
  var DeferSubscriber = function(_super) {
    __extends(DeferSubscriber2, _super);
    function DeferSubscriber2(destination, factory) {
      _super.call(this, destination);
      this.factory = factory;
      this.tryDefer();
    }
    DeferSubscriber2.prototype.tryDefer = function() {
      try {
        this._callFactory();
      } catch (err) {
        this._error(err);
      }
    };
    DeferSubscriber2.prototype._callFactory = function() {
      var result3 = this.factory();
      if (result3) {
        this.add(subscribeToResult_1.subscribeToResult(this, result3));
      }
    };
    return DeferSubscriber2;
  }(OuterSubscriber_1.OuterSubscriber);
  return DeferObservable;
}
var hasRequiredDefer$1;
function requireDefer$1() {
  if (hasRequiredDefer$1)
    return defer;
  hasRequiredDefer$1 = 1;
  var DeferObservable_1 = requireDeferObservable();
  defer.defer = DeferObservable_1.DeferObservable.create;
  return defer;
}
var hasRequiredDefer;
function requireDefer() {
  if (hasRequiredDefer)
    return defer$1;
  hasRequiredDefer = 1;
  var Observable_1 = requireObservable();
  var defer_1 = requireDefer$1();
  Observable_1.Observable.defer = defer_1.defer;
  return defer$1;
}
var of$1 = {};
var of = {};
var ArrayObservable = {};
var ScalarObservable = {};
var hasRequiredScalarObservable;
function requireScalarObservable() {
  if (hasRequiredScalarObservable)
    return ScalarObservable;
  hasRequiredScalarObservable = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Observable_1 = requireObservable();
  var ScalarObservable$1 = function(_super) {
    __extends(ScalarObservable2, _super);
    function ScalarObservable2(value, scheduler) {
      _super.call(this);
      this.value = value;
      this.scheduler = scheduler;
      this._isScalar = true;
      if (scheduler) {
        this._isScalar = false;
      }
    }
    ScalarObservable2.create = function(value, scheduler) {
      return new ScalarObservable2(value, scheduler);
    };
    ScalarObservable2.dispatch = function(state) {
      var done = state.done, value = state.value, subscriber = state.subscriber;
      if (done) {
        subscriber.complete();
        return;
      }
      subscriber.next(value);
      if (subscriber.closed) {
        return;
      }
      state.done = true;
      this.schedule(state);
    };
    ScalarObservable2.prototype._subscribe = function(subscriber) {
      var value = this.value;
      var scheduler = this.scheduler;
      if (scheduler) {
        return scheduler.schedule(ScalarObservable2.dispatch, 0, {
          done: false,
          value,
          subscriber
        });
      } else {
        subscriber.next(value);
        if (!subscriber.closed) {
          subscriber.complete();
        }
      }
    };
    return ScalarObservable2;
  }(Observable_1.Observable);
  ScalarObservable.ScalarObservable = ScalarObservable$1;
  return ScalarObservable;
}
var EmptyObservable = {};
var hasRequiredEmptyObservable;
function requireEmptyObservable() {
  if (hasRequiredEmptyObservable)
    return EmptyObservable;
  hasRequiredEmptyObservable = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Observable_1 = requireObservable();
  var EmptyObservable$1 = function(_super) {
    __extends(EmptyObservable2, _super);
    function EmptyObservable2(scheduler) {
      _super.call(this);
      this.scheduler = scheduler;
    }
    EmptyObservable2.create = function(scheduler) {
      return new EmptyObservable2(scheduler);
    };
    EmptyObservable2.dispatch = function(arg) {
      var subscriber = arg.subscriber;
      subscriber.complete();
    };
    EmptyObservable2.prototype._subscribe = function(subscriber) {
      var scheduler = this.scheduler;
      if (scheduler) {
        return scheduler.schedule(EmptyObservable2.dispatch, 0, { subscriber });
      } else {
        subscriber.complete();
      }
    };
    return EmptyObservable2;
  }(Observable_1.Observable);
  EmptyObservable.EmptyObservable = EmptyObservable$1;
  return EmptyObservable;
}
var isScheduler = {};
var hasRequiredIsScheduler;
function requireIsScheduler() {
  if (hasRequiredIsScheduler)
    return isScheduler;
  hasRequiredIsScheduler = 1;
  function isScheduler$1(value) {
    return value && typeof value.schedule === "function";
  }
  isScheduler.isScheduler = isScheduler$1;
  return isScheduler;
}
var hasRequiredArrayObservable;
function requireArrayObservable() {
  if (hasRequiredArrayObservable)
    return ArrayObservable;
  hasRequiredArrayObservable = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Observable_1 = requireObservable();
  var ScalarObservable_1 = requireScalarObservable();
  var EmptyObservable_1 = requireEmptyObservable();
  var isScheduler_1 = requireIsScheduler();
  var ArrayObservable$1 = function(_super) {
    __extends(ArrayObservable2, _super);
    function ArrayObservable2(array, scheduler) {
      _super.call(this);
      this.array = array;
      this.scheduler = scheduler;
      if (!scheduler && array.length === 1) {
        this._isScalar = true;
        this.value = array[0];
      }
    }
    ArrayObservable2.create = function(array, scheduler) {
      return new ArrayObservable2(array, scheduler);
    };
    ArrayObservable2.of = function() {
      var array = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        array[_i - 0] = arguments[_i];
      }
      var scheduler = array[array.length - 1];
      if (isScheduler_1.isScheduler(scheduler)) {
        array.pop();
      } else {
        scheduler = null;
      }
      var len = array.length;
      if (len > 1) {
        return new ArrayObservable2(array, scheduler);
      } else if (len === 1) {
        return new ScalarObservable_1.ScalarObservable(array[0], scheduler);
      } else {
        return new EmptyObservable_1.EmptyObservable(scheduler);
      }
    };
    ArrayObservable2.dispatch = function(state) {
      var array = state.array, index = state.index, count = state.count, subscriber = state.subscriber;
      if (index >= count) {
        subscriber.complete();
        return;
      }
      subscriber.next(array[index]);
      if (subscriber.closed) {
        return;
      }
      state.index = index + 1;
      this.schedule(state);
    };
    ArrayObservable2.prototype._subscribe = function(subscriber) {
      var index = 0;
      var array = this.array;
      var count = array.length;
      var scheduler = this.scheduler;
      if (scheduler) {
        return scheduler.schedule(ArrayObservable2.dispatch, 0, {
          array,
          index,
          count,
          subscriber
        });
      } else {
        for (var i2 = 0; i2 < count && !subscriber.closed; i2++) {
          subscriber.next(array[i2]);
        }
        subscriber.complete();
      }
    };
    return ArrayObservable2;
  }(Observable_1.Observable);
  ArrayObservable.ArrayObservable = ArrayObservable$1;
  return ArrayObservable;
}
var hasRequiredOf$1;
function requireOf$1() {
  if (hasRequiredOf$1)
    return of;
  hasRequiredOf$1 = 1;
  var ArrayObservable_1 = requireArrayObservable();
  of.of = ArrayObservable_1.ArrayObservable.of;
  return of;
}
var hasRequiredOf;
function requireOf() {
  if (hasRequiredOf)
    return of$1;
  hasRequiredOf = 1;
  var Observable_1 = requireObservable();
  var of_1 = requireOf$1();
  Observable_1.Observable.of = of_1.of;
  return of$1;
}
var from$1 = {};
var from = {};
var FromObservable = {};
var PromiseObservable = {};
var hasRequiredPromiseObservable;
function requirePromiseObservable() {
  if (hasRequiredPromiseObservable)
    return PromiseObservable;
  hasRequiredPromiseObservable = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var root_1 = requireRoot();
  var Observable_1 = requireObservable();
  var PromiseObservable$1 = function(_super) {
    __extends(PromiseObservable2, _super);
    function PromiseObservable2(promise, scheduler) {
      _super.call(this);
      this.promise = promise;
      this.scheduler = scheduler;
    }
    PromiseObservable2.create = function(promise, scheduler) {
      return new PromiseObservable2(promise, scheduler);
    };
    PromiseObservable2.prototype._subscribe = function(subscriber) {
      var _this = this;
      var promise = this.promise;
      var scheduler = this.scheduler;
      if (scheduler == null) {
        if (this._isScalar) {
          if (!subscriber.closed) {
            subscriber.next(this.value);
            subscriber.complete();
          }
        } else {
          promise.then(function(value) {
            _this.value = value;
            _this._isScalar = true;
            if (!subscriber.closed) {
              subscriber.next(value);
              subscriber.complete();
            }
          }, function(err) {
            if (!subscriber.closed) {
              subscriber.error(err);
            }
          }).then(null, function(err) {
            root_1.root.setTimeout(function() {
              throw err;
            });
          });
        }
      } else {
        if (this._isScalar) {
          if (!subscriber.closed) {
            return scheduler.schedule(dispatchNext, 0, { value: this.value, subscriber });
          }
        } else {
          promise.then(function(value) {
            _this.value = value;
            _this._isScalar = true;
            if (!subscriber.closed) {
              subscriber.add(scheduler.schedule(dispatchNext, 0, { value, subscriber }));
            }
          }, function(err) {
            if (!subscriber.closed) {
              subscriber.add(scheduler.schedule(dispatchError, 0, { err, subscriber }));
            }
          }).then(null, function(err) {
            root_1.root.setTimeout(function() {
              throw err;
            });
          });
        }
      }
    };
    return PromiseObservable2;
  }(Observable_1.Observable);
  PromiseObservable.PromiseObservable = PromiseObservable$1;
  function dispatchNext(arg) {
    var value = arg.value, subscriber = arg.subscriber;
    if (!subscriber.closed) {
      subscriber.next(value);
      subscriber.complete();
    }
  }
  function dispatchError(arg) {
    var err = arg.err, subscriber = arg.subscriber;
    if (!subscriber.closed) {
      subscriber.error(err);
    }
  }
  return PromiseObservable;
}
var IteratorObservable = {};
var hasRequiredIteratorObservable;
function requireIteratorObservable() {
  if (hasRequiredIteratorObservable)
    return IteratorObservable;
  hasRequiredIteratorObservable = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var root_1 = requireRoot();
  var Observable_1 = requireObservable();
  var iterator_1 = requireIterator();
  var IteratorObservable$1 = function(_super) {
    __extends(IteratorObservable2, _super);
    function IteratorObservable2(iterator2, scheduler) {
      _super.call(this);
      this.scheduler = scheduler;
      if (iterator2 == null) {
        throw new Error("iterator cannot be null.");
      }
      this.iterator = getIterator(iterator2);
    }
    IteratorObservable2.create = function(iterator2, scheduler) {
      return new IteratorObservable2(iterator2, scheduler);
    };
    IteratorObservable2.dispatch = function(state) {
      var index = state.index, hasError = state.hasError, iterator2 = state.iterator, subscriber = state.subscriber;
      if (hasError) {
        subscriber.error(state.error);
        return;
      }
      var result3 = iterator2.next();
      if (result3.done) {
        subscriber.complete();
        return;
      }
      subscriber.next(result3.value);
      state.index = index + 1;
      if (subscriber.closed) {
        if (typeof iterator2.return === "function") {
          iterator2.return();
        }
        return;
      }
      this.schedule(state);
    };
    IteratorObservable2.prototype._subscribe = function(subscriber) {
      var index = 0;
      var _a = this, iterator2 = _a.iterator, scheduler = _a.scheduler;
      if (scheduler) {
        return scheduler.schedule(IteratorObservable2.dispatch, 0, {
          index,
          iterator: iterator2,
          subscriber
        });
      } else {
        do {
          var result3 = iterator2.next();
          if (result3.done) {
            subscriber.complete();
            break;
          } else {
            subscriber.next(result3.value);
          }
          if (subscriber.closed) {
            if (typeof iterator2.return === "function") {
              iterator2.return();
            }
            break;
          }
        } while (true);
      }
    };
    return IteratorObservable2;
  }(Observable_1.Observable);
  IteratorObservable.IteratorObservable = IteratorObservable$1;
  var StringIterator = function() {
    function StringIterator2(str, idx, len) {
      if (idx === void 0) {
        idx = 0;
      }
      if (len === void 0) {
        len = str.length;
      }
      this.str = str;
      this.idx = idx;
      this.len = len;
    }
    StringIterator2.prototype[iterator_1.$$iterator] = function() {
      return this;
    };
    StringIterator2.prototype.next = function() {
      return this.idx < this.len ? {
        done: false,
        value: this.str.charAt(this.idx++)
      } : {
        done: true,
        value: void 0
      };
    };
    return StringIterator2;
  }();
  var ArrayIterator = function() {
    function ArrayIterator2(arr, idx, len) {
      if (idx === void 0) {
        idx = 0;
      }
      if (len === void 0) {
        len = toLength(arr);
      }
      this.arr = arr;
      this.idx = idx;
      this.len = len;
    }
    ArrayIterator2.prototype[iterator_1.$$iterator] = function() {
      return this;
    };
    ArrayIterator2.prototype.next = function() {
      return this.idx < this.len ? {
        done: false,
        value: this.arr[this.idx++]
      } : {
        done: true,
        value: void 0
      };
    };
    return ArrayIterator2;
  }();
  function getIterator(obj) {
    var i2 = obj[iterator_1.$$iterator];
    if (!i2 && typeof obj === "string") {
      return new StringIterator(obj);
    }
    if (!i2 && obj.length !== void 0) {
      return new ArrayIterator(obj);
    }
    if (!i2) {
      throw new TypeError("object is not iterable");
    }
    return obj[iterator_1.$$iterator]();
  }
  var maxSafeInteger = Math.pow(2, 53) - 1;
  function toLength(o) {
    var len = +o.length;
    if (isNaN(len)) {
      return 0;
    }
    if (len === 0 || !numberIsFinite(len)) {
      return len;
    }
    len = sign(len) * Math.floor(Math.abs(len));
    if (len <= 0) {
      return 0;
    }
    if (len > maxSafeInteger) {
      return maxSafeInteger;
    }
    return len;
  }
  function numberIsFinite(value) {
    return typeof value === "number" && root_1.root.isFinite(value);
  }
  function sign(value) {
    var valueAsNumber = +value;
    if (valueAsNumber === 0) {
      return valueAsNumber;
    }
    if (isNaN(valueAsNumber)) {
      return valueAsNumber;
    }
    return valueAsNumber < 0 ? -1 : 1;
  }
  return IteratorObservable;
}
var ArrayLikeObservable = {};
var hasRequiredArrayLikeObservable;
function requireArrayLikeObservable() {
  if (hasRequiredArrayLikeObservable)
    return ArrayLikeObservable;
  hasRequiredArrayLikeObservable = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Observable_1 = requireObservable();
  var ScalarObservable_1 = requireScalarObservable();
  var EmptyObservable_1 = requireEmptyObservable();
  var ArrayLikeObservable$1 = function(_super) {
    __extends(ArrayLikeObservable2, _super);
    function ArrayLikeObservable2(arrayLike, scheduler) {
      _super.call(this);
      this.arrayLike = arrayLike;
      this.scheduler = scheduler;
      if (!scheduler && arrayLike.length === 1) {
        this._isScalar = true;
        this.value = arrayLike[0];
      }
    }
    ArrayLikeObservable2.create = function(arrayLike, scheduler) {
      var length = arrayLike.length;
      if (length === 0) {
        return new EmptyObservable_1.EmptyObservable();
      } else if (length === 1) {
        return new ScalarObservable_1.ScalarObservable(arrayLike[0], scheduler);
      } else {
        return new ArrayLikeObservable2(arrayLike, scheduler);
      }
    };
    ArrayLikeObservable2.dispatch = function(state) {
      var arrayLike = state.arrayLike, index = state.index, length = state.length, subscriber = state.subscriber;
      if (subscriber.closed) {
        return;
      }
      if (index >= length) {
        subscriber.complete();
        return;
      }
      subscriber.next(arrayLike[index]);
      state.index = index + 1;
      this.schedule(state);
    };
    ArrayLikeObservable2.prototype._subscribe = function(subscriber) {
      var index = 0;
      var _a = this, arrayLike = _a.arrayLike, scheduler = _a.scheduler;
      var length = arrayLike.length;
      if (scheduler) {
        return scheduler.schedule(ArrayLikeObservable2.dispatch, 0, {
          arrayLike,
          index,
          length,
          subscriber
        });
      } else {
        for (var i2 = 0; i2 < length && !subscriber.closed; i2++) {
          subscriber.next(arrayLike[i2]);
        }
        subscriber.complete();
      }
    };
    return ArrayLikeObservable2;
  }(Observable_1.Observable);
  ArrayLikeObservable.ArrayLikeObservable = ArrayLikeObservable$1;
  return ArrayLikeObservable;
}
var observeOn = {};
var Notification = {};
var hasRequiredNotification;
function requireNotification() {
  if (hasRequiredNotification)
    return Notification;
  hasRequiredNotification = 1;
  var Observable_1 = requireObservable();
  var Notification$1 = function() {
    function Notification2(kind, value, error) {
      this.kind = kind;
      this.value = value;
      this.error = error;
      this.hasValue = kind === "N";
    }
    Notification2.prototype.observe = function(observer) {
      switch (this.kind) {
        case "N":
          return observer.next && observer.next(this.value);
        case "E":
          return observer.error && observer.error(this.error);
        case "C":
          return observer.complete && observer.complete();
      }
    };
    Notification2.prototype.do = function(next, error, complete) {
      var kind = this.kind;
      switch (kind) {
        case "N":
          return next && next(this.value);
        case "E":
          return error && error(this.error);
        case "C":
          return complete && complete();
      }
    };
    Notification2.prototype.accept = function(nextOrObserver, error, complete) {
      if (nextOrObserver && typeof nextOrObserver.next === "function") {
        return this.observe(nextOrObserver);
      } else {
        return this.do(nextOrObserver, error, complete);
      }
    };
    Notification2.prototype.toObservable = function() {
      var kind = this.kind;
      switch (kind) {
        case "N":
          return Observable_1.Observable.of(this.value);
        case "E":
          return Observable_1.Observable.throw(this.error);
        case "C":
          return Observable_1.Observable.empty();
      }
      throw new Error("unexpected notification kind value");
    };
    Notification2.createNext = function(value) {
      if (typeof value !== "undefined") {
        return new Notification2("N", value);
      }
      return this.undefinedValueNotification;
    };
    Notification2.createError = function(err) {
      return new Notification2("E", void 0, err);
    };
    Notification2.createComplete = function() {
      return this.completeNotification;
    };
    Notification2.completeNotification = new Notification2("C");
    Notification2.undefinedValueNotification = new Notification2("N", void 0);
    return Notification2;
  }();
  Notification.Notification = Notification$1;
  return Notification;
}
var hasRequiredObserveOn;
function requireObserveOn() {
  if (hasRequiredObserveOn)
    return observeOn;
  hasRequiredObserveOn = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Subscriber_1 = requireSubscriber();
  var Notification_1 = requireNotification();
  function observeOn$1(scheduler, delay) {
    if (delay === void 0) {
      delay = 0;
    }
    return this.lift(new ObserveOnOperator(scheduler, delay));
  }
  observeOn.observeOn = observeOn$1;
  var ObserveOnOperator = function() {
    function ObserveOnOperator2(scheduler, delay) {
      if (delay === void 0) {
        delay = 0;
      }
      this.scheduler = scheduler;
      this.delay = delay;
    }
    ObserveOnOperator2.prototype.call = function(subscriber, source) {
      return source.subscribe(new ObserveOnSubscriber(subscriber, this.scheduler, this.delay));
    };
    return ObserveOnOperator2;
  }();
  observeOn.ObserveOnOperator = ObserveOnOperator;
  var ObserveOnSubscriber = function(_super) {
    __extends(ObserveOnSubscriber2, _super);
    function ObserveOnSubscriber2(destination, scheduler, delay) {
      if (delay === void 0) {
        delay = 0;
      }
      _super.call(this, destination);
      this.scheduler = scheduler;
      this.delay = delay;
    }
    ObserveOnSubscriber2.dispatch = function(arg) {
      var notification = arg.notification, destination = arg.destination;
      notification.observe(destination);
      this.unsubscribe();
    };
    ObserveOnSubscriber2.prototype.scheduleMessage = function(notification) {
      this.add(this.scheduler.schedule(ObserveOnSubscriber2.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));
    };
    ObserveOnSubscriber2.prototype._next = function(value) {
      this.scheduleMessage(Notification_1.Notification.createNext(value));
    };
    ObserveOnSubscriber2.prototype._error = function(err) {
      this.scheduleMessage(Notification_1.Notification.createError(err));
    };
    ObserveOnSubscriber2.prototype._complete = function() {
      this.scheduleMessage(Notification_1.Notification.createComplete());
    };
    return ObserveOnSubscriber2;
  }(Subscriber_1.Subscriber);
  observeOn.ObserveOnSubscriber = ObserveOnSubscriber;
  var ObserveOnMessage = function() {
    function ObserveOnMessage2(notification, destination) {
      this.notification = notification;
      this.destination = destination;
    }
    return ObserveOnMessage2;
  }();
  observeOn.ObserveOnMessage = ObserveOnMessage;
  return observeOn;
}
var hasRequiredFromObservable;
function requireFromObservable() {
  if (hasRequiredFromObservable)
    return FromObservable;
  hasRequiredFromObservable = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var isArray_1 = requireIsArray();
  var isPromise_1 = requireIsPromise();
  var PromiseObservable_1 = requirePromiseObservable();
  var IteratorObservable_1 = requireIteratorObservable();
  var ArrayObservable_1 = requireArrayObservable();
  var ArrayLikeObservable_1 = requireArrayLikeObservable();
  var iterator_1 = requireIterator();
  var Observable_1 = requireObservable();
  var observeOn_1 = requireObserveOn();
  var observable_1 = requireObservable$1();
  var isArrayLike = function(x) {
    return x && typeof x.length === "number";
  };
  var FromObservable$1 = function(_super) {
    __extends(FromObservable2, _super);
    function FromObservable2(ish, scheduler) {
      _super.call(this, null);
      this.ish = ish;
      this.scheduler = scheduler;
    }
    FromObservable2.create = function(ish, scheduler) {
      if (ish != null) {
        if (typeof ish[observable_1.$$observable] === "function") {
          if (ish instanceof Observable_1.Observable && !scheduler) {
            return ish;
          }
          return new FromObservable2(ish, scheduler);
        } else if (isArray_1.isArray(ish)) {
          return new ArrayObservable_1.ArrayObservable(ish, scheduler);
        } else if (isPromise_1.isPromise(ish)) {
          return new PromiseObservable_1.PromiseObservable(ish, scheduler);
        } else if (typeof ish[iterator_1.$$iterator] === "function" || typeof ish === "string") {
          return new IteratorObservable_1.IteratorObservable(ish, scheduler);
        } else if (isArrayLike(ish)) {
          return new ArrayLikeObservable_1.ArrayLikeObservable(ish, scheduler);
        }
      }
      throw new TypeError((ish !== null && typeof ish || ish) + " is not observable");
    };
    FromObservable2.prototype._subscribe = function(subscriber) {
      var ish = this.ish;
      var scheduler = this.scheduler;
      if (scheduler == null) {
        return ish[observable_1.$$observable]().subscribe(subscriber);
      } else {
        return ish[observable_1.$$observable]().subscribe(new observeOn_1.ObserveOnSubscriber(subscriber, scheduler, 0));
      }
    };
    return FromObservable2;
  }(Observable_1.Observable);
  FromObservable.FromObservable = FromObservable$1;
  return FromObservable;
}
var hasRequiredFrom$1;
function requireFrom$1() {
  if (hasRequiredFrom$1)
    return from;
  hasRequiredFrom$1 = 1;
  var FromObservable_1 = requireFromObservable();
  from.from = FromObservable_1.FromObservable.create;
  return from;
}
var hasRequiredFrom;
function requireFrom() {
  if (hasRequiredFrom)
    return from$1;
  hasRequiredFrom = 1;
  var Observable_1 = requireObservable();
  var from_1 = requireFrom$1();
  Observable_1.Observable.from = from_1.from;
  return from$1;
}
var _throw$1 = {};
var _throw = {};
var ErrorObservable = {};
var hasRequiredErrorObservable;
function requireErrorObservable() {
  if (hasRequiredErrorObservable)
    return ErrorObservable;
  hasRequiredErrorObservable = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Observable_1 = requireObservable();
  var ErrorObservable$1 = function(_super) {
    __extends(ErrorObservable2, _super);
    function ErrorObservable2(error, scheduler) {
      _super.call(this);
      this.error = error;
      this.scheduler = scheduler;
    }
    ErrorObservable2.create = function(error, scheduler) {
      return new ErrorObservable2(error, scheduler);
    };
    ErrorObservable2.dispatch = function(arg) {
      var error = arg.error, subscriber = arg.subscriber;
      subscriber.error(error);
    };
    ErrorObservable2.prototype._subscribe = function(subscriber) {
      var error = this.error;
      var scheduler = this.scheduler;
      if (scheduler) {
        return scheduler.schedule(ErrorObservable2.dispatch, 0, {
          error,
          subscriber
        });
      } else {
        subscriber.error(error);
      }
    };
    return ErrorObservable2;
  }(Observable_1.Observable);
  ErrorObservable.ErrorObservable = ErrorObservable$1;
  return ErrorObservable;
}
var hasRequired_throw$1;
function require_throw$1() {
  if (hasRequired_throw$1)
    return _throw;
  hasRequired_throw$1 = 1;
  var ErrorObservable_1 = requireErrorObservable();
  _throw._throw = ErrorObservable_1.ErrorObservable.create;
  return _throw;
}
var hasRequired_throw;
function require_throw() {
  if (hasRequired_throw)
    return _throw$1;
  hasRequired_throw = 1;
  var Observable_1 = requireObservable();
  var throw_1 = require_throw$1();
  Observable_1.Observable.throw = throw_1._throw;
  return _throw$1;
}
var empty$1 = {};
var empty = {};
var hasRequiredEmpty$1;
function requireEmpty$1() {
  if (hasRequiredEmpty$1)
    return empty;
  hasRequiredEmpty$1 = 1;
  var EmptyObservable_1 = requireEmptyObservable();
  empty.empty = EmptyObservable_1.EmptyObservable.create;
  return empty;
}
var hasRequiredEmpty;
function requireEmpty() {
  if (hasRequiredEmpty)
    return empty$1;
  hasRequiredEmpty = 1;
  var Observable_1 = requireObservable();
  var empty_1 = requireEmpty$1();
  Observable_1.Observable.empty = empty_1.empty;
  return empty$1;
}
var mergeMap$1 = {};
var mergeMap = {};
var hasRequiredMergeMap$1;
function requireMergeMap$1() {
  if (hasRequiredMergeMap$1)
    return mergeMap;
  hasRequiredMergeMap$1 = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var subscribeToResult_1 = requireSubscribeToResult();
  var OuterSubscriber_1 = requireOuterSubscriber();
  function mergeMap$12(project, resultSelector, concurrent) {
    if (concurrent === void 0) {
      concurrent = Number.POSITIVE_INFINITY;
    }
    if (typeof resultSelector === "number") {
      concurrent = resultSelector;
      resultSelector = null;
    }
    return this.lift(new MergeMapOperator(project, resultSelector, concurrent));
  }
  mergeMap.mergeMap = mergeMap$12;
  var MergeMapOperator = function() {
    function MergeMapOperator2(project, resultSelector, concurrent) {
      if (concurrent === void 0) {
        concurrent = Number.POSITIVE_INFINITY;
      }
      this.project = project;
      this.resultSelector = resultSelector;
      this.concurrent = concurrent;
    }
    MergeMapOperator2.prototype.call = function(observer, source) {
      return source.subscribe(new MergeMapSubscriber(observer, this.project, this.resultSelector, this.concurrent));
    };
    return MergeMapOperator2;
  }();
  mergeMap.MergeMapOperator = MergeMapOperator;
  var MergeMapSubscriber = function(_super) {
    __extends(MergeMapSubscriber2, _super);
    function MergeMapSubscriber2(destination, project, resultSelector, concurrent) {
      if (concurrent === void 0) {
        concurrent = Number.POSITIVE_INFINITY;
      }
      _super.call(this, destination);
      this.project = project;
      this.resultSelector = resultSelector;
      this.concurrent = concurrent;
      this.hasCompleted = false;
      this.buffer = [];
      this.active = 0;
      this.index = 0;
    }
    MergeMapSubscriber2.prototype._next = function(value) {
      if (this.active < this.concurrent) {
        this._tryNext(value);
      } else {
        this.buffer.push(value);
      }
    };
    MergeMapSubscriber2.prototype._tryNext = function(value) {
      var result3;
      var index = this.index++;
      try {
        result3 = this.project(value, index);
      } catch (err) {
        this.destination.error(err);
        return;
      }
      this.active++;
      this._innerSub(result3, value, index);
    };
    MergeMapSubscriber2.prototype._innerSub = function(ish, value, index) {
      this.add(subscribeToResult_1.subscribeToResult(this, ish, value, index));
    };
    MergeMapSubscriber2.prototype._complete = function() {
      this.hasCompleted = true;
      if (this.active === 0 && this.buffer.length === 0) {
        this.destination.complete();
      }
    };
    MergeMapSubscriber2.prototype.notifyNext = function(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
      if (this.resultSelector) {
        this._notifyResultSelector(outerValue, innerValue, outerIndex, innerIndex);
      } else {
        this.destination.next(innerValue);
      }
    };
    MergeMapSubscriber2.prototype._notifyResultSelector = function(outerValue, innerValue, outerIndex, innerIndex) {
      var result3;
      try {
        result3 = this.resultSelector(outerValue, innerValue, outerIndex, innerIndex);
      } catch (err) {
        this.destination.error(err);
        return;
      }
      this.destination.next(result3);
    };
    MergeMapSubscriber2.prototype.notifyComplete = function(innerSub) {
      var buffer = this.buffer;
      this.remove(innerSub);
      this.active--;
      if (buffer.length > 0) {
        this._next(buffer.shift());
      } else if (this.active === 0 && this.hasCompleted) {
        this.destination.complete();
      }
    };
    return MergeMapSubscriber2;
  }(OuterSubscriber_1.OuterSubscriber);
  mergeMap.MergeMapSubscriber = MergeMapSubscriber;
  return mergeMap;
}
var hasRequiredMergeMap;
function requireMergeMap() {
  if (hasRequiredMergeMap)
    return mergeMap$1;
  hasRequiredMergeMap = 1;
  var Observable_1 = requireObservable();
  var mergeMap_1 = requireMergeMap$1();
  Observable_1.Observable.prototype.mergeMap = mergeMap_1.mergeMap;
  Observable_1.Observable.prototype.flatMap = mergeMap_1.mergeMap;
  return mergeMap$1;
}
var _do$1 = {};
var _do = {};
var hasRequired_do$1;
function require_do$1() {
  if (hasRequired_do$1)
    return _do;
  hasRequired_do$1 = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Subscriber_1 = requireSubscriber();
  function _do$12(nextOrObserver, error, complete) {
    return this.lift(new DoOperator(nextOrObserver, error, complete));
  }
  _do._do = _do$12;
  var DoOperator = function() {
    function DoOperator2(nextOrObserver, error, complete) {
      this.nextOrObserver = nextOrObserver;
      this.error = error;
      this.complete = complete;
    }
    DoOperator2.prototype.call = function(subscriber, source) {
      return source.subscribe(new DoSubscriber(subscriber, this.nextOrObserver, this.error, this.complete));
    };
    return DoOperator2;
  }();
  var DoSubscriber = function(_super) {
    __extends(DoSubscriber2, _super);
    function DoSubscriber2(destination, nextOrObserver, error, complete) {
      _super.call(this, destination);
      var safeSubscriber = new Subscriber_1.Subscriber(nextOrObserver, error, complete);
      safeSubscriber.syncErrorThrowable = true;
      this.add(safeSubscriber);
      this.safeSubscriber = safeSubscriber;
    }
    DoSubscriber2.prototype._next = function(value) {
      var safeSubscriber = this.safeSubscriber;
      safeSubscriber.next(value);
      if (safeSubscriber.syncErrorThrown) {
        this.destination.error(safeSubscriber.syncErrorValue);
      } else {
        this.destination.next(value);
      }
    };
    DoSubscriber2.prototype._error = function(err) {
      var safeSubscriber = this.safeSubscriber;
      safeSubscriber.error(err);
      if (safeSubscriber.syncErrorThrown) {
        this.destination.error(safeSubscriber.syncErrorValue);
      } else {
        this.destination.error(err);
      }
    };
    DoSubscriber2.prototype._complete = function() {
      var safeSubscriber = this.safeSubscriber;
      safeSubscriber.complete();
      if (safeSubscriber.syncErrorThrown) {
        this.destination.error(safeSubscriber.syncErrorValue);
      } else {
        this.destination.complete();
      }
    };
    return DoSubscriber2;
  }(Subscriber_1.Subscriber);
  return _do;
}
var hasRequired_do;
function require_do() {
  if (hasRequired_do)
    return _do$1;
  hasRequired_do = 1;
  var Observable_1 = requireObservable();
  var do_1 = require_do$1();
  Observable_1.Observable.prototype.do = do_1._do;
  Observable_1.Observable.prototype._do = do_1._do;
  return _do$1;
}
var defaultIfEmpty$1 = {};
var defaultIfEmpty = {};
var hasRequiredDefaultIfEmpty$1;
function requireDefaultIfEmpty$1() {
  if (hasRequiredDefaultIfEmpty$1)
    return defaultIfEmpty;
  hasRequiredDefaultIfEmpty$1 = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Subscriber_1 = requireSubscriber();
  function defaultIfEmpty$12(defaultValue) {
    if (defaultValue === void 0) {
      defaultValue = null;
    }
    return this.lift(new DefaultIfEmptyOperator(defaultValue));
  }
  defaultIfEmpty.defaultIfEmpty = defaultIfEmpty$12;
  var DefaultIfEmptyOperator = function() {
    function DefaultIfEmptyOperator2(defaultValue) {
      this.defaultValue = defaultValue;
    }
    DefaultIfEmptyOperator2.prototype.call = function(subscriber, source) {
      return source.subscribe(new DefaultIfEmptySubscriber(subscriber, this.defaultValue));
    };
    return DefaultIfEmptyOperator2;
  }();
  var DefaultIfEmptySubscriber = function(_super) {
    __extends(DefaultIfEmptySubscriber2, _super);
    function DefaultIfEmptySubscriber2(destination, defaultValue) {
      _super.call(this, destination);
      this.defaultValue = defaultValue;
      this.isEmpty = true;
    }
    DefaultIfEmptySubscriber2.prototype._next = function(value) {
      this.isEmpty = false;
      this.destination.next(value);
    };
    DefaultIfEmptySubscriber2.prototype._complete = function() {
      if (this.isEmpty) {
        this.destination.next(this.defaultValue);
      }
      this.destination.complete();
    };
    return DefaultIfEmptySubscriber2;
  }(Subscriber_1.Subscriber);
  return defaultIfEmpty;
}
var hasRequiredDefaultIfEmpty;
function requireDefaultIfEmpty() {
  if (hasRequiredDefaultIfEmpty)
    return defaultIfEmpty$1;
  hasRequiredDefaultIfEmpty = 1;
  var Observable_1 = requireObservable();
  var defaultIfEmpty_1 = requireDefaultIfEmpty$1();
  Observable_1.Observable.prototype.defaultIfEmpty = defaultIfEmpty_1.defaultIfEmpty;
  return defaultIfEmpty$1;
}
var materialize$2 = {};
var materialize$1 = {};
var hasRequiredMaterialize$2;
function requireMaterialize$2() {
  if (hasRequiredMaterialize$2)
    return materialize$1;
  hasRequiredMaterialize$2 = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Subscriber_1 = requireSubscriber();
  var Notification_1 = requireNotification();
  function materialize2() {
    return this.lift(new MaterializeOperator());
  }
  materialize$1.materialize = materialize2;
  var MaterializeOperator = function() {
    function MaterializeOperator2() {
    }
    MaterializeOperator2.prototype.call = function(subscriber, source) {
      return source.subscribe(new MaterializeSubscriber(subscriber));
    };
    return MaterializeOperator2;
  }();
  var MaterializeSubscriber = function(_super) {
    __extends(MaterializeSubscriber2, _super);
    function MaterializeSubscriber2(destination) {
      _super.call(this, destination);
    }
    MaterializeSubscriber2.prototype._next = function(value) {
      this.destination.next(Notification_1.Notification.createNext(value));
    };
    MaterializeSubscriber2.prototype._error = function(err) {
      var destination = this.destination;
      destination.next(Notification_1.Notification.createError(err));
      destination.complete();
    };
    MaterializeSubscriber2.prototype._complete = function() {
      var destination = this.destination;
      destination.next(Notification_1.Notification.createComplete());
      destination.complete();
    };
    return MaterializeSubscriber2;
  }(Subscriber_1.Subscriber);
  return materialize$1;
}
var hasRequiredMaterialize$1;
function requireMaterialize$1() {
  if (hasRequiredMaterialize$1)
    return materialize$2;
  hasRequiredMaterialize$1 = 1;
  var Observable_1 = requireObservable();
  var materialize_1 = requireMaterialize$2();
  Observable_1.Observable.prototype.materialize = materialize_1.materialize;
  return materialize$2;
}
var expand$1 = {};
var expand = {};
var hasRequiredExpand$1;
function requireExpand$1() {
  if (hasRequiredExpand$1)
    return expand;
  hasRequiredExpand$1 = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var tryCatch_12 = requireTryCatch();
  var errorObject_1 = requireErrorObject();
  var OuterSubscriber_1 = requireOuterSubscriber();
  var subscribeToResult_1 = requireSubscribeToResult();
  function expand$12(project, concurrent, scheduler) {
    if (concurrent === void 0) {
      concurrent = Number.POSITIVE_INFINITY;
    }
    if (scheduler === void 0) {
      scheduler = void 0;
    }
    concurrent = (concurrent || 0) < 1 ? Number.POSITIVE_INFINITY : concurrent;
    return this.lift(new ExpandOperator(project, concurrent, scheduler));
  }
  expand.expand = expand$12;
  var ExpandOperator = function() {
    function ExpandOperator2(project, concurrent, scheduler) {
      this.project = project;
      this.concurrent = concurrent;
      this.scheduler = scheduler;
    }
    ExpandOperator2.prototype.call = function(subscriber, source) {
      return source.subscribe(new ExpandSubscriber(subscriber, this.project, this.concurrent, this.scheduler));
    };
    return ExpandOperator2;
  }();
  expand.ExpandOperator = ExpandOperator;
  var ExpandSubscriber = function(_super) {
    __extends(ExpandSubscriber2, _super);
    function ExpandSubscriber2(destination, project, concurrent, scheduler) {
      _super.call(this, destination);
      this.project = project;
      this.concurrent = concurrent;
      this.scheduler = scheduler;
      this.index = 0;
      this.active = 0;
      this.hasCompleted = false;
      if (concurrent < Number.POSITIVE_INFINITY) {
        this.buffer = [];
      }
    }
    ExpandSubscriber2.dispatch = function(arg) {
      var subscriber = arg.subscriber, result3 = arg.result, value = arg.value, index = arg.index;
      subscriber.subscribeToProjection(result3, value, index);
    };
    ExpandSubscriber2.prototype._next = function(value) {
      var destination = this.destination;
      if (destination.closed) {
        this._complete();
        return;
      }
      var index = this.index++;
      if (this.active < this.concurrent) {
        destination.next(value);
        var result3 = tryCatch_12.tryCatch(this.project)(value, index);
        if (result3 === errorObject_1.errorObject) {
          destination.error(errorObject_1.errorObject.e);
        } else if (!this.scheduler) {
          this.subscribeToProjection(result3, value, index);
        } else {
          var state = { subscriber: this, result: result3, value, index };
          this.add(this.scheduler.schedule(ExpandSubscriber2.dispatch, 0, state));
        }
      } else {
        this.buffer.push(value);
      }
    };
    ExpandSubscriber2.prototype.subscribeToProjection = function(result3, value, index) {
      this.active++;
      this.add(subscribeToResult_1.subscribeToResult(this, result3, value, index));
    };
    ExpandSubscriber2.prototype._complete = function() {
      this.hasCompleted = true;
      if (this.hasCompleted && this.active === 0) {
        this.destination.complete();
      }
    };
    ExpandSubscriber2.prototype.notifyNext = function(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
      this._next(innerValue);
    };
    ExpandSubscriber2.prototype.notifyComplete = function(innerSub) {
      var buffer = this.buffer;
      this.remove(innerSub);
      this.active--;
      if (buffer && buffer.length > 0) {
        this._next(buffer.shift());
      }
      if (this.hasCompleted && this.active === 0) {
        this.destination.complete();
      }
    };
    return ExpandSubscriber2;
  }(OuterSubscriber_1.OuterSubscriber);
  expand.ExpandSubscriber = ExpandSubscriber;
  return expand;
}
var hasRequiredExpand;
function requireExpand() {
  if (hasRequiredExpand)
    return expand$1;
  hasRequiredExpand = 1;
  var Observable_1 = requireObservable();
  var expand_1 = requireExpand$1();
  Observable_1.Observable.prototype.expand = expand_1.expand;
  return expand$1;
}
var reduce$1 = {};
var reduce = {};
var hasRequiredReduce$1;
function requireReduce$1() {
  if (hasRequiredReduce$1)
    return reduce;
  hasRequiredReduce$1 = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Subscriber_1 = requireSubscriber();
  function reduce$12(accumulator, seed) {
    var hasSeed = false;
    if (arguments.length >= 2) {
      hasSeed = true;
    }
    return this.lift(new ReduceOperator(accumulator, seed, hasSeed));
  }
  reduce.reduce = reduce$12;
  var ReduceOperator = function() {
    function ReduceOperator2(accumulator, seed, hasSeed) {
      if (hasSeed === void 0) {
        hasSeed = false;
      }
      this.accumulator = accumulator;
      this.seed = seed;
      this.hasSeed = hasSeed;
    }
    ReduceOperator2.prototype.call = function(subscriber, source) {
      return source.subscribe(new ReduceSubscriber(subscriber, this.accumulator, this.seed, this.hasSeed));
    };
    return ReduceOperator2;
  }();
  reduce.ReduceOperator = ReduceOperator;
  var ReduceSubscriber = function(_super) {
    __extends(ReduceSubscriber2, _super);
    function ReduceSubscriber2(destination, accumulator, seed, hasSeed) {
      _super.call(this, destination);
      this.accumulator = accumulator;
      this.hasSeed = hasSeed;
      this.index = 0;
      this.hasValue = false;
      this.acc = seed;
      if (!this.hasSeed) {
        this.index++;
      }
    }
    ReduceSubscriber2.prototype._next = function(value) {
      if (this.hasValue || (this.hasValue = this.hasSeed)) {
        this._tryReduce(value);
      } else {
        this.acc = value;
        this.hasValue = true;
      }
    };
    ReduceSubscriber2.prototype._tryReduce = function(value) {
      var result3;
      try {
        result3 = this.accumulator(this.acc, value, this.index++);
      } catch (err) {
        this.destination.error(err);
        return;
      }
      this.acc = result3;
    };
    ReduceSubscriber2.prototype._complete = function() {
      if (this.hasValue || this.hasSeed) {
        this.destination.next(this.acc);
      }
      this.destination.complete();
    };
    return ReduceSubscriber2;
  }(Subscriber_1.Subscriber);
  reduce.ReduceSubscriber = ReduceSubscriber;
  return reduce;
}
var hasRequiredReduce;
function requireReduce() {
  if (hasRequiredReduce)
    return reduce$1;
  hasRequiredReduce = 1;
  var Observable_1 = requireObservable();
  var reduce_1 = requireReduce$1();
  Observable_1.Observable.prototype.reduce = reduce_1.reduce;
  return reduce$1;
}
var toArray$1 = {};
var toArray = {};
var hasRequiredToArray$1;
function requireToArray$1() {
  if (hasRequiredToArray$1)
    return toArray;
  hasRequiredToArray$1 = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Subscriber_1 = requireSubscriber();
  function toArray$12() {
    return this.lift(new ToArrayOperator());
  }
  toArray.toArray = toArray$12;
  var ToArrayOperator = function() {
    function ToArrayOperator2() {
    }
    ToArrayOperator2.prototype.call = function(subscriber, source) {
      return source.subscribe(new ToArraySubscriber(subscriber));
    };
    return ToArrayOperator2;
  }();
  var ToArraySubscriber = function(_super) {
    __extends(ToArraySubscriber2, _super);
    function ToArraySubscriber2(destination) {
      _super.call(this, destination);
      this.array = [];
    }
    ToArraySubscriber2.prototype._next = function(x) {
      this.array.push(x);
    };
    ToArraySubscriber2.prototype._complete = function() {
      this.destination.next(this.array);
      this.destination.complete();
    };
    return ToArraySubscriber2;
  }(Subscriber_1.Subscriber);
  return toArray;
}
var hasRequiredToArray;
function requireToArray() {
  if (hasRequiredToArray)
    return toArray$1;
  hasRequiredToArray = 1;
  var Observable_1 = requireObservable();
  var toArray_1 = requireToArray$1();
  Observable_1.Observable.prototype.toArray = toArray_1.toArray;
  return toArray$1;
}
var map$1 = {};
var map = {};
var hasRequiredMap$1;
function requireMap$1() {
  if (hasRequiredMap$1)
    return map;
  hasRequiredMap$1 = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Subscriber_1 = requireSubscriber();
  function map$12(project, thisArg) {
    if (typeof project !== "function") {
      throw new TypeError("argument is not a function. Are you looking for `mapTo()`?");
    }
    return this.lift(new MapOperator(project, thisArg));
  }
  map.map = map$12;
  var MapOperator = function() {
    function MapOperator2(project, thisArg) {
      this.project = project;
      this.thisArg = thisArg;
    }
    MapOperator2.prototype.call = function(subscriber, source) {
      return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
    };
    return MapOperator2;
  }();
  map.MapOperator = MapOperator;
  var MapSubscriber = function(_super) {
    __extends(MapSubscriber2, _super);
    function MapSubscriber2(destination, project, thisArg) {
      _super.call(this, destination);
      this.project = project;
      this.count = 0;
      this.thisArg = thisArg || this;
    }
    MapSubscriber2.prototype._next = function(value) {
      var result3;
      try {
        result3 = this.project.call(this.thisArg, value, this.count++);
      } catch (err) {
        this.destination.error(err);
        return;
      }
      this.destination.next(result3);
    };
    return MapSubscriber2;
  }(Subscriber_1.Subscriber);
  return map;
}
var hasRequiredMap;
function requireMap() {
  if (hasRequiredMap)
    return map$1;
  hasRequiredMap = 1;
  var Observable_1 = requireObservable();
  var map_1 = requireMap$1();
  Observable_1.Observable.prototype.map = map_1.map;
  return map$1;
}
var filter$1 = {};
var filter = {};
var hasRequiredFilter$1;
function requireFilter$1() {
  if (hasRequiredFilter$1)
    return filter;
  hasRequiredFilter$1 = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Subscriber_1 = requireSubscriber();
  function filter$12(predicate, thisArg) {
    return this.lift(new FilterOperator(predicate, thisArg));
  }
  filter.filter = filter$12;
  var FilterOperator = function() {
    function FilterOperator2(predicate, thisArg) {
      this.predicate = predicate;
      this.thisArg = thisArg;
    }
    FilterOperator2.prototype.call = function(subscriber, source) {
      return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
    };
    return FilterOperator2;
  }();
  var FilterSubscriber = function(_super) {
    __extends(FilterSubscriber2, _super);
    function FilterSubscriber2(destination, predicate, thisArg) {
      _super.call(this, destination);
      this.predicate = predicate;
      this.thisArg = thisArg;
      this.count = 0;
      this.predicate = predicate;
    }
    FilterSubscriber2.prototype._next = function(value) {
      var result3;
      try {
        result3 = this.predicate.call(this.thisArg, value, this.count++);
      } catch (err) {
        this.destination.error(err);
        return;
      }
      if (result3) {
        this.destination.next(value);
      }
    };
    return FilterSubscriber2;
  }(Subscriber_1.Subscriber);
  return filter;
}
var hasRequiredFilter;
function requireFilter() {
  if (hasRequiredFilter)
    return filter$1;
  hasRequiredFilter = 1;
  var Observable_1 = requireObservable();
  var filter_1 = requireFilter$1();
  Observable_1.Observable.prototype.filter = filter_1.filter;
  return filter$1;
}
var _catch$1 = {};
var _catch = {};
var hasRequired_catch$1;
function require_catch$1() {
  if (hasRequired_catch$1)
    return _catch;
  hasRequired_catch$1 = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var OuterSubscriber_1 = requireOuterSubscriber();
  var subscribeToResult_1 = requireSubscribeToResult();
  function _catch$12(selector) {
    var operator = new CatchOperator(selector);
    var caught = this.lift(operator);
    return operator.caught = caught;
  }
  _catch._catch = _catch$12;
  var CatchOperator = function() {
    function CatchOperator2(selector) {
      this.selector = selector;
    }
    CatchOperator2.prototype.call = function(subscriber, source) {
      return source.subscribe(new CatchSubscriber(subscriber, this.selector, this.caught));
    };
    return CatchOperator2;
  }();
  var CatchSubscriber = function(_super) {
    __extends(CatchSubscriber2, _super);
    function CatchSubscriber2(destination, selector, caught) {
      _super.call(this, destination);
      this.selector = selector;
      this.caught = caught;
    }
    CatchSubscriber2.prototype.error = function(err) {
      if (!this.isStopped) {
        var result3 = void 0;
        try {
          result3 = this.selector(err, this.caught);
        } catch (err2) {
          _super.prototype.error.call(this, err2);
          return;
        }
        this._unsubscribeAndRecycle();
        this.add(subscribeToResult_1.subscribeToResult(this, result3));
      }
    };
    return CatchSubscriber2;
  }(OuterSubscriber_1.OuterSubscriber);
  return _catch;
}
var hasRequired_catch;
function require_catch() {
  if (hasRequired_catch)
    return _catch$1;
  hasRequired_catch = 1;
  var Observable_1 = requireObservable();
  var catch_1 = require_catch$1();
  Observable_1.Observable.prototype.catch = catch_1._catch;
  Observable_1.Observable.prototype._catch = catch_1._catch;
  return _catch$1;
}
var concat$1 = {};
var concat = {};
var mergeAll = {};
var hasRequiredMergeAll;
function requireMergeAll() {
  if (hasRequiredMergeAll)
    return mergeAll;
  hasRequiredMergeAll = 1;
  var __extends = commonjsGlobal && commonjsGlobal.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var OuterSubscriber_1 = requireOuterSubscriber();
  var subscribeToResult_1 = requireSubscribeToResult();
  function mergeAll$1(concurrent) {
    if (concurrent === void 0) {
      concurrent = Number.POSITIVE_INFINITY;
    }
    return this.lift(new MergeAllOperator(concurrent));
  }
  mergeAll.mergeAll = mergeAll$1;
  var MergeAllOperator = function() {
    function MergeAllOperator2(concurrent) {
      this.concurrent = concurrent;
    }
    MergeAllOperator2.prototype.call = function(observer, source) {
      return source.subscribe(new MergeAllSubscriber(observer, this.concurrent));
    };
    return MergeAllOperator2;
  }();
  mergeAll.MergeAllOperator = MergeAllOperator;
  var MergeAllSubscriber = function(_super) {
    __extends(MergeAllSubscriber2, _super);
    function MergeAllSubscriber2(destination, concurrent) {
      _super.call(this, destination);
      this.concurrent = concurrent;
      this.hasCompleted = false;
      this.buffer = [];
      this.active = 0;
    }
    MergeAllSubscriber2.prototype._next = function(observable2) {
      if (this.active < this.concurrent) {
        this.active++;
        this.add(subscribeToResult_1.subscribeToResult(this, observable2));
      } else {
        this.buffer.push(observable2);
      }
    };
    MergeAllSubscriber2.prototype._complete = function() {
      this.hasCompleted = true;
      if (this.active === 0 && this.buffer.length === 0) {
        this.destination.complete();
      }
    };
    MergeAllSubscriber2.prototype.notifyComplete = function(innerSub) {
      var buffer = this.buffer;
      this.remove(innerSub);
      this.active--;
      if (buffer.length > 0) {
        this._next(buffer.shift());
      } else if (this.active === 0 && this.hasCompleted) {
        this.destination.complete();
      }
    };
    return MergeAllSubscriber2;
  }(OuterSubscriber_1.OuterSubscriber);
  mergeAll.MergeAllSubscriber = MergeAllSubscriber;
  return mergeAll;
}
var hasRequiredConcat$1;
function requireConcat$1() {
  if (hasRequiredConcat$1)
    return concat;
  hasRequiredConcat$1 = 1;
  var isScheduler_1 = requireIsScheduler();
  var ArrayObservable_1 = requireArrayObservable();
  var mergeAll_1 = requireMergeAll();
  function concat$12() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      observables[_i - 0] = arguments[_i];
    }
    return this.lift.call(concatStatic.apply(void 0, [this].concat(observables)));
  }
  concat.concat = concat$12;
  function concatStatic() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      observables[_i - 0] = arguments[_i];
    }
    var scheduler = null;
    var args = observables;
    if (isScheduler_1.isScheduler(args[observables.length - 1])) {
      scheduler = args.pop();
    }
    if (scheduler === null && observables.length === 1) {
      return observables[0];
    }
    return new ArrayObservable_1.ArrayObservable(observables, scheduler).lift(new mergeAll_1.MergeAllOperator(1));
  }
  concat.concatStatic = concatStatic;
  return concat;
}
var hasRequiredConcat;
function requireConcat() {
  if (hasRequiredConcat)
    return concat$1;
  hasRequiredConcat = 1;
  var Observable_1 = requireObservable();
  var concat_1 = requireConcat$1();
  Observable_1.Observable.prototype.concat = concat_1.concat;
  return concat$1;
}
var RouterRx_1;
var hasRequiredRouterRx;
function requireRouterRx() {
  if (hasRequiredRouterRx)
    return RouterRx_1;
  hasRequiredRouterRx = 1;
  var RouterRx = {
    Observable: requireObservable().Observable,
    Scheduler: {
      queue: requireQueue().queue
    }
  };
  requireDefer();
  requireOf();
  requireFrom();
  require_throw();
  requireEmpty();
  requireMergeMap();
  require_do();
  requireDefaultIfEmpty();
  requireMaterialize$1();
  requireExpand();
  requireReduce();
  requireToArray();
  requireMap();
  requireFilter();
  require_catch();
  requireConcat();
  RouterRx_1 = RouterRx;
  return RouterRx_1;
}
function symbolObservablePonyfill2(root3) {
  var result3;
  var Symbol2 = root3.Symbol;
  if (typeof Symbol2 === "function") {
    if (Symbol2.observable) {
      result3 = Symbol2.observable;
    } else {
      result3 = Symbol2("observable");
      Symbol2.observable = result3;
    }
  } else {
    result3 = "@@observable";
  }
  return result3;
}
var root2;
if (typeof self !== "undefined") {
  root2 = self;
} else if (typeof window !== "undefined") {
  root2 = window;
} else if (typeof global !== "undefined") {
  root2 = global;
} else if (typeof module !== "undefined") {
  root2 = module;
} else {
  root2 = Function("return this")();
}
var result2 = symbolObservablePonyfill2(root2);
var es2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: result2
});
var require$$1 = /* @__PURE__ */ getAugmentedNamespace2(es2);
var outputToObservable;
var hasRequiredOutputToObservable;
function requireOutputToObservable() {
  if (hasRequiredOutputToObservable)
    return outputToObservable;
  hasRequiredOutputToObservable = 1;
  var Observable3 = requireRouterRx().Observable;
  var isArray2 = Array.isArray;
  var $$observable = require$$1.default;
  outputToObservable = function outputToObservable2(valueOrObservable) {
    var value = valueOrObservable;
    if (value instanceof Observable3) {
      return value;
    }
    if (!value) {
      return Observable3.of(value);
    }
    if (value[$$observable]) {
      return Observable3.from(value);
    }
    if (value.subscribe) {
      var oldObservable = value;
      return Observable3.create(function(observer) {
        var oldObserver = {
          onNext: function(v2) {
            this.observer.next(v2);
          },
          onError: function(err) {
            this.observer.error(err);
          },
          onCompleted: function() {
            this.observer.complete();
          },
          observer
        };
        var oldSubscription = oldObservable.subscribe(oldObserver);
        return function() {
          oldSubscription.dispose();
        };
      });
    }
    if (value.then) {
      return Observable3.from(value);
    }
    if (isArray2(value)) {
      return Observable3.of(value);
    }
    return Observable3.of(value);
  };
  return outputToObservable;
}
var isJSONG;
var hasRequiredIsJSONG;
function requireIsJSONG() {
  if (hasRequiredIsJSONG)
    return isJSONG;
  hasRequiredIsJSONG = 1;
  isJSONG = function isJSONG2(x) {
    return x.jsonGraph;
  };
  return isJSONG;
}
var errorToPathValue;
var hasRequiredErrorToPathValue;
function requireErrorToPathValue() {
  if (hasRequiredErrorToPathValue)
    return errorToPathValue;
  hasRequiredErrorToPathValue = 1;
  var JSONGraphError3 = JSONGraphErrorExports;
  errorToPathValue = function errorToPathValue2(error, path) {
    var typeValue = {
      $type: "error",
      value: {}
    };
    if (error.throwToNext) {
      throw error;
    }
    if (error instanceof JSONGraphError3) {
      typeValue = error.typeValue;
    } else if (error instanceof Error) {
      typeValue.value.message = error.message;
    }
    return {
      path,
      value: typeValue
    };
  };
  return errorToPathValue;
}
var noteToJsongOrPV;
var hasRequiredNoteToJsongOrPV;
function requireNoteToJsongOrPV() {
  if (hasRequiredNoteToJsongOrPV)
    return noteToJsongOrPV;
  hasRequiredNoteToJsongOrPV = 1;
  var isJSONG2 = requireIsJSONG();
  var onNext = "N";
  var errorToPathValue2 = requireErrorToPathValue();
  noteToJsongOrPV = function noteToJsongOrPV2(pathOrPathSet, isPathSet, routerInstance) {
    return function(note) {
      return convertNoteToJsongOrPV(
        pathOrPathSet,
        note,
        isPathSet,
        routerInstance
      );
    };
  };
  function convertNoteToJsongOrPV(pathOrPathSet, note, isPathSet, routerInstance) {
    var incomingJSONGOrPathValues;
    var kind = note.kind;
    if (kind === onNext) {
      incomingJSONGOrPathValues = note.value;
    } else {
      incomingJSONGOrPathValues = errorToPathValue2(note.error, pathOrPathSet);
      if (routerInstance._errorHook) {
        routerInstance._errorHook(note.error);
      }
    }
    if (isJSONG2(incomingJSONGOrPathValues) && !incomingJSONGOrPathValues.paths) {
      incomingJSONGOrPathValues = {
        jsonGraph: incomingJSONGOrPathValues.jsonGraph,
        paths: isPathSet && pathOrPathSet || [pathOrPathSet]
      };
    }
    return incomingJSONGOrPathValues;
  }
  return noteToJsongOrPV;
}
var runGetAction;
var hasRequiredRunGetAction;
function requireRunGetAction() {
  if (hasRequiredRunGetAction)
    return runGetAction;
  hasRequiredRunGetAction = 1;
  var outputToObservable2 = requireOutputToObservable();
  var noteToJsongOrPV2 = requireNoteToJsongOrPV();
  var Observable3 = requireRouterRx().Observable;
  runGetAction = function runGetAction2(routerInstance, jsongCache, methodSummary) {
    return function innerGetAction(matchAndPath) {
      return getAction(
        routerInstance,
        matchAndPath,
        jsongCache,
        methodSummary
      );
    };
  };
  function getAction(routerInstance, matchAndPath, jsongCache, methodSummary) {
    var match2 = matchAndPath.match;
    var out;
    try {
      out = match2.action.call(routerInstance, matchAndPath.path);
      out = outputToObservable2(out);
      if (methodSummary) {
        var _out = out;
        out = Observable3.defer(function() {
          var route = {
            start: routerInstance._now(),
            route: matchAndPath.match.prettyRoute,
            pathSet: matchAndPath.path,
            results: []
          };
          methodSummary.routes.push(route);
          return _out.do(function(response) {
            route.results.push({
              time: routerInstance._now(),
              value: response
            });
          }, function(err) {
            route.error = err;
            route.end = routerInstance._now();
          }, function() {
            route.end = routerInstance._now();
          });
        });
      }
    } catch (e2) {
      out = Observable3.throw(e2);
    }
    return out.materialize().filter(function(note) {
      return note.kind !== "C";
    }).map(noteToJsongOrPV2(matchAndPath.path, false, routerInstance)).map(function(jsonGraphOrPV) {
      return [matchAndPath.match, jsonGraphOrPV];
    });
  }
  return runGetAction;
}
var stripFromRange;
var hasRequiredStripFromRange;
function requireStripFromRange() {
  if (hasRequiredStripFromRange)
    return stripFromRange;
  hasRequiredStripFromRange = 1;
  var isArray2 = Array.isArray;
  var rangeToArray2 = rangeToArray$2;
  var isNumber2 = isNumber$2;
  stripFromRange = function stripFromRange2(argToStrip, range3) {
    var ranges = [];
    var matches = [];
    var toStrip = argToStrip;
    var toStripIsNumber = isNumber2(toStrip);
    if (toStripIsNumber) {
      toStrip = +toStrip;
    }
    if (!toStripIsNumber && typeof toStrip === "string") {
      ranges = [range3];
    } else if (isArray2(toStrip)) {
      var currenRanges = [range3];
      toStrip.forEach(function(atom) {
        var nextRanges = [];
        currenRanges.forEach(function(currentRename) {
          var matchAndComplement = stripFromRange2(atom, currentRename);
          if (matchAndComplement[0] !== void 0) {
            matches = matches.concat(matchAndComplement[0]);
          }
          nextRanges = nextRanges.concat(matchAndComplement[1]);
        });
        currenRanges = nextRanges;
      });
      ranges = currenRanges;
    } else if (toStripIsNumber) {
      if (range3.from < toStrip && toStrip < range3.to) {
        ranges[0] = {
          from: range3.from,
          to: toStrip - 1
        };
        ranges[1] = {
          from: toStrip + 1,
          to: range3.to
        };
        matches = [toStrip];
      } else if (range3.from === toStrip && range3.to === toStrip) {
        ranges = [];
        matches = [toStrip];
      } else if (range3.from === toStrip) {
        ranges[0] = {
          from: toStrip + 1,
          to: range3.to
        };
        matches = [toStrip];
      } else if (range3.to === toStrip) {
        ranges[0] = {
          from: range3.from,
          to: toStrip - 1
        };
        matches = [toStrip];
      } else {
        ranges = [range3];
      }
    } else {
      matches = rangeToArray2(range3);
    }
    return [matches, ranges];
  };
  return stripFromRange;
}
var stripFromArray;
var hasRequiredStripFromArray;
function requireStripFromArray() {
  if (hasRequiredStripFromArray)
    return stripFromArray;
  hasRequiredStripFromArray = 1;
  var stripFromRange2 = requireStripFromRange();
  var Keys2 = Keys_1;
  var isArray2 = Array.isArray;
  stripFromArray = function stripFromArray2(toStrip, array) {
    var complement;
    var matches = [];
    var typeToStrip = typeof toStrip;
    var isRangedArray = typeof array[0] === "object";
    var isNumber2 = typeToStrip === "number";
    var isString = typeToStrip === "string";
    var isRoutedToken3 = !isNumber2 && !isString;
    var routeType = isRoutedToken3 && toStrip.type || false;
    var isKeys = routeType === Keys2.keys;
    var toStripIsArray = isArray2(toStrip);
    if (isKeys) {
      complement = [];
      matches = array;
    } else if (toStripIsArray) {
      var currentArray = array;
      toStrip.forEach(function(atom) {
        var results = stripFromArray2(atom, currentArray);
        if (results[0] !== void 0) {
          matches = matches.concat(results[0]);
        }
        currentArray = results[1];
      });
      complement = currentArray;
    } else if (!isRangedArray && !isRoutedToken3) {
      matches = [toStrip];
      complement = array.filter(function(x) {
        return toStrip !== x;
      });
    } else if (isRangedArray && !isRoutedToken3) {
      complement = array.reduce(function(comp, range3) {
        var results = stripFromRange2(toStrip, range3);
        if (results[0] !== void 0) {
          matches = matches.concat(results[0]);
        }
        return comp.concat(results[1]);
      }, []);
    } else if (!isRangedArray && isRoutedToken3) {
      complement = array.filter(function(el) {
        var type = typeof el;
        if (type === "number") {
          matches[matches.length] = el;
          return false;
        }
        return true;
      });
    } else {
      complement = [];
      matches = array;
    }
    return [matches, complement];
  };
  return stripFromArray;
}
var strip;
var hasRequiredStrip;
function requireStrip() {
  if (hasRequiredStrip)
    return strip;
  hasRequiredStrip = 1;
  var isArray2 = Array.isArray;
  var stripFromArray2 = requireStripFromArray();
  var stripFromRange2 = requireStripFromRange();
  strip = function strip2(matchedAtom, virtualAtom) {
    var relativeComplement = [];
    var matchedResults;
    var typeOfMatched = typeof matchedAtom;
    var isArrayMatched = isArray2(matchedAtom);
    var isObjectMatched = typeOfMatched === "object";
    if (matchedAtom === virtualAtom || String(matchedAtom) === String(virtualAtom)) {
      matchedResults = [matchedAtom];
    } else if (!isObjectMatched) {
      matchedResults = [matchedAtom];
    } else {
      var results;
      if (isArrayMatched) {
        results = stripFromArray2(virtualAtom, matchedAtom);
        matchedResults = results[0];
        relativeComplement = results[1];
      } else {
        results = stripFromRange2(virtualAtom, matchedAtom);
        matchedResults = results[0];
        relativeComplement = results[1];
      }
    }
    if (matchedResults.length === 1) {
      matchedResults = matchedResults[0];
    }
    return [matchedResults, relativeComplement];
  };
  return strip;
}
var catAndSlice;
var hasRequiredCatAndSlice;
function requireCatAndSlice() {
  if (hasRequiredCatAndSlice)
    return catAndSlice;
  hasRequiredCatAndSlice = 1;
  catAndSlice = function catAndSlice2(a2, b, slice3) {
    var next = [], i2, j, len;
    for (i2 = 0, len = a2.length; i2 < len; ++i2) {
      next[i2] = a2[i2];
    }
    for (j = slice3 || 0, len = b.length; j < len; ++j, ++i2) {
      next[i2] = b[j];
    }
    return next;
  };
  return catAndSlice;
}
var stripPath;
var hasRequiredStripPath;
function requireStripPath() {
  if (hasRequiredStripPath)
    return stripPath;
  hasRequiredStripPath = 1;
  var strip2 = requireStrip();
  var catAndSlice2 = requireCatAndSlice();
  stripPath = function stripPath2(matchedPath, virtualPath) {
    var relativeComplement = [];
    var exactMatch = [];
    var current = [];
    for (var i2 = 0, len = virtualPath.length; i2 < len; ++i2) {
      var matchedAtom = matchedPath[i2];
      var virtualAtom = virtualPath[i2];
      var stripResults = strip2(matchedAtom, virtualAtom);
      var innerMatch = stripResults[0];
      var innerComplement = stripResults[1];
      var hasComplement = innerComplement.length > 0;
      if (hasComplement) {
        var flattendIC = innerComplement.length === 1 ? innerComplement[0] : innerComplement;
        current[i2] = flattendIC;
        relativeComplement[relativeComplement.length] = catAndSlice2(current, matchedPath, i2 + 1);
      }
      exactMatch[i2] = innerMatch;
      current[i2] = innerMatch;
    }
    return [exactMatch, relativeComplement];
  };
  return stripPath;
}
var isRange;
var hasRequiredIsRange;
function requireIsRange() {
  if (hasRequiredIsRange)
    return isRange;
  hasRequiredIsRange = 1;
  isRange = function isRange2(range3) {
    return range3.hasOwnProperty("to") && range3.hasOwnProperty("from");
  };
  return isRange;
}
var hasAtomIntersection;
var hasRequiredHasAtomIntersection;
function requireHasAtomIntersection() {
  if (hasRequiredHasAtomIntersection)
    return hasAtomIntersection;
  hasRequiredHasAtomIntersection = 1;
  var Keys2 = Keys_1;
  var isArray2 = Array.isArray;
  var isRoutedToken3 = isRoutedToken$1;
  var isRange2 = requireIsRange();
  hasAtomIntersection = function hasAtomIntersection2(matchedAtom, virtualAtom) {
    var virtualIsRoutedToken = isRoutedToken3(virtualAtom);
    var isKeys = virtualIsRoutedToken && virtualAtom.type === Keys2.keys;
    var matched = false;
    var i2, len;
    if (isArray2(matchedAtom)) {
      for (i2 = 0, len = matchedAtom.length; i2 < len && !matched; ++i2) {
        matched = hasAtomIntersection2(matchedAtom[i2], virtualAtom);
      }
    } else if (doubleEquals(matchedAtom, virtualAtom)) {
      matched = true;
    } else if (isKeys) {
      matched = true;
    } else if (virtualIsRoutedToken) {
      matched = isNumber2(matchedAtom) || isRange2(matchedAtom);
    } else if (isArray2(virtualAtom)) {
      for (i2 = 0, len = virtualAtom.length; i2 < len && !matched; ++i2) {
        matched = hasAtomIntersection2(matchedAtom, virtualAtom[i2]);
      }
    }
    return matched;
  };
  function isNumber2(x) {
    return String(Number(x)) === String(x);
  }
  function doubleEquals(a2, b) {
    return a2 == b;
  }
  return hasAtomIntersection;
}
var hasIntersection;
var hasRequiredHasIntersection;
function requireHasIntersection() {
  if (hasRequiredHasIntersection)
    return hasIntersection;
  hasRequiredHasIntersection = 1;
  var hasAtomIntersection2 = requireHasAtomIntersection();
  hasIntersection = function hasIntersection2(matchedPath, virtualPath) {
    var intersection = true;
    for (var i2 = 0, len = virtualPath.length; i2 < len && intersection; ++i2) {
      intersection = hasAtomIntersection2(matchedPath[i2], virtualPath[i2]);
    }
    return intersection;
  };
  return hasIntersection;
}
var getExecutableMatches;
var hasRequiredGetExecutableMatches;
function requireGetExecutableMatches() {
  if (hasRequiredGetExecutableMatches)
    return getExecutableMatches;
  hasRequiredGetExecutableMatches = 1;
  var pathUtils2 = requireLib();
  var collapse2 = pathUtils2.collapse;
  var stripPath2 = requireStripPath();
  var hasIntersection2 = requireHasIntersection();
  getExecutableMatches = function getExecutableMatches2(matches, pathSet) {
    var remainingPaths = pathSet;
    var matchAndPaths = [];
    var out = {
      matchAndPaths,
      unhandledPaths: false
    };
    for (var i2 = 0; i2 < matches.length && remainingPaths.length > 0; ++i2) {
      var availablePaths = remainingPaths;
      var match2 = matches[i2];
      remainingPaths = [];
      if (i2 > 0) {
        availablePaths = collapse2(availablePaths);
      }
      for (var j = 0; j < availablePaths.length; ++j) {
        var path = availablePaths[j];
        if (hasIntersection2(path, match2.virtual)) {
          var stripResults = stripPath2(path, match2.virtual);
          matchAndPaths[matchAndPaths.length] = {
            path: stripResults[0],
            match: match2
          };
          remainingPaths = remainingPaths.concat(stripResults[1]);
        } else if (i2 < matches.length - 1) {
          remainingPaths[remainingPaths.length] = path;
        }
      }
    }
    if (remainingPaths && remainingPaths.length) {
      out.unhandledPaths = remainingPaths;
    }
    return out;
  };
  return getExecutableMatches;
}
var runByPrecedence;
var hasRequiredRunByPrecedence;
function requireRunByPrecedence() {
  if (hasRequiredRunByPrecedence)
    return runByPrecedence;
  hasRequiredRunByPrecedence = 1;
  var Observable3 = requireRouterRx().Observable;
  var getExecutableMatches2 = requireGetExecutableMatches();
  runByPrecedence = function runByPrecedence2(pathSet, matches, actionRunner) {
    var sortedMatches = matches.sort(function(a2, b) {
      if (a2.precedence < b.precedence) {
        return 1;
      } else if (a2.precedence > b.precedence) {
        return -1;
      }
      return 0;
    });
    var execs = getExecutableMatches2(sortedMatches, [pathSet]);
    var setOfMatchedPaths = Observable3.from(execs.matchAndPaths).flatMap(actionRunner).map(function(actionTuple) {
      return {
        match: actionTuple[0],
        value: actionTuple[1]
      };
    });
    if (execs.unhandledPaths) {
      setOfMatchedPaths = setOfMatchedPaths.concat(Observable3.of({
        match: { suffix: [] },
        value: {
          isMessage: true,
          unhandledPaths: execs.unhandledPaths
        }
      }));
    }
    return setOfMatchedPaths;
  };
  return runByPrecedence;
}
var types;
var hasRequiredTypes;
function requireTypes() {
  if (hasRequiredTypes)
    return types;
  hasRequiredTypes = 1;
  types = {
    $ref: "ref",
    $atom: "atom",
    $error: "error"
  };
  return types;
}
var followReference;
var hasRequiredFollowReference;
function requireFollowReference() {
  if (hasRequiredFollowReference)
    return followReference;
  hasRequiredFollowReference = 1;
  var cloneArray2 = cloneArray_1$1;
  var $ref = requireTypes().$ref;
  var errors2 = exceptions;
  followReference = function followReference2(cacheRoot, ref, maxRefFollow) {
    var current = cacheRoot;
    var refPath = ref;
    var depth = -1;
    var length = refPath.length;
    var key, next, type;
    var referenceCount = 0;
    while (++depth < length) {
      key = refPath[depth];
      next = current[key];
      type = next && next.$type;
      if (!next || type && type !== $ref) {
        current = next;
        break;
      }
      if (type && type === $ref && depth + 1 < length) {
        var err = new Error(errors2.innerReferences);
        err.throwToNext = true;
        throw err;
      }
      if (depth + 1 === length) {
        if (type === $ref) {
          depth = -1;
          refPath = next.value;
          length = refPath.length;
          next = cacheRoot;
          referenceCount++;
        }
        if (referenceCount > maxRefFollow) {
          throw new Error(errors2.circularReference);
        }
      }
      current = next;
    }
    return [current, cloneArray2(refPath)];
  };
  return followReference;
}
var optimizePathSets;
var hasRequiredOptimizePathSets;
function requireOptimizePathSets() {
  if (hasRequiredOptimizePathSets)
    return optimizePathSets;
  hasRequiredOptimizePathSets = 1;
  var iterateKeySet2 = requireLib().iterateKeySet;
  var cloneArray2 = cloneArray_1$1;
  var catAndSlice2 = requireCatAndSlice();
  var $types = requireTypes();
  var $ref = $types.$ref;
  var followReference2 = requireFollowReference();
  optimizePathSets = function optimizePathSets2(cache, paths, maxRefFollow) {
    var optimized = [];
    paths.forEach(function(p) {
      optimizePathSet(cache, cache, p, 0, optimized, [], maxRefFollow);
    });
    return optimized;
  };
  function optimizePathSet(cache, cacheRoot, pathSet, depth, out, optimizedPath, maxRefFollow) {
    if (cache === void 0) {
      out[out.length] = catAndSlice2(optimizedPath, pathSet, depth);
      return;
    }
    if (cache === null || cache.$type && cache.$type !== $ref || typeof cache !== "object") {
      return;
    }
    if (cache.$type === $ref && depth === pathSet.length) {
      return;
    }
    var keySet = pathSet[depth];
    var nextDepth = depth + 1;
    var iteratorNote = {};
    var key, next, nextOptimized;
    key = iterateKeySet2(keySet, iteratorNote);
    do {
      next = cache[key];
      var optimizedPathLength = optimizedPath.length;
      if (key !== null) {
        optimizedPath[optimizedPathLength] = key;
      }
      if (next && next.$type === $ref && nextDepth < pathSet.length) {
        var refResults = followReference2(cacheRoot, next.value, maxRefFollow);
        next = refResults[0];
        nextOptimized = cloneArray2(refResults[1]);
      } else {
        nextOptimized = optimizedPath;
      }
      optimizePathSet(
        next,
        cacheRoot,
        pathSet,
        nextDepth,
        out,
        nextOptimized,
        maxRefFollow
      );
      optimizedPath.length = optimizedPathLength;
      if (!iteratorNote.done) {
        key = iterateKeySet2(keySet, iteratorNote);
      }
    } while (!iteratorNote.done);
  }
  return optimizePathSets;
}
var clone;
var hasRequiredClone;
function requireClone() {
  if (hasRequiredClone)
    return clone;
  hasRequiredClone = 1;
  clone = function copy(valueType) {
    if (typeof valueType !== "object" || valueType === null) {
      return valueType;
    }
    return Object.keys(valueType).reduce(function(acc, k) {
      acc[k] = valueType[k];
      return acc;
    }, {});
  };
  return clone;
}
var jsongMerge;
var hasRequiredJsongMerge;
function requireJsongMerge() {
  if (hasRequiredJsongMerge)
    return jsongMerge;
  hasRequiredJsongMerge = 1;
  var iterateKeySet2 = requireLib().iterateKeySet;
  var types2 = requireTypes();
  var $ref = types2.$ref;
  var $error = types2.$error;
  var clone2 = requireClone();
  var cloneArray2 = cloneArray_1$1;
  var catAndSlice2 = requireCatAndSlice();
  jsongMerge = function jsongMerge2(cache, jsongEnv, routerInstance) {
    var paths = jsongEnv.paths;
    var j = jsongEnv.jsonGraph;
    var references = [];
    var values = [];
    paths.forEach(function(p) {
      merge({
        router: routerInstance,
        cacheRoot: cache,
        messageRoot: j,
        references,
        values,
        requestedPath: [],
        requestIdx: -1,
        ignoreCount: 0
      }, cache, j, 0, p);
    });
    return {
      references,
      values
    };
  };
  function merge(config, cache, message, depth, path, fromParent, fromKey) {
    var cacheRoot = config.cacheRoot;
    var messageRoot = config.messageRoot;
    var requestedPath = config.requestedPath;
    var ignoreCount = config.ignoreCount;
    var typeOfMessage = typeof message;
    var requestIdx = config.requestIdx;
    var updateRequestedPath = ignoreCount <= depth;
    if (updateRequestedPath) {
      requestIdx = ++config.requestIdx;
    }
    if (message === null || typeOfMessage !== "object" || message.$type) {
      fromParent[fromKey] = clone2(message);
      if (message && message.$type === $error) {
        config.router._pathErrorHook({ path, value: message });
      }
      if (message && message.$type === $ref) {
        var references = config.references;
        references.push({
          path: cloneArray2(requestedPath),
          value: message.value
        });
      } else {
        var values = config.values;
        values.push({
          path: cloneArray2(requestedPath),
          value: message && message.type ? message.value : message
        });
      }
      return;
    }
    var outerKey = path[depth];
    var iteratorNote = {};
    var key;
    key = iterateKeySet2(outerKey, iteratorNote);
    do {
      var cacheRes = cache[key];
      var messageRes = message[key];
      if (messageRes !== void 0) {
        var nextPath = path;
        var nextDepth = depth + 1;
        if (updateRequestedPath) {
          requestedPath[requestIdx] = key;
        }
        if (cacheRes === void 0) {
          cacheRes = cache[key] = {};
        }
        var nextIgnoreCount = ignoreCount;
        if (messageRes && messageRes.$type === $ref && depth < path.length - 1) {
          nextDepth = 0;
          nextPath = catAndSlice2(messageRes.value, path, depth + 1);
          cache[key] = clone2(messageRes);
          nextIgnoreCount = messageRes.value.length;
          messageRes = messageRoot;
          cacheRes = cacheRoot;
        }
        config.ignoreCount = nextIgnoreCount;
        merge(
          config,
          cacheRes,
          messageRes,
          nextDepth,
          nextPath,
          cache,
          key
        );
        config.ignoreCount = ignoreCount;
      }
      if (updateRequestedPath) {
        requestedPath.length = requestIdx;
      }
      key = iterateKeySet2(outerKey, iteratorNote);
    } while (!iteratorNote.done);
  }
  return jsongMerge;
}
var pathValueMerge;
var hasRequiredPathValueMerge;
function requirePathValueMerge() {
  if (hasRequiredPathValueMerge)
    return pathValueMerge;
  hasRequiredPathValueMerge = 1;
  var clone2 = requireClone();
  var types2 = requireTypes();
  var $ref = types2.$ref;
  var iterateKeySet2 = requireLib().iterateKeySet;
  pathValueMerge = function pathValueMerge2(cache, pathValue) {
    var refs = [];
    var values = [];
    var invalidations = [];
    var valueType = true;
    if (pathValue.invalidated === true) {
      invalidations.push({ path: pathValue.path });
      valueType = false;
    } else if (pathValue.value !== null && pathValue.value.$type === $ref) {
      refs.push({
        path: pathValue.path,
        value: pathValue.value.value
      });
    } else {
      values.push(pathValue);
    }
    if (valueType) {
      innerPathValueMerge(cache, pathValue);
    }
    return {
      references: refs,
      values,
      invalidations
    };
  };
  function innerPathValueMerge(cache, pathValue) {
    var path = pathValue.path;
    var curr = cache;
    var next, key, cloned, outerKey, iteratorNote;
    var i2, len;
    for (i2 = 0, len = path.length - 1; i2 < len; ++i2) {
      outerKey = path[i2];
      if (outerKey && typeof outerKey === "object") {
        iteratorNote = {};
        key = iterateKeySet2(outerKey, iteratorNote);
      } else {
        key = outerKey;
        iteratorNote = false;
      }
      do {
        next = curr[key];
        if (!next) {
          next = curr[key] = {};
        }
        if (iteratorNote) {
          innerPathValueMerge(
            next,
            {
              path: path.slice(i2 + 1),
              value: pathValue.value
            }
          );
          if (!iteratorNote.done) {
            key = iterateKeySet2(outerKey, iteratorNote);
          }
        } else {
          curr = next;
        }
      } while (iteratorNote && !iteratorNote.done);
      if (iteratorNote) {
        return;
      }
    }
    outerKey = path[i2];
    iteratorNote = {};
    key = iterateKeySet2(outerKey, iteratorNote);
    do {
      cloned = clone2(pathValue.value);
      curr[key] = cloned;
      if (!iteratorNote.done) {
        key = iterateKeySet2(outerKey, iteratorNote);
      }
    } while (!iteratorNote.done);
  }
  return pathValueMerge;
}
var isMessage;
var hasRequiredIsMessage;
function requireIsMessage() {
  if (hasRequiredIsMessage)
    return isMessage;
  hasRequiredIsMessage = 1;
  isMessage = function isMessage2(output) {
    return output.hasOwnProperty("isMessage");
  };
  return isMessage;
}
var mergeCacheAndGatherRefsAndInvalidations_1;
var hasRequiredMergeCacheAndGatherRefsAndInvalidations;
function requireMergeCacheAndGatherRefsAndInvalidations() {
  if (hasRequiredMergeCacheAndGatherRefsAndInvalidations)
    return mergeCacheAndGatherRefsAndInvalidations_1;
  hasRequiredMergeCacheAndGatherRefsAndInvalidations = 1;
  var jsongMerge2 = requireJsongMerge();
  var pathValueMerge2 = requirePathValueMerge();
  var isJSONG2 = requireIsJSONG();
  var isMessage2 = requireIsMessage();
  mergeCacheAndGatherRefsAndInvalidations_1 = mergeCacheAndGatherRefsAndInvalidations;
  function mergeCacheAndGatherRefsAndInvalidations(cache, jsongOrPVs, routerInstance) {
    var references = [];
    var len = -1;
    var invalidations = [];
    var unhandledPaths = [];
    var messages = [];
    var values = [];
    jsongOrPVs.forEach(function(jsongOrPV) {
      var refsAndValues = [];
      if (isMessage2(jsongOrPV)) {
        messages[messages.length] = jsongOrPV;
      } else if (isJSONG2(jsongOrPV)) {
        refsAndValues = jsongMerge2(cache, jsongOrPV, routerInstance);
      } else {
        refsAndValues = pathValueMerge2(cache, jsongOrPV);
      }
      var refs = refsAndValues.references;
      var vals = refsAndValues.values;
      var invs = refsAndValues.invalidations;
      var unhandled = refsAndValues.unhandledPaths;
      if (vals && vals.length) {
        values = values.concat(vals);
      }
      if (invs && invs.length) {
        invalidations = invalidations.concat(invs);
      }
      if (unhandled && unhandled.length) {
        unhandledPaths = unhandledPaths.concat(unhandled);
      }
      if (refs && refs.length) {
        refs.forEach(function(ref) {
          references[++len] = ref;
        });
      }
    });
    return {
      invalidations,
      references,
      messages,
      values,
      unhandledPaths
    };
  }
  return mergeCacheAndGatherRefsAndInvalidations_1;
}
var recurseMatchAndExecute;
var hasRequiredRecurseMatchAndExecute;
function requireRecurseMatchAndExecute() {
  if (hasRequiredRecurseMatchAndExecute)
    return recurseMatchAndExecute;
  hasRequiredRecurseMatchAndExecute = 1;
  var Rx = requireRouterRx();
  var Observable3 = Rx.Observable;
  var runByPrecedence2 = requireRunByPrecedence();
  var pathUtils2 = requireLib();
  var collapse2 = pathUtils2.collapse;
  var optimizePathSets2 = requireOptimizePathSets();
  var mCGRI = requireMergeCacheAndGatherRefsAndInvalidations();
  var isArray2 = Array.isArray;
  recurseMatchAndExecute = function recurseMatchAndExecute2(match2, actionRunner, paths, method, routerInstance, jsongCache) {
    return _recurseMatchAndExecute(
      match2,
      actionRunner,
      paths,
      method,
      routerInstance,
      jsongCache
    );
  };
  function _recurseMatchAndExecute(match2, actionRunner, paths, method, routerInstance, jsongCache) {
    var unhandledPaths = [];
    var invalidated = [];
    var reportedPaths = [];
    var currentMethod = method;
    return Observable3.from(paths).expand(function(nextPaths) {
      if (!nextPaths.length) {
        return Observable3.empty();
      }
      var matchedResults;
      try {
        matchedResults = match2(currentMethod, nextPaths);
      } catch (e2) {
        return Observable3.throw(e2);
      }
      if (!matchedResults.length) {
        unhandledPaths.push(nextPaths);
        return Observable3.empty();
      }
      return runByPrecedence2(nextPaths, matchedResults, actionRunner).flatMap(function(results) {
        var value = results.value;
        var suffix = results.match.suffix;
        if (!isArray2(value)) {
          value = [value];
        }
        var invsRefsAndValues = mCGRI(jsongCache, value, routerInstance);
        var invalidations = invsRefsAndValues.invalidations;
        var unhandled = invsRefsAndValues.unhandledPaths;
        var messages = invsRefsAndValues.messages;
        var pathsToExpand = [];
        if (suffix.length > 0) {
          pathsToExpand = invsRefsAndValues.references;
        }
        invalidations.forEach(function(invalidation) {
          invalidated[invalidated.length] = invalidation.path;
        });
        unhandled.forEach(function(unhandledPath) {
          unhandledPaths[unhandledPaths.length] = unhandledPath;
        });
        pathsToExpand = pathsToExpand.map(function(next) {
          return next.value.concat(suffix);
        });
        messages.forEach(function(message) {
          if (message.method) {
            currentMethod = message.method;
          } else if (message.additionalPath) {
            var path = message.additionalPath;
            pathsToExpand[pathsToExpand.length] = path;
            reportedPaths[reportedPaths.length] = path;
          } else if (message.invalidations) {
            message.invalidations.forEach(function(invalidation) {
              invalidated.push(invalidation);
            });
          } else if (message.unhandledPaths) {
            unhandledPaths = unhandledPaths.concat(message.unhandledPaths);
          }
        });
        pathsToExpand = optimizePathSets2(
          jsongCache,
          pathsToExpand,
          routerInstance.maxRefFollow
        );
        if (pathsToExpand.length) {
          pathsToExpand = collapse2(pathsToExpand);
        }
        return Observable3.from(pathsToExpand);
      }).defaultIfEmpty([]);
    }, Number.POSITIVE_INFINITY, Rx.Scheduler.queue).reduce(function(acc, x) {
      return acc;
    }, null).map(function() {
      return {
        unhandledPaths,
        invalidated,
        jsonGraph: jsongCache,
        reportedPaths
      };
    });
  }
  return recurseMatchAndExecute;
}
var normalize;
var hasRequiredNormalize;
function requireNormalize() {
  if (hasRequiredNormalize)
    return normalize;
  hasRequiredNormalize = 1;
  normalize = function normalize2(range3) {
    var from2 = range3.from || 0;
    var to;
    if (typeof range3.to === "number") {
      to = range3.to;
    } else {
      to = from2 + range3.length - 1;
    }
    return { to, from: from2 };
  };
  return normalize;
}
var normalizePathSets;
var hasRequiredNormalizePathSets;
function requireNormalizePathSets() {
  if (hasRequiredNormalizePathSets)
    return normalizePathSets;
  hasRequiredNormalizePathSets = 1;
  var normalize2 = requireNormalize();
  normalizePathSets = function normalizePathSets2(path) {
    path.forEach(function(key, i2) {
      if (Array.isArray(key)) {
        normalizePathSets2(key);
      } else if (typeof key === "object") {
        path[i2] = normalize2(path[i2]);
      }
    });
    return path;
  };
  return normalizePathSets;
}
var materialize;
var hasRequiredMaterialize;
function requireMaterialize() {
  if (hasRequiredMaterialize)
    return materialize;
  hasRequiredMaterialize = 1;
  var pathValueMerge2 = requirePathValueMerge();
  var optimizePathSets2 = requireOptimizePathSets();
  var $atom = requireTypes().$atom;
  materialize = function materializeMissing(router, paths, jsongEnv) {
    var jsonGraph = jsongEnv.jsonGraph;
    var materializedAtom = { $type: $atom };
    optimizePathSets2(jsonGraph, paths, router.maxRefFollow).forEach(function(optMissingPath) {
      pathValueMerge2(jsonGraph, {
        path: optMissingPath,
        value: materializedAtom
      });
    });
    return { jsonGraph };
  };
  return materialize;
}
var MaxPathsExceededError_1;
var hasRequiredMaxPathsExceededError;
function requireMaxPathsExceededError() {
  if (hasRequiredMaxPathsExceededError)
    return MaxPathsExceededError_1;
  hasRequiredMaxPathsExceededError = 1;
  var MESSAGE = "Maximum number of paths exceeded.";
  var MaxPathsExceededError = function MaxPathsExceededError2(message) {
    this.message = message === void 0 ? MESSAGE : message;
    this.stack = new Error().stack;
  };
  MaxPathsExceededError.prototype = new Error();
  MaxPathsExceededError.prototype.throwToNext = true;
  MaxPathsExceededError_1 = MaxPathsExceededError;
  return MaxPathsExceededError_1;
}
var getPathsCount_1;
var hasRequiredGetPathsCount;
function requireGetPathsCount() {
  if (hasRequiredGetPathsCount)
    return getPathsCount_1;
  hasRequiredGetPathsCount = 1;
  var falcorPathUtils = requireLib();
  function getPathsCount(pathSets) {
    return pathSets.reduce(function(numPaths, pathSet) {
      return numPaths + falcorPathUtils.pathCount(pathSet);
    }, 0);
  }
  getPathsCount_1 = getPathsCount;
  return getPathsCount_1;
}
var rxNewToRxNewAndOld;
var hasRequiredRxNewToRxNewAndOld;
function requireRxNewToRxNewAndOld() {
  if (hasRequiredRxNewToRxNewAndOld)
    return rxNewToRxNewAndOld;
  hasRequiredRxNewToRxNewAndOld = 1;
  function noop() {
  }
  function toRxNewObserver(observer) {
    var onNext = observer.onNext;
    var onError = observer.onError;
    var onCompleted = observer.onCompleted;
    if (typeof onNext !== "function" && typeof onError !== "function" && typeof onCompleted !== "function") {
      return observer;
    }
    return {
      next: typeof onNext === "function" ? function(x) {
        this.destination.onNext(x);
      } : noop,
      error: typeof onError === "function" ? function(err) {
        this.destination.onError(err);
      } : noop,
      complete: typeof onCompleted === "function" ? function() {
        this.destination.onCompleted();
      } : noop,
      destination: observer
    };
  }
  rxNewToRxNewAndOld = function rxNewToRxNewAndOld2(rxNewObservable) {
    var _subscribe = rxNewObservable.subscribe;
    rxNewObservable.subscribe = function(observerOrNextFn, errFn, compFn) {
      var subscription;
      if (typeof observerOrNextFn !== "object" || observerOrNextFn === null) {
        subscription = _subscribe.call(
          this,
          observerOrNextFn,
          errFn,
          compFn
        );
      } else {
        var observer = toRxNewObserver(observerOrNextFn);
        subscription = _subscribe.call(this, observer);
      }
      var _unsubscribe = subscription.unsubscribe;
      subscription.unsubscribe = subscription.dispose = function() {
        this.isDisposed = true;
        _unsubscribe.call(this);
      };
      return subscription;
    };
    return rxNewObservable;
  };
  return rxNewToRxNewAndOld;
}
var get_1;
var hasRequiredGet;
function requireGet() {
  if (hasRequiredGet)
    return get_1;
  hasRequiredGet = 1;
  var runGetAction2 = requireRunGetAction();
  var get2 = "get";
  var recurseMatchAndExecute2 = requireRecurseMatchAndExecute();
  var normalizePathSets2 = requireNormalizePathSets();
  var materialize2 = requireMaterialize();
  var Observable3 = requireRouterRx().Observable;
  var mCGRI = requireMergeCacheAndGatherRefsAndInvalidations();
  var MaxPathsExceededError = requireMaxPathsExceededError();
  var getPathsCount = requireGetPathsCount();
  var outputToObservable2 = requireOutputToObservable();
  var rxNewToRxNewAndOld2 = requireRxNewToRxNewAndOld();
  get_1 = function routerGet(paths) {
    var router = this;
    return rxNewToRxNewAndOld2(Observable3.defer(function() {
      var methodSummary;
      if (router._methodSummaryHook) {
        methodSummary = {
          method: "get",
          pathSets: paths,
          start: router._now(),
          results: [],
          routes: []
        };
      }
      var result3 = Observable3.defer(function() {
        var jsongCache = {};
        var action = runGetAction2(router, jsongCache, methodSummary);
        var normPS = normalizePathSets2(paths);
        if (getPathsCount(normPS) > router.maxPaths) {
          throw new MaxPathsExceededError();
        }
        return recurseMatchAndExecute2(
          router._matcher,
          action,
          normPS,
          get2,
          router,
          jsongCache
        ).flatMap(function flatMapAfterRouterGet(details) {
          var out = {
            jsonGraph: details.jsonGraph
          };
          if (details.unhandledPaths.length && router._unhandled) {
            var unhandledPaths = details.unhandledPaths;
            return outputToObservable2(
              router._unhandled.get(unhandledPaths)
            ).map(function(jsonGraphFragment) {
              mCGRI(out.jsonGraph, [{
                jsonGraph: jsonGraphFragment.jsonGraph,
                paths: unhandledPaths
              }], router);
              return out;
            }).defaultIfEmpty(out);
          }
          return Observable3.of(out);
        }).map(function(jsonGraphEnvelope) {
          return materialize2(router, normPS, jsonGraphEnvelope);
        });
      });
      if (router._methodSummaryHook || router._errorHook) {
        result3 = result3.do(function(response) {
          if (router._methodSummaryHook) {
            methodSummary.results.push({
              time: router._now(),
              value: response
            });
          }
        }, function(err) {
          if (router._methodSummaryHook) {
            methodSummary.end = router._now();
            methodSummary.error = err;
            router._methodSummaryHook(methodSummary);
          }
          if (router._errorHook) {
            router._errorHook(err);
          }
        }, function() {
          if (router._methodSummaryHook) {
            methodSummary.end = router._now();
            router._methodSummaryHook(methodSummary);
          }
        });
      }
      return result3;
    }));
  };
  return get_1;
}
var spreadPaths;
var hasRequiredSpreadPaths;
function requireSpreadPaths() {
  if (hasRequiredSpreadPaths)
    return spreadPaths;
  hasRequiredSpreadPaths = 1;
  var iterateKeySet2 = requireLib().iterateKeySet;
  var cloneArray2 = cloneArray_1$1;
  spreadPaths = function spreadPaths2(paths) {
    var allPaths = [];
    paths.forEach(function(x) {
      _spread(x, 0, allPaths);
    });
    return allPaths;
  };
  function _spread(pathSet, depth, out, currentPath) {
    currentPath = currentPath || [];
    if (depth === pathSet.length) {
      out[out.length] = cloneArray2(currentPath);
      return;
    }
    var key = pathSet[depth];
    if (typeof key !== "object") {
      currentPath[depth] = key;
      _spread(pathSet, depth + 1, out, currentPath);
      return;
    }
    var iteratorNote = {};
    var innerKey = iterateKeySet2(key, iteratorNote);
    do {
      currentPath[depth] = innerKey;
      _spread(pathSet, depth + 1, out, currentPath);
      currentPath.length = depth;
      innerKey = iterateKeySet2(key, iteratorNote);
    } while (!iteratorNote.done);
  }
  return spreadPaths;
}
var getValue;
var hasRequiredGetValue;
function requireGetValue() {
  if (hasRequiredGetValue)
    return getValue;
  hasRequiredGetValue = 1;
  getValue = function getValue2(cache, path) {
    return path.reduce(function(acc, key) {
      return acc[key];
    }, cache);
  };
  return getValue;
}
var runSetAction_1;
var hasRequiredRunSetAction;
function requireRunSetAction() {
  if (hasRequiredRunSetAction)
    return runSetAction_1;
  hasRequiredRunSetAction = 1;
  var outputToObservable2 = requireOutputToObservable();
  var noteToJsongOrPV2 = requireNoteToJsongOrPV();
  var spreadPaths2 = requireSpreadPaths();
  var getValue2 = requireGetValue();
  var jsongMerge2 = requireJsongMerge();
  var optimizePathSets2 = requireOptimizePathSets();
  var hasIntersection2 = requireHasIntersection();
  var pathValueMerge2 = requirePathValueMerge();
  var Observable3 = requireRouterRx().Observable;
  runSetAction_1 = function outerRunSetAction(routerInstance, modelContext, jsongCache, methodSummary) {
    return function innerRunSetAction(matchAndPath) {
      return runSetAction(
        routerInstance,
        modelContext,
        matchAndPath,
        jsongCache,
        methodSummary
      );
    };
  };
  function runSetAction(routerInstance, jsongMessage, matchAndPath, jsongCache, methodSummary) {
    var match2 = matchAndPath.match;
    var out;
    var arg = matchAndPath.path;
    if (match2.isSet) {
      var paths = spreadPaths2(jsongMessage.paths);
      var optimizedPathsAndPaths = paths.map(function(path) {
        return [
          optimizePathSets2(
            jsongCache,
            [path],
            routerInstance.maxRefFollow
          )[0],
          path
        ];
      }).filter(function(optimizedAndPath) {
        return optimizedAndPath[0] && hasIntersection2(optimizedAndPath[0], match2.virtual);
      });
      var optimizedPaths = optimizedPathsAndPaths.map(function(opp) {
        return opp[0];
      });
      var subSetPaths = optimizedPathsAndPaths.map(function(opp) {
        return opp[1];
      });
      var tmpJsonGraph = subSetPaths.reduce(function(json, path, i2) {
        pathValueMerge2(json, {
          path: optimizedPaths[i2],
          value: getValue2(jsongMessage.jsonGraph, path)
        });
        return json;
      }, {});
      var subJsonGraphEnv = {
        jsonGraph: tmpJsonGraph,
        paths: [match2.requested]
      };
      arg = {};
      jsongMerge2(arg, subJsonGraphEnv, routerInstance);
    }
    try {
      out = match2.action.call(routerInstance, arg);
      out = outputToObservable2(out);
      if (methodSummary) {
        var _out = out;
        out = Observable3.defer(function() {
          var route = {
            route: matchAndPath.match.prettyRoute,
            pathSet: matchAndPath.path,
            start: routerInstance._now()
          };
          methodSummary.routes.push(route);
          return _out.do(
            function(result3) {
              route.results = route.results || [];
              route.results.push({
                time: routerInstance._now(),
                value: result3
              });
            },
            function(err) {
              route.error = err;
              route.end = routerInstance._now();
            },
            function() {
              route.end = routerInstance._now();
            }
          );
        });
      }
    } catch (e2) {
      out = Observable3.throw(e2);
    }
    return out.materialize().filter(function(note) {
      return note.kind !== "C";
    }).map(noteToJsongOrPV2(matchAndPath.path, false, routerInstance)).map(function(jsonGraphOrPV) {
      return [matchAndPath.match, jsonGraphOrPV];
    });
  }
  return runSetAction_1;
}
var hasIntersectionWithTree;
var hasRequiredHasIntersectionWithTree;
function requireHasIntersectionWithTree() {
  if (hasRequiredHasIntersectionWithTree)
    return hasIntersectionWithTree;
  hasRequiredHasIntersectionWithTree = 1;
  hasIntersectionWithTree = function hasIntersectionWithTree2(path, tree) {
    return _hasIntersection(path, tree, 0);
  };
  function _hasIntersection(path, node, depth) {
    if (depth === path.length && node === null) {
      return true;
    }
    var key = path[depth];
    var next = node[key];
    if (node !== void 0) {
      return _hasIntersection(path, next, depth + 1);
    }
    return false;
  }
  return hasIntersectionWithTree;
}
var set_1;
var hasRequiredSet;
function requireSet() {
  if (hasRequiredSet)
    return set_1;
  hasRequiredSet = 1;
  var set2 = "set";
  var recurseMatchAndExecute2 = requireRecurseMatchAndExecute();
  var runSetAction = requireRunSetAction();
  var materialize2 = requireMaterialize();
  var Observable3 = requireRouterRx().Observable;
  var spreadPaths2 = requireSpreadPaths();
  var pathValueMerge2 = requirePathValueMerge();
  var optimizePathSets2 = requireOptimizePathSets();
  var hasIntersectionWithTree2 = requireHasIntersectionWithTree();
  var getValue2 = requireGetValue();
  var normalizePathSets2 = requireNormalizePathSets();
  var pathUtils2 = requireLib();
  var collapse2 = pathUtils2.collapse;
  var mCGRI = requireMergeCacheAndGatherRefsAndInvalidations();
  var MaxPathsExceededError = requireMaxPathsExceededError();
  var getPathsCount = requireGetPathsCount();
  var outputToObservable2 = requireOutputToObservable();
  var rxNewToRxNewAndOld2 = requireRxNewToRxNewAndOld();
  set_1 = function routerSet(jsonGraph) {
    var router = this;
    var source = Observable3.defer(function() {
      var jsongCache = {};
      var methodSummary;
      if (router._methodSummaryHook) {
        methodSummary = {
          method: "set",
          jsonGraphEnvelope: jsonGraph,
          start: router._now(),
          results: [],
          routes: []
        };
      }
      var action = runSetAction(router, jsonGraph, jsongCache, methodSummary);
      jsonGraph.paths = normalizePathSets2(jsonGraph.paths);
      if (getPathsCount(jsonGraph.paths) > router.maxPaths) {
        throw new MaxPathsExceededError();
      }
      var innerSource = recurseMatchAndExecute2(
        router._matcher,
        action,
        jsonGraph.paths,
        set2,
        router,
        jsongCache
      ).flatMap(function(details) {
        var out = {
          jsonGraph: details.jsonGraph
        };
        if (details.unhandledPaths.length && router._unhandled) {
          var unhandledPaths = details.unhandledPaths;
          var jsonGraphFragment = {};
          var jsonGraphEnvelope = { jsonGraph: jsonGraphFragment };
          var unhandledPathsTree = unhandledPaths.reduce(function(acc, path) {
            pathValueMerge2(acc, { path, value: null });
            return acc;
          }, {});
          var pathIntersection = spreadPaths2(jsonGraph.paths).map(function(path) {
            return [
              // full path
              path,
              // optimized path
              optimizePathSets2(
                details.jsonGraph,
                [path],
                router.maxRefFollow
              )[0]
            ];
          }).filter(function(x) {
            return x[1];
          }).map(function(pathAndOPath) {
            var oPath = pathAndOPath[1];
            var hasIntersection2 = hasIntersectionWithTree2(
              oPath,
              unhandledPathsTree
            );
            if (hasIntersection2) {
              var value = getValue2(
                jsonGraph.jsonGraph,
                pathAndOPath[0]
              );
              return {
                path: oPath,
                value
              };
            }
            return null;
          }).filter(function(x) {
            return x !== null;
          });
          pathIntersection.reduce(function(acc, pathValue) {
            pathValueMerge2(acc, pathValue);
            return acc;
          }, jsonGraphFragment);
          jsonGraphEnvelope.paths = collapse2(
            pathIntersection.map(function(pV) {
              return pV.path;
            })
          );
          return outputToObservable2(
            router._unhandled.set(jsonGraphEnvelope)
          ).map(function(unhandledJsonGraphEnv) {
            mCGRI(out.jsonGraph, [{
              jsonGraph: unhandledJsonGraphEnv.jsonGraph,
              paths: unhandledPaths
            }], router);
            return out;
          }).defaultIfEmpty(out);
        }
        return Observable3.of(out);
      }).map(function(jsonGraphEnvelope) {
        return materialize2(router, jsonGraph.paths, jsonGraphEnvelope);
      });
      if (router._errorHook || router._methodSummaryHook) {
        innerSource = innerSource.do(
          function(response) {
            if (router._methodSummaryHook) {
              methodSummary.results.push({
                time: router._now(),
                value: response
              });
            }
          },
          function(err) {
            if (router._methodSummaryHook) {
              methodSummary.end = router._now();
              methodSummary.error = err;
              router._methodSummaryHook(methodSummary);
            }
            if (router._errorHook) {
              router._errorHook(err);
            }
          },
          function() {
            if (router._methodSummaryHook) {
              methodSummary.end = router._now();
              router._methodSummaryHook(methodSummary);
            }
          }
        );
      }
      return innerSource;
    });
    if (router._errorHook) {
      source = source.do(null, function summaryHookErrorHandler(err) {
        router._errorHook(err);
      });
    }
    return rxNewToRxNewAndOld2(source);
  };
  return set_1;
}
var CallRequiresPathsError_1;
var hasRequiredCallRequiresPathsError;
function requireCallRequiresPathsError() {
  if (hasRequiredCallRequiresPathsError)
    return CallRequiresPathsError_1;
  hasRequiredCallRequiresPathsError = 1;
  var MESSAGE = "Any JSONG-Graph returned from call must have paths.";
  var CallRequiresPathsError = function CallRequiresPathsError2() {
    this.message = MESSAGE;
    this.stack = new Error().stack;
  };
  CallRequiresPathsError.prototype = new Error();
  CallRequiresPathsError_1 = CallRequiresPathsError;
  return CallRequiresPathsError_1;
}
var runCallAction_1;
var hasRequiredRunCallAction;
function requireRunCallAction() {
  if (hasRequiredRunCallAction)
    return runCallAction_1;
  hasRequiredRunCallAction = 1;
  var isJSONG2 = requireIsJSONG();
  var outputToObservable2 = requireOutputToObservable();
  var noteToJsongOrPV2 = requireNoteToJsongOrPV();
  var CallRequiresPathsError = requireCallRequiresPathsError();
  var mCGRI = requireMergeCacheAndGatherRefsAndInvalidations();
  var Observable3 = requireRouterRx().Observable;
  runCallAction_1 = outerRunCallAction;
  function outerRunCallAction(routerInstance, callPath, args, suffixes, paths, jsongCache, methodSummary) {
    return function innerRunCallAction(matchAndPath) {
      return runCallAction(
        matchAndPath,
        routerInstance,
        callPath,
        args,
        suffixes,
        paths,
        jsongCache,
        methodSummary
      );
    };
  }
  function runCallAction(matchAndPath, routerInstance, callPath, args, suffixes, paths, jsongCache, methodSummary) {
    var match2 = matchAndPath.match;
    var matchedPath = matchAndPath.path;
    var out;
    if (match2.isCall) {
      out = Observable3.defer(function() {
        var next;
        try {
          next = match2.action.call(
            routerInstance,
            matchedPath,
            args,
            suffixes,
            paths
          );
        } catch (e2) {
          e2.throwToNext = true;
          throw e2;
        }
        var output = outputToObservable2(next);
        if (methodSummary) {
          var route2 = {
            start: routerInstance._now(),
            route: matchAndPath.match.prettyRoute,
            pathSet: matchAndPath.path,
            results: []
          };
          methodSummary.routes.push(route2);
          output = output.do(
            function(response) {
              route2.results.push({
                time: routerInstance._now(),
                value: response
              });
            },
            function(err) {
              route2.error = err;
              route2.end = routerInstance._now();
            },
            function() {
              route2.end = routerInstance._now();
            }
          );
        }
        return output.toArray();
      }).map(function(res) {
        var refs = [];
        var values = [];
        var callOutput = res.filter(function(x) {
          return x;
        }).reduce(function(flattenedRes, next) {
          return flattenedRes.concat(next);
        }, []);
        if (callOutput.length === 0) {
          return [];
        }
        var refLen = -1;
        callOutput.forEach(function(r2) {
          if (isJSONG2(r2)) {
            if (!r2.paths) {
              var err = new CallRequiresPathsError();
              err.throwToNext = true;
              throw err;
            }
          }
        });
        var invsRefsAndValues = mCGRI(jsongCache, callOutput, routerInstance);
        invsRefsAndValues.references.forEach(function(ref) {
          refs[++refLen] = ref;
        });
        values = invsRefsAndValues.values.map(function(pv) {
          return pv.path;
        });
        var callLength = callOutput.length;
        var callPathSave1 = callPath.slice(0, callPath.length - 1);
        var hasSuffixes = suffixes && suffixes.length;
        var hasPaths = paths && paths.length;
        callOutput[++callLength] = { isMessage: true, method: "get" };
        if (hasPaths && callLength + 1) {
          paths.forEach(function(path) {
            callOutput[++callLength] = {
              isMessage: true,
              additionalPath: callPathSave1.concat(path)
            };
          });
        }
        if (hasSuffixes) {
          var optimizedPathLength = matchedPath.length - 1;
          refs.forEach(function(ref) {
            var deoptimizedPath = callPathSave1.concat(
              ref.path.slice(optimizedPathLength)
            );
            suffixes.forEach(function(suffix) {
              var additionalPath = deoptimizedPath.concat(suffix);
              callOutput[++callLength] = {
                isMessage: true,
                additionalPath
              };
            });
          });
        }
        if (refs.length && !hasSuffixes || values.length) {
          var additionalPaths = [];
          if (refs.length && !hasSuffixes) {
            additionalPaths = refs.map(function(x) {
              return x.path;
            });
          }
          additionalPaths.concat(values).forEach(function(path) {
            callOutput[++callLength] = {
              isMessage: true,
              additionalPath: path
            };
          });
        }
        return callOutput;
      }).do(null, function(e2) {
        e2.throwToNext = true;
        throw e2;
      });
    } else {
      out = Observable3.defer(function() {
        return outputToObservable2(
          match2.action.call(routerInstance, matchAndPath.path)
        );
      });
      if (methodSummary) {
        var route = {
          start: routerInstance._now(),
          route: matchAndPath.match.prettyRoute,
          pathSet: matchAndPath.path,
          results: []
        };
        methodSummary.routes.push(route);
        out = out.do(
          function(response) {
            route.results.push({
              time: routerInstance._now(),
              value: response
            });
          },
          function(err) {
            route.error = err;
            route.end = routerInstance._now();
          },
          function() {
            route.end = routerInstance._now();
          }
        );
      }
    }
    return out.materialize().filter(function(note) {
      return note.kind !== "C";
    }).map(noteToJsongOrPV2(matchAndPath.path, false, routerInstance)).map(function(jsonGraphOrPV) {
      return [matchAndPath.match, jsonGraphOrPV];
    });
  }
  return runCallAction_1;
}
var call_1;
var hasRequiredCall;
function requireCall() {
  if (hasRequiredCall)
    return call_1;
  hasRequiredCall = 1;
  var call2 = "call";
  var runCallAction = requireRunCallAction();
  var recurseMatchAndExecute2 = requireRecurseMatchAndExecute();
  var normalizePathSets2 = requireNormalizePathSets();
  var CallNotFoundError2 = requireCallNotFoundError();
  var materialize2 = requireMaterialize();
  var pathUtils2 = requireLib();
  var collapse2 = pathUtils2.collapse;
  var Observable3 = requireRouterRx().Observable;
  var MaxPathsExceededError = requireMaxPathsExceededError();
  var getPathsCount = requireGetPathsCount();
  var outputToObservable2 = requireOutputToObservable();
  var rxNewToRxNewAndOld2 = requireRxNewToRxNewAndOld();
  call_1 = function routerCall(callPath, args, refPathsArg, thisPathsArg) {
    var router = this;
    var source = Observable3.defer(function() {
      var methodSummary;
      if (router._methodSummaryHook) {
        methodSummary = {
          method: "call",
          start: router._now(),
          callPath,
          args,
          refPaths: refPathsArg,
          thisPaths: thisPathsArg,
          results: [],
          routes: []
        };
      }
      var innerSource = Observable3.defer(function() {
        var refPaths = normalizePathSets2(refPathsArg || []);
        var thisPaths = normalizePathSets2(thisPathsArg || []);
        var jsongCache = {};
        var action = runCallAction(
          router,
          callPath,
          args,
          refPaths,
          thisPaths,
          jsongCache,
          methodSummary
        );
        var callPaths = [callPath];
        if (getPathsCount(refPaths) + getPathsCount(thisPaths) + getPathsCount(callPaths) > router.maxPaths) {
          throw new MaxPathsExceededError();
        }
        return recurseMatchAndExecute2(
          router._matcher,
          action,
          callPaths,
          call2,
          router,
          jsongCache
        ).map(function(jsongResult) {
          var reportedPaths = jsongResult.reportedPaths;
          var jsongEnv = {
            jsonGraph: jsongResult.jsonGraph
          };
          if (reportedPaths.length) {
            jsongEnv.paths = collapse2(reportedPaths);
          } else {
            jsongEnv.paths = [];
            jsongEnv.jsonGraph = {};
          }
          var invalidated = jsongResult.invalidated;
          if (invalidated && invalidated.length) {
            jsongEnv.invalidated = invalidated;
          }
          materialize2(router, reportedPaths, jsongEnv);
          return jsongEnv;
        }).catch(function catchException(e2) {
          if (e2 instanceof CallNotFoundError2 && router._unhandled) {
            return outputToObservable2(
              router._unhandled.call(callPath, args, refPaths, thisPaths)
            );
          }
          throw e2;
        });
      });
      if (router._methodSummaryHook || router._errorHook) {
        innerSource = innerSource.do(function(response) {
          if (router._methodSummaryHook) {
            methodSummary.results.push({
              time: router._now(),
              value: response
            });
          }
        }, function(err) {
          if (router._methodSummaryHook) {
            methodSummary.error = err;
            methodSummary.end = router._now();
            router._methodSummaryHook(methodSummary);
          }
          if (router._errorHook) {
            router._errorHook(err);
          }
        }, function() {
          if (router._methodSummaryHook) {
            methodSummary.end = router._now();
            router._methodSummaryHook(methodSummary);
          }
        });
      }
      return innerSource;
    });
    return rxNewToRxNewAndOld2(source);
  };
  return call_1;
}
var Keys = Keys_1;
var parseTree2 = parseTree$1;
var matcher2 = matcher$1;
var JSONGraphError2 = JSONGraphErrorExports;
var MAX_REF_FOLLOW = 50;
var MAX_PATHS = 9e3;
var noOp = function noOp2() {
};
var defaultNow = function defaultNow2() {
  return Date.now();
};
var Router = function(routes, options) {
  this._routes = routes;
  this._rst = parseTree2(routes);
  this._matcher = matcher2(this._rst);
  this._setOptions(options);
};
Router.createClass = function(routes) {
  function C(options) {
    this._setOptions(options);
  }
  C.prototype = new Router(routes);
  C.prototype.constructor = C;
  return C;
};
Router.prototype = {
  /**
   * Performs the get algorithm on the router.
   * @param {PathSet[]} paths -
   * @returns {Observable.<JSONGraphEnvelope>}
   */
  get: requireGet(),
  /**
   * Takes in a jsonGraph and outputs a Observable.<jsonGraph>.  The set
   * method will use get until it evaluates the last key of the path inside
   * of paths.  At that point it will produce an intermediate structure that
   * matches the path and has the value that is found in the jsonGraph env.
   *
   * One of the requirements for interaction with a dataSource is that the
   * set message must be optimized to the best of the incoming sources
   * knowledge.
   *
   * @param {JSONGraphEnvelope} jsonGraph -
   * @returns {Observable.<JSONGraphEnvelope>}
   */
  set: requireSet(),
  /**
   * Invokes a function in the DataSource's JSONGraph object at the path
   * provided in the callPath argument.  If there are references that are
   * followed, a get will be performed to get to the call function.
   *
   * @param {Path} callPath -
   * @param {Array.<*>} args -
   * @param {Array.<PathSet>} refPaths -
   * @param {Array.<PathSet>} thisPaths -
   */
  call: requireCall(),
  /**
   * When a route misses on a call, get, or set the unhandledDataSource will
   * have a chance to fulfill that request.
   * @param {DataSource} dataSource -
   */
  routeUnhandledPathsTo: function routeUnhandledPathsTo(dataSource) {
    this._unhandled = dataSource;
  },
  _setOptions: function _setOptions(options) {
    var opts = options || {};
    this._debug = opts.debug;
    this._pathErrorHook = opts.hooks && opts.hooks.pathError || noOp;
    this._errorHook = opts.hooks && opts.hooks.error;
    this._methodSummaryHook = opts.hooks && opts.hooks.methodSummary;
    this._now = opts.hooks && opts.hooks.now || opts.now || defaultNow;
    this.maxRefFollow = opts.maxRefFollow || MAX_REF_FOLLOW;
    this.maxPaths = opts.maxPaths || MAX_PATHS;
  }
};
Router.ranges = Keys.ranges;
Router.integers = Keys.integers;
Router.keys = Keys.keys;
Router.JSONGraphError = JSONGraphError2;
var Router_1 = Router;
var Router$1 = /* @__PURE__ */ getDefaultExportFromCjs(Router_1);

// app/src/schema/helpers.js
function addPathTags(paths, tags) {
  if (typeof tags === "string") {
    tags = [tags];
  }
  Object.values(paths).forEach((pathConf) => {
    if (tags.includes("window") && !pathConf.get) {
      pathConf.get = {};
    }
    const methodConfs = Object.values(pathConf).filter((conf) => typeof conf === "object");
    methodConfs.forEach((conf) => {
      tags.forEach((tag) => {
        if (!conf.tags) {
          conf.tags = [tag];
        } else if (!conf.tags.includes(tag)) {
          conf.tags.push(tag);
        }
      });
    });
  });
  return paths;
}

// app/src/schema/falcor-paths.js
var falcor_paths_default = {
  "_sync": {
    call: {
      operationId: "_sync"
    }
  },
  "_users": {
    get: {
      handler: async ({ dbs, session: { org, userId } }) => {
        const { rows: sessions } = await dbs.couch.query(`ayu_main/by_type_and_title`, {
          partition: "system",
          reduce: false,
          include_docs: true,
          startkey: ["session"],
          endkey: ["session", {}]
        });
        const users = sessions.map((row) => row.doc).sort((a2, b) => b.lastLogin - a2.lastLogin).reduce((agg, session) => {
          if (!agg[session.title]) {
            agg[session.title] = session;
            agg[session.title].numSessions = 1;
          } else {
            agg[session.title].numSessions += 1;
          }
          return agg;
        }, {});
        return {
          jsonGraph: {
            _users: { $type: "atom", value: Object.values(users) }
          }
        };
      }
    }
  },
  "_sessions": {
    get: {
      handler: async ({ dbs, session: { org, userId } }) => {
        const sessionName = userId + (org ? ` (${org})` : "");
        const { rows: sessions } = await dbs.couch.query(`ayu_main/by_type_and_title`, {
          partition: "system",
          reduce: false,
          include_docs: true,
          startkey: ["session", sessionName],
          endkey: ["session", sessionName, {}]
        });
        return {
          jsonGraph: {
            _sessions: { $type: "atom", value: sessions.map((row) => row.doc).sort((a2, b) => b.lastLogin - a2.lastLogin) }
          }
        };
      }
    }
  },
  "_pouch": {
    get: {
      handler: async ({ dbs }) => {
        return {
          jsonGraph: {
            _pouch: { $type: "atom", value: await dbs.pouch.info() }
          }
        };
      }
    }
  },
  "_couch": {
    get: {
      handler: async ({ dbs }) => {
        return {
          jsonGraph: {
            _couch: { $type: "atom", value: await dbs.couch?.info?.() }
          }
        };
      }
    }
  },
  // // fetch(`/_api/_couch/${loggedInDbName}/${session.sessionId}`)
  "_session[{keys:keys}]": {
    get: {
      handler: ({ _keys, session }) => {
        return {
          jsonGraph: {
            _session: session
          }
        };
      }
    }
  },
  "_hash": {
    get: {
      handler: () => {
        return {
          jsonGraph: {
            _hash: { $type: "atom", value: self.ipfsHash }
          }
        };
      }
    }
  },
  "_updating": {
    get: {
      handler: () => {
        return {
          jsonGraph: {
            _updating: self.updating
          }
        };
      }
    },
    set: {
      handler: ({ _updating, model }) => {
        self.updating = _updating;
        model.invalidate("_hash");
        return {
          jsonGraph: {
            _updating
          }
        };
      }
    }
  },
  // '_changes.length': {
  //   get: {
  //     handler: async ({ dbs }) => {
  //       const pouchRes = await dbs.pouch.info()
  //       return { path: ['_changes', 'length'], value: pouchRes.update_seq }
  //     }
  //   }
  // },
  // '_changes': {
  //   get: {
  //     handler: ({ _ids, _keys, _dbs }) => {
  //       consoe.log('fixme')
  //       // const _pouchRes = await db.allDocs({
  //       //   include_docs: true,
  //       //   conflicts: true,
  //       //   keys: ids
  //       // })
  //     }
  //   }
  // },
  "_docs.create": {
    call: {
      handler: async ({ dbs, session, _Observable }, [docs]) => {
        if (!Array.isArray(docs)) {
          docs = [docs];
        }
        const result3 = await dbs.pouch.bulkDocs(docs.map((doc) => {
          if (!doc._id) {
            doc._id = `${Math.floor(Math.random() * 1e3)}:${Math.floor(Math.random() * 1e9)}`;
          }
          doc.changes = [{ userId: session.userId, action: "created", date: Date.now() }];
          return doc;
        }));
        return result3.map((_doc, i2) => {
          return { path: ["_docs", docs[i2]._id], value: docs[i2] };
        });
      }
    }
  },
  // this route handles subkey upsert and subset key requests
  // '_docs[{keys:ids}][{keys:keys}]': {
  //   set: {
  //     handler: async ({ _docs, db, _userId, keys, ids }) => {
  //       console.log(_docs, keys, ids)
  //       const result = await db.bulkDocs(Object.values(_docs).map(({value}) => {
  //         if (!value.changes) {
  //           value.changes = []
  //         }
  //         if (value.deleted) {
  //           value.changes.push({ userId: session.userId, action: 'deleted',  date: Date.now() })
  //         } else if (!value._rev) {
  //           value.changes.push({ userId: session.userId, action: 'created',  date: Date.now() })
  //         } else {
  //           value.changes.push({ userId: session.userId, action: 'updated',  date: Date.now() })
  //         }
  //         return value
  //       }))
  //       result.forEach(res => {
  //         if (res.ok) {
  //           _docs[res.id].value._rev = res.rev
  //         } else {
  //           console.error('set doc error', res)
  //         }
  //       })
  //       return  {
  //         jsonGraph: {
  //           _docs
  //         }
  //       }
  //     }
  //   },
  //   get: {
  //     handler: async ({ ids, keys, db }) => {
  //       console.log( keys, ids)
  //       const pouchRes = await db.allDocs({
  //         include_docs: true,
  //         conflicts: true,
  //         keys: ids
  //       })
  //       // console.log(ids, pouchRes)
  //       const missingIds = []
  //       const _docs = {}
  //       pouchRes.rows.forEach(row => {
  //         if (row.error === 'not_found') {
  //           missingIds.push(row.key)
  //         } else if (!row.error) {
  //           if (row.doc) {
  //             _docs[row.key] = { $type: 'atom', value: row.doc }
  //             if (row.doc.type) {
  //               _docs[row.key].$schema = { $ref: row.doc.type }
  //             } else if (row.doc.types?.length === 1) {
  //               _docs[row.key].$schema = { $ref: row.doc.types[0].profile }
  //             } else if (row.doc.types?.length > 1) {
  //               _docs[row.key].$schema = { anyOf: _row.doc.types.map(type => {$ref: type.profile}) }
  //             }
  //           } else {
  //             console.warn(row)
  //           }
  //         } else {
  //           console.error(row)
  //         }
  //       })
  //       return {
  //         jsonGraph: {
  //           _docs
  //         }
  //       }
  //     }
  //   }
  // },
  "_docs[{keys:ids}]": {
    get: {
      operationId: "getDocs"
    },
    set: {
      handler: async ({ _docs, dbs, session }) => {
        const result3 = await dbs.pouch.bulkDocs(Object.values(_docs).map(({ value }) => {
          if (!value.changes) {
            value.changes = [];
          }
          if (value.changes.length > 12) {
            value.changes.splice(2, value.changes.length - 4);
            value.changes.push({ userId: session.userId, action: "aggregated", date: Date.now() });
          }
          if (value.deleted) {
            value.changes.push({ userId: session.userId, action: "deleted", date: Date.now() });
          } else if (!value._rev) {
            value.changes.push({ userId: session.userId, action: "created", date: Date.now() });
          } else {
            value.changes.push({ userId: session.userId, action: "updated", date: Date.now() });
          }
          return value;
        }));
        result3.forEach((res) => {
          if (res.ok) {
            _docs[res.id].value._rev = res.rev;
          } else {
            console.error("set doc error", res);
          }
        });
        return {
          jsonGraph: {
            _docs
          }
        };
      }
    }
  }
};

// app/src/schema/window-paths.js
var window_paths_default = {
  "/(#/):_page(/:_subPage)(/*_)": {}
};

// app/src/schema/default-routes.js
var default_routes_default = {
  ...addPathTags(falcor_paths_default, "falcor"),
  ...addPathTags(window_paths_default, "window"),
  "/*": {
    get: {
      tags: ["edge", "service-worker"],
      operationId: "_ipfs"
    }
  },
  // '/_debug': {
  //   get: {
  //     tags: [ 'edge' ],
  //     operationId: '_debug'
  //   }
  // },
  // codespace support TODO: remove
  // '/signin*': {
  //   get: {
  //     operationId: '_bypass'
  //   }
  // },
  // TODO: not required anymore?
  // '/_ayu/accounts*': {
  //   get: {
  //     operationId: '_bypass' // '_accounts'
  //   }
  // },
  // '/_api/_feed/*': {
  //   get: {
  //     tags: [ 'edge' ],
  //     operationId: '_feed'
  //   }
  // },
  "/_api/_session*": {
    get: {
      tags: ["edge"],
      operationId: "_session"
    },
    post: {
      tags: ["edge"],
      operationId: "_session"
    },
    delete: {
      tags: ["edge"],
      operationId: "_session"
    }
  },
  "/_api/_couch/*": {
    get: {
      tags: ["edge"],
      operationId: "_couch"
    },
    put: {
      tags: ["edge"],
      operationId: "_couch"
    },
    post: {
      tags: ["edge"],
      operationId: "_couch"
    },
    options: {
      tags: ["edge"],
      operationId: "_couch"
    }
  },
  // cloudflare access support
  "/cdn-cgi/access*": {
    get: {
      tags: ["service-worker"],
      operationId: "_bypass"
    }
  }
};

// app/src/lib/url-logger.js
function urlLogger({ missing, continued, scope, method, url, origUrl, cached, corsConf, body, duration, res, richConsole = true, verbose }) {
  let badgeColor = "";
  if (!verbose) {
    if (cached && !missing && method === "GET" && scope === "ipfs") {
      return;
    }
    if (continued) {
      return;
    }
  }
  if (richConsole) {
    badgeColor = "grey";
    if (cached) {
      badgeColor = "#099009";
    } else if (cached === false) {
      badgeColor = "orange";
    }
    if (method === "POST" || method === "SET") {
      badgeColor = "rgb(170, 90, 217)";
    } else if (method === "PUT") {
      badgeColor = "rgb(174, 12, 226)";
    } else if (method === "CALL") {
      badgeColor = "rgb(236 124 248)";
    } else if (method === "PRELOAD") {
      badgeColor = "#6ad4f6";
    }
  }
  let displayUrl = "";
  try {
    if (typeof location !== "undefined" && location.origin) {
      displayUrl = url.replace(location.origin, "");
    } else {
      displayUrl = url;
    }
  } catch (_e) {
    displayUrl = url;
  }
  const edgeWorker = scope?.endsWith("edge-worker");
  if (richConsole) {
    console.groupCollapsed(
      `${scope && edgeWorker ? scope + ": " : ""}%c${missing ? "route error" : ""}%c${missing ? " " : ""}%c${method}%c %c ${displayUrl}`,
      richConsole && missing ? `background-color:red;border-radius:3px;color:black;font-weight:bold;padding-left:2px;padding-right:2px` : "",
      richConsole ? "color:grey" : "",
      richConsole ? `background-color:${badgeColor};border-radius:3px;color:black;font-weight:bold;padding-left:2px;padding-right:2px` : "",
      richConsole ? "color:grey" : "",
      richConsole ? "color:grey" : ""
    );
  } else {
    console.log(`${scope && edgeWorker ? scope + ": " : ""} ${missing ? "route error" : ""} ${missing ? " " : ""} ${method}    ${displayUrl}`);
  }
  if (!edgeWorker && scope) {
    console.info(scope);
  }
  if (cached === true) {
    console.info("cache-status: hit");
  } else if (cached === false) {
    console.info("cache-status: miss");
  }
  if (origUrl && url !== origUrl) {
    console.info("rewritten from: ", origUrl);
  }
  if (corsConf && corsConf.mode === "proxy") {
    console.info("proxied through: " + corsConf.server);
  }
  if (typeof duration !== "undefined") {
    console.log(`duration: ${duration}ms`);
  }
  if (continued) {
    console.info("continued processing of previous request");
  }
  if (body) {
    console.info(body);
  }
  if (richConsole) {
    console.groupEnd();
  }
}

// app/src/schema/falcor-handlers/index.js
var falcor_handlers_exports = {};
__export(falcor_handlers_exports, {
  _sync: () => _sync,
  getDocs: () => getDocs
});
var changes;
function doSync(dbs, since, Observable3, _model) {
  let id;
  let i2 = 0;
  function schedule(action) {
    if (i2 < 5) {
      i2++;
      if (id) {
        clearTimeout(id);
        id = null;
      }
      id = setTimeout(action, 5);
    }
  }
  return Observable3.create((subscriber) => {
    let catchupFeed = false;
    let usedFeed;
    if (!changes) {
      changes = dbs.pouch.changes({
        since: since || "now",
        live: true,
        timeout: false,
        include_docs: true
      });
      dbs.pouch.info().then((info) => {
        changes.lastSeq = info.update_seq;
      });
      usedFeed = changes;
    } else {
      if (since !== void 0 && changes.lastSeq > since) {
        catchupFeed = true;
        console.log("creating pouch _sync catchup feed", since, changes.lastSeq);
        usedFeed = dbs.pouch.changes({
          since,
          live: true,
          timeout: false,
          include_docs: true
        });
      } else {
        usedFeed = changes;
      }
    }
    const complListener = (_info) => {
      subscriber.onCompleted();
    };
    const errListener = (err) => {
      subscriber.onError({ path: ["_seq"], value: { $type: "error", value: err } });
    };
    const changeListener = (change) => {
      usedFeed.lastSeq = change.seq;
      const jsonGE = {
        jsonGraph: {},
        paths: []
      };
      if (change.doc.type === "system:counter" && change.doc.path) {
        const changePath = change.doc.path.split(".");
        jsonGE.paths.push(changePath);
        let target = jsonGE.jsonGraph;
        let i3 = 0;
        for (const key of changePath) {
          i3++;
          if (!target[key]) {
            target[key] = {};
          }
          if (i3 === changePath.length) {
            target[key] = { value: change.doc.value, $type: "atom" };
          } else {
            target = target[key];
          }
        }
      } else {
        jsonGE.paths.push(["_docs", change.id]);
        jsonGE.jsonGraph._docs = {
          [change.id]: { $type: "atom", value: change.doc, $expires: 1 }
        };
      }
      jsonGE.paths.push(["_seq"]);
      jsonGE.jsonGraph._seq = { $type: "atom", value: change.seq };
      subscriber.onNext(jsonGE);
      schedule(() => {
        if (!subscriber.isStopped) {
          subscriber.onCompleted();
        }
      });
    };
    usedFeed.on("change", changeListener);
    usedFeed.on("error", errListener);
    usedFeed.on("complete", complListener);
    return () => {
      if (catchupFeed) {
        usedFeed.cancel();
      }
      usedFeed.removeListener("change", changeListener);
      usedFeed.removeListener("error", errListener);
      usedFeed.removeListener("complete", complListener);
    };
  });
}
var _sync = ({ dbs, Observable: Observable3, model }, [since]) => {
  return dbs && doSync(dbs, since, Observable3, model);
};
async function getDocs({ ids, dbs }) {
  const docs = await dbs.sync.pullDocs(ids.filter((id) => id), { includeDocs: true });
  const _docs = {};
  docs.forEach((doc) => {
    const envelope = { $type: "atom", value: doc, $expires: 1 };
    if (doc.type) {
      envelope.$schema = { $ref: doc.type };
    } else if (doc.types?.length === 1) {
      envelope.$schema = { $ref: doc.types[0].profile };
    } else if (doc.types?.length > 1) {
      envelope.$schema = { anyOf: doc.types.map((type) => ({ "$ref": type.profile })) };
    }
    _docs[doc._id] = envelope;
  });
  return {
    jsonGraph: {
      _docs
    }
  };
}

// app/src/deps/luxon.js
var t = class extends Error {
};
var r = class extends t {
  constructor() {
    super("Zone is an abstract class");
  }
};
var e = "numeric";
var n = "short";
var s = "long";
function O(t2) {
  return void 0 === t2;
}
function l(t2, e2 = 2) {
  let r2;
  return r2 = t2 < 0 ? "-" + ("" + -t2).padStart(e2, "0") : ("" + t2).padStart(e2, "0");
}
function d(t2) {
  if (!O(t2) && null !== t2 && "" !== t2)
    return parseInt(t2, 10);
}
function ft(t2) {
  if (!O(t2) && null !== t2 && "" !== t2)
    return t2 = 1e3 * parseFloat("0." + t2), Math.floor(t2);
}
function pt(t2) {
  let e2 = Date.UTC(t2.year, t2.month - 1, t2.day, t2.hour, t2.minute, t2.second, t2.millisecond);
  return t2.year < 100 && 0 <= t2.year && (e2 = new Date(e2)).setUTCFullYear(e2.getUTCFullYear() - 1900), +e2;
}
function Ot(t2, e2, r2, n2 = null) {
  const s2 = new Date(t2), i2 = { hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
  n2 && (i2.timeZone = n2);
  t2 = { timeZoneName: e2, ...i2 }, n2 = new Intl.DateTimeFormat(r2, t2).formatToParts(s2).find((t3) => "timezonename" === t3.type.toLowerCase());
  return n2 ? n2.value : null;
}
function bt(t2, e2) {
  let r2 = parseInt(t2, 10);
  Number.isNaN(r2) && (r2 = 0);
  t2 = parseInt(e2, 10) || 0, e2 = r2 < 0 || Object.is(r2, -0) ? -t2 : t2;
  return 60 * r2 + e2;
}
function Nt(t2, e2) {
  var r2 = Math.trunc(Math.abs(t2 / 60)), n2 = Math.trunc(Math.abs(t2 % 60)), s2 = 0 <= t2 ? "+" : "-";
  switch (e2) {
    case "short":
      return s2 + l(r2, 2) + ":" + l(n2, 2);
    case "narrow":
      return s2 + r2 + (0 < n2 ? ":" + n2 : "");
    case "techie":
      return s2 + l(r2, 2) + l(n2, 2);
    default:
      throw new RangeError(`Value format ${e2} is out of range for property format`);
  }
}
n = /[A-Za-z_+-]{1,256}(?::?\/[A-Za-z0-9_+-]{1,256}(?:\/[A-Za-z0-9_+-]{1,256})?)?/;
var i = class {
  get type() {
    throw new r();
  }
  get name() {
    throw new r();
  }
  get ianaName() {
    return this.name;
  }
  get isUniversal() {
    throw new r();
  }
  offsetName(t2, e2) {
    throw new r();
  }
  formatOffset(t2, e2) {
    throw new r();
  }
  offset(t2) {
    throw new r();
  }
  equals(t2) {
    throw new r();
  }
  get isValid() {
    throw new r();
  }
};
var Bt = {};
function Qt(t2) {
  return Bt[t2] || (Bt[t2] = new Intl.DateTimeFormat("en-US", { hour12: false, timeZone: t2, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", era: "short" })), Bt[t2];
}
var Kt = { year: 0, month: 1, day: 2, era: 3, hour: 4, minute: 5, second: 6 };
function Xt(t2, e2) {
  var t2 = t2.format(e2).replace(/\u200E/g, ""), [, e2, t2, r2, n2, s2, i2, a2] = /(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/.exec(t2);
  return [r2, e2, t2, n2, s2, i2, a2];
}
function te(t2, e2) {
  var r2 = t2.formatToParts(e2);
  const n2 = [];
  for (let t3 = 0; t3 < r2.length; t3++) {
    var { type: s2, value: i2 } = r2[t3], a2 = Kt[s2];
    "era" === s2 ? n2[a2] = i2 : O(a2) || (n2[a2] = parseInt(i2, 10));
  }
  return n2;
}
var ee = {};
var w = class _w extends i {
  static create(t2) {
    return ee[t2] || (ee[t2] = new _w(t2)), ee[t2];
  }
  static resetCache() {
    ee = {}, Bt = {};
  }
  static isValidSpecifier(t2) {
    return this.isValidZone(t2);
  }
  static isValidZone(t2) {
    if (!t2)
      return false;
    try {
      return new Intl.DateTimeFormat("en-US", { timeZone: t2 }).format(), true;
    } catch (t3) {
      return false;
    }
  }
  constructor(t2) {
    super(), this.zoneName = t2, this.valid = _w.isValidZone(t2);
  }
  get type() {
    return "iana";
  }
  get name() {
    return this.zoneName;
  }
  get isUniversal() {
    return false;
  }
  offsetName(t2, { format: e2, locale: r2 }) {
    return Ot(t2, e2, r2, this.name);
  }
  formatOffset(t2, e2) {
    return Nt(this.offset(t2), e2);
  }
  offset(t2) {
    t2 = new Date(t2);
    if (isNaN(t2))
      return NaN;
    var e2 = Qt(this.name);
    let [r2, n2, s2, i2, a2, o, u] = (e2.formatToParts ? te : Xt)(e2, t2);
    e2 = +t2, t2 = e2 % 1e3;
    return (pt({ year: r2 = "BC" === i2 ? 1 - Math.abs(r2) : r2, month: n2, day: s2, hour: 24 === a2 ? 0 : a2, minute: o, second: u, millisecond: 0 }) - (e2 -= 0 <= t2 ? t2 : 1e3 + t2)) / 6e4;
  }
  equals(t2) {
    return "iana" === t2.type && t2.name === this.name;
  }
  get isValid() {
    return this.valid;
  }
};
var re = null;
var v = class _v extends i {
  static get utcInstance() {
    return re = null === re ? new _v(0) : re;
  }
  static instance(t2) {
    return 0 === t2 ? _v.utcInstance : new _v(t2);
  }
  static parseSpecifier(t2) {
    if (t2) {
      t2 = t2.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
      if (t2)
        return new _v(bt(t2[1], t2[2]));
    }
    return null;
  }
  constructor(t2) {
    super(), this.fixed = t2;
  }
  get type() {
    return "fixed";
  }
  get name() {
    return 0 === this.fixed ? "UTC" : "UTC" + Nt(this.fixed, "narrow");
  }
  get ianaName() {
    return 0 === this.fixed ? "Etc/UTC" : "Etc/GMT" + Nt(-this.fixed, "narrow");
  }
  offsetName() {
    return this.name;
  }
  formatOffset(t2, e2) {
    return Nt(this.fixed, e2);
  }
  get isUniversal() {
    return true;
  }
  offset() {
    return this.fixed;
  }
  equals(t2) {
    return "fixed" === t2.type && t2.fixed === this.fixed;
  }
  get isValid() {
    return true;
  }
};
function a(...t2) {
  t2 = t2.reduce((t3, e2) => t3 + e2.source, "");
  return RegExp(`^${t2}$`);
}
function g(...t2) {
  return (i2) => t2.reduce(([t3, e2, r2], n2) => {
    var [n2, r2, s2] = n2(i2, r2);
    return [{ ...t3, ...n2 }, r2 || e2, s2];
  }, [{}, null, 1]).slice(0, 2);
}
function Ve(...s2) {
  return (t2, e2) => {
    const r2 = {};
    let n2;
    for (n2 = 0; n2 < s2.length; n2++)
      r2[s2[n2]] = d(t2[e2 + n2]);
    return [r2, null, e2 + n2];
  };
}
var e = /(?:(Z)|([+-]\d\d)(?::?(\d\d))?)/;
var s = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/;
var xe = RegExp(s.source + `(?:${e.source}?(?:\\[(${n.source})\\])?)?`);
var Ie = RegExp(`(?:T${xe.source})?`);
var Ce = Ve("weekYear", "weekNumber", "weekDay");
var Fe = Ve("year", "ordinal");
var e = RegExp(s.source + ` ?(?:${e.source}|(${n.source}))?`);
var n = RegExp(`(?: ${e.source})?`);
function T(t2, e2, r2) {
  t2 = t2[e2];
  return O(t2) ? r2 : d(t2);
}
function S(t2, e2) {
  return [{ hours: T(t2, e2, 0), minutes: T(t2, e2 + 1, 0), seconds: T(t2, e2 + 2, 0), milliseconds: ft(t2[e2 + 3]) }, null, e2 + 4];
}
function Ze(t2, e2) {
  var r2 = !t2[e2] && !t2[e2 + 1], t2 = bt(t2[e2 + 1], t2[e2 + 2]);
  return [{}, r2 ? null : v.instance(t2), e2 + 3];
}
function Le(t2, e2) {
  return [{}, t2[e2] ? w.create(t2[e2]) : null, e2 + 1];
}
var ze = RegExp(`^T?${s.source}$`);
var Pe = a(/([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/, Ie);
var Ge = a(/(\d{4})-?W(\d\d)(?:-?(\d))?/, Ie);
var Be = a(/(\d{4})-?(\d{3})/, Ie);
var Qe = a(xe);
var Ke = g(function(t2, e2) {
  return [{ year: T(t2, e2), month: T(t2, e2 + 1, 1), day: T(t2, e2 + 2, 1) }, null, e2 + 3];
}, S, Ze, Le);
var Xe = g(Ce, S, Ze, Le);
var tr = g(Fe, S, Ze, Le);
var er = g(S, Ze, Le);
var ar = g(S);
var ur = a(/(\d{4})-(\d\d)-(\d\d)/, n);
var lr = a(e);
var cr = g(S, Ze, Le);
var dr = { weeks: { days: 7, hours: 168, minutes: 10080, seconds: 604800, milliseconds: 6048e5 }, days: { hours: 24, minutes: 1440, seconds: 86400, milliseconds: 864e5 }, hours: { minutes: 60, seconds: 3600, milliseconds: 36e5 }, minutes: { seconds: 60, milliseconds: 6e4 }, seconds: { milliseconds: 1e3 } };
var mr = { years: { quarters: 4, months: 12, weeks: 52, days: 365, hours: 8760, minutes: 525600, seconds: 31536e3, milliseconds: 31536e6 }, quarters: { months: 3, weeks: 13, days: 91, hours: 2184, minutes: 131040, seconds: 7862400, milliseconds: 78624e5 }, months: { weeks: 4, days: 30, hours: 720, minutes: 43200, seconds: 2592e3, milliseconds: 2592e6 }, ...dr };
var N = 365.2425;
var fr = 30.436875;
var yr = { years: { quarters: 4, months: 12, weeks: N / 7, days: N, hours: 24 * N, minutes: 525949.2, seconds: 525949.2 * 60, milliseconds: 525949.2 * 60 * 1e3 }, quarters: { months: 3, weeks: N / 28, days: N / 4, hours: 24 * N / 4, minutes: 131487.3, seconds: 525949.2 * 60 / 4, milliseconds: 7889237999999999e-6 }, months: { weeks: fr / 7, days: fr, hours: 24 * fr, minutes: 43829.1, seconds: 2629746, milliseconds: 2629746e3 }, ...dr };
var D = ["years", "quarters", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds"];
var gr = D.slice(0).reverse();
var kr = { arab: "[\u0660-\u0669]", arabext: "[\u06F0-\u06F9]", bali: "[\u1B50-\u1B59]", beng: "[\u09E6-\u09EF]", deva: "[\u0966-\u096F]", fullwide: "[\uFF10-\uFF19]", gujr: "[\u0AE6-\u0AEF]", hanidec: "[\u3007|\u4E00|\u4E8C|\u4E09|\u56DB|\u4E94|\u516D|\u4E03|\u516B|\u4E5D]", khmr: "[\u17E0-\u17E9]", knda: "[\u0CE6-\u0CEF]", laoo: "[\u0ED0-\u0ED9]", limb: "[\u1946-\u194F]", mlym: "[\u0D66-\u0D6F]", mong: "[\u1810-\u1819]", mymr: "[\u1040-\u1049]", orya: "[\u0B66-\u0B6F]", tamldec: "[\u0BE6-\u0BEF]", telu: "[\u0C66-\u0C6F]", thai: "[\u0E50-\u0E59]", tibt: "[\u0F20-\u0F29]", latn: "\\d" };
var Nr = kr.hanidec.replace(/[\[|\]]/g, "").split("");
var Er = `[ ${String.fromCharCode(160)}]`;
var Vr = new RegExp(Er, "g");
s = "3.0.3";

// app/src/lib/helpers.js
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
var sleepRandom = () => {
  const ms = randomInt(500, 1500);
  return sleep(ms);
};

// app/src/lib/req.js
async function req(url, { method, body, headers: headersArg = {}, raw: rawArg, retry = false, redirect = "manual" } = {}) {
  if (!method) {
    method = body ? "POST" : "GET";
  }
  const headers = new Headers(headersArg);
  if (body && !headers.get("content-type")) {
    headers.set("content-type", "application/json");
  }
  headers.set("X-Requested-With", "XMLHttpRequest");
  if (body && headers.get("content-type") === "application/json") {
    body = JSON.stringify(body);
  }
  let res;
  let kvs;
  let retried;
  const reqStart = Date.now();
  const wasCached = !!res;
  if (!wasCached) {
    res = await fetch(url, { method, body, headers, redirect }).catch((fetchError) => ({ ok: false, error: fetchError }));
    if (!res.ok && retry) {
      retried = {
        status: res.status,
        statusText: res.statusText,
        text: res.text ? await res.text() : void 0,
        error: res.error,
        redirect: res.redirected || res.type === "opaqueredirect"
      };
      if (retried.redirect || res.status === 401) {
        self.session?.refresh();
      }
      await sleepRandom();
      res = await fetch(url, { method, body, headers, redirect }).catch((fetchError) => ({ ok: false, error: fetchError }));
    }
  }
  const duration = Date.now() - reqStart;
  let resHeaders;
  let json;
  let text;
  if (!rawArg && res.headers) {
    resHeaders = Object.fromEntries(res.headers.entries());
    if (!wasCached) {
      let oldCacheStatus = res.headers.get("cache-status") || "";
      if (oldCacheStatus) {
        oldCacheStatus += ", ";
      }
      resHeaders["cache-status"] = oldCacheStatus + "edge-kv; miss" + (kvs ? "; stored" : "");
    }
    text = await res.text();
    if (res.headers.get("content-type") === "application/json") {
      json = JSON.parse(text);
    }
  }
  const baseResponse = {
    headers: resHeaders,
    duration,
    ok: res.ok,
    redirect: res.redirected || res.type === "opaqueredirect",
    status: res.status,
    statusText: res.statusText,
    retried,
    error: res.error
  };
  if (baseResponse.redirect || res.status === 401) {
    self.session?.refresh();
  }
  return {
    raw: res,
    json,
    text,
    ...baseResponse
  };
}

// app/src/falcor/router.js
function falcorTags(routes) {
  Object.keys(routes).forEach((key) => {
    Object.keys(routes[key]).forEach((method) => {
      const tags = routes[key][method].tags;
      routes[key][method].tags = tags ? tags : ["falcor"];
    });
  });
  return routes;
}
function maxRange(ranges) {
  let from2;
  let to;
  ranges.forEach((range3) => {
    if (to === void 0) {
      to = range3.to;
    } else {
      to = Math.max(to, range3.to);
    }
    if (from2 === void 0) {
      from2 = range3.from;
    } else {
      from2 = Math.min(from2, range3.from);
    }
  });
  return { from: from2, to };
}
function toFalcorRoutes(schema) {
  const routes = [];
  [...Object.entries(schema.paths)].forEach(([path, handlerArgs]) => {
    const handlers = {};
    Object.entries(handlerArgs).forEach(([handlerType, handlerConf]) => {
      if (handlerConf.tags?.includes?.("falcor")) {
        if (!["get", "set", "call"].includes(handlerType)) {
          console.error("unsupported falcor handler type " + handlerType);
        }
        const handler = handlerConf.handler || handlerConf.operationId && falcor_handlers_exports[handlerConf.operationId];
        handlers[handlerType] = function() {
          arguments[0].dbs = this.dbs;
          arguments[0].session = this.session;
          arguments[0].Observable = this.Observable;
          arguments[0].req = this.req;
          arguments[0].fetch = this.fetch;
          arguments[0].model = this.model;
          arguments[0].maxRange = maxRange;
          let getRes = handler(...arguments);
          if (handlerType === "get") {
            const pathArg = arguments[0];
            const auoWrap = (paAr, res) => {
              if (res.jsonGraph) {
                return res;
              }
              if (res?.length && res?.[0]?.path) {
                return res;
              }
              if (["boolean", "undefined", "number", "string"].includes(typeof res) || !res.value && !res.path) {
                res = { value: { $type: "atom", value: res } };
              }
              if (res.value !== void 0 && !res.path) {
                res.path = paAr.length ? [...paAr] : [paAr];
              }
              return res;
            };
            if (typeof getRes.then === "function") {
              getRes = getRes.then((res) => {
                return auoWrap(pathArg, res);
              });
            } else {
              getRes = auoWrap(pathArg, getRes);
            }
          }
          return getRes;
        };
      }
    });
    if (Object.keys(handlers).length > 0) {
      routes.push({
        route: path,
        ...handlers
      });
    }
  });
  return routes;
}
function makeRouter({ dataRoutes, schema }) {
  if (!dataRoutes && schema) {
    if (typeof schema === "function") {
      schema = schema({ defaultPaths: default_routes_default, addPathTags });
    } else if (schema) {
      schema.paths = { ...default_routes_default, ...falcorTags(schema.paths) };
    }
    dataRoutes = toFalcorRoutes(schema);
  }
  class AtreyuRouter extends Router$1.createClass(dataRoutes) {
    // eslint-disable-line functional/no-class
    constructor({ session, dbs, fetch: internalFetch }) {
      super({
        // FIXME: check why debug flag and path errors dont work!
        debug: false,
        hooks: {
          pathError: (err) => {
            console.error(err);
          },
          error: (err) => {
            console.error(err);
          },
          methodSummary: (e2) => {
            const totalDuration = e2.end - e2.start;
            e2.routes?.forEach((route, i2) => {
              let batchMarker = "";
              if (e2.routes.length > 1) {
                if (i2 === 0) {
                  batchMarker = " (batched >";
                } else if (i2 === e2.routes.length - 1) {
                  batchMarker = " < batched)";
                } else {
                  batchMarker = " ...";
                }
                const body = route.results?.map((res) => res.value.jsonGraph || res.value);
                const duration = route.end && route.start ? route.end - route.start : 0;
                urlLogger({
                  method: e2.method.toUpperCase() + batchMarker,
                  url: `falcor://${JSON.stringify(route.pathSet)}`,
                  duration,
                  error: route.error,
                  body
                });
              } else {
                urlLogger({
                  method: e2.method.toUpperCase(),
                  url: `falcor://${JSON.stringify(route.pathSet)}`,
                  error: route.error,
                  duration: totalDuration,
                  body: e2.results[i2]?.value.jsonGraph || e2.results[i2]?.value.value
                });
              }
            });
            const reqPaths = [...e2.pathSets || [], ...e2.callPath ? [e2.callPath] : [], ...e2.jsonGraphEnvelope?.paths || []];
            if (reqPaths.length > (e2.routes?.length || 0)) {
              reqPaths.slice(e2.routes.length).forEach((pathSet) => {
                urlLogger({
                  missing: true,
                  error: e2.error,
                  method: e2.method.toUpperCase(),
                  url: `falcor://${JSON.stringify(pathSet)}`,
                  duration: totalDuration,
                  args: e2.args
                });
              });
            }
          }
        }
      });
      this.session = session;
      this.dbs = dbs;
      this.req = req;
      this.fetch = internalFetch;
      this.Observable = Observable;
    }
  }
  return AtreyuRouter;
}
export {
  falcorTags,
  makeRouter,
  toFalcorRoutes
};
