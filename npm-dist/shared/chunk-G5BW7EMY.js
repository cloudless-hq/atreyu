// app/src/store/helpers.js
function extractFromCache({ obj, path, idx = 0, root: root3 = obj, parentAtom, verbose }) {
  if (verbose) {
    console.log({ obj, path, idx });
  }
  if (obj && obj.$type === "atom" && path.length - idx !== 0) {
    const step = path[idx];
    if (obj.value === void 0) {
      return { value: void 0, parentAtom, $type: obj.$type };
    }
    return extractFromCache({ obj: obj.value[step], path, idx: idx + 1, root: root3, parentAtom: { obj, relPath: path.slice(idx) }, verbose });
  } else if (obj && obj.$type === "ref") {
    const newPath = obj.value.concat(path.slice(idx));
    return extractFromCache({ obj: root3, path: newPath, verbose });
  } else if (path.length - idx === 0) {
    if (obj && obj.$type === "error") {
      return { value: void 0, parentAtom, $type: obj.$type };
    } else if (obj && obj.$type) {
      return { value: obj.value, parentAtom, $type: obj.$type };
    } else {
      return { value: obj, parentAtom };
    }
  } else if (obj === null || obj === void 0) {
    return { value: obj, parentAtom };
  } else {
    const step = path[idx];
    return extractFromCache({ obj: obj[step], path, idx: idx + 1, root: root3, verbose });
  }
}
function getJsonPath(obj, path) {
  if (obj === void 0) {
    return;
  }
  let current = obj;
  for (let i = 0; i < path.length; i++) {
    if (current[path[i]] === void 0) {
      return;
    }
    current = current[path[i]];
  }
  return current;
}
function setPathValue(o, [head3, ...tail], newValue, root3) {
  if (!root3) {
    o = structuredClone(o);
    root3 = o;
  }
  if (tail.length) {
    if (!o[head3]) {
      o[head3] = {};
    }
    setPathValue(o[head3], tail, newValue, root3);
  } else {
    o[head3] = newValue;
    return root3;
  }
}

// app/build/deps/falcor.js
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
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
var functionTypeof = "function";
var isFunction$5 = function isFunction(func) {
  return Boolean(func) && typeof func === functionTypeof;
};
var objTypeof$1 = "object";
var isObject$f = function isObject(value) {
  return value !== null && typeof value === objTypeof$1;
};
var isObject$e = isObject$f;
var hasOwn$3 = Object.prototype.hasOwnProperty;
var hasOwn_1 = function(obj, prop) {
  return isObject$e(obj) && hasOwn$3.call(obj, prop);
};
var isFunction$4 = isFunction$5;
var hasOwn$2 = hasOwn_1;
function ModelRoot$1(o) {
  var options = o || {};
  this.syncRefCount = 0;
  this.expired = options.expired || [];
  this.unsafeMode = options.unsafeMode || false;
  this.cache = {};
  if (isFunction$4(options.comparator)) {
    this.comparator = options.comparator;
  }
  if (isFunction$4(options.errorSelector)) {
    this.errorSelector = options.errorSelector;
  }
  if (isFunction$4(options.onChange)) {
    this.onChange = options.onChange;
  }
}
ModelRoot$1.prototype.errorSelector = function errorSelector(x, y) {
  return y;
};
ModelRoot$1.prototype.comparator = function comparator(cacheNode, messageNode) {
  if (hasOwn$2(cacheNode, "value") && hasOwn$2(messageNode, "value")) {
    return cacheNode.value === messageNode.value && cacheNode.$type === messageNode.$type && cacheNode.$expires === messageNode.$expires;
  }
  return cacheNode === messageNode;
};
var ModelRoot_1 = ModelRoot$1;
function ModelDataSourceAdapter$1(model) {
  this._model = model._materialize().treatErrorsAsValues();
}
ModelDataSourceAdapter$1.prototype.get = function get(pathSets) {
  return this._model.get.apply(this._model, pathSets)._toJSONG();
};
ModelDataSourceAdapter$1.prototype.set = function set(jsongResponse) {
  return this._model.set(jsongResponse)._toJSONG();
};
ModelDataSourceAdapter$1.prototype.call = function call(path, args, suffixes, paths) {
  var params = [path, args, suffixes];
  Array.prototype.push.apply(params, paths);
  return this._model.call.apply(this._model, params)._toJSONG();
};
var ModelDataSourceAdapter_1 = ModelDataSourceAdapter$1;
var RequestTypes$1 = {
  GetRequest: "GET"
};
var reservedPrefix$1 = "$";
var reservedPrefix = reservedPrefix$1;
var privatePrefix$2 = reservedPrefix + "_";
var ref$1;
var hasRequiredRef;
function requireRef() {
  if (hasRequiredRef)
    return ref$1;
  hasRequiredRef = 1;
  ref$1 = privatePrefix$2 + "ref";
  return ref$1;
}
var __ref$4 = requireRef();
var createHardlink$2 = function createHardlink(from, to) {
  var backRefs = to.$_refsLength || 0;
  to[__ref$4 + backRefs] = from;
  to.$_refsLength = backRefs + 1;
  from.$_refIndex = backRefs;
  from.$_context = to;
};
var ref = "ref";
var now$3 = Date.now;
var expiresNow$1 = 0;
var expiresNever = 1;
var now$2 = now$3;
var $now$1 = expiresNow$1;
var $never$1 = expiresNever;
var isAlreadyExpired = function isAlreadyExpired2(node) {
  var exp = node.$expires;
  return exp != null && exp !== $never$1 && exp !== $now$1 && exp < now$2();
};
var objTypeof = "object";
var isPrimitive$4 = function isPrimitive(value) {
  return value == null || typeof value !== objTypeof;
};
var splice$2 = function lruSplice(root3, object) {
  var prev = object.$_prev;
  var next = object.$_next;
  if (next) {
    next.$_prev = prev;
  }
  if (prev) {
    prev.$_next = next;
  }
  object.$_prev = object.$_next = void 0;
  if (object === root3.$_head) {
    root3.$_head = next;
  }
  if (object === root3.$_tail) {
    root3.$_tail = prev;
  }
};
var splice$1 = splice$2;
var expireNode$5 = function expireNode(node, expired, lru) {
  if (!node.$_invalidated) {
    node.$_invalidated = true;
    expired.push(node);
    splice$1(lru, node);
  }
  return node;
};
var isArray$9 = Array.isArray;
var iterateKeySet$7 = function iterateKeySet(keySet, note) {
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
      if (el !== null && typeof el === "object") {
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
    if (!note.loaded) {
      note.loaded = true;
      return keySet;
    }
    note.done = true;
    return void 0;
  }
};
function initializeRange(key, memo) {
  var from = memo.from = key.from || 0;
  var to = memo.to = key.to || (typeof key.length === "number" && memo.from + key.length - 1 || 0);
  memo.rangeOffset = memo.from;
  memo.loaded = true;
  if (from > to) {
    memo.empty = true;
  }
}
function initializeNote(key, note) {
  note.done = false;
  var isObject3 = note.isObject = !!(key && typeof key === "object");
  note.isArray = isObject3 && isArray$9(key);
  note.arrayOffset = 0;
}
var iterateKeySet$6 = iterateKeySet$7;
var toTree$2 = function toTree(paths) {
  return paths.reduce(__reducer, {});
};
function __reducer(acc, path) {
  innerToTree(acc, path, 0);
  return acc;
}
function innerToTree(seed, path, depth) {
  var keySet = path[depth];
  var iteratorNote = {};
  var key;
  var nextDepth = depth + 1;
  key = iterateKeySet$6(keySet, iteratorNote);
  while (!iteratorNote.done) {
    var next = Object.prototype.hasOwnProperty.call(seed, key) && seed[key];
    if (!next) {
      if (nextDepth === path.length) {
        seed[key] = null;
      } else if (key !== void 0) {
        next = seed[key] = {};
      }
    }
    if (nextDepth < path.length) {
      innerToTree(next, path, nextDepth);
    }
    key = iterateKeySet$6(keySet, iteratorNote);
  }
}
var iterateKeySet$5 = iterateKeySet$7;
var hasIntersection$2 = function hasIntersection(tree, path, depth) {
  var current = tree;
  var intersects = true;
  for (; intersects && depth < path.length; ++depth) {
    var key = path[depth];
    var keyType = typeof key;
    if (key && keyType === "object") {
      var note = {};
      var innerKey = iterateKeySet$5(key, note);
      var nextDepth = depth + 1;
      do {
        var next = current[innerKey];
        intersects = next !== void 0;
        if (intersects) {
          intersects = hasIntersection(next, path, nextDepth);
        }
        innerKey = iterateKeySet$5(key, note);
      } while (intersects && !note.done);
      break;
    }
    current = current[key];
    intersects = current !== void 0;
  }
  return intersects;
};
var hasIntersection$1 = hasIntersection$2;
var pathsComplementFromTree = function pathsComplementFromTree2(paths, tree) {
  var out = [];
  var outLength = -1;
  for (var i = 0, len = paths.length; i < len; ++i) {
    if (!hasIntersection$1(tree, paths[i], 0)) {
      out[++outLength] = paths[i];
    }
  }
  return out;
};
var hasIntersection2 = hasIntersection$2;
var pathsComplementFromLengthTree = function pathsComplementFromLengthTree2(paths, tree) {
  var out = [];
  var outLength = -1;
  for (var i = 0, len = paths.length; i < len; ++i) {
    var path = paths[i];
    if (!hasIntersection2(tree[path.length], path, 0)) {
      out[++outLength] = path;
    }
  }
  return out;
};
var jsonKey = {};
function toJsonKey(obj) {
  if (Object.prototype.toString.call(obj) === "[object Object]") {
    var key = JSON.stringify(obj, replacer);
    if (key[0] === "{") {
      return key;
    }
  }
  throw new TypeError("Only plain objects can be converted to JSON keys");
}
function replacer(key, value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return value;
  }
  return Object.keys(value).sort().reduce(function(acc, k) {
    acc[k] = value[k];
    return acc;
  }, {});
}
function maybeJsonKey(key) {
  if (typeof key !== "string" || key[0] !== "{") {
    return;
  }
  var parsed;
  try {
    parsed = JSON.parse(key);
  } catch (e) {
    return;
  }
  if (JSON.stringify(parsed, replacer) !== key) {
    return;
  }
  return parsed;
}
function isJsonKey(key) {
  return typeof maybeJsonKey(key) !== "undefined";
}
jsonKey.toJsonKey = toJsonKey;
jsonKey.isJsonKey = isJsonKey;
jsonKey.maybeJsonKey = maybeJsonKey;
var toPaths$2 = { exports: {} };
var integerKey = {};
var MAX_SAFE_INTEGER = 9007199254740991;
var abs = Math.abs;
var isSafeInteger = Number.isSafeInteger || function isSafeInteger2(num) {
  return typeof num === "number" && num % 1 === 0 && abs(num) <= MAX_SAFE_INTEGER;
};
function maybeIntegerKey$1(val) {
  if (typeof val === "string") {
    var num = Number(val);
    if (isSafeInteger(num) && String(num) === val) {
      return num;
    }
  } else if (isSafeInteger(val)) {
    return val;
  }
}
function isIntegerKey$1(val) {
  if (typeof val === "string") {
    var num = Number(val);
    return isSafeInteger(num) && String(num) === val;
  }
  return isSafeInteger(val);
}
integerKey.isIntegerKey = isIntegerKey$1;
integerKey.maybeIntegerKey = maybeIntegerKey$1;
var maybeIntegerKey = integerKey.maybeIntegerKey;
var isIntegerKey = integerKey.isIntegerKey;
var isArray$8 = Array.isArray;
var typeOfObject = "object";
var typeOfNumber = "number";
toPaths$2.exports = function toPaths(lengths) {
  var pathmap;
  var allPaths = [];
  for (var length in lengths) {
    var num = maybeIntegerKey(length);
    if (typeof num === typeOfNumber && isObject$d(pathmap = lengths[length])) {
      var paths = collapsePathMap(pathmap, 0, num).sets;
      var pathsIndex = -1;
      var pathsCount = paths.length;
      while (++pathsIndex < pathsCount) {
        allPaths.push(collapsePathSetIndexes(paths[pathsIndex]));
      }
    }
  }
  return allPaths;
};
function isObject$d(value) {
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
    subKeysCount = getKeys$1(pathmap, subKeys);
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
      var num = maybeIntegerKey(key);
      subPath.keys.push(typeof num === typeOfNumber ? num : key);
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
    subKeysCount = getKeys$1(pathmap, subKeys);
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
    if (isArray$8(keyset)) {
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
    if (!isIntegerKey(key)) {
      isSparseRange = false;
      break;
    }
    keyset[keyIndex] = parseInt(key, 10);
  }
  if (isSparseRange === true) {
    keyset.sort(sortListAscending);
    var from = keyset[0];
    var to = keyset[keyCount];
    if (to - from <= keyCount) {
      return {
        from,
        to
      };
    }
  }
  return keyset;
}
function sortListAscending(a, b) {
  return a - b;
}
function getKeys$1(map, keys, sort) {
  var len = 0;
  for (var key in map) {
    keys[len++] = key;
  }
  return len;
}
function getHashCode(key) {
  var code = 5381;
  var index2 = -1;
  var count = key.length;
  while (++index2 < count) {
    code = (code << 5) + code + key.charCodeAt(index2);
  }
  return String(code);
}
toPaths$2.exports._isSafeNumber = isIntegerKey;
var toPathsExports = toPaths$2.exports;
var toPaths$1 = toPathsExports;
var toTree$1 = toTree$2;
var collapse = function collapse2(paths) {
  var collapseMap = paths.reduce(function(acc, path) {
    var len = path.length;
    if (!acc[len]) {
      acc[len] = [];
    }
    acc[len].push(path);
    return acc;
  }, {});
  Object.keys(collapseMap).forEach(function(collapseKey) {
    collapseMap[collapseKey] = toTree$1(collapseMap[collapseKey]);
  });
  return toPaths$1(collapseMap);
};
var errors$1 = {
  innerReferences: "References with inner references are not allowed.",
  circularReference: "There appears to be a circular reference, maximum reference following exceeded."
};
var errors = errors$1;
function followReference$2(cacheRoot, ref3, maxRefFollow) {
  if (typeof maxRefFollow === "undefined") {
    maxRefFollow = 5;
  }
  var branch = cacheRoot;
  var node = branch;
  var refPath = ref3;
  var depth = -1;
  var referenceCount = 0;
  while (++depth < refPath.length) {
    var key = refPath[depth];
    node = branch[key];
    if (node === null || typeof node !== "object" || node.$type && node.$type !== "ref") {
      break;
    }
    if (node.$type === "ref") {
      if (depth + 1 < refPath.length) {
        return { error: new Error(errors.innerReferences) };
      }
      if (referenceCount >= maxRefFollow) {
        return { error: new Error(errors.circularReference) };
      }
      refPath = node.value;
      depth = -1;
      branch = cacheRoot;
      referenceCount++;
    } else {
      branch = node;
    }
  }
  return { node, refPath };
}
var followReference_1$1 = followReference$2;
function cloneArray$1(arr, index2) {
  var a = [];
  var len = arr.length;
  for (var i = index2 || 0; i < len; i++) {
    a[i] = arr[i];
  }
  return a;
}
var cloneArray_1 = cloneArray$1;
var catAndSlice$1 = function catAndSlice(a, b, slice) {
  var next = [], i, j, len;
  for (i = 0, len = a.length; i < len; ++i) {
    next[i] = a[i];
  }
  for (j = slice || 0, len = b.length; j < len; ++j, ++i) {
    next[i] = b[j];
  }
  return next;
};
var iterateKeySet$4 = iterateKeySet$7;
var cloneArray = cloneArray_1;
var catAndSlice2 = catAndSlice$1;
var followReference$1 = followReference_1$1;
var optimizePathSets = function optimizePathSets2(cache, paths, maxRefFollow) {
  if (typeof maxRefFollow === "undefined") {
    maxRefFollow = 5;
  }
  var optimized = [];
  for (var i = 0, len = paths.length; i < len; ++i) {
    var error3 = optimizePathSet(cache, cache, paths[i], 0, optimized, [], maxRefFollow);
    if (error3) {
      return { error: error3 };
    }
  }
  return { paths: optimized };
};
function optimizePathSet(cache, cacheRoot, pathSet, depth, out, optimizedPath, maxRefFollow) {
  if (cache === void 0) {
    out[out.length] = catAndSlice2(optimizedPath, pathSet, depth);
    return;
  }
  if (cache === null || cache.$type && cache.$type !== "ref" || typeof cache !== "object") {
    return;
  }
  if (cache.$type === "ref" && depth === pathSet.length) {
    return;
  }
  var keySet = pathSet[depth];
  var isKeySet = typeof keySet === "object" && keySet !== null;
  var nextDepth = depth + 1;
  var iteratorNote = false;
  var key = keySet;
  if (isKeySet) {
    iteratorNote = {};
    key = iterateKeySet$4(keySet, iteratorNote);
  }
  var next, nextOptimized;
  do {
    next = cache[key];
    var optimizedPathLength = optimizedPath.length;
    optimizedPath[optimizedPathLength] = key;
    if (next && next.$type === "ref" && nextDepth < pathSet.length) {
      var refResults = followReference$1(cacheRoot, next.value, maxRefFollow);
      if (refResults.error) {
        return refResults.error;
      }
      next = refResults.node;
      nextOptimized = cloneArray(refResults.refPath);
    } else {
      nextOptimized = optimizedPath;
    }
    var error3 = optimizePathSet(
      next,
      cacheRoot,
      pathSet,
      nextDepth,
      out,
      nextOptimized,
      maxRefFollow
    );
    if (error3) {
      return error3;
    }
    optimizedPath.length = optimizedPathLength;
    if (iteratorNote && !iteratorNote.done) {
      key = iterateKeySet$4(keySet, iteratorNote);
    }
  } while (iteratorNote && !iteratorNote.done);
}
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
    var from = range3.from || 0;
    if (isNaN(from) || parseInt(from, 10) !== from) {
      throw new Error("Invalid range, 'from' is not an integer: " + JSON.stringify(range3));
    }
    if (from <= to) {
      return to - from + 1;
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
  for (var i = 0; i < pathSet.length; i++) {
    var segment = pathSet[i];
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
var pathCount = getPathCount;
var _escape = function escape(str) {
  return "_" + str;
};
var _unescape = function unescape(str) {
  if (str.slice(0, 1) === "_") {
    return str.slice(1);
  } else {
    throw SyntaxError('Expected "_".');
  }
};
var iterateKeySet$3 = iterateKeySet$7;
var materialize = function materialize2(pathSet, value) {
  return pathSet.reduceRight(function materializeInner(acc, keySet) {
    var branch = {};
    if (typeof keySet !== "object" || keySet === null) {
      branch[keySet] = acc;
      return branch;
    }
    var iteratorNote = {};
    var key = iterateKeySet$3(keySet, iteratorNote);
    while (!iteratorNote.done) {
      branch[key] = acc;
      key = iterateKeySet$3(keySet, iteratorNote);
    }
    return branch;
  }, value);
};
var lib$1 = {
  iterateKeySet: iterateKeySet$7,
  toTree: toTree$2,
  pathsComplementFromTree,
  pathsComplementFromLengthTree,
  toJsonKey: jsonKey.toJsonKey,
  isJsonKey: jsonKey.isJsonKey,
  maybeJsonKey: jsonKey.maybeJsonKey,
  hasIntersection: hasIntersection$2,
  toPaths: toPathsExports,
  isIntegerKey: integerKey.isIntegerKey,
  maybeIntegerKey: integerKey.maybeIntegerKey,
  collapse,
  followReference: followReference_1$1,
  optimizePathSets,
  pathCount,
  escape: _escape,
  unescape: _unescape,
  materialize
};
var incrementVersion$3 = { exports: {} };
var version$1 = 1;
incrementVersion$3.exports = function incrementVersion() {
  return version$1++;
};
incrementVersion$3.exports.getCurrentVersion = function getCurrentVersion() {
  return version$1;
};
var incrementVersionExports = incrementVersion$3.exports;
var error = "error";
var isObject$c = isObject$f;
var getSize$6 = function getSize(node) {
  return isObject$c(node) && node.$size || 0;
};
var isObject$b = isObject$f;
var getTimestamp$2 = function getTimestamp(node) {
  return isObject$b(node) && node.$timestamp || void 0;
};
var now$1 = now$3;
var $now = expiresNow$1;
var $never = expiresNever;
var isExpired$7 = function isExpired(node) {
  var exp = node.$expires;
  return exp != null && exp !== $never && (exp === $now || exp < now$1());
};
var privatePrefix$1 = privatePrefix$2;
var hasOwn$1 = hasOwn_1;
var isArray$7 = Array.isArray;
var isObject$a = isObject$f;
var clone$4 = function clone(value) {
  var dest = value;
  if (isObject$a(dest)) {
    dest = isArray$7(value) ? [] : {};
    var src2 = value;
    for (var key in src2) {
      if (key.lastIndexOf(privatePrefix$1, 0) === 0 || !hasOwn$1(src2, key)) {
        continue;
      }
      dest[key] = src2[key];
    }
  }
  return dest;
};
var isObject$9 = isObject$f;
var getExpires$1 = function getSize2(node) {
  return isObject$9(node) && node.$expires || void 0;
};
var atom;
var hasRequiredAtom;
function requireAtom() {
  if (hasRequiredAtom)
    return atom;
  hasRequiredAtom = 1;
  atom = "atom";
  return atom;
}
var now = now$3;
var expiresNow = expiresNow$1;
var atomSize = 50;
var clone$3 = clone$4;
var isArray$6 = Array.isArray;
var getSize$5 = getSize$6;
var getExpires = getExpires$1;
var atomType = requireAtom();
var wrapNode$2 = function wrapNode(nodeArg, typeArg, value) {
  var size = 0;
  var node = nodeArg;
  var type = typeArg;
  if (type) {
    var modelCreated = node.$_modelCreated;
    node = clone$3(node);
    size = getSize$5(node);
    node.$type = type;
    node.$_prev = void 0;
    node.$_next = void 0;
    node.$_modelCreated = modelCreated || false;
  } else {
    node = {
      $type: atomType,
      value,
      // eslint-disable-next-line camelcase
      $_prev: void 0,
      // eslint-disable-next-line camelcase
      $_next: void 0,
      // eslint-disable-next-line camelcase
      $_modelCreated: true
    };
  }
  if (value == null) {
    size = atomSize + 1;
  } else if (size == null || size <= 0) {
    switch (typeof value) {
      case "object":
        if (isArray$6(value)) {
          size = atomSize + value.length;
        } else {
          size = atomSize + 1;
        }
        break;
      case "string":
        size = atomSize + value.length;
        break;
      default:
        size = atomSize + 1;
        break;
    }
  }
  var expires = getExpires(node);
  if (typeof expires === "number" && expires < expiresNow) {
    node.$expires = now() + expires * -1;
  }
  node.$size = size;
  return node;
};
var insertNode$2 = function insertNode(node, parent, key, version2, optimizedPath) {
  node.$_key = key;
  node.$_parent = parent;
  if (version2 !== void 0) {
    node.$_version = version2;
  }
  if (!node.$_absolutePath) {
    if (Array.isArray(key)) {
      node.$_absolutePath = optimizedPath.slice(0, optimizedPath.index);
      Array.prototype.push.apply(node.$_absolutePath, key);
    } else {
      node.$_absolutePath = optimizedPath.slice(0, optimizedPath.index);
      node.$_absolutePath.push(key);
    }
  }
  parent[key] = node;
  return node;
};
var __ref$3 = requireRef();
var transferBackReferences$1 = function transferBackReferences(fromNode, destNode) {
  var fromNodeRefsLength = fromNode.$_refsLength || 0, destNodeRefsLength = destNode.$_refsLength || 0, i = -1;
  while (++i < fromNodeRefsLength) {
    var ref3 = fromNode[__ref$3 + i];
    if (ref3 !== void 0) {
      ref3.$_context = destNode;
      destNode[__ref$3 + (destNodeRefsLength + i)] = ref3;
      fromNode[__ref$3 + i] = void 0;
    }
  }
  destNode.$_refsLength = fromNodeRefsLength + destNodeRefsLength;
  fromNode.$_refsLength = void 0;
  return destNode;
};
var __ref$2 = requireRef();
var unlinkBackReferences$1 = function unlinkBackReferences(node) {
  var i = -1, n = node.$_refsLength || 0;
  while (++i < n) {
    var ref3 = node[__ref$2 + i];
    if (ref3 != null) {
      ref3.$_context = ref3.$_refIndex = node[__ref$2 + i] = void 0;
    }
  }
  node.$_refsLength = void 0;
  return node;
};
var __ref$1 = requireRef();
var unlinkForwardReference$1 = function unlinkForwardReference(reference) {
  var destination = reference.$_context;
  if (destination) {
    var i = (reference.$_refIndex || 0) - 1, n = (destination.$_refsLength || 0) - 1;
    while (++i <= n) {
      destination[__ref$1 + i] = destination[__ref$1 + (i + 1)];
    }
    destination.$_refsLength = n;
    reference.$_refIndex = reference.$_context = destination = void 0;
  }
  return reference;
};
var $ref$6 = ref;
var splice = splice$2;
var isObject$8 = isObject$f;
var unlinkBackReferences2 = unlinkBackReferences$1;
var unlinkForwardReference2 = unlinkForwardReference$1;
var removeNode$2 = function removeNode(node, parent, key, lru) {
  if (isObject$8(node)) {
    var type = node.$type;
    if (type) {
      if (type === $ref$6) {
        unlinkForwardReference2(node);
      }
      splice(lru, node);
    }
    unlinkBackReferences2(node);
    parent[key] = node.$_parent = void 0;
    return true;
  }
  return false;
};
var removeNodeAndDescendants$1;
var hasRequiredRemoveNodeAndDescendants;
function requireRemoveNodeAndDescendants() {
  if (hasRequiredRemoveNodeAndDescendants)
    return removeNodeAndDescendants$1;
  hasRequiredRemoveNodeAndDescendants = 1;
  var hasOwn2 = hasOwn_1;
  var prefix = reservedPrefix$1;
  var removeNode3 = removeNode$2;
  removeNodeAndDescendants$1 = function removeNodeAndDescendants2(node, parent, key, lru, mergeContext) {
    if (removeNode3(node, parent, key, lru)) {
      if (node.$type !== void 0 && mergeContext && node.$_absolutePath) {
        mergeContext.hasInvalidatedResult = true;
      }
      if (node.$type == null) {
        for (var key2 in node) {
          if (key2[0] !== prefix && hasOwn2(node, key2)) {
            removeNodeAndDescendants2(node[key2], node, key2, lru, mergeContext);
          }
        }
      }
      return true;
    }
    return false;
  };
  return removeNodeAndDescendants$1;
}
var isObject$7 = isObject$f;
var transferBackReferences2 = transferBackReferences$1;
var removeNodeAndDescendants = requireRemoveNodeAndDescendants();
var replaceNode$2 = function replaceNode(node, replacement, parent, key, lru, mergeContext) {
  if (node === replacement) {
    return node;
  } else if (isObject$7(node)) {
    transferBackReferences2(node, replacement);
    removeNodeAndDescendants(node, parent, key, lru, mergeContext);
  }
  parent[key] = replacement;
  return replacement;
};
var __ref = requireRef();
var updateBackReferenceVersions$2 = function updateBackReferenceVersions(nodeArg, version2) {
  var stack = [nodeArg];
  var count = 0;
  do {
    var node = stack[count];
    if (node && node.$_version !== version2) {
      node.$_version = version2;
      stack[count++] = node.$_parent;
      var i = -1;
      var n = node.$_refsLength || 0;
      while (++i < n) {
        stack[count++] = node[__ref + i];
      }
    }
  } while (--count > -1);
  return nodeArg;
};
var removeNode$1 = removeNode$2;
var updateBackReferenceVersions$1 = updateBackReferenceVersions$2;
var updateNodeAncestors$3 = function updateNodeAncestors(nodeArg, offset, lru, version2) {
  var child = nodeArg;
  do {
    var node = child.$_parent;
    var size = child.$size = (child.$size || 0) - offset;
    if (size <= 0 && node != null) {
      removeNode$1(child, node, child.$_key, lru);
    } else if (child.$_version !== version2) {
      updateBackReferenceVersions$1(child, version2);
    }
    child = node;
  } while (child);
  return nodeArg;
};
var reconstructPath$2 = function reconstructPath(currentPath, key) {
  var path = currentPath.slice(0, currentPath.depth);
  path[path.length] = key;
  return path;
};
var $ref$5 = ref;
var $error$4 = error;
var getSize$4 = getSize$6;
var getTimestamp$1 = getTimestamp$2;
var isObject$6 = isObject$f;
var isExpired$6 = isExpired$7;
var isFunction$3 = isFunction$5;
var wrapNode$1 = wrapNode$2;
var insertNode$1 = insertNode$2;
var expireNode$4 = expireNode$5;
var replaceNode$1 = replaceNode$2;
var updateNodeAncestors$2 = updateNodeAncestors$3;
var reconstructPath$1 = reconstructPath$2;
var mergeJSONGraphNode$1 = function mergeJSONGraphNode(parent, node, message, key, requestedPath, optimizedPath, version2, expired, lru, comparator2, errorSelector2, replacedPaths) {
  var sizeOffset;
  var cType, mType, cIsObject, mIsObject, cTimestamp, mTimestamp;
  var nodeValue = node && node.value !== void 0 ? node.value : node;
  if (nodeValue === message) {
    if (message === null) {
      node = wrapNode$1(message, void 0, message);
      parent = updateNodeAncestors$2(parent, -node.$size, lru, version2);
      node = insertNode$1(node, parent, key, void 0, optimizedPath);
      return node;
    } else if (message === void 0) {
      return message;
    } else {
      cIsObject = isObject$6(node);
      if (cIsObject) {
        cType = node.$type;
        if (cType == null) {
          if (node.$_parent == null) {
            insertNode$1(node, parent, key, version2, optimizedPath);
          }
          return node;
        }
      }
    }
  } else {
    cIsObject = isObject$6(node);
    if (cIsObject) {
      cType = node.$type;
    }
  }
  if (cType !== $ref$5) {
    mIsObject = isObject$6(message);
    if (mIsObject) {
      mType = message.$type;
    }
    if (cIsObject && !cType) {
      if (message == null || mIsObject && !mType) {
        return node;
      }
    }
  } else {
    if (message == null) {
      if (isExpired$6(node)) {
        expireNode$4(node, expired, lru);
        return void 0;
      }
      return node;
    }
    mIsObject = isObject$6(message);
    if (mIsObject) {
      mType = message.$type;
      if (mType === $ref$5) {
        if (node === message) {
          if (node.$_parent != null) {
            return node;
          }
        } else {
          cTimestamp = node.$timestamp;
          mTimestamp = message.$timestamp;
          if (!isExpired$6(node) && !isExpired$6(message) && mTimestamp < cTimestamp) {
            return void 0;
          }
        }
      }
    }
  }
  if (cType && mIsObject && !mType) {
    return insertNode$1(replaceNode$1(node, message, parent, key, lru, replacedPaths), parent, key, void 0, optimizedPath);
  } else if (mType || !mIsObject) {
    if (mType === $error$4 && isFunction$3(errorSelector2)) {
      message = errorSelector2(reconstructPath$1(requestedPath, key), message);
      mType = message.$type || mType;
    }
    if (mType && node === message) {
      if (node.$_parent == null) {
        node = wrapNode$1(node, mType, node.value);
        parent = updateNodeAncestors$2(parent, -node.$size, lru, version2);
        node = insertNode$1(node, parent, key, version2, optimizedPath);
      }
    } else {
      var isDistinct = true;
      if (cType && !isExpired$6(node) || !cIsObject) {
        isDistinct = getTimestamp$1(message) < getTimestamp$1(node) === false;
        if (isDistinct && (cType || mType) && isFunction$3(comparator2)) {
          isDistinct = !comparator2(nodeValue, message, optimizedPath.slice(0, optimizedPath.index));
        }
      }
      if (isDistinct) {
        message = wrapNode$1(message, mType, mType ? message.value : message);
        sizeOffset = getSize$4(node) - getSize$4(message);
        node = replaceNode$1(node, message, parent, key, lru, replacedPaths);
        parent = updateNodeAncestors$2(parent, sizeOffset, lru, version2);
        node = insertNode$1(node, parent, key, version2, optimizedPath);
      }
    }
    if (isExpired$6(node)) {
      expireNode$4(node, expired, lru);
    }
  } else if (node == null) {
    node = insertNode$1({}, parent, key, void 0, optimizedPath);
  }
  return node;
};
function applyErrorPrototype$4(errorType) {
  errorType.prototype = Object.create(Error.prototype, {
    constructor: {
      value: Error,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(errorType, Error);
  } else {
    errorType.__proto__ = Error;
  }
}
var applyErrorPrototype_1 = applyErrorPrototype$4;
var applyErrorPrototype$3 = applyErrorPrototype_1;
function NullInPathError$2() {
  var instance = new Error("`null` and `undefined` are not allowed in branch key positions");
  instance.name = "NullInPathError";
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  }
  if (Error.captureStackTrace) {
    Error.captureStackTrace(instance, NullInPathError$2);
  }
  return instance;
}
applyErrorPrototype$3(NullInPathError$2);
var NullInPathError_1 = NullInPathError$2;
var createHardlink$1 = createHardlink$2;
var $ref$4 = ref;
var isExpired$5 = isAlreadyExpired;
var isFunction$2 = isFunction$5;
var isPrimitive$3 = isPrimitive$4;
var expireNode$3 = expireNode$5;
var iterateKeySet$2 = lib$1.iterateKeySet;
var incrementVersion$2 = incrementVersionExports;
var mergeJSONGraphNode2 = mergeJSONGraphNode$1;
var NullInPathError$1 = NullInPathError_1;
var setJSONGraphs$3 = function setJSONGraphs(model, jsonGraphEnvelopes, x, errorSelector2, comparator2, replacedPaths) {
  var modelRoot = model._root;
  var lru = modelRoot;
  var expired = modelRoot.expired;
  var version2 = incrementVersion$2();
  var cache = modelRoot.cache;
  var initialVersion = cache.$_version;
  var requestedPath = [];
  var optimizedPath = [];
  var requestedPaths = [];
  var optimizedPaths = [];
  var jsonGraphEnvelopeIndex = -1;
  var jsonGraphEnvelopeCount = jsonGraphEnvelopes.length;
  while (++jsonGraphEnvelopeIndex < jsonGraphEnvelopeCount) {
    var jsonGraphEnvelope = jsonGraphEnvelopes[jsonGraphEnvelopeIndex];
    var paths = jsonGraphEnvelope.paths;
    var jsonGraph = jsonGraphEnvelope.jsonGraph;
    var pathIndex = -1;
    var pathCount2 = paths.length;
    while (++pathIndex < pathCount2) {
      var path = paths[pathIndex];
      optimizedPath.index = 0;
      setJSONGraphPathSet(
        path,
        0,
        cache,
        cache,
        cache,
        jsonGraph,
        jsonGraph,
        jsonGraph,
        requestedPaths,
        optimizedPaths,
        requestedPath,
        optimizedPath,
        version2,
        expired,
        lru,
        comparator2,
        errorSelector2,
        replacedPaths
      );
    }
  }
  var newVersion = cache.$_version;
  var rootChangeHandler = modelRoot.onChange;
  if (isFunction$2(rootChangeHandler) && initialVersion !== newVersion) {
    rootChangeHandler();
  }
  return [requestedPaths, optimizedPaths];
};
function setJSONGraphPathSet(path, depth, root3, parent, node, messageRoot, messageParent, message, requestedPaths, optimizedPaths, requestedPath, optimizedPath, version2, expired, lru, comparator2, errorSelector2, replacedPaths) {
  var note = {};
  var branch = depth < path.length - 1;
  var keySet = path[depth];
  var key = iterateKeySet$2(keySet, note);
  var optimizedIndex = optimizedPath.index;
  do {
    requestedPath.depth = depth;
    var results = setNode$1(
      root3,
      parent,
      node,
      messageRoot,
      messageParent,
      message,
      key,
      branch,
      requestedPath,
      optimizedPath,
      version2,
      expired,
      lru,
      comparator2,
      errorSelector2,
      replacedPaths
    );
    requestedPath[depth] = key;
    requestedPath.index = depth;
    optimizedPath[optimizedPath.index++] = key;
    var nextNode = results[0];
    var nextParent = results[1];
    if (nextNode) {
      if (branch) {
        setJSONGraphPathSet(
          path,
          depth + 1,
          root3,
          nextParent,
          nextNode,
          messageRoot,
          results[3],
          results[2],
          requestedPaths,
          optimizedPaths,
          requestedPath,
          optimizedPath,
          version2,
          expired,
          lru,
          comparator2,
          errorSelector2,
          replacedPaths
        );
      } else {
        requestedPaths.push(requestedPath.slice(0, requestedPath.index + 1));
        optimizedPaths.push(optimizedPath.slice(0, optimizedPath.index));
      }
    }
    key = iterateKeySet$2(keySet, note);
    if (note.done) {
      break;
    }
    optimizedPath.index = optimizedIndex;
  } while (true);
}
var _result = new Array(4);
function setReference$1(root3, node, messageRoot, message, requestedPath, optimizedPath, version2, expired, lru, comparator2, errorSelector2, replacedPaths) {
  var reference = node.value;
  optimizedPath.length = 0;
  optimizedPath.push.apply(optimizedPath, reference);
  if (isExpired$5(node)) {
    optimizedPath.index = reference.length;
    expireNode$3(node, expired, lru);
    _result[0] = void 0;
    _result[1] = root3;
    _result[2] = message;
    _result[3] = messageRoot;
    return _result;
  }
  var index2 = 0;
  var container = node;
  var count = reference.length - 1;
  var parent = node = root3;
  var messageParent = message = messageRoot;
  do {
    var key = reference[index2];
    var branch = index2 < count;
    optimizedPath.index = index2;
    var results = setNode$1(
      root3,
      parent,
      node,
      messageRoot,
      messageParent,
      message,
      key,
      branch,
      requestedPath,
      optimizedPath,
      version2,
      expired,
      lru,
      comparator2,
      errorSelector2,
      replacedPaths
    );
    node = results[0];
    if (isPrimitive$3(node)) {
      optimizedPath.index = index2;
      return results;
    }
    parent = results[1];
    message = results[2];
    messageParent = results[3];
  } while (index2++ < count);
  optimizedPath.index = index2;
  if (container.$_context !== node) {
    createHardlink$1(container, node);
  }
  _result[0] = node;
  _result[1] = parent;
  _result[2] = message;
  _result[3] = messageParent;
  return _result;
}
function setNode$1(root3, parent, node, messageRoot, messageParent, message, key, branch, requestedPath, optimizedPath, version2, expired, lru, comparator2, errorSelector2, replacedPaths) {
  var type = node.$type;
  while (type === $ref$4) {
    var results = setReference$1(
      root3,
      node,
      messageRoot,
      message,
      requestedPath,
      optimizedPath,
      version2,
      expired,
      lru,
      comparator2,
      errorSelector2,
      replacedPaths
    );
    node = results[0];
    if (isPrimitive$3(node)) {
      return results;
    }
    parent = results[1];
    message = results[2];
    messageParent = results[3];
    type = node.$type;
  }
  if (type !== void 0) {
    _result[0] = node;
    _result[1] = parent;
    _result[2] = message;
    _result[3] = messageParent;
    return _result;
  }
  if (key == null) {
    if (branch) {
      throw new NullInPathError$1();
    } else if (node) {
      key = node.$_key;
    }
  } else {
    parent = node;
    messageParent = message;
    node = parent[key];
    message = messageParent && messageParent[key];
  }
  node = mergeJSONGraphNode2(
    parent,
    node,
    message,
    key,
    requestedPath,
    optimizedPath,
    version2,
    expired,
    lru,
    comparator2,
    errorSelector2,
    replacedPaths
  );
  _result[0] = node;
  _result[1] = parent;
  _result[2] = message;
  _result[3] = messageParent;
  return _result;
}
var promote$3;
var hasRequiredPromote;
function requirePromote() {
  if (hasRequiredPromote)
    return promote$3;
  hasRequiredPromote = 1;
  var EXPIRES_NEVER = expiresNever;
  promote$3 = function lruPromote(root3, object) {
    if (object.$expires === EXPIRES_NEVER) {
      return;
    }
    var head3 = root3.$_head;
    if (!head3) {
      root3.$_head = root3.$_tail = object;
      return;
    }
    if (head3 === object) {
      return;
    }
    var prev = object.$_prev;
    var next = object.$_next;
    if (next) {
      next.$_prev = prev;
    }
    if (prev) {
      prev.$_next = next;
    }
    object.$_prev = void 0;
    root3.$_head = object;
    object.$_next = head3;
    head3.$_prev = object;
    if (object === root3.$_tail) {
      root3.$_tail = prev;
    }
  };
  return promote$3;
}
var clone$2;
var hasRequiredClone;
function requireClone() {
  if (hasRequiredClone)
    return clone$2;
  hasRequiredClone = 1;
  var privatePrefix2 = privatePrefix$2;
  clone$2 = function clone3(node) {
    if (node === void 0) {
      return node;
    }
    var outValue = {};
    for (var k in node) {
      if (k.lastIndexOf(privatePrefix2, 0) === 0) {
        continue;
      }
      outValue[k] = node[k];
    }
    return outValue;
  };
  return clone$2;
}
var promote$2 = requirePromote();
var clone$1 = requireClone();
var $ref$3 = ref;
var $atom = requireAtom();
var $error$3 = error;
var onValue$2 = function onValue(model, node, seed, depth, outerResults, branchInfo, requestedPath, optimizedPath, optimizedLength, isJSONG) {
  if (node) {
    promote$2(model._root, node);
  }
  if (!seed) {
    return;
  }
  var i, len, k, key, curr, prev = null, prevK;
  var materialized = false, valueNode, nodeType = node && node.$type, nodeValue = node && node.value;
  if (nodeValue === void 0) {
    materialized = model._materialized;
  }
  if (materialized) {
    valueNode = { $type: $atom };
  } else if (model._boxed) {
    valueNode = clone$1(node);
  } else if (!isJSONG && nodeType === $ref$3) {
    valueNode = void 0;
  } else if (nodeType === $ref$3 || nodeType === $error$3) {
    if (isJSONG) {
      valueNode = clone$1(node);
    } else {
      valueNode = nodeValue;
    }
  } else if (isJSONG) {
    var isObject3 = nodeValue && typeof nodeValue === "object";
    var isUserCreatedNode = !node || !node.$_modelCreated;
    if (isObject3 || isUserCreatedNode) {
      valueNode = clone$1(node);
    } else {
      valueNode = nodeValue;
    }
  } else if (node && nodeType === void 0 && nodeValue === void 0) {
    valueNode = {};
  } else {
    valueNode = nodeValue;
  }
  var hasValues = false;
  if (isJSONG) {
    curr = seed.jsonGraph;
    if (!curr) {
      hasValues = true;
      curr = seed.jsonGraph = {};
      seed.paths = [];
    }
    for (i = 0, len = optimizedLength - 1; i < len; i++) {
      key = optimizedPath[i];
      if (!curr[key]) {
        hasValues = true;
        curr[key] = {};
      }
      curr = curr[key];
    }
    key = optimizedPath[i];
    curr[key] = materialized ? { $type: $atom } : valueNode;
    if (requestedPath) {
      seed.paths.push(requestedPath.slice(0, depth));
    }
  } else if (depth === 0) {
    hasValues = true;
    seed.json = valueNode;
  } else {
    curr = seed.json;
    if (!curr) {
      hasValues = true;
      curr = seed.json = {};
    }
    for (i = 0; i < depth - 1; i++) {
      k = requestedPath[i];
      if (!curr[k]) {
        hasValues = true;
        curr[k] = branchInfo[i];
      }
      prev = curr;
      prevK = k;
      curr = curr[k];
    }
    k = requestedPath[i];
    if (valueNode !== void 0) {
      if (k != null) {
        hasValues = true;
        if (!curr[k]) {
          curr[k] = valueNode;
        }
      } else {
        prev[prevK] = valueNode;
      }
    }
  }
  if (outerResults) {
    outerResults.hasValues = hasValues;
  }
};
var isExpired$4;
var hasRequiredIsExpired;
function requireIsExpired() {
  if (hasRequiredIsExpired)
    return isExpired$4;
  hasRequiredIsExpired = 1;
  isExpired$4 = isExpired$7;
  return isExpired$4;
}
var followReference_1;
var hasRequiredFollowReference;
function requireFollowReference() {
  if (hasRequiredFollowReference)
    return followReference_1;
  hasRequiredFollowReference = 1;
  var createHardlink3 = createHardlink$2;
  var onValue3 = onValue$2;
  var isExpired3 = requireIsExpired();
  var $ref2 = ref;
  var promote2 = requirePromote();
  function followReference2(model, root3, nodeArg, referenceContainerArg, referenceArg, seed, isJSONG) {
    var node = nodeArg;
    var reference = referenceArg;
    var referenceContainer = referenceContainerArg;
    var depth = 0;
    var k, next;
    while (true) {
      if (depth === 0 && referenceContainer.$_context) {
        depth = reference.length;
        next = referenceContainer.$_context;
      } else {
        k = reference[depth++];
        next = node[k];
      }
      if (next) {
        var type = next.$type;
        var value = type && next.value || next;
        if (depth < reference.length) {
          if (type) {
            node = next;
            break;
          }
          node = next;
          continue;
        } else {
          node = next;
          if (type && isExpired3(next)) {
            break;
          }
          if (!referenceContainer.$_context) {
            createHardlink3(referenceContainer, next);
          }
          if (type === $ref2) {
            if (isJSONG) {
              onValue3(
                model,
                next,
                seed,
                null,
                null,
                null,
                null,
                reference,
                reference.length,
                isJSONG
              );
            } else {
              promote2(model._root, next);
            }
            depth = 0;
            reference = value;
            referenceContainer = next;
            node = root3;
            continue;
          }
          break;
        }
      } else {
        node = void 0;
      }
      break;
    }
    if (depth < reference.length && node !== void 0) {
      var ref3 = [];
      for (var i = 0; i < depth; i++) {
        ref3[i] = reference[i];
      }
      reference = ref3;
    }
    return [node, reference, referenceContainer];
  }
  followReference_1 = followReference2;
  return followReference_1;
}
var getValueSync;
var hasRequiredGetValueSync;
function requireGetValueSync() {
  if (hasRequiredGetValueSync)
    return getValueSync;
  hasRequiredGetValueSync = 1;
  var followReference2 = requireFollowReference();
  var clone3 = requireClone();
  var isExpired3 = requireIsExpired();
  var promote2 = requirePromote();
  var $ref2 = ref;
  var $atom2 = requireAtom();
  var $error2 = error;
  getValueSync = function getValueSync2(model, simplePath, noClone) {
    var root3 = model._root.cache;
    var len = simplePath.length;
    var optimizedPath = [];
    var shorted = false, shouldShort = false;
    var depth = 0;
    var key, i, next = root3, curr = root3, out = root3, type, ref3, refNode;
    var found = true;
    var expired = false;
    while (next && depth < len) {
      key = simplePath[depth++];
      if (key !== null) {
        next = curr[key];
        optimizedPath[optimizedPath.length] = key;
      }
      if (!next) {
        out = void 0;
        shorted = true;
        found = false;
        break;
      }
      type = next.$type;
      if (type === $atom2 && next.value === void 0) {
        out = void 0;
        found = false;
        shorted = depth < len;
        break;
      }
      if (depth < len) {
        if (type === $ref2) {
          if (isExpired3(next)) {
            expired = true;
            out = void 0;
            break;
          }
          ref3 = followReference2(model, root3, root3, next, next.value);
          refNode = ref3[0];
          if (!refNode) {
            out = void 0;
            next = void 0;
            found = false;
            break;
          }
          type = refNode.$type;
          next = refNode;
          optimizedPath = ref3[1].slice(0);
        }
        if (type) {
          break;
        }
      } else {
        out = next;
      }
      curr = next;
    }
    if (depth < len && !expired) {
      for (i = depth; i < len; ++i) {
        if (simplePath[depth] !== null) {
          shouldShort = true;
          break;
        }
      }
      if (shouldShort) {
        shorted = true;
        out = void 0;
      } else {
        out = next;
      }
      for (i = depth; i < len; ++i) {
        if (simplePath[i] !== null) {
          optimizedPath[optimizedPath.length] = simplePath[i];
        }
      }
    }
    if (out && type) {
      if (isExpired3(out)) {
        out = void 0;
      } else {
        promote2(model._root, out);
      }
    }
    if (out && type === $error2 && !model._treatErrorsAsValues) {
      throw {
        path: depth === len ? simplePath : simplePath.slice(0, depth),
        value: out.value
      };
    } else if (out && model._boxed) {
      out = Boolean(type) && !noClone ? clone3(out) : out;
    } else if (!out && model._materialized) {
      out = { $type: $atom2 };
    } else if (out) {
      out = out.value;
    }
    return {
      value: out,
      shorted,
      optimizedPath,
      found
    };
  };
  return getValueSync;
}
var InvalidModelError_1;
var hasRequiredInvalidModelError;
function requireInvalidModelError() {
  if (hasRequiredInvalidModelError)
    return InvalidModelError_1;
  hasRequiredInvalidModelError = 1;
  var applyErrorPrototype2 = applyErrorPrototype_1;
  function InvalidModelError2(boundPath, shortedPath) {
    var instance = new Error("The boundPath of the model is not valid since a value or error was found before the path end.");
    instance.name = "InvalidModelError";
    instance.boundPath = boundPath;
    instance.shortedPath = shortedPath;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    }
    if (Error.captureStackTrace) {
      Error.captureStackTrace(instance, InvalidModelError2);
    }
    return instance;
  }
  applyErrorPrototype2(InvalidModelError2);
  InvalidModelError_1 = InvalidModelError2;
  return InvalidModelError_1;
}
var getBoundValue$1;
var hasRequiredGetBoundValue;
function requireGetBoundValue() {
  if (hasRequiredGetBoundValue)
    return getBoundValue$1;
  hasRequiredGetBoundValue = 1;
  var getValueSync2 = requireGetValueSync();
  var InvalidModelError2 = requireInvalidModelError();
  getBoundValue$1 = function getBoundValue2(model, pathArg, materialized) {
    var path = pathArg;
    var boundPath = pathArg;
    var boxed, treatErrorsAsValues2, value, shorted, found;
    boxed = model._boxed;
    materialized = model._materialized;
    treatErrorsAsValues2 = model._treatErrorsAsValues;
    model._boxed = true;
    model._materialized = materialized === void 0 || materialized;
    model._treatErrorsAsValues = true;
    value = getValueSync2(model, path.concat(null), true);
    model._boxed = boxed;
    model._materialized = materialized;
    model._treatErrorsAsValues = treatErrorsAsValues2;
    path = value.optimizedPath;
    shorted = value.shorted;
    found = value.found;
    value = value.value;
    while (path.length && path[path.length - 1] === null) {
      path.pop();
    }
    if (found && shorted) {
      throw new InvalidModelError2(boundPath, path);
    }
    return {
      path,
      value,
      shorted,
      found
    };
  };
  return getBoundValue$1;
}
var isObject$5 = isObject$f;
var getType$1 = function getType(node, anyType) {
  var type = isObject$5(node) && node.$type || void 0;
  if (anyType && type) {
    return "branch";
  }
  return type;
};
var $ref$2 = ref;
var $error$2 = error;
var getType2 = getType$1;
var getSize$3 = getSize$6;
var getTimestamp2 = getTimestamp$2;
var isExpired$3 = isExpired$7;
var isPrimitive$2 = isPrimitive$4;
var isFunction$1 = isFunction$5;
var wrapNode2 = wrapNode$2;
var expireNode$2 = expireNode$5;
var insertNode2 = insertNode$2;
var replaceNode2 = replaceNode$2;
var updateNodeAncestors$1 = updateNodeAncestors$3;
var updateBackReferenceVersions2 = updateBackReferenceVersions$2;
var reconstructPath2 = reconstructPath$2;
var mergeValueOrInsertBranch$1 = function mergeValueOrInsertBranch(parent, node, key, value, branch, reference, requestedPath, optimizedPath, version2, expired, lru, comparator2, errorSelector2, replacedPaths) {
  var type = getType2(node, reference);
  if (branch || reference) {
    if (type && isExpired$3(node)) {
      type = "expired";
      expireNode$2(node, expired, lru);
    }
    if (type && type !== $ref$2 || isPrimitive$2(node)) {
      node = replaceNode2(node, {}, parent, key, lru, replacedPaths);
      node = insertNode2(node, parent, key, version2, optimizedPath);
      node = updateBackReferenceVersions2(node, version2);
    }
  } else {
    var message = value;
    var mType = getType2(message);
    var isDistinct = getTimestamp2(message) < getTimestamp2(node) === false;
    if ((type || mType) && isFunction$1(comparator2)) {
      isDistinct = !comparator2(node, message, optimizedPath.slice(0, optimizedPath.index));
    }
    if (isDistinct) {
      if (mType === $error$2 && isFunction$1(errorSelector2)) {
        message = errorSelector2(reconstructPath2(requestedPath, key), message);
        mType = message.$type || mType;
      }
      message = wrapNode2(message, mType, mType ? message.value : message);
      var sizeOffset = getSize$3(node) - getSize$3(message);
      node = replaceNode2(node, message, parent, key, lru, replacedPaths);
      parent = updateNodeAncestors$1(parent, sizeOffset, lru, version2);
      node = insertNode2(node, parent, key, version2, optimizedPath);
    }
  }
  return node;
};
var setPathValues$2;
var hasRequiredSetPathValues;
function requireSetPathValues() {
  if (hasRequiredSetPathValues)
    return setPathValues$2;
  hasRequiredSetPathValues = 1;
  var createHardlink3 = createHardlink$2;
  var $ref2 = ref;
  var getBoundValue2 = requireGetBoundValue();
  var isExpired3 = isExpired$7;
  var isFunction3 = isFunction$5;
  var isPrimitive3 = isPrimitive$4;
  var expireNode3 = expireNode$5;
  var iterateKeySet3 = lib$1.iterateKeySet;
  var incrementVersion3 = incrementVersionExports;
  var mergeValueOrInsertBranch3 = mergeValueOrInsertBranch$1;
  var NullInPathError2 = NullInPathError_1;
  setPathValues$2 = function setPathValues2(model, pathValues, x, errorSelector2, comparator2) {
    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version2 = incrementVersion3();
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = bound.length ? getBoundValue2(model, bound).value : cache;
    var parent = node.$_parent || cache;
    var initialVersion = cache.$_version;
    var requestedPath = [];
    var requestedPaths = [];
    var optimizedPaths = [];
    var optimizedIndex = bound.length;
    var pathValueIndex = -1;
    var pathValueCount = pathValues.length;
    while (++pathValueIndex < pathValueCount) {
      var pathValue2 = pathValues[pathValueIndex];
      var path = pathValue2.path;
      var value = pathValue2.value;
      var optimizedPath = bound.slice(0);
      optimizedPath.index = optimizedIndex;
      setPathSet(
        value,
        path,
        0,
        cache,
        parent,
        node,
        requestedPaths,
        optimizedPaths,
        requestedPath,
        optimizedPath,
        version2,
        expired,
        lru,
        comparator2,
        errorSelector2
      );
    }
    var newVersion = cache.$_version;
    var rootChangeHandler = modelRoot.onChange;
    if (isFunction3(rootChangeHandler) && initialVersion !== newVersion) {
      rootChangeHandler();
    }
    return [requestedPaths, optimizedPaths];
  };
  function setPathSet(value, path, depth, root3, parent, node, requestedPaths, optimizedPaths, requestedPath, optimizedPath, version2, expired, lru, comparator2, errorSelector2, replacedPaths) {
    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet3(keySet, note);
    var optimizedIndex = optimizedPath.index;
    do {
      requestedPath.depth = depth;
      var results = setNode2(
        root3,
        parent,
        node,
        key,
        value,
        branch,
        false,
        requestedPath,
        optimizedPath,
        version2,
        expired,
        lru,
        comparator2,
        errorSelector2,
        replacedPaths
      );
      requestedPath[depth] = key;
      requestedPath.index = depth;
      optimizedPath[optimizedPath.index++] = key;
      var nextNode = results[0];
      var nextParent = results[1];
      if (nextNode) {
        if (branch) {
          setPathSet(
            value,
            path,
            depth + 1,
            root3,
            nextParent,
            nextNode,
            requestedPaths,
            optimizedPaths,
            requestedPath,
            optimizedPath,
            version2,
            expired,
            lru,
            comparator2,
            errorSelector2
          );
        } else {
          requestedPaths.push(requestedPath.slice(0, requestedPath.index + 1));
          optimizedPaths.push(optimizedPath.slice(0, optimizedPath.index));
        }
      }
      key = iterateKeySet3(keySet, note);
      if (note.done) {
        break;
      }
      optimizedPath.index = optimizedIndex;
    } while (true);
  }
  function setReference2(value, root3, node, requestedPath, optimizedPath, version2, expired, lru, comparator2, errorSelector2, replacedPaths) {
    var reference = node.value;
    optimizedPath.length = 0;
    optimizedPath.push.apply(optimizedPath, reference);
    if (isExpired3(node)) {
      optimizedPath.index = reference.length;
      expireNode3(node, expired, lru);
      return [void 0, root3];
    }
    var container = node;
    var parent = root3;
    node = node.$_context;
    if (node != null) {
      parent = node.$_parent || root3;
      optimizedPath.index = reference.length;
    } else {
      var index2 = 0;
      var count = reference.length - 1;
      parent = node = root3;
      do {
        var key = reference[index2];
        var branch = index2 < count;
        optimizedPath.index = index2;
        var results = setNode2(
          root3,
          parent,
          node,
          key,
          value,
          branch,
          true,
          requestedPath,
          optimizedPath,
          version2,
          expired,
          lru,
          comparator2,
          errorSelector2,
          replacedPaths
        );
        node = results[0];
        if (isPrimitive3(node)) {
          optimizedPath.index = index2;
          return results;
        }
        parent = results[1];
      } while (index2++ < count);
      optimizedPath.index = index2;
      if (container.$_context !== node) {
        createHardlink3(container, node);
      }
    }
    return [node, parent];
  }
  function setNode2(root3, parent, node, key, value, branch, reference, requestedPath, optimizedPath, version2, expired, lru, comparator2, errorSelector2, replacedPaths) {
    var type = node.$type;
    while (type === $ref2) {
      var results = setReference2(
        value,
        root3,
        node,
        requestedPath,
        optimizedPath,
        version2,
        expired,
        lru,
        comparator2,
        errorSelector2,
        replacedPaths
      );
      node = results[0];
      if (isPrimitive3(node)) {
        return results;
      }
      parent = results[1];
      type = node.$type;
    }
    if (branch && type !== void 0) {
      return [node, parent];
    }
    if (key == null) {
      if (branch) {
        throw new NullInPathError2();
      } else if (node) {
        key = node.$_key;
      }
    } else {
      parent = node;
      node = parent[key];
    }
    node = mergeValueOrInsertBranch3(
      parent,
      node,
      key,
      value,
      branch,
      reference,
      requestedPath,
      optimizedPath,
      version2,
      expired,
      lru,
      comparator2,
      errorSelector2,
      replacedPaths
    );
    return [node, parent];
  }
  return setPathValues$2;
}
var applyErrorPrototype$2 = applyErrorPrototype_1;
function InvalidSourceError$6(error3) {
  var instance = new Error("An exception was thrown when making a request.");
  instance.name = "InvalidSourceError";
  instance.innerError = error3;
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  }
  if (Error.captureStackTrace) {
    Error.captureStackTrace(instance, InvalidSourceError$6);
  }
  return instance;
}
applyErrorPrototype$2(InvalidSourceError$6);
var InvalidSourceError_1 = InvalidSourceError$6;
var setJSONGraphs$2 = setJSONGraphs$3;
var setPathValues$1 = requireSetPathValues();
var InvalidSourceError$5 = InvalidSourceError_1;
var emptyArray$2 = [];
var emptyDisposable = { dispose: function() {
} };
var sendSetRequest$1 = function(originalJsonGraph, model, attemptCount, callback) {
  var paths = originalJsonGraph.paths;
  var modelRoot = model._root;
  var errorSelector2 = modelRoot.errorSelector;
  var comparator2 = modelRoot.comparator;
  var boundPath = model._path;
  var resultingJsonGraphEnvelope;
  var setObservable;
  try {
    setObservable = model._source.set(originalJsonGraph, attemptCount);
  } catch (e) {
    callback(new InvalidSourceError$5());
    return emptyDisposable;
  }
  var disposable = setObservable.subscribe(function onNext2(jsonGraphEnvelope) {
    if (disposable && disposable.disposed) {
      return;
    }
    model._path = emptyArray$2;
    var successfulPaths = setJSONGraphs$2(model, [{
      paths,
      jsonGraph: jsonGraphEnvelope.jsonGraph
    }], null, errorSelector2, comparator2);
    jsonGraphEnvelope.paths = successfulPaths[1];
    model._path = boundPath;
    resultingJsonGraphEnvelope = jsonGraphEnvelope;
  }, function onError4(dataSourceError) {
    if (disposable && disposable.disposed) {
      return;
    }
    model._path = emptyArray$2;
    setPathValues$1(model, paths.map(function(path) {
      return {
        path,
        value: dataSourceError
      };
    }), null, errorSelector2, comparator2);
    model._path = boundPath;
    callback(dataSourceError);
  }, function onCompleted2() {
    callback(null, resultingJsonGraphEnvelope);
  });
  return disposable;
};
var sendSetRequest_1 = sendSetRequest$1;
var complement$1 = { exports: {} };
var iterateKeySet$1 = lib$1.iterateKeySet;
complement$1.exports = function complement(requested, optimized, tree) {
  var optimizedComplement = [];
  var requestedComplement = [];
  var intersection = [];
  var i, iLen;
  for (i = 0, iLen = optimized.length; i < iLen; ++i) {
    var oPath = optimized[i];
    var rPath = requested[i];
    var subTree = tree[oPath.length];
    var intersectionData = findPartialIntersections(rPath, oPath, subTree);
    Array.prototype.push.apply(intersection, intersectionData[0]);
    Array.prototype.push.apply(optimizedComplement, intersectionData[1]);
    Array.prototype.push.apply(requestedComplement, intersectionData[2]);
  }
  return {
    intersection,
    optimizedComplement,
    requestedComplement
  };
};
function findPartialIntersections(requestedPath, optimizedPath, requestTree) {
  var depthDiff = requestedPath.length - optimizedPath.length;
  var i;
  for (i = 0; requestTree && i < -depthDiff; i++) {
    requestTree = requestTree[optimizedPath[i]];
  }
  if (!requestTree) {
    return [[], [optimizedPath], [requestedPath]];
  }
  if (depthDiff === 0) {
    return recurse(requestedPath, optimizedPath, requestTree, 0, [], []);
  } else if (depthDiff > 0) {
    return recurse(requestedPath, optimizedPath, requestTree, 0, requestedPath.slice(0, depthDiff), []);
  } else {
    return recurse(requestedPath, optimizedPath, requestTree, -depthDiff, [], optimizedPath.slice(0, -depthDiff));
  }
}
function recurse(requestedPath, optimizedPath, currentTree, depth, rCurrentPath, oCurrentPath) {
  var depthDiff = requestedPath.length - optimizedPath.length;
  var intersections = [];
  var rComplementPaths = [];
  var oComplementPaths = [];
  var oPathLen = optimizedPath.length;
  for (; depth < oPathLen; ++depth) {
    var key = optimizedPath[depth];
    var keyType = typeof key;
    if (key && keyType === "object") {
      var note = {};
      var innerKey = iterateKeySet$1(key, note);
      while (!note.done) {
        var nextTree = currentTree[innerKey];
        if (nextTree === void 0) {
          oComplementPaths[oComplementPaths.length] = arrayConcatSlice2(
            oCurrentPath,
            innerKey,
            optimizedPath,
            depth + 1
          );
          rComplementPaths[rComplementPaths.length] = arrayConcatSlice2(
            rCurrentPath,
            innerKey,
            requestedPath,
            depth + 1 + depthDiff
          );
        } else if (depth === oPathLen - 1) {
          intersections[intersections.length] = arrayConcatElement(rCurrentPath, innerKey);
        } else {
          var intersectionData = recurse(
            requestedPath,
            optimizedPath,
            nextTree,
            depth + 1,
            arrayConcatElement(rCurrentPath, innerKey),
            arrayConcatElement(oCurrentPath, innerKey)
          );
          Array.prototype.push.apply(intersections, intersectionData[0]);
          Array.prototype.push.apply(oComplementPaths, intersectionData[1]);
          Array.prototype.push.apply(rComplementPaths, intersectionData[2]);
        }
        innerKey = iterateKeySet$1(key, note);
      }
      break;
    } else {
      currentTree = currentTree[key];
      oCurrentPath[oCurrentPath.length] = optimizedPath[depth];
      rCurrentPath[rCurrentPath.length] = requestedPath[depth + depthDiff];
      if (currentTree === void 0) {
        oComplementPaths[oComplementPaths.length] = arrayConcatSlice(
          oCurrentPath,
          optimizedPath,
          depth + 1
        );
        rComplementPaths[rComplementPaths.length] = arrayConcatSlice(
          rCurrentPath,
          requestedPath,
          depth + depthDiff + 1
        );
        break;
      } else if (depth === oPathLen - 1) {
        intersections[intersections.length] = rCurrentPath;
      }
    }
  }
  return [intersections, oComplementPaths, rComplementPaths];
}
complement$1.exports.__test = { findPartialIntersections };
function arrayConcatSlice(a1, a2, start) {
  var result3 = a1.slice();
  var l1 = result3.length;
  var length = a2.length - start;
  result3.length = l1 + length;
  for (var i = 0; i < length; ++i) {
    result3[l1 + i] = a2[start + i];
  }
  return result3;
}
function arrayConcatSlice2(a1, a2, a3, start) {
  var result3 = a1.concat(a2);
  var l1 = result3.length;
  var length = a3.length - start;
  result3.length = l1 + length;
  for (var i = 0; i < length; ++i) {
    result3[l1 + i] = a3[start + i];
  }
  return result3;
}
function arrayConcatElement(a1, element) {
  var result3 = a1.slice();
  result3.push(element);
  return result3;
}
var complementExports = complement$1.exports;
var pathUtils = lib$1;
var toTree2 = pathUtils.toTree;
var toPaths2 = pathUtils.toPaths;
var InvalidSourceError$4 = InvalidSourceError_1;
var flushGetRequest$1 = function flushGetRequest(request, pathSetArrayBatch, callback) {
  if (request._count === 0) {
    request.requestQueue.removeRequest(request);
    return null;
  }
  request.sent = true;
  request.scheduled = false;
  var requestPaths;
  var model = request.requestQueue.model;
  if (model._enablePathCollapse || model._enableRequestDeduplication) {
    var pathMap = request._pathMap;
    var listIdx = 0, listLen = pathSetArrayBatch.length;
    for (; listIdx < listLen; ++listIdx) {
      var paths = pathSetArrayBatch[listIdx];
      for (var j = 0, pathLen = paths.length; j < pathLen; ++j) {
        var pathSet = paths[j];
        var len = pathSet.length;
        if (!pathMap[len]) {
          pathMap[len] = [pathSet];
        } else {
          var pathSetsByLength = pathMap[len];
          pathSetsByLength[pathSetsByLength.length] = pathSet;
        }
      }
    }
    var pathMapKeys = Object.keys(pathMap);
    var pathMapIdx = 0, pathMapLen = pathMapKeys.length;
    for (; pathMapIdx < pathMapLen; ++pathMapIdx) {
      var pathMapKey = pathMapKeys[pathMapIdx];
      pathMap[pathMapKey] = toTree2(pathMap[pathMapKey]);
    }
  }
  if (model._enablePathCollapse) {
    requestPaths = toPaths2(request._pathMap);
  } else if (pathSetArrayBatch.length === 1) {
    requestPaths = pathSetArrayBatch[0];
  } else {
    requestPaths = Array.prototype.concat.apply([], pathSetArrayBatch);
  }
  var getRequest;
  try {
    getRequest = model._source.get(requestPaths, request._attemptCount);
  } catch (e) {
    callback(new InvalidSourceError$4());
    return null;
  }
  var jsonGraphData;
  var disposable = getRequest.subscribe(
    function(data) {
      jsonGraphData = data;
    },
    function(err) {
      callback(err, jsonGraphData);
    },
    function() {
      callback(null, jsonGraphData);
    }
  );
  return disposable;
};
var currentCacheVersion$2 = {};
var version = null;
currentCacheVersion$2.setVersion = function setCacheVersion(newVersion) {
  version = newVersion;
};
currentCacheVersion$2.getVersion = function getCacheVersion() {
  return version;
};
var complement2 = complementExports;
var flushGetRequest2 = flushGetRequest$1;
var incrementVersion$1 = incrementVersionExports;
var currentCacheVersion$1 = currentCacheVersion$2;
var REQUEST_ID = 0;
var GetRequestType = RequestTypes$1.GetRequest;
var setJSONGraphs$1 = setJSONGraphs$3;
var setPathValues = requireSetPathValues();
var $error$1 = error;
var emptyArray$1 = [];
var InvalidSourceError$3 = InvalidSourceError_1;
var GetRequestV2 = function(scheduler, requestQueue, attemptCount) {
  this.sent = false;
  this.scheduled = false;
  this.requestQueue = requestQueue;
  this.id = ++REQUEST_ID;
  this.type = GetRequestType;
  this._scheduler = scheduler;
  this._attemptCount = attemptCount;
  this._pathMap = {};
  this._optimizedPaths = [];
  this._requestedPaths = [];
  this._callbacks = [];
  this._count = 0;
  this._disposable = null;
  this._collapsed = null;
  this._disposed = false;
};
GetRequestV2.prototype = {
  /**
   * batches the paths that are passed in.  Once the request is complete,
   * all callbacks will be called and the request will be removed from
   * parent queue.
   * @param {Array} requestedPaths -
   * @param {Array} optimizedPaths -
   * @param {Function} callback -
   */
  batch: function(requestedPaths, optimizedPaths, callback) {
    var self2 = this;
    var batchedOptPathSets = self2._optimizedPaths;
    var batchedReqPathSets = self2._requestedPaths;
    var batchedCallbacks = self2._callbacks;
    var batchIx = batchedOptPathSets.length;
    batchedOptPathSets[batchIx] = optimizedPaths;
    batchedReqPathSets[batchIx] = requestedPaths;
    batchedCallbacks[batchIx] = callback;
    ++self2._count;
    if (!self2.scheduled) {
      self2.scheduled = true;
      var flushedDisposable;
      var scheduleDisposable = self2._scheduler.schedule(function() {
        flushedDisposable = flushGetRequest2(self2, batchedOptPathSets, function(err, data) {
          var i, fn, len;
          var model = self2.requestQueue.model;
          self2.requestQueue.removeRequest(self2);
          self2._disposed = true;
          if (model._treatDataSourceErrorsAsJSONGraphErrors ? err instanceof InvalidSourceError$3 : !!err) {
            for (i = 0, len = batchedCallbacks.length; i < len; ++i) {
              fn = batchedCallbacks[i];
              if (fn) {
                fn(err);
              }
            }
            return;
          }
          if (self2._count) {
            var currentVersion = incrementVersion$1.getCurrentVersion();
            currentCacheVersion$1.setVersion(currentVersion);
            var mergeContext = { hasInvalidatedResult: false };
            var pathsErr = model._useServerPaths && data && data.paths === void 0 ? new Error("Server responses must include a 'paths' field when Model._useServerPaths === true") : void 0;
            if (!pathsErr) {
              self2._merge(batchedReqPathSets, err, data, mergeContext);
            }
            for (i = 0, len = batchedCallbacks.length; i < len; ++i) {
              fn = batchedCallbacks[i];
              if (fn) {
                fn(pathsErr || err, data, mergeContext.hasInvalidatedResult);
              }
            }
            currentCacheVersion$1.setVersion(null);
          }
        });
        self2._disposable = flushedDisposable;
      });
      self2._disposable = flushedDisposable || scheduleDisposable;
    }
    return createDisposable(self2, batchIx);
  },
  /**
   * Attempts to add paths to the outgoing request.  If there are added
   * paths then the request callback will be added to the callback list.
   * Handles adding partial paths as well
   *
   * @returns {Array} - whether new requested paths were inserted in this
   *                    request, the remaining paths that could not be added,
   *                    and disposable for the inserted requested paths.
   */
  add: function(requested, optimized, callback) {
    var self2 = this;
    var complementResult = complement2(requested, optimized, self2._pathMap);
    var inserted = false;
    var disposable = false;
    if (complementResult.intersection.length) {
      inserted = true;
      var batchIx = self2._callbacks.length;
      self2._callbacks[batchIx] = callback;
      self2._requestedPaths[batchIx] = complementResult.intersection;
      self2._optimizedPaths[batchIx] = [];
      ++self2._count;
      disposable = createDisposable(self2, batchIx);
    }
    return [inserted, complementResult.requestedComplement, complementResult.optimizedComplement, disposable];
  },
  /**
   * merges the response into the model"s cache.
   */
  _merge: function(requested, err, data, mergeContext) {
    var self2 = this;
    var model = self2.requestQueue.model;
    var modelRoot = model._root;
    var errorSelector2 = modelRoot.errorSelector;
    var comparator2 = modelRoot.comparator;
    var boundPath = model._path;
    model._path = emptyArray$1;
    var nextPaths = model._useServerPaths ? data.paths : flattenRequestedPaths(requested);
    if (err && model._treatDataSourceErrorsAsJSONGraphErrors) {
      var error3 = err;
      if (error3 instanceof Error) {
        error3 = {
          message: error3.message
        };
      }
      if (!error3.$type) {
        error3 = {
          $type: $error$1,
          value: error3
        };
      }
      var pathValues = nextPaths.map(function(x) {
        return {
          path: x,
          value: error3
        };
      });
      setPathValues(model, pathValues, null, errorSelector2, comparator2, mergeContext);
    } else {
      setJSONGraphs$1(model, [{
        paths: nextPaths,
        jsonGraph: data.jsonGraph
      }], null, errorSelector2, comparator2, mergeContext);
    }
    model._path = boundPath;
  }
};
function createDisposable(request, batchIx) {
  var disposed = false;
  return function() {
    if (disposed || request._disposed) {
      return;
    }
    disposed = true;
    request._callbacks[batchIx] = null;
    request._optimizedPaths[batchIx] = [];
    request._requestedPaths[batchIx] = [];
    var count = --request._count;
    var disposable = request._disposable;
    if (count === 0) {
      if (disposable.unsubscribe) {
        disposable.unsubscribe();
      } else {
        disposable.dispose();
      }
      request.requestQueue.removeRequest(request);
    }
  };
}
function flattenRequestedPaths(requested) {
  var out = [];
  var outLen = -1;
  for (var i = 0, len = requested.length; i < len; ++i) {
    var paths = requested[i];
    for (var j = 0, innerLen = paths.length; j < innerLen; ++j) {
      out[++outLen] = paths[j];
    }
  }
  return out;
}
var GetRequestV2_1 = GetRequestV2;
var RequestTypes = RequestTypes$1;
var sendSetRequest = sendSetRequest_1;
var GetRequest = GetRequestV2_1;
var falcorPathUtils = lib$1;
function RequestQueueV2(model, scheduler) {
  this.model = model;
  this.scheduler = scheduler;
  this.requests = this._requests = [];
}
RequestQueueV2.prototype = {
  /**
   * Sets the scheduler, but will not affect any current requests.
   */
  setScheduler: function(scheduler) {
    this.scheduler = scheduler;
  },
  /**
   * performs a set against the dataSource.  Sets, though are not batched
   * currently could be batched potentially in the future.  Since no batching
   * is required the setRequest action is simplified significantly.
   *
   * @param {JSONGraphEnvelope} jsonGraph -
   * @param {number} attemptCount
   * @param {Function} cb
   */
  set: function(jsonGraph, attemptCount, cb) {
    if (this.model._enablePathCollapse) {
      jsonGraph.paths = falcorPathUtils.collapse(jsonGraph.paths);
    }
    if (cb === void 0) {
      cb = attemptCount;
      attemptCount = void 0;
    }
    return sendSetRequest(jsonGraph, this.model, attemptCount, cb);
  },
  /**
   * Creates a get request to the dataSource.  Depending on the current
   * scheduler is how the getRequest will be flushed.
   * @param {Array} requestedPaths -
   * @param {Array} optimizedPaths -
   * @param {number} attemptCount
   * @param {Function} cb -
   */
  get: function(requestedPaths, optimizedPaths, attemptCount, cb) {
    var self2 = this;
    var disposables = [];
    var count = 0;
    var requests = self2._requests;
    var i, len;
    var oRemainingPaths = optimizedPaths;
    var rRemainingPaths = requestedPaths;
    var disposed = false;
    var request;
    if (cb === void 0) {
      cb = attemptCount;
      attemptCount = void 0;
    }
    for (i = 0, len = requests.length; i < len; ++i) {
      request = requests[i];
      if (request.type !== RequestTypes.GetRequest) {
        continue;
      }
      if (request.sent) {
        if (this.model._enableRequestDeduplication) {
          var results = request.add(rRemainingPaths, oRemainingPaths, refCountCallback);
          if (results[0]) {
            rRemainingPaths = results[1];
            oRemainingPaths = results[2];
            disposables[disposables.length] = results[3];
            ++count;
            if (!oRemainingPaths.length) {
              break;
            }
          }
        }
      } else {
        request.batch(rRemainingPaths, oRemainingPaths, refCountCallback);
        oRemainingPaths = null;
        rRemainingPaths = null;
        ++count;
        break;
      }
    }
    if (oRemainingPaths && oRemainingPaths.length) {
      request = new GetRequest(self2.scheduler, self2, attemptCount);
      requests[requests.length] = request;
      ++count;
      var disposable = request.batch(rRemainingPaths, oRemainingPaths, refCountCallback);
      disposables[disposables.length] = disposable;
    }
    function refCountCallback(err, data, hasInvalidatedResult) {
      if (disposed) {
        return;
      }
      --count;
      if (count === 0) {
        cb(err, data, hasInvalidatedResult);
      }
    }
    return function() {
      if (disposed || count === 0) {
        return;
      }
      disposed = true;
      var length = disposables.length;
      for (var idx = 0; idx < length; ++idx) {
        disposables[idx]();
      }
    };
  },
  /**
   * Removes the request from the request queue.
   */
  removeRequest: function(request) {
    var requests = this._requests;
    var i = requests.length;
    while (--i >= 0) {
      if (requests[i].id === request.id) {
        requests.splice(i, 1);
        break;
      }
    }
  }
};
var RequestQueueV2_1 = RequestQueueV2;
var noop$1 = function noop() {
};
var noop2 = noop$1;
function ModelResponseObserver$1(onNextOrObserver, onErrorFn, onCompletedFn) {
  if (!onNextOrObserver || typeof onNextOrObserver !== "object") {
    this._observer = {
      onNext: typeof onNextOrObserver === "function" ? onNextOrObserver : noop2,
      onError: typeof onErrorFn === "function" ? onErrorFn : noop2,
      onCompleted: typeof onCompletedFn === "function" ? onCompletedFn : noop2
    };
  } else {
    this._observer = {
      onNext: typeof onNextOrObserver.onNext === "function" ? function(value) {
        onNextOrObserver.onNext(value);
      } : noop2,
      onError: typeof onNextOrObserver.onError === "function" ? function(error3) {
        onNextOrObserver.onError(error3);
      } : noop2,
      onCompleted: typeof onNextOrObserver.onCompleted === "function" ? function() {
        onNextOrObserver.onCompleted();
      } : noop2
    };
  }
}
ModelResponseObserver$1.prototype = {
  onNext: function(v) {
    if (!this._closed) {
      this._observer.onNext(v);
    }
  },
  onError: function(e) {
    if (!this._closed) {
      this._closed = true;
      this._observer.onError(e);
    }
  },
  onCompleted: function() {
    if (!this._closed) {
      this._closed = true;
      this._observer.onCompleted();
    }
  }
};
var ModelResponseObserver_1 = ModelResponseObserver$1;
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
var require$$1 = /* @__PURE__ */ getAugmentedNamespace(es);
function FromEsObserverAdapter(esObserver) {
  this.esObserver = esObserver;
}
FromEsObserverAdapter.prototype = {
  onNext: function onNext(value) {
    if (typeof this.esObserver.next === "function") {
      this.esObserver.next(value);
    }
  },
  onError: function onError(error3) {
    if (typeof this.esObserver.error === "function") {
      this.esObserver.error(error3);
    }
  },
  onCompleted: function onCompleted() {
    if (typeof this.esObserver.complete === "function") {
      this.esObserver.complete();
    }
  }
};
function ToEsSubscriptionAdapter(subscription) {
  this.subscription = subscription;
}
ToEsSubscriptionAdapter.prototype.unsubscribe = function unsubscribe() {
  this.subscription.dispose();
};
function toEsObservable$1(_self) {
  return {
    subscribe: function subscribe2(observer) {
      return new ToEsSubscriptionAdapter(_self.subscribe(new FromEsObserverAdapter(observer)));
    }
  };
}
var toEsObservable_1 = toEsObservable$1;
var ModelResponseObserver = ModelResponseObserver_1;
var $$observable = require$$1.default;
var toEsObservable = toEsObservable_1;
function ModelResponse$7(subscribe2) {
  this._subscribe = subscribe2;
}
ModelResponse$7.prototype[$$observable] = function SymbolObservable() {
  return toEsObservable(this);
};
ModelResponse$7.prototype._toJSONG = function toJSONG() {
  return this;
};
ModelResponse$7.prototype.progressively = function progressively() {
  return this;
};
ModelResponse$7.prototype.subscribe = ModelResponse$7.prototype.forEach = function subscribe(a, b, c) {
  var observer = new ModelResponseObserver(a, b, c);
  var subscription = this._subscribe(observer);
  switch (typeof subscription) {
    case "function":
      return {
        dispose: function() {
          if (observer._closed) {
            return;
          }
          observer._closed = true;
          subscription();
        }
      };
    case "object":
      return {
        dispose: function() {
          if (observer._closed) {
            return;
          }
          observer._closed = true;
          if (subscription !== null) {
            subscription.dispose();
          }
        }
      };
    default:
      return {
        dispose: function() {
          observer._closed = true;
        }
      };
  }
};
ModelResponse$7.prototype.then = function then(onNext2, onError4) {
  var self2 = this;
  if (!self2._promise) {
    self2._promise = new Promise(function(resolve, reject) {
      var rejected = false;
      var values = [];
      self2.subscribe(
        function(value) {
          values[values.length] = value;
        },
        function(errors2) {
          rejected = true;
          reject(errors2);
        },
        function() {
          var value = values;
          if (values.length <= 1) {
            value = values[0];
          }
          if (rejected === false) {
            resolve(value);
          }
        }
      );
    });
  }
  return self2._promise.then(onNext2, onError4);
};
var ModelResponse_1 = ModelResponse$7;
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
var exceptions = {
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
var E$4 = exceptions;
var range$1 = function range(tokenizer2, openingToken, state, out) {
  var token = tokenizer2.peek();
  var dotCount = 1;
  var done = false;
  var inclusive = true;
  var idx = state.indexer.length - 1;
  var from = Tokenizer$1.toNumber(state.indexer[idx]);
  var to;
  if (isNaN(from)) {
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
  state.indexer[idx] = { from, to: inclusive ? to : to - 1 };
};
var TokenTypes$3 = TokenTypes_1;
var E$3 = exceptions;
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
var E$2 = exceptions;
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
var E$1 = exceptions;
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
        var t = +token.token;
        if (isNaN(t)) {
          E$1.throwError(idxE.needQuotes, tokenizer2);
        }
        state.indexer[state.indexer.length] = t;
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
var E = exceptions;
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
var src$1 = parser;
parser.fromPathsOrPathValues = function(paths, ext) {
  if (!paths) {
    return [];
  }
  var out = [];
  for (var i = 0, len = paths.length; i < len; i++) {
    if (typeof paths[i] === "string") {
      out[i] = parser(paths[i], ext);
    } else if (typeof paths[i].path === "string") {
      out[i] = {
        path: parser(paths[i].path, ext),
        value: paths[i].value
      };
    } else {
      out[i] = paths[i];
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
var ModelResponse$6 = ModelResponse_1;
var InvalidSourceError$2 = InvalidSourceError_1;
var pathSyntax$5 = src$1;
function CallResponse$1(model, callPath, args, suffix, paths) {
  this.callPath = pathSyntax$5.fromPath(callPath);
  this.args = args;
  if (paths) {
    this.paths = paths.map(pathSyntax$5.fromPath);
  }
  if (suffix) {
    this.suffix = suffix.map(pathSyntax$5.fromPath);
  }
  this.model = model;
}
CallResponse$1.prototype = Object.create(ModelResponse$6.prototype);
CallResponse$1.prototype._subscribe = function _subscribe(observer) {
  var callPath = this.callPath;
  var callArgs = this.args;
  var suffixes = this.suffix;
  var extraPaths = this.paths;
  var model = this.model;
  var rootModel = model._clone({
    _path: []
  });
  var boundPath = model._path;
  var boundCallPath = boundPath.concat(callPath);
  if (!model._source) {
    observer.onError(new Error("function does not exist"));
    return;
  }
  var response, obs;
  try {
    obs = model._source.call(boundCallPath, callArgs, suffixes, extraPaths);
  } catch (e) {
    observer.onError(new InvalidSourceError$2(e));
    return;
  }
  return obs.subscribe(function(res) {
    response = res;
  }, function(err) {
    observer.onError(err);
  }, function() {
    var invalidations = response.invalidated;
    if (invalidations && invalidations.length) {
      rootModel.invalidate.apply(rootModel, invalidations);
    }
    rootModel.withoutDataSource().set(response).subscribe(function(x) {
      observer.onNext(x);
    }, function(err) {
      observer.onError(err);
    }, function() {
      observer.onCompleted();
    });
  });
};
var CallResponse_1 = CallResponse$1;
var isArray$5 = Array.isArray;
var isObject$4 = isObject$f;
var isPathValue$3 = function isPathValue(pathValue2) {
  return isObject$4(pathValue2) && (isArray$5(pathValue2.path) || typeof pathValue2.path === "string");
};
var isObject$3 = isObject$f;
var isJSONEnvelope$4 = function isJSONEnvelope(envelope) {
  return isObject$3(envelope) && "json" in envelope;
};
var isArray$4 = Array.isArray;
var ModelResponse$5 = ModelResponse_1;
var isPathValue$2 = isPathValue$3;
var isJSONEnvelope$3 = isJSONEnvelope$4;
var empty$2 = { dispose: function() {
} };
function InvalidateResponse$1(model, args) {
  this._model = model;
  var groups = [];
  var group, groupType;
  var argIndex = -1;
  var argCount = args.length;
  while (++argIndex < argCount) {
    var arg = args[argIndex];
    var argType;
    if (isArray$4(arg)) {
      argType = "PathValues";
    } else if (isPathValue$2(arg)) {
      argType = "PathValues";
    } else if (isJSONEnvelope$3(arg)) {
      argType = "PathMaps";
    } else {
      throw new Error("Invalid Input");
    }
    if (groupType !== argType) {
      groupType = argType;
      group = {
        inputType: argType,
        arguments: []
      };
      groups.push(group);
    }
    group.arguments.push(arg);
  }
  this._groups = groups;
}
InvalidateResponse$1.prototype = Object.create(ModelResponse$5.prototype);
InvalidateResponse$1.prototype.progressively = function progressively2() {
  return this;
};
InvalidateResponse$1.prototype._toJSONG = function _toJSONG() {
  return this;
};
InvalidateResponse$1.prototype._subscribe = function _subscribe2(observer) {
  var model = this._model;
  this._groups.forEach(function(group) {
    var inputType = group.inputType;
    var methodArgs = group.arguments;
    var operationName = "_invalidate" + inputType;
    var operationFunc = model[operationName];
    operationFunc(model, methodArgs);
  });
  observer.onCompleted();
  return empty$2;
};
var InvalidateResponse_1 = InvalidateResponse$1;
function TimeoutScheduler$1(delay) {
  this.delay = delay;
}
var TimerDisposable = function TimerDisposable2(id) {
  this.id = id;
  this.disposed = false;
};
TimeoutScheduler$1.prototype.schedule = function schedule(action) {
  var id = setTimeout(action, this.delay);
  return new TimerDisposable(id);
};
TimeoutScheduler$1.prototype.scheduleWithState = function scheduleWithState(state, action) {
  var self2 = this;
  var id = setTimeout(function() {
    action(self2, state);
  }, this.delay);
  return new TimerDisposable(id);
};
TimerDisposable.prototype.dispose = function() {
  if (this.disposed) {
    return;
  }
  clearTimeout(this.id);
  this.disposed = true;
};
var TimeoutScheduler_1 = TimeoutScheduler$1;
var empty$1 = { dispose: function() {
} };
function ImmediateScheduler$1() {
}
ImmediateScheduler$1.prototype.schedule = function schedule2(action) {
  action();
  return empty$1;
};
ImmediateScheduler$1.prototype.scheduleWithState = function scheduleWithState2(state, action) {
  action(this, state);
  return empty$1;
};
var ImmediateScheduler_1 = ImmediateScheduler$1;
var removeNode2 = removeNode$2;
var updateNodeAncestors2 = updateNodeAncestors$3;
var collect = function collect2(lru, expired, totalArg, max, ratioArg, version2) {
  var total = totalArg;
  var ratio = ratioArg;
  if (typeof ratio !== "number") {
    ratio = 0.75;
  }
  var shouldUpdate = typeof version2 === "number";
  var targetSize = max * ratio;
  var parent, node, size;
  node = expired.pop();
  while (node) {
    size = node.$size || 0;
    total -= size;
    if (shouldUpdate === true) {
      updateNodeAncestors2(node, size, lru, version2);
    } else if (parent = node.$_parent) {
      removeNode2(node, parent, node.$_key, lru);
    }
    node = expired.pop();
  }
  if (total >= max) {
    var prev = lru.$_tail;
    node = prev;
    while (total >= targetSize && node) {
      prev = prev.$_prev;
      size = node.$size || 0;
      total -= size;
      if (shouldUpdate === true) {
        updateNodeAncestors2(node, size, lru, version2);
      }
      node = prev;
    }
    lru.$_tail = lru.$_prev = node;
    if (node == null) {
      lru.$_head = lru.$_next = void 0;
    } else {
      node.$_next = void 0;
    }
  }
};
var isArray$3 = Array.isArray;
var isObject$2 = isObject$f;
var isJSONGraphEnvelope$3 = function isJSONGraphEnvelope(envelope) {
  return isObject$2(envelope) && isArray$3(envelope.paths) && (isObject$2(envelope.jsonGraph) || isObject$2(envelope.jsong) || isObject$2(envelope.json) || isObject$2(envelope.values) || isObject$2(envelope.value));
};
var createHardlink2 = createHardlink$2;
var __prefix = reservedPrefix$1;
var $ref$1 = ref;
var getBoundValue = requireGetBoundValue();
var isArray$2 = Array.isArray;
var hasOwn = hasOwn_1;
var isObject$1 = isObject$f;
var isExpired$2 = isExpired$7;
var isFunction2 = isFunction$5;
var isPrimitive$1 = isPrimitive$4;
var expireNode$1 = expireNode$5;
var incrementVersion2 = incrementVersionExports;
var mergeValueOrInsertBranch2 = mergeValueOrInsertBranch$1;
var NullInPathError = NullInPathError_1;
var setPathMaps = function setPathMaps2(model, pathMapEnvelopes, x, errorSelector2, comparator2) {
  var modelRoot = model._root;
  var lru = modelRoot;
  var expired = modelRoot.expired;
  var version2 = incrementVersion2();
  var bound = model._path;
  var cache = modelRoot.cache;
  var node = bound.length ? getBoundValue(model, bound).value : cache;
  var parent = node.$_parent || cache;
  var initialVersion = cache.$_version;
  var requestedPath = [];
  var requestedPaths = [];
  var optimizedPaths = [];
  var optimizedIndex = bound.length;
  var pathMapIndex = -1;
  var pathMapCount = pathMapEnvelopes.length;
  while (++pathMapIndex < pathMapCount) {
    var pathMapEnvelope = pathMapEnvelopes[pathMapIndex];
    var optimizedPath = bound.slice(0);
    optimizedPath.index = optimizedIndex;
    setPathMap(
      pathMapEnvelope.json,
      0,
      cache,
      parent,
      node,
      requestedPaths,
      optimizedPaths,
      requestedPath,
      optimizedPath,
      version2,
      expired,
      lru,
      comparator2,
      errorSelector2
    );
  }
  var newVersion = cache.$_version;
  var rootChangeHandler = modelRoot.onChange;
  if (isFunction2(rootChangeHandler) && initialVersion !== newVersion) {
    rootChangeHandler();
  }
  return [requestedPaths, optimizedPaths];
};
function setPathMap(pathMap, depth, root3, parent, node, requestedPaths, optimizedPaths, requestedPath, optimizedPath, version2, expired, lru, comparator2, errorSelector2) {
  var keys = getKeys(pathMap);
  if (keys && keys.length) {
    var keyIndex = 0;
    var keyCount = keys.length;
    var optimizedIndex = optimizedPath.index;
    do {
      var key = keys[keyIndex];
      var child = pathMap[key];
      var branch = isObject$1(child) && !child.$type;
      requestedPath.depth = depth;
      var results = setNode(
        root3,
        parent,
        node,
        key,
        child,
        branch,
        false,
        requestedPath,
        optimizedPath,
        version2,
        expired,
        lru,
        comparator2,
        errorSelector2
      );
      requestedPath[depth] = key;
      requestedPath.index = depth;
      optimizedPath[optimizedPath.index++] = key;
      var nextNode = results[0];
      var nextParent = results[1];
      if (nextNode) {
        if (branch) {
          setPathMap(
            child,
            depth + 1,
            root3,
            nextParent,
            nextNode,
            requestedPaths,
            optimizedPaths,
            requestedPath,
            optimizedPath,
            version2,
            expired,
            lru,
            comparator2,
            errorSelector2
          );
        } else {
          requestedPaths.push(requestedPath.slice(0, requestedPath.index + 1));
          optimizedPaths.push(optimizedPath.slice(0, optimizedPath.index));
        }
      }
      if (++keyIndex >= keyCount) {
        break;
      }
      optimizedPath.index = optimizedIndex;
    } while (true);
  }
}
function setReference(value, root3, node, requestedPath, optimizedPath, version2, expired, lru, comparator2, errorSelector2) {
  var reference = node.value;
  optimizedPath.length = 0;
  optimizedPath.push.apply(optimizedPath, reference);
  if (isExpired$2(node)) {
    optimizedPath.index = reference.length;
    expireNode$1(node, expired, lru);
    return [void 0, root3];
  }
  var container = node;
  var parent = root3;
  node = node.$_context;
  if (node != null) {
    parent = node.$_parent || root3;
    optimizedPath.index = reference.length;
  } else {
    var index2 = 0;
    var count = reference.length - 1;
    optimizedPath.index = index2;
    parent = node = root3;
    do {
      var key = reference[index2];
      var branch = index2 < count;
      var results = setNode(
        root3,
        parent,
        node,
        key,
        value,
        branch,
        true,
        requestedPath,
        optimizedPath,
        version2,
        expired,
        lru,
        comparator2,
        errorSelector2
      );
      node = results[0];
      if (isPrimitive$1(node)) {
        optimizedPath.index = index2;
        return results;
      }
      parent = results[1];
    } while (index2++ < count);
    optimizedPath.index = index2;
    if (container.$_context !== node) {
      createHardlink2(container, node);
    }
  }
  return [node, parent];
}
function setNode(root3, parent, node, key, value, branch, reference, requestedPath, optimizedPath, version2, expired, lru, comparator2, errorSelector2) {
  var type = node.$type;
  while (type === $ref$1) {
    var results = setReference(
      value,
      root3,
      node,
      requestedPath,
      optimizedPath,
      version2,
      expired,
      lru,
      comparator2,
      errorSelector2
    );
    node = results[0];
    if (isPrimitive$1(node)) {
      return results;
    }
    parent = results[1];
    type = node && node.$type;
  }
  if (type !== void 0) {
    return [node, parent];
  }
  if (key == null) {
    if (branch) {
      throw new NullInPathError();
    } else if (node) {
      key = node.$_key;
    }
  } else {
    parent = node;
    node = parent[key];
  }
  node = mergeValueOrInsertBranch2(
    parent,
    node,
    key,
    value,
    branch,
    reference,
    requestedPath,
    optimizedPath,
    version2,
    expired,
    lru,
    comparator2,
    errorSelector2
  );
  return [node, parent];
}
function getKeys(pathMap) {
  if (isObject$1(pathMap) && !pathMap.$type) {
    var keys = [];
    var itr = 0;
    if (isArray$2(pathMap)) {
      keys[itr++] = "length";
    }
    for (var key in pathMap) {
      if (key[0] === __prefix || !hasOwn(pathMap, key)) {
        continue;
      }
      keys[itr++] = key;
    }
    return keys;
  }
  return void 0;
}
var pathSyntax$4 = src$1;
function sentinel(type, value, props) {
  var copy = /* @__PURE__ */ Object.create(null);
  if (props != null) {
    for (var key in props) {
      copy[key] = props[key];
    }
    copy["$type"] = type;
    copy.value = value;
    return copy;
  } else {
    return { $type: type, value };
  }
}
var src = {
  ref: function ref2(path, props) {
    return sentinel("ref", pathSyntax$4.fromPath(path), props);
  },
  atom: function atom2(value, props) {
    return sentinel("atom", value, props);
  },
  undefined: function() {
    return sentinel("atom");
  },
  error: function error2(errorValue, props) {
    return sentinel("error", errorValue, props);
  },
  pathValue: function pathValue(path, value) {
    return { path: pathSyntax$4.fromPath(path), value };
  },
  pathInvalidation: function pathInvalidation(path) {
    return { path: pathSyntax$4.fromPath(path), invalidated: true };
  }
};
var isArray$1 = Array.isArray;
var isPathValue$1 = isPathValue$3;
var isJSONGraphEnvelope$2 = isJSONGraphEnvelope$3;
var isJSONEnvelope$2 = isJSONEnvelope$4;
var pathSyntax$3 = src$1;
var validateInput$3 = function validateInput(args, allowedInput, method) {
  for (var i = 0, len = args.length; i < len; ++i) {
    var arg = args[i];
    var valid = false;
    if (isArray$1(arg) && allowedInput.path) {
      valid = true;
    } else if (typeof arg === "string" && allowedInput.pathSyntax) {
      try {
        pathSyntax$3.fromPath(arg);
        valid = true;
      } catch (errorMessage) {
        return new Error("Path syntax validation error -- " + errorMessage);
      }
    } else if (isPathValue$1(arg) && allowedInput.pathValue) {
      try {
        arg.path = pathSyntax$3.fromPath(arg.path);
        valid = true;
      } catch (errorMessage) {
        return new Error("Path syntax validation error -- " + errorMessage);
      }
    } else if (isJSONGraphEnvelope$2(arg) && allowedInput.jsonGraph) {
      valid = true;
    } else if (isJSONEnvelope$2(arg) && allowedInput.json) {
      valid = true;
    } else if (typeof arg === "function" && i + 1 === len && allowedInput.selector) {
      valid = true;
    }
    if (!valid) {
      return new Error("Unrecognized argument " + typeof arg + " [" + String(arg) + "] to Model#" + method);
    }
  }
  return true;
};
var privatePrefix = privatePrefix$2;
var isInternalKey$1 = function isInternalKey(x) {
  return x === "$size" || x.lastIndexOf(privatePrefix, 0) === 0;
};
var isInternalKey2 = isInternalKey$1;
var getCache$1 = function getCache(cache) {
  var out = {};
  _copyCache(cache, out);
  return out;
};
function cloneBoxedValue(boxedValue) {
  var clonedValue = {};
  var keys = Object.keys(boxedValue);
  var key;
  var i;
  var l;
  for (i = 0, l = keys.length; i < l; i++) {
    key = keys[i];
    if (!isInternalKey2(key)) {
      clonedValue[key] = boxedValue[key];
    }
  }
  return clonedValue;
}
function _copyCache(node, out, fromKey) {
  Object.keys(node).filter(function(k) {
    return !isInternalKey2(k) && node[k] !== void 0;
  }).forEach(function(key) {
    var cacheNext = node[key];
    var outNext = out[key];
    if (!outNext) {
      outNext = out[key] = {};
    }
    if (cacheNext.$type) {
      var isObject3 = cacheNext.value && typeof cacheNext.value === "object";
      var isUserCreatedcacheNext = !cacheNext.$_modelCreated;
      var value;
      if (isObject3 || isUserCreatedcacheNext) {
        value = cloneBoxedValue(cacheNext);
      } else {
        value = cacheNext.value;
      }
      out[key] = value;
      return;
    }
    _copyCache(cacheNext, outNext);
  });
}
var getCachePosition$1;
var hasRequiredGetCachePosition;
function requireGetCachePosition() {
  if (hasRequiredGetCachePosition)
    return getCachePosition$1;
  hasRequiredGetCachePosition = 1;
  getCachePosition$1 = function getCachePosition2(model, path) {
    var currentCachePosition = model._root.cache;
    var depth = -1;
    var maxDepth = path.length;
    while (++depth < maxDepth && currentCachePosition && !currentCachePosition.$type) {
      currentCachePosition = currentCachePosition[path[depth]];
    }
    return currentCachePosition;
  };
  return getCachePosition$1;
}
var applyErrorPrototype$1 = applyErrorPrototype_1;
function BoundJSONGraphModelError$1() {
  var instance = new Error("It is not legal to use the JSON Graph format from a bound Model. JSON Graph format can only be used from a root model.");
  instance.name = "BoundJSONGraphModelError";
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  }
  if (Error.captureStackTrace) {
    Error.captureStackTrace(instance, BoundJSONGraphModelError$1);
  }
  return instance;
}
applyErrorPrototype$1(BoundJSONGraphModelError$1);
var BoundJSONGraphModelError_1 = BoundJSONGraphModelError$1;
var getCachePosition = requireGetCachePosition();
var InvalidModelError = requireInvalidModelError();
var BoundJSONGraphModelError = BoundJSONGraphModelError_1;
function mergeInto(target, obj) {
  if (target === obj) {
    return;
  }
  if (target === null || typeof target !== "object" || target.$type) {
    return;
  }
  if (obj === null || typeof obj !== "object" || obj.$type) {
    return;
  }
  for (var key in obj) {
    if (key === "$__path") {
      continue;
    }
    var targetValue = target[key];
    if (targetValue === void 0) {
      target[key] = obj[key];
    } else {
      mergeInto(targetValue, obj[key]);
    }
  }
}
function defaultEnvelope(isJSONG) {
  return isJSONG ? { jsonGraph: {}, paths: [] } : { json: {} };
}
var get$3 = function get2(walk, isJSONG) {
  return function innerGet(model, paths, seed) {
    var nextSeed = isJSONG ? seed : [{}];
    var valueNode = nextSeed[0];
    var results = {
      values: nextSeed,
      optimizedPaths: []
    };
    var cache = model._root.cache;
    var boundPath = model._path;
    var currentCachePosition = cache;
    var optimizedPath, optimizedLength;
    var i, len;
    var requestedPath = [];
    var derefInfo = [];
    var referenceContainer;
    if (boundPath.length) {
      if (isJSONG) {
        return {
          criticalError: new BoundJSONGraphModelError()
        };
      }
      optimizedPath = model._getOptimizedBoundPath();
      optimizedLength = optimizedPath.length;
      currentCachePosition = getCachePosition(model, optimizedPath);
      if (currentCachePosition && currentCachePosition.$type) {
        return {
          criticalError: new InvalidModelError(boundPath, optimizedPath)
        };
      }
      referenceContainer = model._referenceContainer;
    } else {
      optimizedPath = [];
      optimizedLength = 0;
    }
    for (i = 0, len = paths.length; i < len; i++) {
      walk(
        model,
        cache,
        currentCachePosition,
        paths[i],
        0,
        valueNode,
        results,
        derefInfo,
        requestedPath,
        optimizedPath,
        optimizedLength,
        isJSONG,
        false,
        referenceContainer
      );
    }
    mergeInto(valueNode, paths.length ? seed[0] : defaultEnvelope(isJSONG));
    return results;
  };
};
var promote$1 = requirePromote();
var clone2 = requireClone();
var onError$1 = function onError2(model, node, depth, requestedPath, outerResults) {
  var value = node.value;
  if (!outerResults.errors) {
    outerResults.errors = [];
  }
  if (model._boxed) {
    value = clone2(node);
  }
  outerResults.errors.push({
    path: requestedPath.slice(0, depth),
    value
  });
  promote$1(model._root, node);
};
var onMissing$1 = function onMissing(model, path, depth, outerResults, requestedPath, optimizedPath, optimizedLength) {
  var pathSlice;
  if (!outerResults.requestedMissingPaths) {
    outerResults.requestedMissingPaths = [];
    outerResults.optimizedMissingPaths = [];
  }
  if (depth < path.length) {
    var isEmpty = false;
    for (var i = depth; i < path.length && !isEmpty; ++i) {
      if (isEmptyAtom(path[i])) {
        return;
      }
    }
    pathSlice = path.slice(depth);
  } else {
    pathSlice = [];
  }
  concatAndInsertMissing(
    model,
    pathSlice,
    depth,
    requestedPath,
    optimizedPath,
    optimizedLength,
    outerResults
  );
};
function concatAndInsertMissing(model, remainingPath, depth, requestedPath, optimizedPath, optimizedLength, results) {
  var requested = requestedPath.slice(0, depth);
  Array.prototype.push.apply(requested, remainingPath);
  results.requestedMissingPaths[results.requestedMissingPaths.length] = requested;
  var optimized = optimizedPath.slice(0, optimizedLength);
  Array.prototype.push.apply(optimized, remainingPath);
  results.optimizedMissingPaths[results.optimizedMissingPaths.length] = optimized;
}
function isEmptyAtom(atom3) {
  if (atom3 === null || typeof atom3 !== "object") {
    return false;
  }
  var isArray2 = Array.isArray(atom3);
  if (isArray2 && atom3.length) {
    return false;
  } else if (isArray2) {
    return true;
  }
  var from = atom3.from;
  var to = atom3.to;
  if (from === void 0 || from <= to) {
    return false;
  }
  return true;
}
var isMaterialzed = function isMaterialized(model) {
  return model._materialized && !model._source;
};
var isExpired$1 = requireIsExpired();
var $error = error;
var onError3 = onError$1;
var onValue$1 = onValue$2;
var onMissing2 = onMissing$1;
var isMaterialized2 = isMaterialzed;
var expireNode2 = expireNode$5;
var currentCacheVersion = currentCacheVersion$2;
var onValueType$1 = function onValueType(model, node, path, depth, seed, outerResults, branchInfo, requestedPath, optimizedPath, optimizedLength, isJSONG, fromReference) {
  var currType = node && node.$type;
  if (!node || !currType) {
    var materialized = isMaterialized2(model);
    if (materialized || !isJSONG) {
      onValue$1(
        model,
        node,
        seed,
        depth,
        outerResults,
        branchInfo,
        requestedPath,
        optimizedPath,
        optimizedLength,
        isJSONG
      );
    }
    if (!materialized) {
      onMissing2(
        model,
        path,
        depth,
        outerResults,
        requestedPath,
        optimizedPath,
        optimizedLength
      );
    }
    return;
  } else if (isExpired$1(node) && !(node.$_version === currentCacheVersion.getVersion() && node.$expires === 0)) {
    if (!node.$_invalidated) {
      expireNode2(node, model._root.expired, model._root);
    }
    onMissing2(
      model,
      path,
      depth,
      outerResults,
      requestedPath,
      optimizedPath,
      optimizedLength
    );
  } else if (currType === $error) {
    if (fromReference) {
      requestedPath[depth] = null;
      depth += 1;
    }
    if (isJSONG || model._treatErrorsAsValues) {
      onValue$1(
        model,
        node,
        seed,
        depth,
        outerResults,
        branchInfo,
        requestedPath,
        optimizedPath,
        optimizedLength,
        isJSONG
      );
    } else {
      onValue$1(
        model,
        void 0,
        seed,
        depth,
        outerResults,
        branchInfo,
        requestedPath,
        optimizedPath,
        optimizedLength,
        isJSONG
      );
      onError3(model, node, depth, requestedPath, outerResults);
    }
  } else {
    if (fromReference) {
      requestedPath[depth] = null;
      depth += 1;
    }
    onValue$1(
      model,
      node,
      seed,
      depth,
      outerResults,
      branchInfo,
      requestedPath,
      optimizedPath,
      optimizedLength,
      isJSONG
    );
  }
};
var followReference = requireFollowReference();
var onValueType2 = onValueType$1;
var onValue2 = onValue$2;
var isExpired2 = requireIsExpired();
var iterateKeySet2 = lib$1.iterateKeySet;
var $ref = ref;
var promote = requirePromote();
var walkPath$1 = function walkPath(model, root3, curr, path, depth, seed, outerResults, branchInfo, requestedPath, optimizedPathArg, optimizedLength, isJSONG, fromReferenceArg, referenceContainerArg) {
  var fromReference = fromReferenceArg;
  var optimizedPath = optimizedPathArg;
  var referenceContainer = referenceContainerArg;
  if (!curr || curr.$type || depth === path.length) {
    onValueType2(
      model,
      curr,
      path,
      depth,
      seed,
      outerResults,
      branchInfo,
      requestedPath,
      optimizedPath,
      optimizedLength,
      isJSONG,
      fromReference
    );
    return;
  }
  var keySet = path[depth];
  var isKeySet = keySet !== null && typeof keySet === "object";
  var iteratorNote = false;
  var key = keySet;
  if (isKeySet) {
    iteratorNote = {};
    key = iterateKeySet2(keySet, iteratorNote);
  }
  var allowFromWhenceYouCame = model._allowFromWhenceYouCame;
  var optimizedLengthPlus1 = optimizedLength + 1;
  var nextDepth = depth + 1;
  var refPath;
  do {
    if (key == null) {
      onValue2(
        model,
        curr,
        seed,
        depth,
        outerResults,
        branchInfo,
        requestedPath,
        optimizedPath,
        optimizedLength,
        isJSONG
      );
      if (iteratorNote && !iteratorNote.done) {
        key = iterateKeySet2(keySet, iteratorNote);
      }
      continue;
    }
    fromReference = false;
    optimizedPath[optimizedLength] = key;
    requestedPath[depth] = key;
    var next = curr[key];
    var nextOptimizedPath = optimizedPath;
    var nextOptimizedLength = optimizedLengthPlus1;
    if (next) {
      var nType = next.$type;
      var value = nType && next.value || next;
      if (nextDepth < path.length && nType && nType === $ref && !isExpired2(next)) {
        promote(model._root, next);
        if (isJSONG) {
          onValue2(
            model,
            next,
            seed,
            nextDepth,
            outerResults,
            null,
            null,
            optimizedPath,
            nextOptimizedLength,
            isJSONG
          );
        }
        var ref3 = followReference(
          model,
          root3,
          root3,
          next,
          value,
          seed,
          isJSONG
        );
        fromReference = true;
        next = ref3[0];
        refPath = ref3[1];
        referenceContainer = ref3[2];
        nextOptimizedPath = refPath.slice();
        nextOptimizedLength = refPath.length;
      }
      if (next) {
        var obj;
        if (referenceContainer && allowFromWhenceYouCame) {
          obj = {
            // eslint-disable-next-line camelcase
            $__path: next.$_absolutePath,
            // eslint-disable-next-line camelcase
            $__refPath: referenceContainer.value,
            // eslint-disable-next-line camelcase
            $__toReference: referenceContainer.$_absolutePath
          };
        } else {
          obj = {
            // eslint-disable-next-line camelcase
            $__path: next.$_absolutePath
          };
        }
        branchInfo[depth] = obj;
      }
    }
    walkPath(
      model,
      root3,
      next,
      path,
      nextDepth,
      seed,
      outerResults,
      branchInfo,
      requestedPath,
      nextOptimizedPath,
      nextOptimizedLength,
      isJSONG,
      fromReference,
      referenceContainer
    );
    if (iteratorNote && !iteratorNote.done) {
      key = iterateKeySet2(keySet, iteratorNote);
    }
  } while (iteratorNote && !iteratorNote.done);
};
var get$2 = get$3;
var walkPath2 = walkPath$1;
var getWithPathsAsPathMap$2 = get$2(walkPath2, false);
var getWithPathsAsJSONGraph$1 = get$2(walkPath2, true);
var get_1 = {
  getValueSync: requireGetValueSync(),
  getBoundValue: requireGetBoundValue(),
  getWithPathsAsPathMap: getWithPathsAsPathMap$2,
  getWithPathsAsJSONGraph: getWithPathsAsJSONGraph$1
};
var validInput = {
  path: true,
  pathSyntax: true
};
var gets = get_1;
var getWithPathsAsJSONGraph = gets.getWithPathsAsJSONGraph;
var getWithPathsAsPathMap$1 = gets.getWithPathsAsPathMap;
var checkCacheAndReport$2 = function checkCacheAndReport(model, requestedPaths, observer, progressive, isJSONG, seed, errors2) {
  var results = isJSONG ? getWithPathsAsJSONGraph(model, requestedPaths, seed) : getWithPathsAsPathMap$1(model, requestedPaths, seed);
  var valueNode = results.values && results.values[0];
  var completed = !results.requestedMissingPaths || !results.requestedMissingPaths.length || !model._source;
  if (results.errors) {
    var errs = results.errors;
    var errorsLength = errors2.length;
    for (var i = 0, len = errs.length; i < len; ++i, ++errorsLength) {
      errors2[errorsLength] = errs[i];
    }
  }
  if (progressive || completed && valueNode !== void 0) {
    observer.onNext(valueNode);
  }
  if (results.criticalError) {
    observer.onError(results.criticalError);
    return null;
  }
  if (completed) {
    if (errors2.length) {
      observer.onError(errors2);
    } else {
      observer.onCompleted();
    }
    return null;
  }
  return results;
};
var applyErrorPrototype = applyErrorPrototype_1;
function MaxRetryExceededError$2(missingOptimizedPaths) {
  var instance = new Error("The allowed number of retries have been exceeded.");
  instance.name = "MaxRetryExceededError";
  instance.missingOptimizedPaths = missingOptimizedPaths || [];
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  }
  if (Error.captureStackTrace) {
    Error.captureStackTrace(instance, MaxRetryExceededError$2);
  }
  return instance;
}
applyErrorPrototype(MaxRetryExceededError$2);
MaxRetryExceededError$2.is = function(e) {
  return e && e.name === "MaxRetryExceededError";
};
var MaxRetryExceededError_1 = MaxRetryExceededError$2;
var AssignableDisposable$2 = function AssignableDisposable(disosableCallback) {
  this.disposed = false;
  this.currentDisposable = disosableCallback;
};
AssignableDisposable$2.prototype = {
  /**
   * Disposes of the current disposable.  This would be the getRequestCycle
   * disposable.
   */
  dispose: function dispose() {
    if (this.disposed || !this.currentDisposable) {
      return;
    }
    this.disposed = true;
    var currentDisposable = this.currentDisposable;
    if (currentDisposable.dispose) {
      currentDisposable.dispose();
    } else {
      currentDisposable();
    }
  }
};
var AssignableDisposable_1 = AssignableDisposable$2;
var checkCacheAndReport$1 = checkCacheAndReport$2;
var MaxRetryExceededError$1 = MaxRetryExceededError_1;
var collectLru$2 = collect;
var getSize$2 = getSize$6;
var AssignableDisposable$1 = AssignableDisposable_1;
var InvalidSourceError$1 = InvalidSourceError_1;
var getRequestCycle$1 = function getRequestCycle(getResponse, model, results, observer, errors2, count) {
  if (count > model._maxRetries) {
    observer.onError(new MaxRetryExceededError$1(results.optimizedMissingPaths));
    return {
      dispose: function() {
      }
    };
  }
  var requestQueue = model._request;
  var requestedMissingPaths = results.requestedMissingPaths;
  var optimizedMissingPaths = results.optimizedMissingPaths;
  var disposable = new AssignableDisposable$1();
  var boundRequestedMissingPaths = [];
  var boundPath = model._path;
  if (boundPath.length) {
    for (var i = 0, len = requestedMissingPaths.length; i < len; ++i) {
      boundRequestedMissingPaths[i] = boundPath.concat(requestedMissingPaths[i]);
    }
  } else {
    boundRequestedMissingPaths = requestedMissingPaths;
  }
  var currentRequestDisposable = requestQueue.get(boundRequestedMissingPaths, optimizedMissingPaths, count, function(err, data, hasInvalidatedResult) {
    if (model._treatDataSourceErrorsAsJSONGraphErrors ? err instanceof InvalidSourceError$1 : !!err) {
      if (results.hasValues) {
        observer.onNext(results.values && results.values[0]);
      }
      observer.onError(err);
      return;
    }
    var nextRequestedMissingPaths;
    var nextSeed;
    if (hasInvalidatedResult) {
      nextRequestedMissingPaths = getResponse.currentRemainingPaths;
      nextSeed = [{}];
    } else {
      nextRequestedMissingPaths = requestedMissingPaths;
      nextSeed = results.values;
    }
    var nextResults = checkCacheAndReport$1(
      model,
      nextRequestedMissingPaths,
      observer,
      getResponse.isProgressive,
      getResponse.isJSONGraph,
      nextSeed,
      errors2
    );
    if (nextResults) {
      disposable.currentDisposable = getRequestCycle(
        getResponse,
        model,
        nextResults,
        observer,
        errors2,
        count + 1
      );
    } else {
      var modelRoot = model._root;
      var modelCache = modelRoot.cache;
      var currentVersion = modelCache.$_version;
      collectLru$2(
        modelRoot,
        modelRoot.expired,
        getSize$2(modelCache),
        model._maxSize,
        model._collectRatio,
        currentVersion
      );
    }
  });
  disposable.currentDisposable = currentRequestDisposable;
  return disposable;
};
var ModelResponse$4 = ModelResponse_1;
var checkCacheAndReport2 = checkCacheAndReport$2;
var getRequestCycle2 = getRequestCycle$1;
var empty = { dispose: function() {
} };
var collectLru$1 = collect;
var getSize$1 = getSize$6;
var GetResponse$3 = function GetResponse(model, paths, isJSONGraph, isProgressive, forceCollect) {
  this.model = model;
  this.currentRemainingPaths = paths;
  this.isJSONGraph = isJSONGraph || false;
  this.isProgressive = isProgressive || false;
  this.forceCollect = forceCollect || false;
};
GetResponse$3.prototype = Object.create(ModelResponse$4.prototype);
GetResponse$3.prototype._toJSONG = function _toJSONGraph() {
  return new GetResponse$3(
    this.model,
    this.currentRemainingPaths,
    true,
    this.isProgressive,
    this.forceCollect
  );
};
GetResponse$3.prototype.progressively = function progressively3() {
  return new GetResponse$3(
    this.model,
    this.currentRemainingPaths,
    this.isJSONGraph,
    true,
    this.forceCollect
  );
};
GetResponse$3.prototype._subscribe = function _subscribe3(observer) {
  var seed = [{}];
  var errors2 = [];
  var model = this.model;
  var isJSONG = observer.isJSONG = this.isJSONGraph;
  var isProgressive = this.isProgressive;
  var results = checkCacheAndReport2(
    model,
    this.currentRemainingPaths,
    observer,
    isProgressive,
    isJSONG,
    seed,
    errors2
  );
  if (!results) {
    if (this.forceCollect) {
      var modelRoot = model._root;
      var modelCache = modelRoot.cache;
      var currentVersion = modelCache.$_version;
      collectLru$1(
        modelRoot,
        modelRoot.expired,
        getSize$1(modelCache),
        model._maxSize,
        model._collectRatio,
        currentVersion
      );
    }
    return empty;
  }
  return getRequestCycle2(
    this,
    model,
    results,
    observer,
    errors2,
    1
  );
};
var GetResponse_1 = GetResponse$3;
var pathSyntax$2 = src$1;
var ModelResponse$3 = ModelResponse_1;
var GET_VALID_INPUT$1 = validInput;
var validateInput$2 = validateInput$3;
var GetResponse$2 = GetResponse_1;
var get$1 = function get3() {
  var out = validateInput$2(arguments, GET_VALID_INPUT$1, "get");
  if (out !== true) {
    return new ModelResponse$3(function(o) {
      o.onError(out);
    });
  }
  var paths = pathSyntax$2.fromPathsOrPathValues(arguments);
  return new GetResponse$2(this, paths);
};
var GetResponse$1 = GetResponse_1;
var getWithPaths = function getWithPaths2(paths) {
  return new GetResponse$1(this, paths);
};
var setValidInput$1 = {
  pathValue: true,
  pathSyntax: true,
  json: true,
  jsonGraph: true
};
var arrayFlatMap$1 = function arrayFlatMap(array, selector) {
  var index2 = -1;
  var i = -1;
  var n = array.length;
  var array2 = [];
  while (++i < n) {
    var array3 = selector(array[i], i, array);
    var j = -1;
    var k = array3.length;
    while (++j < k) {
      array2[++index2] = array3[j];
    }
  }
  return array2;
};
var arrayFlatMap2 = arrayFlatMap$1;
var setGroupsIntoCache$1 = function setGroupsIntoCache(model, groups) {
  var modelRoot = model._root;
  var errorSelector2 = modelRoot.errorSelector;
  var groupIndex = -1;
  var groupCount = groups.length;
  var requestedPaths = [];
  var optimizedPaths = [];
  var returnValue = {
    requestedPaths,
    optimizedPaths
  };
  while (++groupIndex < groupCount) {
    var group = groups[groupIndex];
    var inputType = group.inputType;
    var methodArgs = group.arguments;
    if (methodArgs.length > 0) {
      var operationName = "_set" + inputType;
      var operationFunc = model[operationName];
      var successfulPaths = operationFunc(model, methodArgs, null, errorSelector2);
      optimizedPaths.push.apply(optimizedPaths, successfulPaths[1]);
      if (inputType === "PathValues") {
        requestedPaths.push.apply(requestedPaths, methodArgs.map(pluckPath));
      } else if (inputType === "JSONGs") {
        requestedPaths.push.apply(requestedPaths, arrayFlatMap2(methodArgs, pluckEnvelopePaths));
      } else {
        requestedPaths.push.apply(requestedPaths, successfulPaths[0]);
      }
    }
  }
  return returnValue;
};
function pluckPath(pathValue2) {
  return pathValue2.path;
}
function pluckEnvelopePaths(jsonGraphEnvelope) {
  return jsonGraphEnvelope.paths;
}
var emptyArray = [];
var AssignableDisposable2 = AssignableDisposable_1;
var GetResponse2 = GetResponse_1;
var setGroupsIntoCache2 = setGroupsIntoCache$1;
var getWithPathsAsPathMap = get_1.getWithPathsAsPathMap;
var InvalidSourceError = InvalidSourceError_1;
var MaxRetryExceededError = MaxRetryExceededError_1;
var setRequestCycle$1 = function setRequestCycle(model, observer, groups, isJSONGraph, isProgressive, count) {
  var requestedAndOptimizedPaths = setGroupsIntoCache2(model, groups);
  var optimizedPaths = requestedAndOptimizedPaths.optimizedPaths;
  var requestedPaths = requestedAndOptimizedPaths.requestedPaths;
  if (count > model._maxRetries) {
    observer.onError(new MaxRetryExceededError(optimizedPaths));
    return {
      dispose: function() {
      }
    };
  }
  var isMaster = model._source === void 0;
  if (isMaster) {
    return subscribeToFollowupGet(
      model,
      observer,
      requestedPaths,
      isJSONGraph,
      isProgressive
    );
  }
  var prevVersion;
  if (isProgressive) {
    var results = getWithPathsAsPathMap(model, requestedPaths, [{}]);
    if (results.criticalError) {
      observer.onError(results.criticalError);
      return null;
    }
    observer.onNext(results.values[0]);
    prevVersion = model._root.cache.$_version;
  }
  var currentJSONGraph = getJSONGraph(model, optimizedPaths);
  var disposable = new AssignableDisposable2();
  var requestDisposable = model._request.set(currentJSONGraph, count, function(error3, jsonGraphEnv) {
    if (error3 instanceof InvalidSourceError) {
      observer.onError(error3);
      return;
    }
    var isCompleted = false;
    if (error3 || optimizedPaths.length === jsonGraphEnv.paths.length) {
      isCompleted = true;
    }
    if (isProgressive) {
      var nextVersion = model._root.cache.$_version;
      var versionChanged = nextVersion !== prevVersion;
      if (!versionChanged) {
        observer.onCompleted();
        return;
      }
    }
    if (isCompleted) {
      disposable.currentDisposable = subscribeToFollowupGet(
        model,
        observer,
        requestedPaths,
        isJSONGraph,
        isProgressive
      );
    } else {
      setRequestCycle(
        model,
        observer,
        groups,
        isJSONGraph,
        isProgressive,
        count + 1
      );
    }
  });
  disposable.currentDisposable = requestDisposable;
  return disposable;
};
function getJSONGraph(model, optimizedPaths) {
  var boundPath = model._path;
  var envelope = {};
  model._path = emptyArray;
  model._getPathValuesAsJSONG(model._materialize().withoutDataSource(), optimizedPaths, [envelope]);
  model._path = boundPath;
  return envelope;
}
function subscribeToFollowupGet(model, observer, requestedPaths, isJSONGraph, isProgressive) {
  var response = new GetResponse2(
    model,
    requestedPaths,
    isJSONGraph,
    isProgressive,
    true
  );
  return response.subscribe(observer);
}
var ModelResponse$2 = ModelResponse_1;
var pathSyntax$1 = src$1;
var isArray = Array.isArray;
var isPathValue2 = isPathValue$3;
var isJSONGraphEnvelope$1 = isJSONGraphEnvelope$3;
var isJSONEnvelope$1 = isJSONEnvelope$4;
var setRequestCycle2 = setRequestCycle$1;
var SetResponse$1 = function SetResponse(model, args, isJSONGraph, isProgressive) {
  this._model = model;
  this._isJSONGraph = isJSONGraph || false;
  this._isProgressive = isProgressive || false;
  this._initialArgs = args;
  this._value = [{}];
  var groups = [];
  var group, groupType;
  var argIndex = -1;
  var argCount = args.length;
  while (++argIndex < argCount) {
    var arg = args[argIndex];
    var argType;
    if (isArray(arg) || typeof arg === "string") {
      arg = pathSyntax$1.fromPath(arg);
      argType = "PathValues";
    } else if (isPathValue2(arg)) {
      arg.path = pathSyntax$1.fromPath(arg.path);
      argType = "PathValues";
    } else if (isJSONGraphEnvelope$1(arg)) {
      argType = "JSONGs";
    } else if (isJSONEnvelope$1(arg)) {
      argType = "PathMaps";
    }
    if (groupType !== argType) {
      groupType = argType;
      group = {
        inputType: argType,
        arguments: []
      };
      groups.push(group);
    }
    group.arguments.push(arg);
  }
  this._groups = groups;
};
SetResponse$1.prototype = Object.create(ModelResponse$2.prototype);
SetResponse$1.prototype._subscribe = function _subscribe4(observer) {
  var groups = this._groups;
  var model = this._model;
  var isJSONGraph = this._isJSONGraph;
  var isProgressive = this._isProgressive;
  return setRequestCycle2(
    model,
    observer,
    groups,
    isJSONGraph,
    isProgressive,
    1
  );
};
SetResponse$1.prototype._toJSONG = function _toJSONGraph2() {
  return new SetResponse$1(
    this._model,
    this._initialArgs,
    true,
    this._isProgressive
  );
};
SetResponse$1.prototype.progressively = function progressively4() {
  return new SetResponse$1(
    this._model,
    this._initialArgs,
    this._isJSONGraph,
    true
  );
};
var SetResponse_1 = SetResponse$1;
var setValidInput = setValidInput$1;
var validateInput$1 = validateInput$3;
var SetResponse2 = SetResponse_1;
var ModelResponse$1 = ModelResponse_1;
var set2 = function set3() {
  var out = validateInput$1(arguments, setValidInput, "set");
  if (out !== true) {
    return new ModelResponse$1(function(o) {
      o.onError(out);
    });
  }
  var argsIdx = -1;
  var argsLen = arguments.length;
  var args = [];
  while (++argsIdx < argsLen) {
    args[argsIdx] = arguments[argsIdx];
  }
  return new SetResponse2(this, args);
};
var InvalidDerefInputError_1;
var hasRequiredInvalidDerefInputError;
function requireInvalidDerefInputError() {
  if (hasRequiredInvalidDerefInputError)
    return InvalidDerefInputError_1;
  hasRequiredInvalidDerefInputError = 1;
  var applyErrorPrototype2 = applyErrorPrototype_1;
  function InvalidDerefInputError() {
    var instance = new Error("Deref can only be used with a non-primitive object from get, set, or call.");
    instance.name = "InvalidDerefInputError";
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    }
    if (Error.captureStackTrace) {
      Error.captureStackTrace(instance, InvalidDerefInputError);
    }
    return instance;
  }
  applyErrorPrototype2(InvalidDerefInputError);
  InvalidDerefInputError_1 = InvalidDerefInputError;
  return InvalidDerefInputError_1;
}
var deref;
var hasRequiredDeref;
function requireDeref() {
  if (hasRequiredDeref)
    return deref;
  hasRequiredDeref = 1;
  var InvalidDerefInputError = requireInvalidDerefInputError();
  var getCachePosition2 = requireGetCachePosition();
  var CONTAINER_DOES_NOT_EXIST = "e";
  var $ref2 = ref;
  deref = function deref2(boundJSONArg) {
    var absolutePath = boundJSONArg && boundJSONArg.$__path;
    var refPath = boundJSONArg && boundJSONArg.$__refPath;
    var toReference = boundJSONArg && boundJSONArg.$__toReference;
    var referenceContainer;
    if (absolutePath) {
      var validContainer = CONTAINER_DOES_NOT_EXIST;
      if (toReference) {
        validContainer = false;
        referenceContainer = getCachePosition2(this, toReference);
        if (refPath && referenceContainer && referenceContainer.$type === $ref2) {
          var containerPath = referenceContainer.value;
          var i = 0;
          var len = refPath.length;
          validContainer = true;
          for (; validContainer && i < len; ++i) {
            if (containerPath[i] !== refPath[i]) {
              validContainer = false;
            }
          }
        }
      }
      if (!validContainer) {
        referenceContainer = false;
      } else if (validContainer === CONTAINER_DOES_NOT_EXIST) {
        referenceContainer = true;
      }
      return this._clone({
        _path: absolutePath,
        _referenceContainer: referenceContainer
      });
    }
    throw new InvalidDerefInputError();
  };
  return deref;
}
var hasValidParentReference;
var hasRequiredHasValidParentReference;
function requireHasValidParentReference() {
  if (hasRequiredHasValidParentReference)
    return hasValidParentReference;
  hasRequiredHasValidParentReference = 1;
  hasValidParentReference = function fromWhenceYeCame() {
    var reference = this._referenceContainer;
    if (!this._allowFromWhenceYouCame) {
      return true;
    }
    if (reference === true) {
      return true;
    }
    if (reference === false) {
      return false;
    }
    if (reference && reference.$_parent === void 0) {
      return false;
    }
    if (reference && reference.$_invalidated) {
      return false;
    }
    return true;
  };
  return hasValidParentReference;
}
var getValue;
var hasRequiredGetValue;
function requireGetValue() {
  if (hasRequiredGetValue)
    return getValue;
  hasRequiredGetValue = 1;
  var ModelResponse2 = ModelResponse_1;
  var pathSyntax2 = src$1;
  getValue = function getValue2(path) {
    var parsedPath = pathSyntax2.fromPath(path);
    var pathIdx = 0;
    var pathLen = parsedPath.length;
    while (++pathIdx < pathLen) {
      if (typeof parsedPath[pathIdx] === "object") {
        return new ModelResponse2(function(o) {
          o.onError(new Error("Paths must be simple paths"));
        });
      }
    }
    var self2 = this;
    return new ModelResponse2(function(obs) {
      return self2.get(parsedPath).subscribe(function(data) {
        var curr = data.json;
        var depth = -1;
        var length = parsedPath.length;
        while (curr && ++depth < length) {
          curr = curr[parsedPath[depth]];
        }
        obs.onNext(curr);
      }, function(err) {
        obs.onError(err);
      }, function() {
        obs.onCompleted();
      });
    });
  };
  return getValue;
}
var setValue;
var hasRequiredSetValue;
function requireSetValue() {
  if (hasRequiredSetValue)
    return setValue;
  hasRequiredSetValue = 1;
  var jsong2 = src;
  var ModelResponse2 = ModelResponse_1;
  var isPathValue3 = isPathValue$3;
  setValue = function setValue2(pathArg, valueArg) {
    var value = isPathValue3(pathArg) ? pathArg : jsong2.pathValue(pathArg, valueArg);
    var pathIdx = 0;
    var path = value.path;
    var pathLen = path.length;
    while (++pathIdx < pathLen) {
      if (typeof path[pathIdx] === "object") {
        return new ModelResponse2(function(o) {
          o.onError(new Error("Paths must be simple paths"));
        });
      }
    }
    var self2 = this;
    return new ModelResponse2(function(obs) {
      return self2.set(value).subscribe(function(data) {
        var curr = data.json;
        var depth = -1;
        var length = path.length;
        while (curr && ++depth < length) {
          curr = curr[path[depth]];
        }
        obs.onNext(curr);
      }, function(err) {
        obs.onError(err);
      }, function() {
        obs.onCompleted();
      });
    });
  };
  return setValue;
}
var sync$2;
var hasRequiredSync$2;
function requireSync$2() {
  if (hasRequiredSync$2)
    return sync$2;
  hasRequiredSync$2 = 1;
  var pathSyntax2 = src$1;
  var getValueSync2 = requireGetValueSync();
  sync$2 = function _getValueSync(pathArg) {
    var path = pathSyntax2.fromPath(pathArg);
    if (Array.isArray(path) === false) {
      throw new Error("Model#_getValueSync must be called with an Array path.");
    }
    if (this._path.length) {
      path = this._path.concat(path);
    }
    this._syncCheck("getValueSync");
    return getValueSync2(this, path).value;
  };
  return sync$2;
}
var sync$1;
var hasRequiredSync$1;
function requireSync$1() {
  if (hasRequiredSync$1)
    return sync$1;
  hasRequiredSync$1 = 1;
  var pathSyntax2 = src$1;
  var isPathValue3 = isPathValue$3;
  var setPathValues2 = requireSetPathValues();
  sync$1 = function setValueSync(pathArg, valueArg, errorSelectorArg, comparatorArg) {
    var path = pathSyntax2.fromPath(pathArg);
    var value = valueArg;
    var errorSelector2 = errorSelectorArg;
    var comparator2 = comparatorArg;
    if (isPathValue3(path)) {
      comparator2 = errorSelector2;
      errorSelector2 = value;
      value = path;
    } else {
      value = {
        path,
        value
      };
    }
    if (isPathValue3(value) === false) {
      throw new Error("Model#setValueSync must be called with an Array path.");
    }
    if (typeof errorSelector2 !== "function") {
      errorSelector2 = this._root._errorSelector;
    }
    if (typeof comparator2 !== "function") {
      comparator2 = this._root._comparator;
    }
    this._syncCheck("setValueSync");
    setPathValues2(this, [value]);
    return this._getValueSync(value.path);
  };
  return sync$1;
}
var sync;
var hasRequiredSync;
function requireSync() {
  if (hasRequiredSync)
    return sync;
  hasRequiredSync = 1;
  var pathSyntax2 = src$1;
  var getBoundValue2 = requireGetBoundValue();
  var InvalidModelError2 = requireInvalidModelError();
  sync = function derefSync(boundPathArg) {
    var boundPath = pathSyntax2.fromPath(boundPathArg);
    if (!Array.isArray(boundPath)) {
      throw new Error("Model#derefSync must be called with an Array path.");
    }
    var boundValue = getBoundValue2(this, this._path.concat(boundPath), false);
    var path = boundValue.path;
    var node = boundValue.value;
    var found = boundValue.found;
    if (!found || node === void 0) {
      return void 0;
    }
    if (node.$type) {
      throw new InvalidModelError2(path, path);
    }
    return this._clone({ _path: path });
  };
  return sync;
}
var getVersion;
var hasRequiredGetVersion;
function requireGetVersion() {
  if (hasRequiredGetVersion)
    return getVersion;
  hasRequiredGetVersion = 1;
  var getValueSync2 = requireGetValueSync();
  getVersion = function _getVersion(model, path) {
    var gen = getValueSync2({
      _boxed: true,
      _root: model._root,
      _treatErrorsAsValues: model._treatErrorsAsValues
    }, path, true).value;
    var version2 = gen && gen.$_version;
    return version2 == null ? -1 : version2;
  };
  return getVersion;
}
var invalidatePathSets;
var hasRequiredInvalidatePathSets;
function requireInvalidatePathSets() {
  if (hasRequiredInvalidatePathSets)
    return invalidatePathSets;
  hasRequiredInvalidatePathSets = 1;
  var __ref2 = requireRef();
  var $ref2 = ref;
  var getBoundValue2 = requireGetBoundValue();
  var promote2 = requirePromote();
  var getSize4 = getSize$6;
  var isExpired3 = isExpired$7;
  var isFunction3 = isFunction$5;
  var isPrimitive3 = isPrimitive$4;
  var expireNode3 = expireNode$5;
  var iterateKeySet3 = lib$1.iterateKeySet;
  var incrementVersion3 = incrementVersionExports;
  var updateNodeAncestors3 = updateNodeAncestors$3;
  var removeNodeAndDescendants2 = requireRemoveNodeAndDescendants();
  invalidatePathSets = function invalidatePathSets2(model, paths) {
    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version2 = incrementVersion3();
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = bound.length ? getBoundValue2(model, bound).value : cache;
    var parent = node.$_parent || cache;
    var initialVersion = cache.$_version;
    var pathIndex = -1;
    var pathCount2 = paths.length;
    while (++pathIndex < pathCount2) {
      var path = paths[pathIndex];
      invalidatePathSet(path, 0, cache, parent, node, version2, expired, lru);
    }
    var newVersion = cache.$_version;
    var rootChangeHandler = modelRoot.onChange;
    if (isFunction3(rootChangeHandler) && initialVersion !== newVersion) {
      rootChangeHandler();
    }
  };
  function invalidatePathSet(path, depth, root3, parent, node, version2, expired, lru) {
    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet3(keySet, note);
    do {
      var results = invalidateNode(root3, parent, node, key, branch, expired, lru);
      var nextNode = results[0];
      var nextParent = results[1];
      if (nextNode) {
        if (branch) {
          invalidatePathSet(
            path,
            depth + 1,
            root3,
            nextParent,
            nextNode,
            version2,
            expired,
            lru
          );
        } else if (removeNodeAndDescendants2(nextNode, nextParent, key, lru, void 0)) {
          updateNodeAncestors3(nextParent, getSize4(nextNode), lru, version2);
        }
      }
      key = iterateKeySet3(keySet, note);
    } while (!note.done);
  }
  function invalidateReference(root3, node, expired, lru) {
    if (isExpired3(node)) {
      expireNode3(node, expired, lru);
      return [void 0, root3];
    }
    promote2(lru, node);
    var container = node;
    var reference = node.value;
    var parent = root3;
    node = node.$_context;
    if (node != null) {
      parent = node.$_parent || root3;
    } else {
      var index2 = 0;
      var count = reference.length - 1;
      parent = node = root3;
      do {
        var key = reference[index2];
        var branch = index2 < count;
        var results = invalidateNode(root3, parent, node, key, branch, expired, lru);
        node = results[0];
        if (isPrimitive3(node)) {
          return results;
        }
        parent = results[1];
      } while (index2++ < count);
      if (container.$_context !== node) {
        var backRefs = node.$_refsLength || 0;
        node.$_refsLength = backRefs + 1;
        node[__ref2 + backRefs] = container;
        container.$_context = node;
        container.$_refIndex = backRefs;
      }
    }
    return [node, parent];
  }
  function invalidateNode(root3, parent, node, key, branch, expired, lru) {
    var type = node.$type;
    while (type === $ref2) {
      var results = invalidateReference(root3, node, expired, lru);
      node = results[0];
      if (isPrimitive3(node)) {
        return results;
      }
      parent = results[1];
      type = node.$type;
    }
    if (type !== void 0) {
      return [node, parent];
    }
    if (key == null) {
      if (branch) {
        throw new Error("`null` is not allowed in branch key positions.");
      } else if (node) {
        key = node.$_key;
      }
    } else {
      parent = node;
      node = parent[key];
    }
    return [node, parent];
  }
  return invalidatePathSets;
}
var invalidatePathMaps;
var hasRequiredInvalidatePathMaps;
function requireInvalidatePathMaps() {
  if (hasRequiredInvalidatePathMaps)
    return invalidatePathMaps;
  hasRequiredInvalidatePathMaps = 1;
  var createHardlink3 = createHardlink$2;
  var __prefix2 = reservedPrefix$1;
  var $ref2 = ref;
  var getBoundValue2 = requireGetBoundValue();
  var promote2 = requirePromote();
  var getSize4 = getSize$6;
  var hasOwn2 = hasOwn_1;
  var isObject3 = isObject$f;
  var isExpired3 = isExpired$7;
  var isFunction3 = isFunction$5;
  var isPrimitive3 = isPrimitive$4;
  var expireNode3 = expireNode$5;
  var incrementVersion3 = incrementVersionExports;
  var updateNodeAncestors3 = updateNodeAncestors$3;
  var removeNodeAndDescendants2 = requireRemoveNodeAndDescendants();
  invalidatePathMaps = function invalidatePathMaps2(model, pathMapEnvelopes) {
    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version2 = incrementVersion3();
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = bound.length ? getBoundValue2(model, bound).value : cache;
    var parent = node.$_parent || cache;
    var initialVersion = cache.$_version;
    var pathMapIndex = -1;
    var pathMapCount = pathMapEnvelopes.length;
    while (++pathMapIndex < pathMapCount) {
      var pathMapEnvelope = pathMapEnvelopes[pathMapIndex];
      invalidatePathMap(pathMapEnvelope.json, cache, parent, node, version2, expired, lru);
    }
    var newVersion = cache.$_version;
    var rootChangeHandler = modelRoot.onChange;
    if (isFunction3(rootChangeHandler) && initialVersion !== newVersion) {
      rootChangeHandler();
    }
  };
  function invalidatePathMap(pathMap, root3, parent, node, version2, expired, lru) {
    if (isPrimitive3(pathMap) || pathMap.$type) {
      return;
    }
    for (var key in pathMap) {
      if (key[0] !== __prefix2 && hasOwn2(pathMap, key)) {
        var child = pathMap[key];
        var branch = isObject3(child) && !child.$type;
        var results = invalidateNode(root3, parent, node, key, branch, expired, lru);
        var nextNode = results[0];
        var nextParent = results[1];
        if (nextNode) {
          if (branch) {
            invalidatePathMap(child, root3, nextParent, nextNode, version2, expired, lru);
          } else if (removeNodeAndDescendants2(nextNode, nextParent, key, lru)) {
            updateNodeAncestors3(nextParent, getSize4(nextNode), lru, version2);
          }
        }
      }
    }
  }
  function invalidateReference(root3, node, expired, lru) {
    if (isExpired3(node)) {
      expireNode3(node, expired, lru);
      return [void 0, root3];
    }
    promote2(lru, node);
    var container = node;
    var reference = node.value;
    var parent = root3;
    node = node.$_context;
    if (node != null) {
      parent = node.$_parent || root3;
    } else {
      var index2 = 0;
      var count = reference.length - 1;
      parent = node = root3;
      do {
        var key = reference[index2];
        var branch = index2 < count;
        var results = invalidateNode(root3, parent, node, key, branch, expired, lru);
        node = results[0];
        if (isPrimitive3(node)) {
          return results;
        }
        parent = results[1];
      } while (index2++ < count);
      if (container.$_context !== node) {
        createHardlink3(container, node);
      }
    }
    return [node, parent];
  }
  function invalidateNode(root3, parent, node, key, branch, expired, lru) {
    var type = node.$type;
    while (type === $ref2) {
      var results = invalidateReference(root3, node, expired, lru);
      node = results[0];
      if (isPrimitive3(node)) {
        return results;
      }
      parent = results[1];
      type = node && node.$type;
    }
    if (type !== void 0) {
      return [node, parent];
    }
    if (key == null) {
      if (branch) {
        throw new Error("`null` is not allowed in branch key positions.");
      } else if (node) {
        key = node.$_key;
      }
    } else {
      parent = node;
      node = parent[key];
    }
    return [node, parent];
  }
  return invalidatePathMaps;
}
var ModelRoot = ModelRoot_1;
var ModelDataSourceAdapter = ModelDataSourceAdapter_1;
var RequestQueue = RequestQueueV2_1;
var ModelResponse = ModelResponse_1;
var CallResponse = CallResponse_1;
var InvalidateResponse = InvalidateResponse_1;
var TimeoutScheduler = TimeoutScheduler_1;
var ImmediateScheduler = ImmediateScheduler_1;
var collectLru = collect;
var pathSyntax = src$1;
var getSize3 = getSize$6;
var isObject2 = isObject$f;
var isPrimitive2 = isPrimitive$4;
var isJSONEnvelope2 = isJSONEnvelope$4;
var isJSONGraphEnvelope2 = isJSONGraphEnvelope$3;
var setCache = setPathMaps;
var setJSONGraphs2 = setJSONGraphs$3;
var jsong = src;
var ID = 0;
var validateInput2 = validateInput$3;
var noOp = function() {
};
var getCache2 = getCache$1;
var get4 = get_1;
var GET_VALID_INPUT = validInput;
var Model_1 = Model;
Model.ref = jsong.ref;
Model.atom = jsong.atom;
Model.error = jsong.error;
Model.pathValue = jsong.pathValue;
function Model(o) {
  var options = o || {};
  this._root = options._root || new ModelRoot(options);
  this._path = options.path || options._path || [];
  this._source = options.source || options._source;
  this._request = options.request || options._request || new RequestQueue(this, options.scheduler || new ImmediateScheduler());
  this._ID = ID++;
  if (typeof options.maxSize === "number") {
    this._maxSize = options.maxSize;
  } else {
    this._maxSize = options._maxSize || Model.prototype._maxSize;
  }
  if (typeof options.maxRetries === "number") {
    this._maxRetries = options.maxRetries;
  } else {
    this._maxRetries = options._maxRetries || Model.prototype._maxRetries;
  }
  if (typeof options.collectRatio === "number") {
    this._collectRatio = options.collectRatio;
  } else {
    this._collectRatio = options._collectRatio || Model.prototype._collectRatio;
  }
  if (options.boxed || options.hasOwnProperty("_boxed")) {
    this._boxed = options.boxed || options._boxed;
  }
  if (options.materialized || options.hasOwnProperty("_materialized")) {
    this._materialized = options.materialized || options._materialized;
  }
  if (typeof options.treatErrorsAsValues === "boolean") {
    this._treatErrorsAsValues = options.treatErrorsAsValues;
  } else if (options.hasOwnProperty("_treatErrorsAsValues")) {
    this._treatErrorsAsValues = options._treatErrorsAsValues;
  } else {
    this._treatErrorsAsValues = false;
  }
  if (typeof options.disablePathCollapse === "boolean") {
    this._enablePathCollapse = !options.disablePathCollapse;
  } else if (options.hasOwnProperty("_enablePathCollapse")) {
    this._enablePathCollapse = options._enablePathCollapse;
  } else {
    this._enablePathCollapse = true;
  }
  if (typeof options.disableRequestDeduplication === "boolean") {
    this._enableRequestDeduplication = !options.disableRequestDeduplication;
  } else if (options.hasOwnProperty("_enableRequestDeduplication")) {
    this._enableRequestDeduplication = options._enableRequestDeduplication;
  } else {
    this._enableRequestDeduplication = true;
  }
  this._useServerPaths = options._useServerPaths || false;
  this._allowFromWhenceYouCame = options.allowFromWhenceYouCame || options._allowFromWhenceYouCame || false;
  this._treatDataSourceErrorsAsJSONGraphErrors = options._treatDataSourceErrorsAsJSONGraphErrors || false;
  if (options.cache) {
    this.setCache(options.cache);
  }
}
Model.prototype.constructor = Model;
Model.prototype._materialized = false;
Model.prototype._boxed = false;
Model.prototype._progressive = false;
Model.prototype._treatErrorsAsValues = false;
Model.prototype._maxSize = Math.pow(2, 53) - 1;
Model.prototype._maxRetries = 3;
Model.prototype._collectRatio = 0.75;
Model.prototype._enablePathCollapse = true;
Model.prototype._enableRequestDeduplication = true;
Model.prototype.get = get$1;
Model.prototype._getOptimizedBoundPath = function _getOptimizedBoundPath() {
  return this._path ? this._path.slice() : this._path;
};
Model.prototype._getWithPaths = getWithPaths;
Model.prototype.set = set2;
Model.prototype.preload = function preload() {
  var out = validateInput2(arguments, GET_VALID_INPUT, "preload");
  if (out !== true) {
    return new ModelResponse(function(o) {
      o.onError(out);
    });
  }
  var args = Array.prototype.slice.call(arguments);
  var self2 = this;
  return new ModelResponse(function(obs) {
    return self2.get.apply(self2, args).subscribe(
      function() {
      },
      function(err) {
        obs.onError(err);
      },
      function() {
        obs.onCompleted();
      }
    );
  });
};
Model.prototype.call = function call2() {
  var args;
  var argsIdx = -1;
  var argsLen = arguments.length;
  args = new Array(argsLen);
  while (++argsIdx < argsLen) {
    var arg = arguments[argsIdx];
    args[argsIdx] = arg;
    var argType = typeof arg;
    if (argsIdx > 1 && !Array.isArray(arg) || argsIdx === 0 && !Array.isArray(arg) && argType !== "string" || argsIdx === 1 && !Array.isArray(arg) && !isPrimitive2(arg)) {
      return new ModelResponse(function(o) {
        o.onError(new Error("Invalid argument"));
      });
    }
  }
  return new CallResponse(this, args[0], args[1], args[2], args[3]);
};
Model.prototype.invalidate = function invalidate() {
  var args;
  var argsIdx = -1;
  var argsLen = arguments.length;
  args = [];
  while (++argsIdx < argsLen) {
    args[argsIdx] = pathSyntax.fromPath(arguments[argsIdx]);
    if (!Array.isArray(args[argsIdx]) || !args[argsIdx].length) {
      throw new Error("Invalid argument");
    }
  }
  new InvalidateResponse(this, args).subscribe(noOp, function(e) {
    throw e;
  });
};
Model.prototype.deref = requireDeref();
Model.prototype._hasValidParentReference = requireHasValidParentReference();
Model.prototype.getValue = requireGetValue();
Model.prototype.setValue = requireSetValue();
Model.prototype._getValueSync = requireSync$2();
Model.prototype._setValueSync = requireSync$1();
Model.prototype._derefSync = requireSync();
Model.prototype.setCache = function modelSetCache(cacheOrJSONGraphEnvelope) {
  var cache = this._root.cache;
  if (cacheOrJSONGraphEnvelope !== cache) {
    var modelRoot = this._root;
    var boundPath = this._path;
    this._path = [];
    this._root.cache = {};
    if (typeof cache !== "undefined") {
      collectLru(modelRoot, modelRoot.expired, getSize3(cache), 0);
    }
    var out;
    if (isJSONGraphEnvelope2(cacheOrJSONGraphEnvelope)) {
      out = setJSONGraphs2(this, [cacheOrJSONGraphEnvelope])[0];
    } else if (isJSONEnvelope2(cacheOrJSONGraphEnvelope)) {
      out = setCache(this, [cacheOrJSONGraphEnvelope])[0];
    } else if (isObject2(cacheOrJSONGraphEnvelope)) {
      out = setCache(this, [{ json: cacheOrJSONGraphEnvelope }])[0];
    }
    if (out) {
      get4.getWithPathsAsPathMap(this, out, []);
    }
    this._path = boundPath;
  } else if (typeof cache === "undefined") {
    this._root.cache = {};
  }
  return this;
};
Model.prototype.getCache = function _getCache() {
  var paths = Array.prototype.slice.call(arguments);
  if (paths.length === 0) {
    return getCache2(this._root.cache);
  }
  var result3 = [{}];
  var path = this._path;
  get4.getWithPathsAsJSONGraph(this, paths, result3);
  this._path = path;
  return result3[0].jsonGraph;
};
Model.prototype._setMaxSize = function setMaxSize(maxSize) {
  var oldMaxSize = this._maxSize;
  this._maxSize = maxSize;
  if (maxSize < oldMaxSize) {
    var modelRoot = this._root;
    var modelCache = modelRoot.cache;
    var currentVersion = modelCache.$_version;
    collectLru(
      modelRoot,
      modelRoot.expired,
      getSize3(modelCache),
      this._maxSize,
      this._collectRatio,
      currentVersion
    );
  }
};
Model.prototype.getVersion = function getVersion2(pathArg) {
  var path = pathArg && pathSyntax.fromPath(pathArg) || [];
  if (Array.isArray(path) === false) {
    throw new Error("Model#getVersion must be called with an Array path.");
  }
  if (this._path.length) {
    path = this._path.concat(path);
  }
  return this._getVersion(this, path);
};
Model.prototype._syncCheck = function syncCheck(name) {
  if (Boolean(this._source) && this._root.syncRefCount <= 0 && this._root.unsafeMode === false) {
    throw new Error("Model#" + name + " may only be called within the context of a request selector.");
  }
  return true;
};
Model.prototype._clone = function cloneModel(opts) {
  var clone3 = new this.constructor(this);
  for (var key in opts) {
    var value = opts[key];
    if (value === "delete") {
      delete clone3[key];
    } else {
      clone3[key] = value;
    }
  }
  clone3.setCache = void 0;
  return clone3;
};
Model.prototype.batch = function batch(schedulerOrDelay) {
  var scheduler;
  if (typeof schedulerOrDelay === "number") {
    scheduler = new TimeoutScheduler(Math.round(Math.abs(schedulerOrDelay)));
  } else if (!schedulerOrDelay || !schedulerOrDelay.schedule) {
    scheduler = new TimeoutScheduler(1);
  } else {
    scheduler = schedulerOrDelay;
  }
  var clone3 = this._clone();
  clone3._request = new RequestQueue(clone3, scheduler);
  return clone3;
};
Model.prototype.unbatch = function unbatch() {
  var clone3 = this._clone();
  clone3._request = new RequestQueue(clone3, new ImmediateScheduler());
  return clone3;
};
Model.prototype.treatErrorsAsValues = function treatErrorsAsValues() {
  return this._clone({
    _treatErrorsAsValues: true
  });
};
Model.prototype.asDataSource = function asDataSource() {
  return new ModelDataSourceAdapter(this);
};
Model.prototype._materialize = function materialize3() {
  return this._clone({
    _materialized: true
  });
};
Model.prototype._dematerialize = function dematerialize() {
  return this._clone({
    _materialized: "delete"
  });
};
Model.prototype.boxValues = function boxValues() {
  return this._clone({
    _boxed: true
  });
};
Model.prototype.unboxValues = function unboxValues() {
  return this._clone({
    _boxed: "delete"
  });
};
Model.prototype.withoutDataSource = function withoutDataSource() {
  return this._clone({
    _source: "delete"
  });
};
Model.prototype.toJSON = function toJSON() {
  return {
    $type: "ref",
    value: this._path
  };
};
Model.prototype.getPath = function getPath() {
  return this._path ? this._path.slice() : this._path;
};
Model.prototype._fromWhenceYouCame = function fromWhenceYouCame(allow) {
  return this._clone({
    _allowFromWhenceYouCame: allow === void 0 ? true : allow
  });
};
Model.prototype._getBoundValue = requireGetBoundValue();
Model.prototype._getVersion = requireGetVersion();
Model.prototype._getPathValuesAsPathMap = get4.getWithPathsAsPathMap;
Model.prototype._getPathValuesAsJSONG = get4.getWithPathsAsJSONGraph;
Model.prototype._setPathValues = requireSetPathValues();
Model.prototype._setPathMaps = setPathMaps;
Model.prototype._setJSONGs = setJSONGraphs$3;
Model.prototype._setCache = setPathMaps;
Model.prototype._invalidatePathValues = requireInvalidatePathSets();
Model.prototype._invalidatePathMaps = requireInvalidatePathMaps();
function falcor(opts) {
  return new falcor.Model(opts);
}
falcor.keys = function getJSONKeys(json) {
  if (!json) {
    return void 0;
  }
  return Object.keys(json).filter(function(key) {
    return key !== "$__path";
  });
};
var lib = falcor;
falcor.Model = Model_1;
var index = /* @__PURE__ */ getDefaultExportFromCjs(lib);

// app/build/deps/falcor-observable.js
function getAugmentedNamespace2(n) {
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
var require$$0 = /* @__PURE__ */ getAugmentedNamespace2(es2);
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
  const { error: error3 } = observer;
  if (typeof error3 === "function") {
    error3.call(observer, errorValue);
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
      const result3 = factory();
      const obs = this.from(result3);
      return new Subscription$1(obs._subscriber, observer);
    });
  }
};
EsObservable = class EsObservable2 extends BaseObservable$1 {
  subscribe(observerOrOnNext, onError4, onComplete) {
    const observer = typeof observerOrOnNext === "object" && observerOrOnNext !== null ? observerOrOnNext : {
      next: observerOrOnNext,
      error: onError4,
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
    const { onNext: onNext2 } = observer;
    if (typeof onNext2 === "function") {
      onNext2.call(observer, value);
    }
  }
  error(errorValue) {
    const observer = this._observer;
    const { onError: onError4 } = observer;
    if (typeof onError4 === "function") {
      onError4.call(observer, errorValue);
    }
  }
  complete() {
    const observer = this._observer;
    const { onCompleted: onCompleted2 } = observer;
    if (typeof onCompleted2 === "function") {
      onCompleted2.call(observer);
    }
  }
};
var ClassicObservable = class _ClassicObservable extends BaseObservable2 {
  subscribe(observerOrOnNext, onError4, onCompleted2) {
    const observer = typeof observerOrOnNext === "object" && observerOrOnNext !== null ? new EsFromClassicObserver(observerOrOnNext) : {
      next: observerOrOnNext,
      error: onError4,
      complete: onCompleted2
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

export {
  extractFromCache,
  getJsonPath,
  setPathValue,
  index,
  Observable
};
