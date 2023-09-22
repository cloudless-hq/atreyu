var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// app/build/deps/pouchdb.js
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getAugmentedNamespace(n2) {
  if (n2.__esModule)
    return n2;
  var f = n2.default;
  if (typeof f == "function") {
    var a3 = function a4() {
      if (this instanceof a4) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a3.prototype = f.prototype;
  } else
    a3 = {};
  Object.defineProperty(a3, "__esModule", { value: true });
  Object.keys(n2).forEach(function(k) {
    var d2 = Object.getOwnPropertyDescriptor(n2, k);
    Object.defineProperty(a3, k, d2.get ? d2 : {
      enumerable: true,
      get: function() {
        return n2[k];
      }
    });
  });
  return a3;
}
var _nodeResolve_empty = {};
var _nodeResolve_empty$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: _nodeResolve_empty
});
var require$$0 = /* @__PURE__ */ getAugmentedNamespace(_nodeResolve_empty$1);
var queueMicrotask = {};
queueMicrotask.test = function() {
  return typeof commonjsGlobal.queueMicrotask === "function";
};
queueMicrotask.install = function(func) {
  return function() {
    commonjsGlobal.queueMicrotask(func);
  };
};
var mutation = {};
var Mutation = commonjsGlobal.MutationObserver || commonjsGlobal.WebKitMutationObserver;
mutation.test = function() {
  return Mutation;
};
mutation.install = function(handle) {
  var called = 0;
  var observer = new Mutation(handle);
  var element = commonjsGlobal.document.createTextNode("");
  observer.observe(element, {
    characterData: true
  });
  return function() {
    element.data = called = ++called % 2;
  };
};
var messageChannel = {};
messageChannel.test = function() {
  if (commonjsGlobal.setImmediate) {
    return false;
  }
  return typeof commonjsGlobal.MessageChannel !== "undefined";
};
messageChannel.install = function(func) {
  var channel = new commonjsGlobal.MessageChannel();
  channel.port1.onmessage = func;
  return function() {
    channel.port2.postMessage(0);
  };
};
var stateChange = {};
stateChange.test = function() {
  return "document" in commonjsGlobal && "onreadystatechange" in commonjsGlobal.document.createElement("script");
};
stateChange.install = function(handle) {
  return function() {
    var scriptEl = commonjsGlobal.document.createElement("script");
    scriptEl.onreadystatechange = function() {
      handle();
      scriptEl.onreadystatechange = null;
      scriptEl.parentNode.removeChild(scriptEl);
      scriptEl = null;
    };
    commonjsGlobal.document.documentElement.appendChild(scriptEl);
    return handle;
  };
};
var timeout = {};
timeout.test = function() {
  return true;
};
timeout.install = function(t2) {
  return function() {
    setTimeout(t2, 0);
  };
};
var types = [
  require$$0,
  queueMicrotask,
  mutation,
  messageChannel,
  stateChange,
  timeout
];
var draining;
var currentQueue;
var queueIndex = -1;
var queue = [];
var scheduled = false;
function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }
  draining = false;
  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }
  if (queue.length) {
    nextTick();
  }
}
function nextTick() {
  if (draining) {
    return;
  }
  scheduled = false;
  draining = true;
  var len2 = queue.length;
  var timeout2 = setTimeout(cleanUpNextTick);
  while (len2) {
    currentQueue = queue;
    queue = [];
    while (currentQueue && ++queueIndex < len2) {
      currentQueue[queueIndex].run();
    }
    queueIndex = -1;
    len2 = queue.length;
  }
  currentQueue = null;
  queueIndex = -1;
  draining = false;
  clearTimeout(timeout2);
}
var scheduleDrain;
var i = -1;
var len = types.length;
while (++i < len) {
  if (types[i] && types[i].test && types[i].test()) {
    scheduleDrain = types[i].install(nextTick);
    break;
  }
}
function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}
Item.prototype.run = function() {
  var fun = this.fun;
  var array = this.array;
  switch (array.length) {
    case 0:
      return fun();
    case 1:
      return fun(array[0]);
    case 2:
      return fun(array[0], array[1]);
    case 3:
      return fun(array[0], array[1], array[2]);
    default:
      return fun.apply(null, array);
  }
};
var lib = immediate;
function immediate(task) {
  var args = new Array(arguments.length - 1);
  if (arguments.length > 1) {
    for (var i3 = 1; i3 < arguments.length; i3++) {
      args[i3 - 1] = arguments[i3];
    }
  }
  queue.push(new Item(task, args));
  if (!scheduled && !draining) {
    scheduled = true;
    scheduleDrain();
  }
}
var immediate$1 = /* @__PURE__ */ getDefaultExportFromCjs(lib);
var sparkMd5 = { exports: {} };
(function(module2, exports) {
  (function(factory) {
    {
      module2.exports = factory();
    }
  })(function(undefined$1) {
    var hex_chr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    function md5cycle(x, k) {
      var a3 = x[0], b = x[1], c = x[2], d2 = x[3];
      a3 += (b & c | ~b & d2) + k[0] - 680876936 | 0;
      a3 = (a3 << 7 | a3 >>> 25) + b | 0;
      d2 += (a3 & b | ~a3 & c) + k[1] - 389564586 | 0;
      d2 = (d2 << 12 | d2 >>> 20) + a3 | 0;
      c += (d2 & a3 | ~d2 & b) + k[2] + 606105819 | 0;
      c = (c << 17 | c >>> 15) + d2 | 0;
      b += (c & d2 | ~c & a3) + k[3] - 1044525330 | 0;
      b = (b << 22 | b >>> 10) + c | 0;
      a3 += (b & c | ~b & d2) + k[4] - 176418897 | 0;
      a3 = (a3 << 7 | a3 >>> 25) + b | 0;
      d2 += (a3 & b | ~a3 & c) + k[5] + 1200080426 | 0;
      d2 = (d2 << 12 | d2 >>> 20) + a3 | 0;
      c += (d2 & a3 | ~d2 & b) + k[6] - 1473231341 | 0;
      c = (c << 17 | c >>> 15) + d2 | 0;
      b += (c & d2 | ~c & a3) + k[7] - 45705983 | 0;
      b = (b << 22 | b >>> 10) + c | 0;
      a3 += (b & c | ~b & d2) + k[8] + 1770035416 | 0;
      a3 = (a3 << 7 | a3 >>> 25) + b | 0;
      d2 += (a3 & b | ~a3 & c) + k[9] - 1958414417 | 0;
      d2 = (d2 << 12 | d2 >>> 20) + a3 | 0;
      c += (d2 & a3 | ~d2 & b) + k[10] - 42063 | 0;
      c = (c << 17 | c >>> 15) + d2 | 0;
      b += (c & d2 | ~c & a3) + k[11] - 1990404162 | 0;
      b = (b << 22 | b >>> 10) + c | 0;
      a3 += (b & c | ~b & d2) + k[12] + 1804603682 | 0;
      a3 = (a3 << 7 | a3 >>> 25) + b | 0;
      d2 += (a3 & b | ~a3 & c) + k[13] - 40341101 | 0;
      d2 = (d2 << 12 | d2 >>> 20) + a3 | 0;
      c += (d2 & a3 | ~d2 & b) + k[14] - 1502002290 | 0;
      c = (c << 17 | c >>> 15) + d2 | 0;
      b += (c & d2 | ~c & a3) + k[15] + 1236535329 | 0;
      b = (b << 22 | b >>> 10) + c | 0;
      a3 += (b & d2 | c & ~d2) + k[1] - 165796510 | 0;
      a3 = (a3 << 5 | a3 >>> 27) + b | 0;
      d2 += (a3 & c | b & ~c) + k[6] - 1069501632 | 0;
      d2 = (d2 << 9 | d2 >>> 23) + a3 | 0;
      c += (d2 & b | a3 & ~b) + k[11] + 643717713 | 0;
      c = (c << 14 | c >>> 18) + d2 | 0;
      b += (c & a3 | d2 & ~a3) + k[0] - 373897302 | 0;
      b = (b << 20 | b >>> 12) + c | 0;
      a3 += (b & d2 | c & ~d2) + k[5] - 701558691 | 0;
      a3 = (a3 << 5 | a3 >>> 27) + b | 0;
      d2 += (a3 & c | b & ~c) + k[10] + 38016083 | 0;
      d2 = (d2 << 9 | d2 >>> 23) + a3 | 0;
      c += (d2 & b | a3 & ~b) + k[15] - 660478335 | 0;
      c = (c << 14 | c >>> 18) + d2 | 0;
      b += (c & a3 | d2 & ~a3) + k[4] - 405537848 | 0;
      b = (b << 20 | b >>> 12) + c | 0;
      a3 += (b & d2 | c & ~d2) + k[9] + 568446438 | 0;
      a3 = (a3 << 5 | a3 >>> 27) + b | 0;
      d2 += (a3 & c | b & ~c) + k[14] - 1019803690 | 0;
      d2 = (d2 << 9 | d2 >>> 23) + a3 | 0;
      c += (d2 & b | a3 & ~b) + k[3] - 187363961 | 0;
      c = (c << 14 | c >>> 18) + d2 | 0;
      b += (c & a3 | d2 & ~a3) + k[8] + 1163531501 | 0;
      b = (b << 20 | b >>> 12) + c | 0;
      a3 += (b & d2 | c & ~d2) + k[13] - 1444681467 | 0;
      a3 = (a3 << 5 | a3 >>> 27) + b | 0;
      d2 += (a3 & c | b & ~c) + k[2] - 51403784 | 0;
      d2 = (d2 << 9 | d2 >>> 23) + a3 | 0;
      c += (d2 & b | a3 & ~b) + k[7] + 1735328473 | 0;
      c = (c << 14 | c >>> 18) + d2 | 0;
      b += (c & a3 | d2 & ~a3) + k[12] - 1926607734 | 0;
      b = (b << 20 | b >>> 12) + c | 0;
      a3 += (b ^ c ^ d2) + k[5] - 378558 | 0;
      a3 = (a3 << 4 | a3 >>> 28) + b | 0;
      d2 += (a3 ^ b ^ c) + k[8] - 2022574463 | 0;
      d2 = (d2 << 11 | d2 >>> 21) + a3 | 0;
      c += (d2 ^ a3 ^ b) + k[11] + 1839030562 | 0;
      c = (c << 16 | c >>> 16) + d2 | 0;
      b += (c ^ d2 ^ a3) + k[14] - 35309556 | 0;
      b = (b << 23 | b >>> 9) + c | 0;
      a3 += (b ^ c ^ d2) + k[1] - 1530992060 | 0;
      a3 = (a3 << 4 | a3 >>> 28) + b | 0;
      d2 += (a3 ^ b ^ c) + k[4] + 1272893353 | 0;
      d2 = (d2 << 11 | d2 >>> 21) + a3 | 0;
      c += (d2 ^ a3 ^ b) + k[7] - 155497632 | 0;
      c = (c << 16 | c >>> 16) + d2 | 0;
      b += (c ^ d2 ^ a3) + k[10] - 1094730640 | 0;
      b = (b << 23 | b >>> 9) + c | 0;
      a3 += (b ^ c ^ d2) + k[13] + 681279174 | 0;
      a3 = (a3 << 4 | a3 >>> 28) + b | 0;
      d2 += (a3 ^ b ^ c) + k[0] - 358537222 | 0;
      d2 = (d2 << 11 | d2 >>> 21) + a3 | 0;
      c += (d2 ^ a3 ^ b) + k[3] - 722521979 | 0;
      c = (c << 16 | c >>> 16) + d2 | 0;
      b += (c ^ d2 ^ a3) + k[6] + 76029189 | 0;
      b = (b << 23 | b >>> 9) + c | 0;
      a3 += (b ^ c ^ d2) + k[9] - 640364487 | 0;
      a3 = (a3 << 4 | a3 >>> 28) + b | 0;
      d2 += (a3 ^ b ^ c) + k[12] - 421815835 | 0;
      d2 = (d2 << 11 | d2 >>> 21) + a3 | 0;
      c += (d2 ^ a3 ^ b) + k[15] + 530742520 | 0;
      c = (c << 16 | c >>> 16) + d2 | 0;
      b += (c ^ d2 ^ a3) + k[2] - 995338651 | 0;
      b = (b << 23 | b >>> 9) + c | 0;
      a3 += (c ^ (b | ~d2)) + k[0] - 198630844 | 0;
      a3 = (a3 << 6 | a3 >>> 26) + b | 0;
      d2 += (b ^ (a3 | ~c)) + k[7] + 1126891415 | 0;
      d2 = (d2 << 10 | d2 >>> 22) + a3 | 0;
      c += (a3 ^ (d2 | ~b)) + k[14] - 1416354905 | 0;
      c = (c << 15 | c >>> 17) + d2 | 0;
      b += (d2 ^ (c | ~a3)) + k[5] - 57434055 | 0;
      b = (b << 21 | b >>> 11) + c | 0;
      a3 += (c ^ (b | ~d2)) + k[12] + 1700485571 | 0;
      a3 = (a3 << 6 | a3 >>> 26) + b | 0;
      d2 += (b ^ (a3 | ~c)) + k[3] - 1894986606 | 0;
      d2 = (d2 << 10 | d2 >>> 22) + a3 | 0;
      c += (a3 ^ (d2 | ~b)) + k[10] - 1051523 | 0;
      c = (c << 15 | c >>> 17) + d2 | 0;
      b += (d2 ^ (c | ~a3)) + k[1] - 2054922799 | 0;
      b = (b << 21 | b >>> 11) + c | 0;
      a3 += (c ^ (b | ~d2)) + k[8] + 1873313359 | 0;
      a3 = (a3 << 6 | a3 >>> 26) + b | 0;
      d2 += (b ^ (a3 | ~c)) + k[15] - 30611744 | 0;
      d2 = (d2 << 10 | d2 >>> 22) + a3 | 0;
      c += (a3 ^ (d2 | ~b)) + k[6] - 1560198380 | 0;
      c = (c << 15 | c >>> 17) + d2 | 0;
      b += (d2 ^ (c | ~a3)) + k[13] + 1309151649 | 0;
      b = (b << 21 | b >>> 11) + c | 0;
      a3 += (c ^ (b | ~d2)) + k[4] - 145523070 | 0;
      a3 = (a3 << 6 | a3 >>> 26) + b | 0;
      d2 += (b ^ (a3 | ~c)) + k[11] - 1120210379 | 0;
      d2 = (d2 << 10 | d2 >>> 22) + a3 | 0;
      c += (a3 ^ (d2 | ~b)) + k[2] + 718787259 | 0;
      c = (c << 15 | c >>> 17) + d2 | 0;
      b += (d2 ^ (c | ~a3)) + k[9] - 343485551 | 0;
      b = (b << 21 | b >>> 11) + c | 0;
      x[0] = a3 + x[0] | 0;
      x[1] = b + x[1] | 0;
      x[2] = c + x[2] | 0;
      x[3] = d2 + x[3] | 0;
    }
    function md5blk(s2) {
      var md5blks = [], i3;
      for (i3 = 0; i3 < 64; i3 += 4) {
        md5blks[i3 >> 2] = s2.charCodeAt(i3) + (s2.charCodeAt(i3 + 1) << 8) + (s2.charCodeAt(i3 + 2) << 16) + (s2.charCodeAt(i3 + 3) << 24);
      }
      return md5blks;
    }
    function md5blk_array(a3) {
      var md5blks = [], i3;
      for (i3 = 0; i3 < 64; i3 += 4) {
        md5blks[i3 >> 2] = a3[i3] + (a3[i3 + 1] << 8) + (a3[i3 + 2] << 16) + (a3[i3 + 3] << 24);
      }
      return md5blks;
    }
    function md51(s2) {
      var n2 = s2.length, state = [1732584193, -271733879, -1732584194, 271733878], i3, length, tail, tmp, lo, hi;
      for (i3 = 64; i3 <= n2; i3 += 64) {
        md5cycle(state, md5blk(s2.substring(i3 - 64, i3)));
      }
      s2 = s2.substring(i3 - 64);
      length = s2.length;
      tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (i3 = 0; i3 < length; i3 += 1) {
        tail[i3 >> 2] |= s2.charCodeAt(i3) << (i3 % 4 << 3);
      }
      tail[i3 >> 2] |= 128 << (i3 % 4 << 3);
      if (i3 > 55) {
        md5cycle(state, tail);
        for (i3 = 0; i3 < 16; i3 += 1) {
          tail[i3] = 0;
        }
      }
      tmp = n2 * 8;
      tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
      lo = parseInt(tmp[2], 16);
      hi = parseInt(tmp[1], 16) || 0;
      tail[14] = lo;
      tail[15] = hi;
      md5cycle(state, tail);
      return state;
    }
    function md51_array(a3) {
      var n2 = a3.length, state = [1732584193, -271733879, -1732584194, 271733878], i3, length, tail, tmp, lo, hi;
      for (i3 = 64; i3 <= n2; i3 += 64) {
        md5cycle(state, md5blk_array(a3.subarray(i3 - 64, i3)));
      }
      a3 = i3 - 64 < n2 ? a3.subarray(i3 - 64) : new Uint8Array(0);
      length = a3.length;
      tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (i3 = 0; i3 < length; i3 += 1) {
        tail[i3 >> 2] |= a3[i3] << (i3 % 4 << 3);
      }
      tail[i3 >> 2] |= 128 << (i3 % 4 << 3);
      if (i3 > 55) {
        md5cycle(state, tail);
        for (i3 = 0; i3 < 16; i3 += 1) {
          tail[i3] = 0;
        }
      }
      tmp = n2 * 8;
      tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
      lo = parseInt(tmp[2], 16);
      hi = parseInt(tmp[1], 16) || 0;
      tail[14] = lo;
      tail[15] = hi;
      md5cycle(state, tail);
      return state;
    }
    function rhex(n2) {
      var s2 = "", j;
      for (j = 0; j < 4; j += 1) {
        s2 += hex_chr[n2 >> j * 8 + 4 & 15] + hex_chr[n2 >> j * 8 & 15];
      }
      return s2;
    }
    function hex(x) {
      var i3;
      for (i3 = 0; i3 < x.length; i3 += 1) {
        x[i3] = rhex(x[i3]);
      }
      return x.join("");
    }
    if (hex(md51("hello")) !== "5d41402abc4b2a76b9719d911017c592")
      ;
    if (typeof ArrayBuffer !== "undefined" && !ArrayBuffer.prototype.slice) {
      (function() {
        function clamp(val, length) {
          val = val | 0 || 0;
          if (val < 0) {
            return Math.max(val + length, 0);
          }
          return Math.min(val, length);
        }
        ArrayBuffer.prototype.slice = function(from2, to) {
          var length = this.byteLength, begin = clamp(from2, length), end = length, num, target, targetArray, sourceArray;
          if (to !== undefined$1) {
            end = clamp(to, length);
          }
          if (begin > end) {
            return new ArrayBuffer(0);
          }
          num = end - begin;
          target = new ArrayBuffer(num);
          targetArray = new Uint8Array(target);
          sourceArray = new Uint8Array(this, begin, num);
          targetArray.set(sourceArray);
          return target;
        };
      })();
    }
    function toUtf8(str) {
      if (/[\u0080-\uFFFF]/.test(str)) {
        str = unescape(encodeURIComponent(str));
      }
      return str;
    }
    function utf8Str2ArrayBuffer(str, returnUInt8Array) {
      var length = str.length, buff = new ArrayBuffer(length), arr = new Uint8Array(buff), i3;
      for (i3 = 0; i3 < length; i3 += 1) {
        arr[i3] = str.charCodeAt(i3);
      }
      return returnUInt8Array ? arr : buff;
    }
    function arrayBuffer2Utf8Str(buff) {
      return String.fromCharCode.apply(null, new Uint8Array(buff));
    }
    function concatenateArrayBuffers(first, second, returnUInt8Array) {
      var result4 = new Uint8Array(first.byteLength + second.byteLength);
      result4.set(new Uint8Array(first));
      result4.set(new Uint8Array(second), first.byteLength);
      return returnUInt8Array ? result4 : result4.buffer;
    }
    function hexToBinaryString(hex2) {
      var bytes = [], length = hex2.length, x;
      for (x = 0; x < length - 1; x += 2) {
        bytes.push(parseInt(hex2.substr(x, 2), 16));
      }
      return String.fromCharCode.apply(String, bytes);
    }
    function SparkMD5() {
      this.reset();
    }
    SparkMD5.prototype.append = function(str) {
      this.appendBinary(toUtf8(str));
      return this;
    };
    SparkMD5.prototype.appendBinary = function(contents) {
      this._buff += contents;
      this._length += contents.length;
      var length = this._buff.length, i3;
      for (i3 = 64; i3 <= length; i3 += 64) {
        md5cycle(this._hash, md5blk(this._buff.substring(i3 - 64, i3)));
      }
      this._buff = this._buff.substring(i3 - 64);
      return this;
    };
    SparkMD5.prototype.end = function(raw) {
      var buff = this._buff, length = buff.length, i3, tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ret;
      for (i3 = 0; i3 < length; i3 += 1) {
        tail[i3 >> 2] |= buff.charCodeAt(i3) << (i3 % 4 << 3);
      }
      this._finish(tail, length);
      ret = hex(this._hash);
      if (raw) {
        ret = hexToBinaryString(ret);
      }
      this.reset();
      return ret;
    };
    SparkMD5.prototype.reset = function() {
      this._buff = "";
      this._length = 0;
      this._hash = [1732584193, -271733879, -1732584194, 271733878];
      return this;
    };
    SparkMD5.prototype.getState = function() {
      return {
        buff: this._buff,
        length: this._length,
        hash: this._hash.slice()
      };
    };
    SparkMD5.prototype.setState = function(state) {
      this._buff = state.buff;
      this._length = state.length;
      this._hash = state.hash;
      return this;
    };
    SparkMD5.prototype.destroy = function() {
      delete this._hash;
      delete this._buff;
      delete this._length;
    };
    SparkMD5.prototype._finish = function(tail, length) {
      var i3 = length, tmp, lo, hi;
      tail[i3 >> 2] |= 128 << (i3 % 4 << 3);
      if (i3 > 55) {
        md5cycle(this._hash, tail);
        for (i3 = 0; i3 < 16; i3 += 1) {
          tail[i3] = 0;
        }
      }
      tmp = this._length * 8;
      tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
      lo = parseInt(tmp[2], 16);
      hi = parseInt(tmp[1], 16) || 0;
      tail[14] = lo;
      tail[15] = hi;
      md5cycle(this._hash, tail);
    };
    SparkMD5.hash = function(str, raw) {
      return SparkMD5.hashBinary(toUtf8(str), raw);
    };
    SparkMD5.hashBinary = function(content, raw) {
      var hash = md51(content), ret = hex(hash);
      return raw ? hexToBinaryString(ret) : ret;
    };
    SparkMD5.ArrayBuffer = function() {
      this.reset();
    };
    SparkMD5.ArrayBuffer.prototype.append = function(arr) {
      var buff = concatenateArrayBuffers(this._buff.buffer, arr, true), length = buff.length, i3;
      this._length += arr.byteLength;
      for (i3 = 64; i3 <= length; i3 += 64) {
        md5cycle(this._hash, md5blk_array(buff.subarray(i3 - 64, i3)));
      }
      this._buff = i3 - 64 < length ? new Uint8Array(buff.buffer.slice(i3 - 64)) : new Uint8Array(0);
      return this;
    };
    SparkMD5.ArrayBuffer.prototype.end = function(raw) {
      var buff = this._buff, length = buff.length, tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], i3, ret;
      for (i3 = 0; i3 < length; i3 += 1) {
        tail[i3 >> 2] |= buff[i3] << (i3 % 4 << 3);
      }
      this._finish(tail, length);
      ret = hex(this._hash);
      if (raw) {
        ret = hexToBinaryString(ret);
      }
      this.reset();
      return ret;
    };
    SparkMD5.ArrayBuffer.prototype.reset = function() {
      this._buff = new Uint8Array(0);
      this._length = 0;
      this._hash = [1732584193, -271733879, -1732584194, 271733878];
      return this;
    };
    SparkMD5.ArrayBuffer.prototype.getState = function() {
      var state = SparkMD5.prototype.getState.call(this);
      state.buff = arrayBuffer2Utf8Str(state.buff);
      return state;
    };
    SparkMD5.ArrayBuffer.prototype.setState = function(state) {
      state.buff = utf8Str2ArrayBuffer(state.buff, true);
      return SparkMD5.prototype.setState.call(this, state);
    };
    SparkMD5.ArrayBuffer.prototype.destroy = SparkMD5.prototype.destroy;
    SparkMD5.ArrayBuffer.prototype._finish = SparkMD5.prototype._finish;
    SparkMD5.ArrayBuffer.hash = function(arr, raw) {
      var hash = md51_array(new Uint8Array(arr)), ret = hex(hash);
      return raw ? hexToBinaryString(ret) : ret;
    };
    return SparkMD5;
  });
})(sparkMd5);
var sparkMd5Exports = sparkMd5.exports;
var Md5 = /* @__PURE__ */ getDefaultExportFromCjs(sparkMd5Exports);
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}
var byteToHex = [];
for (let i3 = 0; i3 < 256; ++i3) {
  byteToHex.push((i3 + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native = {
  randomUUID
};
function v4(options, buf, offset) {
  if (native.randomUUID && !buf && !options) {
    return native.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i3 = 0; i3 < 16; ++i3) {
      buf[offset + i3] = rnds[i3];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var events = { exports: {} };
var R = typeof Reflect === "object" ? Reflect : null;
var ReflectApply = R && typeof R.apply === "function" ? R.apply : function ReflectApply2(target, receiver, args) {
  return Function.prototype.apply.call(target, receiver, args);
};
var ReflectOwnKeys;
if (R && typeof R.ownKeys === "function") {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys2(target) {
    return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys2(target) {
    return Object.getOwnPropertyNames(target);
  };
}
function ProcessEmitWarning(warning) {
  if (console && console.warn)
    console.warn(warning);
}
var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
  return value !== value;
};
function EventEmitter() {
  EventEmitter.init.call(this);
}
events.exports = EventEmitter;
events.exports.once = once$1;
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.prototype._events = void 0;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = void 0;
var defaultMaxListeners = 10;
function checkListener(listener) {
  if (typeof listener !== "function") {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}
Object.defineProperty(EventEmitter, "defaultMaxListeners", {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
    }
    defaultMaxListeners = arg;
  }
});
EventEmitter.init = function() {
  if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
    this._events = /* @__PURE__ */ Object.create(null);
    this._eventsCount = 0;
  }
  this._maxListeners = this._maxListeners || void 0;
};
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n2) {
  if (typeof n2 !== "number" || n2 < 0 || NumberIsNaN(n2)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n2 + ".");
  }
  this._maxListeners = n2;
  return this;
};
function _getMaxListeners(that) {
  if (that._maxListeners === void 0)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}
EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};
EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i3 = 1; i3 < arguments.length; i3++)
    args.push(arguments[i3]);
  var doError = type === "error";
  var events2 = this._events;
  if (events2 !== void 0)
    doError = doError && events2.error === void 0;
  else if (!doError)
    return false;
  if (doError) {
    var er2;
    if (args.length > 0)
      er2 = args[0];
    if (er2 instanceof Error) {
      throw er2;
    }
    var err = new Error("Unhandled error." + (er2 ? " (" + er2.message + ")" : ""));
    err.context = er2;
    throw err;
  }
  var handler = events2[type];
  if (handler === void 0)
    return false;
  if (typeof handler === "function") {
    ReflectApply(handler, this, args);
  } else {
    var len2 = handler.length;
    var listeners2 = arrayClone(handler, len2);
    for (var i3 = 0; i3 < len2; ++i3)
      ReflectApply(listeners2[i3], this, args);
  }
  return true;
};
function _addListener(target, type, listener, prepend) {
  var m;
  var events2;
  var existing;
  checkListener(listener);
  events2 = target._events;
  if (events2 === void 0) {
    events2 = target._events = /* @__PURE__ */ Object.create(null);
    target._eventsCount = 0;
  } else {
    if (events2.newListener !== void 0) {
      target.emit(
        "newListener",
        type,
        listener.listener ? listener.listener : listener
      );
      events2 = target._events;
    }
    existing = events2[type];
  }
  if (existing === void 0) {
    existing = events2[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === "function") {
      existing = events2[type] = prepend ? [listener, existing] : [existing, listener];
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      var w2 = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
      w2.name = "MaxListenersExceededWarning";
      w2.emitter = target;
      w2.type = type;
      w2.count = existing.length;
      ProcessEmitWarning(w2);
    }
  }
  return target;
}
EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};
EventEmitter.prototype.on = EventEmitter.prototype.addListener;
EventEmitter.prototype.prependListener = function prependListener(type, listener) {
  return _addListener(this, type, listener, true);
};
function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}
function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: void 0, target, type, listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}
EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};
EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
  checkListener(listener);
  this.prependListener(type, _onceWrap(this, type, listener));
  return this;
};
EventEmitter.prototype.removeListener = function removeListener(type, listener) {
  var list, events2, position, i3, originalListener;
  checkListener(listener);
  events2 = this._events;
  if (events2 === void 0)
    return this;
  list = events2[type];
  if (list === void 0)
    return this;
  if (list === listener || list.listener === listener) {
    if (--this._eventsCount === 0)
      this._events = /* @__PURE__ */ Object.create(null);
    else {
      delete events2[type];
      if (events2.removeListener)
        this.emit("removeListener", type, list.listener || listener);
    }
  } else if (typeof list !== "function") {
    position = -1;
    for (i3 = list.length - 1; i3 >= 0; i3--) {
      if (list[i3] === listener || list[i3].listener === listener) {
        originalListener = list[i3].listener;
        position = i3;
        break;
      }
    }
    if (position < 0)
      return this;
    if (position === 0)
      list.shift();
    else {
      spliceOne(list, position);
    }
    if (list.length === 1)
      events2[type] = list[0];
    if (events2.removeListener !== void 0)
      this.emit("removeListener", type, originalListener || listener);
  }
  return this;
};
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
  var listeners2, events2, i3;
  events2 = this._events;
  if (events2 === void 0)
    return this;
  if (events2.removeListener === void 0) {
    if (arguments.length === 0) {
      this._events = /* @__PURE__ */ Object.create(null);
      this._eventsCount = 0;
    } else if (events2[type] !== void 0) {
      if (--this._eventsCount === 0)
        this._events = /* @__PURE__ */ Object.create(null);
      else
        delete events2[type];
    }
    return this;
  }
  if (arguments.length === 0) {
    var keys2 = Object.keys(events2);
    var key;
    for (i3 = 0; i3 < keys2.length; ++i3) {
      key = keys2[i3];
      if (key === "removeListener")
        continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners("removeListener");
    this._events = /* @__PURE__ */ Object.create(null);
    this._eventsCount = 0;
    return this;
  }
  listeners2 = events2[type];
  if (typeof listeners2 === "function") {
    this.removeListener(type, listeners2);
  } else if (listeners2 !== void 0) {
    for (i3 = listeners2.length - 1; i3 >= 0; i3--) {
      this.removeListener(type, listeners2[i3]);
    }
  }
  return this;
};
function _listeners(target, type, unwrap) {
  var events2 = target._events;
  if (events2 === void 0)
    return [];
  var evlistener = events2[type];
  if (evlistener === void 0)
    return [];
  if (typeof evlistener === "function")
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];
  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}
EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};
EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};
EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === "function") {
    return emitter.listenerCount(type);
  } else {
    return listenerCount$1.call(emitter, type);
  }
};
EventEmitter.prototype.listenerCount = listenerCount$1;
function listenerCount$1(type) {
  var events2 = this._events;
  if (events2 !== void 0) {
    var evlistener = events2[type];
    if (typeof evlistener === "function") {
      return 1;
    } else if (evlistener !== void 0) {
      return evlistener.length;
    }
  }
  return 0;
}
EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};
function arrayClone(arr, n2) {
  var copy = new Array(n2);
  for (var i3 = 0; i3 < n2; ++i3)
    copy[i3] = arr[i3];
  return copy;
}
function spliceOne(list, index2) {
  for (; index2 + 1 < list.length; index2++)
    list[index2] = list[index2 + 1];
  list.pop();
}
function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i3 = 0; i3 < ret.length; ++i3) {
    ret[i3] = arr[i3].listener || arr[i3];
  }
  return ret;
}
function once$1(emitter, name) {
  return new Promise(function(resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }
    function resolver() {
      if (typeof emitter.removeListener === "function") {
        emitter.removeListener("error", errorListener);
      }
      resolve([].slice.call(arguments));
    }
    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== "error") {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}
function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === "function") {
    eventTargetAgnosticAddListener(emitter, "error", handler, flags);
  }
}
function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === "function") {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === "function") {
    emitter.addEventListener(name, function wrapListener(arg) {
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}
var eventsExports = events.exports;
var EE = /* @__PURE__ */ getDefaultExportFromCjs(eventsExports);
function mangle(key) {
  return "$" + key;
}
function unmangle(key) {
  return key.substring(1);
}
function Map$1() {
  this._store = {};
}
Map$1.prototype.get = function(key) {
  var mangled = mangle(key);
  return this._store[mangled];
};
Map$1.prototype.set = function(key, value) {
  var mangled = mangle(key);
  this._store[mangled] = value;
  return true;
};
Map$1.prototype.has = function(key) {
  var mangled = mangle(key);
  return mangled in this._store;
};
Map$1.prototype.keys = function() {
  return Object.keys(this._store).map((k) => unmangle(k));
};
Map$1.prototype.delete = function(key) {
  var mangled = mangle(key);
  var res = mangled in this._store;
  delete this._store[mangled];
  return res;
};
Map$1.prototype.forEach = function(cb) {
  var keys2 = Object.keys(this._store);
  for (var i3 = 0, len2 = keys2.length; i3 < len2; i3++) {
    var key = keys2[i3];
    var value = this._store[key];
    key = unmangle(key);
    cb(value, key);
  }
};
Object.defineProperty(Map$1.prototype, "size", {
  get: function() {
    return Object.keys(this._store).length;
  }
});
function Set$1(array) {
  this._store = new Map$1();
  if (array && Array.isArray(array)) {
    for (var i3 = 0, len2 = array.length; i3 < len2; i3++) {
      this.add(array[i3]);
    }
  }
}
Set$1.prototype.add = function(key) {
  return this._store.set(key, true);
};
Set$1.prototype.has = function(key) {
  return this._store.has(key);
};
Set$1.prototype.forEach = function(cb) {
  this._store.forEach(function(value, key) {
    cb(key);
  });
};
Object.defineProperty(Set$1.prototype, "size", {
  get: function() {
    return this._store.size;
  }
});
function supportsMapAndSet() {
  if (typeof Symbol === "undefined" || typeof Map === "undefined" || typeof Set === "undefined") {
    return false;
  }
  var prop = Object.getOwnPropertyDescriptor(Map, Symbol.species);
  return prop && "get" in prop && Map[Symbol.species] === Map;
}
var ExportedSet;
var ExportedMap;
{
  if (supportsMapAndSet()) {
    ExportedSet = Set;
    ExportedMap = Map;
  } else {
    ExportedSet = Set$1;
    ExportedMap = Map$1;
  }
}
function isBinaryObject(object) {
  return typeof ArrayBuffer !== "undefined" && object instanceof ArrayBuffer || typeof Blob !== "undefined" && object instanceof Blob;
}
function cloneArrayBuffer(buff) {
  if (typeof buff.slice === "function") {
    return buff.slice(0);
  }
  var target = new ArrayBuffer(buff.byteLength);
  var targetArray = new Uint8Array(target);
  var sourceArray = new Uint8Array(buff);
  targetArray.set(sourceArray);
  return target;
}
function cloneBinaryObject(object) {
  if (object instanceof ArrayBuffer) {
    return cloneArrayBuffer(object);
  }
  var size = object.size;
  var type = object.type;
  if (typeof object.slice === "function") {
    return object.slice(0, size, type);
  }
  return object.webkitSlice(0, size, type);
}
var funcToString = Function.prototype.toString;
var objectCtorString = funcToString.call(Object);
function isPlainObject(value) {
  var proto = Object.getPrototypeOf(value);
  if (proto === null) {
    return true;
  }
  var Ctor = proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}
function clone(object) {
  var newObject;
  var i3;
  var len2;
  if (!object || typeof object !== "object") {
    return object;
  }
  if (Array.isArray(object)) {
    newObject = [];
    for (i3 = 0, len2 = object.length; i3 < len2; i3++) {
      newObject[i3] = clone(object[i3]);
    }
    return newObject;
  }
  if (object instanceof Date && isFinite(object)) {
    return object.toISOString();
  }
  if (isBinaryObject(object)) {
    return cloneBinaryObject(object);
  }
  if (!isPlainObject(object)) {
    return object;
  }
  newObject = {};
  for (i3 in object) {
    if (Object.prototype.hasOwnProperty.call(object, i3)) {
      var value = clone(object[i3]);
      if (typeof value !== "undefined") {
        newObject[i3] = value;
      }
    }
  }
  return newObject;
}
function once2(fun) {
  var called = false;
  return function(...args) {
    if (called) {
      throw new Error("once called more than once");
    } else {
      called = true;
      fun.apply(this, args);
    }
  };
}
function toPromise(func) {
  return function(...args) {
    args = clone(args);
    var self2 = this;
    var usedCB = typeof args[args.length - 1] === "function" ? args.pop() : false;
    var promise = new Promise(function(fulfill, reject) {
      var resp;
      try {
        var callback = once2(function(err, mesg) {
          if (err) {
            reject(err);
          } else {
            fulfill(mesg);
          }
        });
        args.push(callback);
        resp = func.apply(self2, args);
        if (resp && typeof resp.then === "function") {
          fulfill(resp);
        }
      } catch (e2) {
        reject(e2);
      }
    });
    if (usedCB) {
      promise.then(function(result4) {
        usedCB(null, result4);
      }, usedCB);
    }
    return promise;
  };
}
function logApiCall(self2, name, args) {
  if (self2.constructor.listeners("debug").length) {
    var logArgs = ["api", self2.name, name];
    for (var i3 = 0; i3 < args.length - 1; i3++) {
      logArgs.push(args[i3]);
    }
    self2.constructor.emit("debug", logArgs);
    var origCallback = args[args.length - 1];
    args[args.length - 1] = function(err, res) {
      var responseArgs = ["api", self2.name, name];
      responseArgs = responseArgs.concat(
        err ? ["error", err] : ["success", res]
      );
      self2.constructor.emit("debug", responseArgs);
      origCallback(err, res);
    };
  }
}
function adapterFun(name, callback) {
  return toPromise(function(...args) {
    if (this._closed) {
      return Promise.reject(new Error("database is closed"));
    }
    if (this._destroyed) {
      return Promise.reject(new Error("database is destroyed"));
    }
    var self2 = this;
    logApiCall(self2, name, args);
    if (!this.taskqueue.isReady) {
      return new Promise(function(fulfill, reject) {
        self2.taskqueue.addTask(function(failed) {
          if (failed) {
            reject(failed);
          } else {
            fulfill(self2[name].apply(self2, args));
          }
        });
      });
    }
    return callback.apply(this, args);
  });
}
function pick(obj, arr) {
  var res = {};
  for (var i3 = 0, len2 = arr.length; i3 < len2; i3++) {
    var prop = arr[i3];
    if (prop in obj) {
      res[prop] = obj[prop];
    }
  }
  return res;
}
var MAX_NUM_CONCURRENT_REQUESTS = 6;
function identityFunction(x) {
  return x;
}
function formatResultForOpenRevsGet(result4) {
  return [{
    ok: result4
  }];
}
function bulkGet(db, opts, callback) {
  var requests = opts.docs;
  var requestsById = new ExportedMap();
  requests.forEach(function(request) {
    if (requestsById.has(request.id)) {
      requestsById.get(request.id).push(request);
    } else {
      requestsById.set(request.id, [request]);
    }
  });
  var numDocs = requestsById.size;
  var numDone = 0;
  var perDocResults = new Array(numDocs);
  function collapseResultsAndFinish() {
    var results = [];
    perDocResults.forEach(function(res) {
      res.docs.forEach(function(info2) {
        results.push({
          id: res.id,
          docs: [info2]
        });
      });
    });
    callback(null, { results });
  }
  function checkDone() {
    if (++numDone === numDocs) {
      collapseResultsAndFinish();
    }
  }
  function gotResult(docIndex, id, docs) {
    perDocResults[docIndex] = { id, docs };
    checkDone();
  }
  var allRequests = [];
  requestsById.forEach(function(value, key) {
    allRequests.push(key);
  });
  var i3 = 0;
  function nextBatch() {
    if (i3 >= allRequests.length) {
      return;
    }
    var upTo = Math.min(i3 + MAX_NUM_CONCURRENT_REQUESTS, allRequests.length);
    var batch2 = allRequests.slice(i3, upTo);
    processBatch(batch2, i3);
    i3 += batch2.length;
  }
  function processBatch(batch2, offset) {
    batch2.forEach(function(docId, j) {
      var docIdx = offset + j;
      var docRequests = requestsById.get(docId);
      var docOpts = pick(docRequests[0], ["atts_since", "attachments"]);
      docOpts.open_revs = docRequests.map(function(request) {
        return request.rev;
      });
      docOpts.open_revs = docOpts.open_revs.filter(identityFunction);
      var formatResult = identityFunction;
      if (docOpts.open_revs.length === 0) {
        delete docOpts.open_revs;
        formatResult = formatResultForOpenRevsGet;
      }
      ["revs", "attachments", "binary", "ajax", "latest"].forEach(function(param) {
        if (param in opts) {
          docOpts[param] = opts[param];
        }
      });
      db.get(docId, docOpts, function(err, res) {
        var result4;
        if (err) {
          result4 = [{ error: err }];
        } else {
          result4 = formatResult(res);
        }
        gotResult(docIdx, docId, result4);
        nextBatch();
      });
    });
  }
  nextBatch();
}
var hasLocal;
try {
  localStorage.setItem("_pouch_check_localstorage", 1);
  hasLocal = !!localStorage.getItem("_pouch_check_localstorage");
} catch (e2) {
  hasLocal = false;
}
function hasLocalStorage() {
  return hasLocal;
}
var Changes = class extends EE {
  constructor() {
    super();
    this._listeners = {};
    if (hasLocalStorage()) {
      addEventListener("storage", (e2) => {
        this.emit(e2.key);
      });
    }
  }
  addListener(dbName, id, db, opts) {
    if (this._listeners[id]) {
      return;
    }
    var inprogress = false;
    var self2 = this;
    function eventFunction() {
      if (!self2._listeners[id]) {
        return;
      }
      if (inprogress) {
        inprogress = "waiting";
        return;
      }
      inprogress = true;
      var changesOpts = pick(opts, [
        "style",
        "include_docs",
        "attachments",
        "conflicts",
        "filter",
        "doc_ids",
        "view",
        "since",
        "query_params",
        "binary",
        "return_docs"
      ]);
      function onError4() {
        inprogress = false;
      }
      db.changes(changesOpts).on("change", function(c) {
        if (c.seq > opts.since && !opts.cancelled) {
          opts.since = c.seq;
          opts.onChange(c);
        }
      }).on("complete", function() {
        if (inprogress === "waiting") {
          immediate$1(eventFunction);
        }
        inprogress = false;
      }).on("error", onError4);
    }
    this._listeners[id] = eventFunction;
    this.on(dbName, eventFunction);
  }
  removeListener(dbName, id) {
    if (!(id in this._listeners)) {
      return;
    }
    super.removeListener(dbName, this._listeners[id]);
    delete this._listeners[id];
  }
  notifyLocalWindows(dbName) {
    if (hasLocalStorage()) {
      localStorage[dbName] = localStorage[dbName] === "a" ? "b" : "a";
    }
  }
  notify(dbName) {
    this.emit(dbName);
    this.notifyLocalWindows(dbName);
  }
};
function guardedConsole(method) {
  if (typeof console !== "undefined" && typeof console[method] === "function") {
    var args = Array.prototype.slice.call(arguments, 1);
    console[method].apply(console, args);
  }
}
function randomNumber(min, max) {
  var maxTimeout = 6e5;
  min = parseInt(min, 10) || 0;
  max = parseInt(max, 10);
  if (max !== max || max <= min) {
    max = (min || 1) << 1;
  } else {
    max = max + 1;
  }
  if (max > maxTimeout) {
    min = maxTimeout >> 1;
    max = maxTimeout;
  }
  var ratio = Math.random();
  var range5 = max - min;
  return ~~(range5 * ratio + min);
}
function defaultBackOff(min) {
  var max = 0;
  if (!min) {
    max = 2e3;
  }
  return randomNumber(min, max);
}
function explainError(status, str) {
  guardedConsole("info", "The above " + status + " is totally normal. " + str);
}
var assign;
{
  if (typeof Object.assign === "function") {
    assign = Object.assign;
  } else {
    assign = function(target) {
      var to = Object(target);
      for (var index2 = 1; index2 < arguments.length; index2++) {
        var nextSource = arguments[index2];
        if (nextSource != null) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    };
  }
}
var $inject_Object_assign = assign;
var PouchError = class extends Error {
  constructor(status, error3, reason) {
    super();
    this.status = status;
    this.name = error3;
    this.message = reason;
    this.error = true;
  }
  toString() {
    return JSON.stringify({
      status: this.status,
      name: this.name,
      message: this.message,
      reason: this.reason
    });
  }
};
new PouchError(401, "unauthorized", "Name or password is incorrect.");
var MISSING_BULK_DOCS = new PouchError(400, "bad_request", "Missing JSON list of 'docs'");
var MISSING_DOC = new PouchError(404, "not_found", "missing");
var REV_CONFLICT = new PouchError(409, "conflict", "Document update conflict");
var INVALID_ID = new PouchError(400, "bad_request", "_id field must contain a string");
var MISSING_ID = new PouchError(412, "missing_id", "_id is required for puts");
var RESERVED_ID = new PouchError(400, "bad_request", "Only reserved document ids may start with underscore.");
new PouchError(412, "precondition_failed", "Database not open");
var UNKNOWN_ERROR = new PouchError(500, "unknown_error", "Database encountered an unknown error");
var BAD_ARG = new PouchError(500, "badarg", "Some query argument is invalid");
new PouchError(400, "invalid_request", "Request was invalid");
var QUERY_PARSE_ERROR = new PouchError(400, "query_parse_error", "Some query parameter is invalid");
var DOC_VALIDATION = new PouchError(500, "doc_validation", "Bad special document member");
var BAD_REQUEST = new PouchError(400, "bad_request", "Something wrong with the request");
var NOT_AN_OBJECT = new PouchError(400, "bad_request", "Document must be a JSON object");
new PouchError(404, "not_found", "Database not found");
var IDB_ERROR = new PouchError(500, "indexed_db_went_bad", "unknown");
new PouchError(500, "web_sql_went_bad", "unknown");
new PouchError(500, "levelDB_went_went_bad", "unknown");
new PouchError(403, "forbidden", "Forbidden by design doc validate_doc_update function");
var INVALID_REV = new PouchError(400, "bad_request", "Invalid rev format");
new PouchError(412, "file_exists", "The database could not be created, the file already exists.");
var MISSING_STUB = new PouchError(412, "missing_stub", "A pre-existing attachment stub wasn't found");
new PouchError(413, "invalid_url", "Provided URL is invalid");
function createError(error3, reason) {
  function CustomPouchError(reason2) {
    var names = Object.getOwnPropertyNames(error3);
    for (var i3 = 0, len2 = names.length; i3 < len2; i3++) {
      if (typeof error3[names[i3]] !== "function") {
        this[names[i3]] = error3[names[i3]];
      }
    }
    if (this.stack === void 0) {
      this.stack = new Error().stack;
    }
    if (reason2 !== void 0) {
      this.reason = reason2;
    }
  }
  CustomPouchError.prototype = PouchError.prototype;
  return new CustomPouchError(reason);
}
function generateErrorFromResponse(err) {
  if (typeof err !== "object") {
    var data = err;
    err = UNKNOWN_ERROR;
    err.data = data;
  }
  if ("error" in err && err.error === "conflict") {
    err.name = "conflict";
    err.status = 409;
  }
  if (!("name" in err)) {
    err.name = err.error || "unknown";
  }
  if (!("status" in err)) {
    err.status = 500;
  }
  if (!("message" in err)) {
    err.message = err.message || err.reason;
  }
  if (!("stack" in err)) {
    err.stack = new Error().stack;
  }
  return err;
}
function tryFilter(filter3, doc, req2) {
  try {
    return !filter3(doc, req2);
  } catch (err) {
    var msg = "Filter function threw: " + err.toString();
    return createError(BAD_REQUEST, msg);
  }
}
function filterChange(opts) {
  var req2 = {};
  var hasFilter = opts.filter && typeof opts.filter === "function";
  req2.query = opts.query_params;
  return function filter3(change) {
    if (!change.doc) {
      change.doc = {};
    }
    var filterReturn = hasFilter && tryFilter(opts.filter, change.doc, req2);
    if (typeof filterReturn === "object") {
      return filterReturn;
    }
    if (filterReturn) {
      return false;
    }
    if (!opts.include_docs) {
      delete change.doc;
    } else if (!opts.attachments) {
      for (var att in change.doc._attachments) {
        if (Object.prototype.hasOwnProperty.call(change.doc._attachments, att)) {
          change.doc._attachments[att].stub = true;
        }
      }
    }
    return true;
  };
}
function flatten(arrs) {
  var res = [];
  for (var i3 = 0, len2 = arrs.length; i3 < len2; i3++) {
    res = res.concat(arrs[i3]);
  }
  return res;
}
function invalidIdError(id) {
  var err;
  if (!id) {
    err = createError(MISSING_ID);
  } else if (typeof id !== "string") {
    err = createError(INVALID_ID);
  } else if (/^_/.test(id) && !/^_(design|local)/.test(id)) {
    err = createError(RESERVED_ID);
  }
  if (err) {
    throw err;
  }
}
function isRemote(db) {
  if (typeof db._remote === "boolean") {
    return db._remote;
  }
  if (typeof db.type === "function") {
    guardedConsole(
      "warn",
      "db.type() is deprecated and will be removed in a future version of PouchDB"
    );
    return db.type() === "http";
  }
  return false;
}
function listenerCount(ee2, type) {
  return "listenerCount" in ee2 ? ee2.listenerCount(type) : EE.listenerCount(ee2, type);
}
function parseDesignDocFunctionName(s2) {
  if (!s2) {
    return null;
  }
  var parts = s2.split("/");
  if (parts.length === 2) {
    return parts;
  }
  if (parts.length === 1) {
    return [s2, s2];
  }
  return null;
}
function normalizeDesignDocFunctionName(s2) {
  var normalized = parseDesignDocFunctionName(s2);
  return normalized ? normalized.join("/") : null;
}
var keys = [
  "source",
  "protocol",
  "authority",
  "userInfo",
  "user",
  "password",
  "host",
  "port",
  "relative",
  "path",
  "directory",
  "file",
  "query",
  "anchor"
];
var qName = "queryKey";
var qParser = /(?:^|&)([^&=]*)=?([^&]*)/g;
var parser = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
function parseUri(str) {
  var m = parser.exec(str);
  var uri = {};
  var i3 = 14;
  while (i3--) {
    var key = keys[i3];
    var value = m[i3] || "";
    var encoded = ["user", "password"].indexOf(key) !== -1;
    uri[key] = encoded ? decodeURIComponent(value) : value;
  }
  uri[qName] = {};
  uri[keys[12]].replace(qParser, function($0, $1, $2) {
    if ($1) {
      uri[qName][$1] = $2;
    }
  });
  return uri;
}
function scopeEval(source, scope) {
  var keys2 = [];
  var values = [];
  for (var key in scope) {
    if (Object.prototype.hasOwnProperty.call(scope, key)) {
      keys2.push(key);
      values.push(scope[key]);
    }
  }
  keys2.push(source);
  return Function.apply(null, keys2).apply(null, values);
}
function upsert(db, docId, diffFun) {
  return db.get(docId).catch(function(err) {
    if (err.status !== 404) {
      throw err;
    }
    return {};
  }).then(function(doc) {
    var docRev = doc._rev;
    var newDoc = diffFun(doc);
    if (!newDoc) {
      return { updated: false, rev: docRev };
    }
    newDoc._id = docId;
    newDoc._rev = docRev;
    return tryAndPut(db, newDoc, diffFun);
  });
}
function tryAndPut(db, doc, diffFun) {
  return db.put(doc).then(function(res) {
    return {
      updated: true,
      rev: res.rev
    };
  }, function(err) {
    if (err.status !== 409) {
      throw err;
    }
    return upsert(db, doc._id, diffFun);
  });
}
var thisAtob = function(str) {
  return atob(str);
};
var thisBtoa = function(str) {
  return btoa(str);
};
function createBlob(parts, properties) {
  parts = parts || [];
  properties = properties || {};
  try {
    return new Blob(parts, properties);
  } catch (e2) {
    if (e2.name !== "TypeError") {
      throw e2;
    }
    var Builder = typeof BlobBuilder !== "undefined" ? BlobBuilder : typeof MSBlobBuilder !== "undefined" ? MSBlobBuilder : typeof MozBlobBuilder !== "undefined" ? MozBlobBuilder : WebKitBlobBuilder;
    var builder = new Builder();
    for (var i3 = 0; i3 < parts.length; i3 += 1) {
      builder.append(parts[i3]);
    }
    return builder.getBlob(properties.type);
  }
}
function binaryStringToArrayBuffer(bin) {
  var length = bin.length;
  var buf = new ArrayBuffer(length);
  var arr = new Uint8Array(buf);
  for (var i3 = 0; i3 < length; i3++) {
    arr[i3] = bin.charCodeAt(i3);
  }
  return buf;
}
function binStringToBluffer(binString, type) {
  return createBlob([binaryStringToArrayBuffer(binString)], { type });
}
function b64ToBluffer(b64, type) {
  return binStringToBluffer(thisAtob(b64), type);
}
function arrayBufferToBinaryString(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var length = bytes.byteLength;
  for (var i3 = 0; i3 < length; i3++) {
    binary += String.fromCharCode(bytes[i3]);
  }
  return binary;
}
function readAsBinaryString(blob, callback) {
  var reader = new FileReader();
  var hasBinaryString = typeof reader.readAsBinaryString === "function";
  reader.onloadend = function(e2) {
    var result4 = e2.target.result || "";
    if (hasBinaryString) {
      return callback(result4);
    }
    callback(arrayBufferToBinaryString(result4));
  };
  if (hasBinaryString) {
    reader.readAsBinaryString(blob);
  } else {
    reader.readAsArrayBuffer(blob);
  }
}
function blobToBinaryString(blobOrBuffer, callback) {
  readAsBinaryString(blobOrBuffer, function(bin) {
    callback(bin);
  });
}
function blobToBase64(blobOrBuffer, callback) {
  blobToBinaryString(blobOrBuffer, function(base64) {
    callback(thisBtoa(base64));
  });
}
function readAsArrayBuffer(blob, callback) {
  var reader = new FileReader();
  reader.onloadend = function(e2) {
    var result4 = e2.target.result || new ArrayBuffer(0);
    callback(result4);
  };
  reader.readAsArrayBuffer(blob);
}
var setImmediateShim = self.setImmediate || self.setTimeout;
var MD5_CHUNK_SIZE = 32768;
function rawToBase64(raw) {
  return thisBtoa(raw);
}
function sliceBlob(blob, start, end) {
  if (blob.webkitSlice) {
    return blob.webkitSlice(start, end);
  }
  return blob.slice(start, end);
}
function appendBlob(buffer, blob, start, end, callback) {
  if (start > 0 || end < blob.size) {
    blob = sliceBlob(blob, start, end);
  }
  readAsArrayBuffer(blob, function(arrayBuffer) {
    buffer.append(arrayBuffer);
    callback();
  });
}
function appendString(buffer, string, start, end, callback) {
  if (start > 0 || end < string.length) {
    string = string.substring(start, end);
  }
  buffer.appendBinary(string);
  callback();
}
function binaryMd5(data, callback) {
  var inputIsString = typeof data === "string";
  var len2 = inputIsString ? data.length : data.size;
  var chunkSize = Math.min(MD5_CHUNK_SIZE, len2);
  var chunks = Math.ceil(len2 / chunkSize);
  var currentChunk = 0;
  var buffer = inputIsString ? new Md5() : new Md5.ArrayBuffer();
  var append = inputIsString ? appendString : appendBlob;
  function next() {
    setImmediateShim(loadNextChunk);
  }
  function done() {
    var raw = buffer.end(true);
    var base64 = rawToBase64(raw);
    callback(base64);
    buffer.destroy();
  }
  function loadNextChunk() {
    var start = currentChunk * chunkSize;
    var end = start + chunkSize;
    currentChunk++;
    if (currentChunk < chunks) {
      append(buffer, data, start, end, next);
    } else {
      append(buffer, data, start, end, done);
    }
  }
  loadNextChunk();
}
function stringMd5(string) {
  return Md5.hash(string);
}
function rev$$1(doc, deterministic_revs) {
  if (!deterministic_revs) {
    return v4().replace(/-/g, "").toLowerCase();
  }
  var mutateableDoc = $inject_Object_assign({}, doc);
  delete mutateableDoc._rev_tree;
  return stringMd5(JSON.stringify(mutateableDoc));
}
var uuid = v4;
function winningRev(metadata) {
  var winningId;
  var winningPos;
  var winningDeleted;
  var toVisit = metadata.rev_tree.slice();
  var node;
  while (node = toVisit.pop()) {
    var tree = node.ids;
    var branches = tree[2];
    var pos = node.pos;
    if (branches.length) {
      for (var i3 = 0, len2 = branches.length; i3 < len2; i3++) {
        toVisit.push({ pos: pos + 1, ids: branches[i3] });
      }
      continue;
    }
    var deleted = !!tree[1].deleted;
    var id = tree[0];
    if (!winningId || (winningDeleted !== deleted ? winningDeleted : winningPos !== pos ? winningPos < pos : winningId < id)) {
      winningId = id;
      winningPos = pos;
      winningDeleted = deleted;
    }
  }
  return winningPos + "-" + winningId;
}
function traverseRevTree(revs, callback) {
  var toVisit = revs.slice();
  var node;
  while (node = toVisit.pop()) {
    var pos = node.pos;
    var tree = node.ids;
    var branches = tree[2];
    var newCtx = callback(branches.length === 0, pos, tree[0], node.ctx, tree[1]);
    for (var i3 = 0, len2 = branches.length; i3 < len2; i3++) {
      toVisit.push({ pos: pos + 1, ids: branches[i3], ctx: newCtx });
    }
  }
}
function sortByPos(a3, b) {
  return a3.pos - b.pos;
}
function collectLeaves(revs) {
  var leaves = [];
  traverseRevTree(revs, function(isLeaf, pos, id, acc, opts) {
    if (isLeaf) {
      leaves.push({ rev: pos + "-" + id, pos, opts });
    }
  });
  leaves.sort(sortByPos).reverse();
  for (var i3 = 0, len2 = leaves.length; i3 < len2; i3++) {
    delete leaves[i3].pos;
  }
  return leaves;
}
function collectConflicts(metadata) {
  var win = winningRev(metadata);
  var leaves = collectLeaves(metadata.rev_tree);
  var conflicts = [];
  for (var i3 = 0, len2 = leaves.length; i3 < len2; i3++) {
    var leaf = leaves[i3];
    if (leaf.rev !== win && !leaf.opts.deleted) {
      conflicts.push(leaf.rev);
    }
  }
  return conflicts;
}
function compactTree(metadata) {
  var revs = [];
  traverseRevTree(metadata.rev_tree, function(isLeaf, pos, revHash, ctx, opts) {
    if (opts.status === "available" && !isLeaf) {
      revs.push(pos + "-" + revHash);
      opts.status = "missing";
    }
  });
  return revs;
}
function findPathToLeaf(revs, targetRev) {
  let path = [];
  const toVisit = revs.slice();
  let node;
  while (node = toVisit.pop()) {
    const { pos, ids: tree } = node;
    const rev = `${pos}-${tree[0]}`;
    const branches = tree[2];
    path.push(rev);
    if (rev === targetRev) {
      if (branches.length !== 0) {
        throw new Error("The requested revision is not a leaf");
      }
      return path.reverse();
    }
    if (branches.length === 0 || branches.length > 1) {
      path = [];
    }
    for (let i3 = 0, len2 = branches.length; i3 < len2; i3++) {
      toVisit.push({ pos: pos + 1, ids: branches[i3] });
    }
  }
  if (path.length === 0) {
    throw new Error("The requested revision does not exist");
  }
  return path.reverse();
}
function rootToLeaf(revs) {
  var paths = [];
  var toVisit = revs.slice();
  var node;
  while (node = toVisit.pop()) {
    var pos = node.pos;
    var tree = node.ids;
    var id = tree[0];
    var opts = tree[1];
    var branches = tree[2];
    var isLeaf = branches.length === 0;
    var history = node.history ? node.history.slice() : [];
    history.push({ id, opts });
    if (isLeaf) {
      paths.push({ pos: pos + 1 - history.length, ids: history });
    }
    for (var i3 = 0, len2 = branches.length; i3 < len2; i3++) {
      toVisit.push({ pos: pos + 1, ids: branches[i3], history });
    }
  }
  return paths.reverse();
}
function sortByPos$1(a3, b) {
  return a3.pos - b.pos;
}
function binarySearch(arr, item, comparator2) {
  var low = 0;
  var high = arr.length;
  var mid;
  while (low < high) {
    mid = low + high >>> 1;
    if (comparator2(arr[mid], item) < 0) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}
function insertSorted(arr, item, comparator2) {
  var idx = binarySearch(arr, item, comparator2);
  arr.splice(idx, 0, item);
}
function pathToTree(path, numStemmed) {
  var root4;
  var leaf;
  for (var i3 = numStemmed, len2 = path.length; i3 < len2; i3++) {
    var node = path[i3];
    var currentLeaf = [node.id, node.opts, []];
    if (leaf) {
      leaf[2].push(currentLeaf);
      leaf = currentLeaf;
    } else {
      root4 = leaf = currentLeaf;
    }
  }
  return root4;
}
function compareTree(a3, b) {
  return a3[0] < b[0] ? -1 : 1;
}
function mergeTree(in_tree1, in_tree2) {
  var queue3 = [{ tree1: in_tree1, tree2: in_tree2 }];
  var conflicts = false;
  while (queue3.length > 0) {
    var item = queue3.pop();
    var tree1 = item.tree1;
    var tree2 = item.tree2;
    if (tree1[1].status || tree2[1].status) {
      tree1[1].status = tree1[1].status === "available" || tree2[1].status === "available" ? "available" : "missing";
    }
    for (var i3 = 0; i3 < tree2[2].length; i3++) {
      if (!tree1[2][0]) {
        conflicts = "new_leaf";
        tree1[2][0] = tree2[2][i3];
        continue;
      }
      var merged = false;
      for (var j = 0; j < tree1[2].length; j++) {
        if (tree1[2][j][0] === tree2[2][i3][0]) {
          queue3.push({ tree1: tree1[2][j], tree2: tree2[2][i3] });
          merged = true;
        }
      }
      if (!merged) {
        conflicts = "new_branch";
        insertSorted(tree1[2], tree2[2][i3], compareTree);
      }
    }
  }
  return { conflicts, tree: in_tree1 };
}
function doMerge(tree, path, dontExpand) {
  var restree = [];
  var conflicts = false;
  var merged = false;
  var res;
  if (!tree.length) {
    return { tree: [path], conflicts: "new_leaf" };
  }
  for (var i3 = 0, len2 = tree.length; i3 < len2; i3++) {
    var branch = tree[i3];
    if (branch.pos === path.pos && branch.ids[0] === path.ids[0]) {
      res = mergeTree(branch.ids, path.ids);
      restree.push({ pos: branch.pos, ids: res.tree });
      conflicts = conflicts || res.conflicts;
      merged = true;
    } else if (dontExpand !== true) {
      var t1 = branch.pos < path.pos ? branch : path;
      var t2 = branch.pos < path.pos ? path : branch;
      var diff = t2.pos - t1.pos;
      var candidateParents = [];
      var trees = [];
      trees.push({ ids: t1.ids, diff, parent: null, parentIdx: null });
      while (trees.length > 0) {
        var item = trees.pop();
        if (item.diff === 0) {
          if (item.ids[0] === t2.ids[0]) {
            candidateParents.push(item);
          }
          continue;
        }
        var elements = item.ids[2];
        for (var j = 0, elementsLen = elements.length; j < elementsLen; j++) {
          trees.push({
            ids: elements[j],
            diff: item.diff - 1,
            parent: item.ids,
            parentIdx: j
          });
        }
      }
      var el = candidateParents[0];
      if (!el) {
        restree.push(branch);
      } else {
        res = mergeTree(el.ids, t2.ids);
        el.parent[2][el.parentIdx] = res.tree;
        restree.push({ pos: t1.pos, ids: t1.ids });
        conflicts = conflicts || res.conflicts;
        merged = true;
      }
    } else {
      restree.push(branch);
    }
  }
  if (!merged) {
    restree.push(path);
  }
  restree.sort(sortByPos$1);
  return {
    tree: restree,
    conflicts: conflicts || "internal_node"
  };
}
function stem(tree, depth) {
  var paths = rootToLeaf(tree);
  var stemmedRevs;
  var result4;
  for (var i3 = 0, len2 = paths.length; i3 < len2; i3++) {
    var path = paths[i3];
    var stemmed = path.ids;
    var node;
    if (stemmed.length > depth) {
      if (!stemmedRevs) {
        stemmedRevs = {};
      }
      var numStemmed = stemmed.length - depth;
      node = {
        pos: path.pos + numStemmed,
        ids: pathToTree(stemmed, numStemmed)
      };
      for (var s2 = 0; s2 < numStemmed; s2++) {
        var rev = path.pos + s2 + "-" + stemmed[s2].id;
        stemmedRevs[rev] = true;
      }
    } else {
      node = {
        pos: path.pos,
        ids: pathToTree(stemmed, 0)
      };
    }
    if (result4) {
      result4 = doMerge(result4, node, true).tree;
    } else {
      result4 = [node];
    }
  }
  if (stemmedRevs) {
    traverseRevTree(result4, function(isLeaf, pos, revHash) {
      delete stemmedRevs[pos + "-" + revHash];
    });
  }
  return {
    tree: result4,
    revs: stemmedRevs ? Object.keys(stemmedRevs) : []
  };
}
function merge(tree, path, depth) {
  var newTree = doMerge(tree, path);
  var stemmed = stem(newTree.tree, depth);
  return {
    tree: stemmed.tree,
    stemmedRevs: stemmed.revs,
    conflicts: newTree.conflicts
  };
}
function removeLeafFromRevTree(tree, leafRev) {
  return tree.flatMap((path) => {
    path = removeLeafFromPath(path, leafRev);
    return path ? [path] : [];
  });
}
function removeLeafFromPath(path, leafRev) {
  const tree = clone(path);
  const toVisit = [tree];
  let node;
  while (node = toVisit.pop()) {
    const { pos, ids: [id, , branches], parent } = node;
    const isLeaf = branches.length === 0;
    const hash = `${pos}-${id}`;
    if (isLeaf && hash === leafRev) {
      if (!parent) {
        return null;
      }
      parent.ids[2] = parent.ids[2].filter(function(branchNode) {
        return branchNode[0] !== id;
      });
      return tree;
    }
    for (let i3 = 0, len2 = branches.length; i3 < len2; i3++) {
      toVisit.push({ pos: pos + 1, ids: branches[i3], parent: node });
    }
  }
  return tree;
}
function getTrees(node) {
  return node.ids;
}
function isDeleted(metadata, rev) {
  if (!rev) {
    rev = winningRev(metadata);
  }
  var id = rev.substring(rev.indexOf("-") + 1);
  var toVisit = metadata.rev_tree.map(getTrees);
  var tree;
  while (tree = toVisit.pop()) {
    if (tree[0] === id) {
      return !!tree[1].deleted;
    }
    toVisit = toVisit.concat(tree[2]);
  }
}
function isLocalId(id) {
  return /^_local/.test(id);
}
function latest(rev, metadata) {
  var toVisit = metadata.rev_tree.slice();
  var node;
  while (node = toVisit.pop()) {
    var pos = node.pos;
    var tree = node.ids;
    var id = tree[0];
    var opts = tree[1];
    var branches = tree[2];
    var isLeaf = branches.length === 0;
    var history = node.history ? node.history.slice() : [];
    history.push({ id, pos, opts });
    if (isLeaf) {
      for (var i3 = 0, len2 = history.length; i3 < len2; i3++) {
        var historyNode = history[i3];
        var historyRev = historyNode.pos + "-" + historyNode.id;
        if (historyRev === rev) {
          return pos + "-" + id;
        }
      }
    }
    for (var j = 0, l2 = branches.length; j < l2; j++) {
      toVisit.push({ pos: pos + 1, ids: branches[j], history });
    }
  }
  throw new Error("Unable to resolve latest revision for id " + metadata.id + ", rev " + rev);
}
function tryCatchInChangeListener(self2, change, pending, lastSeq) {
  try {
    self2.emit("change", change, pending, lastSeq);
  } catch (e2) {
    guardedConsole("error", 'Error in .on("change", function):', e2);
  }
}
function processChange(doc, metadata, opts) {
  var changeList = [{ rev: doc._rev }];
  if (opts.style === "all_docs") {
    changeList = collectLeaves(metadata.rev_tree).map(function(x) {
      return { rev: x.rev };
    });
  }
  var change = {
    id: metadata.id,
    changes: changeList,
    doc
  };
  if (isDeleted(metadata, doc._rev)) {
    change.deleted = true;
  }
  if (opts.conflicts) {
    change.doc._conflicts = collectConflicts(metadata);
    if (!change.doc._conflicts.length) {
      delete change.doc._conflicts;
    }
  }
  return change;
}
var Changes$1 = class extends EE {
  constructor(db, opts, callback) {
    super();
    this.db = db;
    opts = opts ? clone(opts) : {};
    var complete = opts.complete = once2((err, resp) => {
      if (err) {
        if (listenerCount(this, "error") > 0) {
          this.emit("error", err);
        }
      } else {
        this.emit("complete", resp);
      }
      this.removeAllListeners();
      db.removeListener("destroyed", onDestroy);
    });
    if (callback) {
      this.on("complete", function(resp) {
        callback(null, resp);
      });
      this.on("error", callback);
    }
    const onDestroy = () => {
      this.cancel();
    };
    db.once("destroyed", onDestroy);
    opts.onChange = (change, pending, lastSeq) => {
      if (this.isCancelled) {
        return;
      }
      tryCatchInChangeListener(this, change, pending, lastSeq);
    };
    var promise = new Promise(function(fulfill, reject) {
      opts.complete = function(err, res) {
        if (err) {
          reject(err);
        } else {
          fulfill(res);
        }
      };
    });
    this.once("cancel", function() {
      db.removeListener("destroyed", onDestroy);
      opts.complete(null, { status: "cancelled" });
    });
    this.then = promise.then.bind(promise);
    this["catch"] = promise["catch"].bind(promise);
    this.then(function(result4) {
      complete(null, result4);
    }, complete);
    if (!db.taskqueue.isReady) {
      db.taskqueue.addTask((failed) => {
        if (failed) {
          opts.complete(failed);
        } else if (this.isCancelled) {
          this.emit("cancel");
        } else {
          this.validateChanges(opts);
        }
      });
    } else {
      this.validateChanges(opts);
    }
  }
  cancel() {
    this.isCancelled = true;
    if (this.db.taskqueue.isReady) {
      this.emit("cancel");
    }
  }
  validateChanges(opts) {
    var callback = opts.complete;
    if (PouchDB._changesFilterPlugin) {
      PouchDB._changesFilterPlugin.validate(opts, (err) => {
        if (err) {
          return callback(err);
        }
        this.doChanges(opts);
      });
    } else {
      this.doChanges(opts);
    }
  }
  doChanges(opts) {
    var callback = opts.complete;
    opts = clone(opts);
    if ("live" in opts && !("continuous" in opts)) {
      opts.continuous = opts.live;
    }
    opts.processChange = processChange;
    if (opts.since === "latest") {
      opts.since = "now";
    }
    if (!opts.since) {
      opts.since = 0;
    }
    if (opts.since === "now") {
      this.db.info().then((info2) => {
        if (this.isCancelled) {
          callback(null, { status: "cancelled" });
          return;
        }
        opts.since = info2.update_seq;
        this.doChanges(opts);
      }, callback);
      return;
    }
    if (PouchDB._changesFilterPlugin) {
      PouchDB._changesFilterPlugin.normalize(opts);
      if (PouchDB._changesFilterPlugin.shouldFilter(this, opts)) {
        return PouchDB._changesFilterPlugin.filter(this, opts);
      }
    } else {
      ["doc_ids", "filter", "selector", "view"].forEach(function(key) {
        if (key in opts) {
          guardedConsole(
            "warn",
            'The "' + key + '" option was passed in to changes/replicate, but pouchdb-changes-filter plugin is not installed, so it was ignored. Please install the plugin to enable filtering.'
          );
        }
      });
    }
    if (!("descending" in opts)) {
      opts.descending = false;
    }
    opts.limit = opts.limit === 0 ? 1 : opts.limit;
    opts.complete = callback;
    var newPromise = this.db._changes(opts);
    if (newPromise && typeof newPromise.cancel === "function") {
      const cancel = this.cancel;
      this.cancel = (...args) => {
        newPromise.cancel();
        cancel.apply(this, args);
      };
    }
  }
};
function compare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}
function yankError(callback, docId) {
  return function(err, results) {
    if (err || results[0] && results[0].error) {
      err = err || results[0];
      err.docId = docId;
      callback(err);
    } else {
      callback(null, results.length ? results[0] : results);
    }
  };
}
function cleanDocs(docs) {
  for (var i3 = 0; i3 < docs.length; i3++) {
    var doc = docs[i3];
    if (doc._deleted) {
      delete doc._attachments;
    } else if (doc._attachments) {
      var atts = Object.keys(doc._attachments);
      for (var j = 0; j < atts.length; j++) {
        var att = atts[j];
        doc._attachments[att] = pick(
          doc._attachments[att],
          ["data", "digest", "content_type", "length", "revpos", "stub"]
        );
      }
    }
  }
}
function compareByIdThenRev(a3, b) {
  var idCompare = compare(a3._id, b._id);
  if (idCompare !== 0) {
    return idCompare;
  }
  var aStart = a3._revisions ? a3._revisions.start : 0;
  var bStart = b._revisions ? b._revisions.start : 0;
  return compare(aStart, bStart);
}
function computeHeight(revs) {
  var height = {};
  var edges = [];
  traverseRevTree(revs, function(isLeaf, pos, id, prnt) {
    var rev = pos + "-" + id;
    if (isLeaf) {
      height[rev] = 0;
    }
    if (prnt !== void 0) {
      edges.push({ from: prnt, to: rev });
    }
    return rev;
  });
  edges.reverse();
  edges.forEach(function(edge) {
    if (height[edge.from] === void 0) {
      height[edge.from] = 1 + height[edge.to];
    } else {
      height[edge.from] = Math.min(height[edge.from], 1 + height[edge.to]);
    }
  });
  return height;
}
function allDocsKeysParse(opts) {
  var keys2 = "limit" in opts ? opts.keys.slice(opts.skip, opts.limit + opts.skip) : opts.skip > 0 ? opts.keys.slice(opts.skip) : opts.keys;
  opts.keys = keys2;
  opts.skip = 0;
  delete opts.limit;
  if (opts.descending) {
    keys2.reverse();
    opts.descending = false;
  }
}
function doNextCompaction(self2) {
  var task = self2._compactionQueue[0];
  var opts = task.opts;
  var callback = task.callback;
  self2.get("_local/compaction").catch(function() {
    return false;
  }).then(function(doc) {
    if (doc && doc.last_seq) {
      opts.last_seq = doc.last_seq;
    }
    self2._compact(opts, function(err, res) {
      if (err) {
        callback(err);
      } else {
        callback(null, res);
      }
      immediate$1(function() {
        self2._compactionQueue.shift();
        if (self2._compactionQueue.length) {
          doNextCompaction(self2);
        }
      });
    });
  });
}
function appendPurgeSeq(db, docId, rev) {
  return db.get("_local/purges").then(function(doc) {
    const purgeSeq = doc.purgeSeq + 1;
    doc.purges.push({
      docId,
      rev,
      purgeSeq
    });
    if (doc.purges.length > self.purged_infos_limit) {
      doc.purges.splice(0, doc.purges.length - self.purged_infos_limit);
    }
    doc.purgeSeq = purgeSeq;
    return doc;
  }).catch(function(err) {
    if (err.status !== 404) {
      throw err;
    }
    return {
      _id: "_local/purges",
      purges: [{
        docId,
        rev,
        purgeSeq: 0
      }],
      purgeSeq: 0
    };
  }).then(function(doc) {
    return db.put(doc);
  });
}
function attachmentNameError(name) {
  if (name.charAt(0) === "_") {
    return name + " is not a valid attachment name, attachment names cannot start with '_'";
  }
  return false;
}
var AbstractPouchDB = class extends EE {
  _setup() {
    this.post = adapterFun("post", function(doc, opts, callback) {
      if (typeof opts === "function") {
        callback = opts;
        opts = {};
      }
      if (typeof doc !== "object" || Array.isArray(doc)) {
        return callback(createError(NOT_AN_OBJECT));
      }
      this.bulkDocs({ docs: [doc] }, opts, yankError(callback, doc._id));
    }).bind(this);
    this.put = adapterFun("put", function(doc, opts, cb) {
      if (typeof opts === "function") {
        cb = opts;
        opts = {};
      }
      if (typeof doc !== "object" || Array.isArray(doc)) {
        return cb(createError(NOT_AN_OBJECT));
      }
      invalidIdError(doc._id);
      if (isLocalId(doc._id) && typeof this._putLocal === "function") {
        if (doc._deleted) {
          return this._removeLocal(doc, cb);
        } else {
          return this._putLocal(doc, cb);
        }
      }
      const putDoc = (next) => {
        if (typeof this._put === "function" && opts.new_edits !== false) {
          this._put(doc, opts, next);
        } else {
          this.bulkDocs({ docs: [doc] }, opts, yankError(next, doc._id));
        }
      };
      if (opts.force && doc._rev) {
        transformForceOptionToNewEditsOption();
        putDoc(function(err) {
          var result4 = err ? null : { ok: true, id: doc._id, rev: doc._rev };
          cb(err, result4);
        });
      } else {
        putDoc(cb);
      }
      function transformForceOptionToNewEditsOption() {
        var parts = doc._rev.split("-");
        var oldRevId = parts[1];
        var oldRevNum = parseInt(parts[0], 10);
        var newRevNum = oldRevNum + 1;
        var newRevId = rev$$1();
        doc._revisions = {
          start: newRevNum,
          ids: [newRevId, oldRevId]
        };
        doc._rev = newRevNum + "-" + newRevId;
        opts.new_edits = false;
      }
    }).bind(this);
    this.putAttachment = adapterFun("putAttachment", function(docId, attachmentId, rev, blob, type) {
      var api = this;
      if (typeof type === "function") {
        type = blob;
        blob = rev;
        rev = null;
      }
      if (typeof type === "undefined") {
        type = blob;
        blob = rev;
        rev = null;
      }
      if (!type) {
        guardedConsole("warn", "Attachment", attachmentId, "on document", docId, "is missing content_type");
      }
      function createAttachment(doc) {
        var prevrevpos = "_rev" in doc ? parseInt(doc._rev, 10) : 0;
        doc._attachments = doc._attachments || {};
        doc._attachments[attachmentId] = {
          content_type: type,
          data: blob,
          revpos: ++prevrevpos
        };
        return api.put(doc);
      }
      return api.get(docId).then(function(doc) {
        if (doc._rev !== rev) {
          throw createError(REV_CONFLICT);
        }
        return createAttachment(doc);
      }, function(err) {
        if (err.reason === MISSING_DOC.message) {
          return createAttachment({ _id: docId });
        } else {
          throw err;
        }
      });
    }).bind(this);
    this.removeAttachment = adapterFun("removeAttachment", function(docId, attachmentId, rev, callback) {
      this.get(docId, (err, obj) => {
        if (err) {
          callback(err);
          return;
        }
        if (obj._rev !== rev) {
          callback(createError(REV_CONFLICT));
          return;
        }
        if (!obj._attachments) {
          return callback();
        }
        delete obj._attachments[attachmentId];
        if (Object.keys(obj._attachments).length === 0) {
          delete obj._attachments;
        }
        this.put(obj, callback);
      });
    }).bind(this);
    this.remove = adapterFun("remove", function(docOrId, optsOrRev, opts, callback) {
      var doc;
      if (typeof optsOrRev === "string") {
        doc = {
          _id: docOrId,
          _rev: optsOrRev
        };
        if (typeof opts === "function") {
          callback = opts;
          opts = {};
        }
      } else {
        doc = docOrId;
        if (typeof optsOrRev === "function") {
          callback = optsOrRev;
          opts = {};
        } else {
          callback = opts;
          opts = optsOrRev;
        }
      }
      opts = opts || {};
      opts.was_delete = true;
      var newDoc = { _id: doc._id, _rev: doc._rev || opts.rev };
      newDoc._deleted = true;
      if (isLocalId(newDoc._id) && typeof this._removeLocal === "function") {
        return this._removeLocal(doc, callback);
      }
      this.bulkDocs({ docs: [newDoc] }, opts, yankError(callback, newDoc._id));
    }).bind(this);
    this.revsDiff = adapterFun("revsDiff", function(req2, opts, callback) {
      if (typeof opts === "function") {
        callback = opts;
        opts = {};
      }
      var ids = Object.keys(req2);
      if (!ids.length) {
        return callback(null, {});
      }
      var count = 0;
      var missing = new ExportedMap();
      function addToMissing(id, revId) {
        if (!missing.has(id)) {
          missing.set(id, { missing: [] });
        }
        missing.get(id).missing.push(revId);
      }
      function processDoc(id, rev_tree) {
        var missingForId = req2[id].slice(0);
        traverseRevTree(rev_tree, function(isLeaf, pos, revHash, ctx, opts2) {
          var rev = pos + "-" + revHash;
          var idx = missingForId.indexOf(rev);
          if (idx === -1) {
            return;
          }
          missingForId.splice(idx, 1);
          if (opts2.status !== "available") {
            addToMissing(id, rev);
          }
        });
        missingForId.forEach(function(rev) {
          addToMissing(id, rev);
        });
      }
      ids.map(function(id) {
        this._getRevisionTree(id, function(err, rev_tree) {
          if (err && err.status === 404 && err.message === "missing") {
            missing.set(id, { missing: req2[id] });
          } else if (err) {
            return callback(err);
          } else {
            processDoc(id, rev_tree);
          }
          if (++count === ids.length) {
            var missingObj = {};
            missing.forEach(function(value, key) {
              missingObj[key] = value;
            });
            return callback(null, missingObj);
          }
        });
      }, this);
    }).bind(this);
    this.bulkGet = adapterFun("bulkGet", function(opts, callback) {
      bulkGet(this, opts, callback);
    }).bind(this);
    this.compactDocument = adapterFun("compactDocument", function(docId, maxHeight, callback) {
      this._getRevisionTree(docId, (err, revTree) => {
        if (err) {
          return callback(err);
        }
        var height = computeHeight(revTree);
        var candidates = [];
        var revs = [];
        Object.keys(height).forEach(function(rev) {
          if (height[rev] > maxHeight) {
            candidates.push(rev);
          }
        });
        traverseRevTree(revTree, function(isLeaf, pos, revHash, ctx, opts) {
          var rev = pos + "-" + revHash;
          if (opts.status === "available" && candidates.indexOf(rev) !== -1) {
            revs.push(rev);
          }
        });
        this._doCompaction(docId, revs, callback);
      });
    }).bind(this);
    this.compact = adapterFun("compact", function(opts, callback) {
      if (typeof opts === "function") {
        callback = opts;
        opts = {};
      }
      opts = opts || {};
      this._compactionQueue = this._compactionQueue || [];
      this._compactionQueue.push({ opts, callback });
      if (this._compactionQueue.length === 1) {
        doNextCompaction(this);
      }
    }).bind(this);
    this.get = adapterFun("get", function(id, opts, cb) {
      if (typeof opts === "function") {
        cb = opts;
        opts = {};
      }
      if (typeof id !== "string") {
        return cb(createError(INVALID_ID));
      }
      if (isLocalId(id) && typeof this._getLocal === "function") {
        return this._getLocal(id, cb);
      }
      var leaves = [];
      const finishOpenRevs = () => {
        var result4 = [];
        var count = leaves.length;
        if (!count) {
          return cb(null, result4);
        }
        leaves.forEach((leaf) => {
          this.get(id, {
            rev: leaf,
            revs: opts.revs,
            latest: opts.latest,
            attachments: opts.attachments,
            binary: opts.binary
          }, function(err, doc) {
            if (!err) {
              var existing;
              for (var i4 = 0, l3 = result4.length; i4 < l3; i4++) {
                if (result4[i4].ok && result4[i4].ok._rev === doc._rev) {
                  existing = true;
                  break;
                }
              }
              if (!existing) {
                result4.push({ ok: doc });
              }
            } else {
              result4.push({ missing: leaf });
            }
            count--;
            if (!count) {
              cb(null, result4);
            }
          });
        });
      };
      if (opts.open_revs) {
        if (opts.open_revs === "all") {
          this._getRevisionTree(id, function(err, rev_tree) {
            if (err) {
              return cb(err);
            }
            leaves = collectLeaves(rev_tree).map(function(leaf) {
              return leaf.rev;
            });
            finishOpenRevs();
          });
        } else {
          if (Array.isArray(opts.open_revs)) {
            leaves = opts.open_revs;
            for (var i3 = 0; i3 < leaves.length; i3++) {
              var l2 = leaves[i3];
              if (!(typeof l2 === "string" && /^\d+-/.test(l2))) {
                return cb(createError(INVALID_REV));
              }
            }
            finishOpenRevs();
          } else {
            return cb(createError(UNKNOWN_ERROR, "function_clause"));
          }
        }
        return;
      }
      return this._get(id, opts, (err, result4) => {
        if (err) {
          err.docId = id;
          return cb(err);
        }
        var doc = result4.doc;
        var metadata = result4.metadata;
        var ctx = result4.ctx;
        if (opts.conflicts) {
          var conflicts = collectConflicts(metadata);
          if (conflicts.length) {
            doc._conflicts = conflicts;
          }
        }
        if (isDeleted(metadata, doc._rev)) {
          doc._deleted = true;
        }
        if (opts.revs || opts.revs_info) {
          var splittedRev = doc._rev.split("-");
          var revNo = parseInt(splittedRev[0], 10);
          var revHash = splittedRev[1];
          var paths = rootToLeaf(metadata.rev_tree);
          var path = null;
          for (var i4 = 0; i4 < paths.length; i4++) {
            var currentPath = paths[i4];
            var hashIndex = currentPath.ids.map(function(x) {
              return x.id;
            }).indexOf(revHash);
            var hashFoundAtRevPos = hashIndex === revNo - 1;
            if (hashFoundAtRevPos || !path && hashIndex !== -1) {
              path = currentPath;
            }
          }
          if (!path) {
            err = new Error("invalid rev tree");
            err.docId = id;
            return cb(err);
          }
          var indexOfRev = path.ids.map(function(x) {
            return x.id;
          }).indexOf(doc._rev.split("-")[1]) + 1;
          var howMany = path.ids.length - indexOfRev;
          path.ids.splice(indexOfRev, howMany);
          path.ids.reverse();
          if (opts.revs) {
            doc._revisions = {
              start: path.pos + path.ids.length - 1,
              ids: path.ids.map(function(rev) {
                return rev.id;
              })
            };
          }
          if (opts.revs_info) {
            var pos = path.pos + path.ids.length;
            doc._revs_info = path.ids.map(function(rev) {
              pos--;
              return {
                rev: pos + "-" + rev.id,
                status: rev.opts.status
              };
            });
          }
        }
        if (opts.attachments && doc._attachments) {
          var attachments = doc._attachments;
          var count = Object.keys(attachments).length;
          if (count === 0) {
            return cb(null, doc);
          }
          Object.keys(attachments).forEach((key2) => {
            this._getAttachment(doc._id, key2, attachments[key2], {
              // Previously the revision handling was done in adapter.js
              // getAttachment, however since idb-next doesnt we need to
              // pass the rev through
              rev: doc._rev,
              binary: opts.binary,
              ctx
            }, function(err2, data) {
              var att = doc._attachments[key2];
              att.data = data;
              delete att.stub;
              delete att.length;
              if (!--count) {
                cb(null, doc);
              }
            });
          });
        } else {
          if (doc._attachments) {
            for (var key in doc._attachments) {
              if (Object.prototype.hasOwnProperty.call(doc._attachments, key)) {
                doc._attachments[key].stub = true;
              }
            }
          }
          cb(null, doc);
        }
      });
    }).bind(this);
    this.getAttachment = adapterFun("getAttachment", function(docId, attachmentId, opts, callback) {
      if (opts instanceof Function) {
        callback = opts;
        opts = {};
      }
      this._get(docId, opts, (err, res) => {
        if (err) {
          return callback(err);
        }
        if (res.doc._attachments && res.doc._attachments[attachmentId]) {
          opts.ctx = res.ctx;
          opts.binary = true;
          this._getAttachment(
            docId,
            attachmentId,
            res.doc._attachments[attachmentId],
            opts,
            callback
          );
        } else {
          return callback(createError(MISSING_DOC));
        }
      });
    }).bind(this);
    this.allDocs = adapterFun("allDocs", function(opts, callback) {
      if (typeof opts === "function") {
        callback = opts;
        opts = {};
      }
      opts.skip = typeof opts.skip !== "undefined" ? opts.skip : 0;
      if (opts.start_key) {
        opts.startkey = opts.start_key;
      }
      if (opts.end_key) {
        opts.endkey = opts.end_key;
      }
      if ("keys" in opts) {
        if (!Array.isArray(opts.keys)) {
          return callback(new TypeError("options.keys must be an array"));
        }
        var incompatibleOpt = ["startkey", "endkey", "key"].filter(function(incompatibleOpt2) {
          return incompatibleOpt2 in opts;
        })[0];
        if (incompatibleOpt) {
          callback(createError(
            QUERY_PARSE_ERROR,
            "Query parameter `" + incompatibleOpt + "` is not compatible with multi-get"
          ));
          return;
        }
        if (!isRemote(this)) {
          allDocsKeysParse(opts);
          if (opts.keys.length === 0) {
            return this._allDocs({ limit: 0 }, callback);
          }
        }
      }
      return this._allDocs(opts, callback);
    }).bind(this);
    this.close = adapterFun("close", function(callback) {
      this._closed = true;
      this.emit("closed");
      return this._close(callback);
    }).bind(this);
    this.info = adapterFun("info", function(callback) {
      this._info((err, info2) => {
        if (err) {
          return callback(err);
        }
        info2.db_name = info2.db_name || this.name;
        info2.auto_compaction = !!(this.auto_compaction && !isRemote(this));
        info2.adapter = this.adapter;
        callback(null, info2);
      });
    }).bind(this);
    this.id = adapterFun("id", function(callback) {
      return this._id(callback);
    }).bind(this);
    this.bulkDocs = adapterFun("bulkDocs", function(req2, opts, callback) {
      if (typeof opts === "function") {
        callback = opts;
        opts = {};
      }
      opts = opts || {};
      if (Array.isArray(req2)) {
        req2 = {
          docs: req2
        };
      }
      if (!req2 || !req2.docs || !Array.isArray(req2.docs)) {
        return callback(createError(MISSING_BULK_DOCS));
      }
      for (var i3 = 0; i3 < req2.docs.length; ++i3) {
        if (typeof req2.docs[i3] !== "object" || Array.isArray(req2.docs[i3])) {
          return callback(createError(NOT_AN_OBJECT));
        }
      }
      var attachmentError;
      req2.docs.forEach(function(doc) {
        if (doc._attachments) {
          Object.keys(doc._attachments).forEach(function(name) {
            attachmentError = attachmentError || attachmentNameError(name);
            if (!doc._attachments[name].content_type) {
              guardedConsole("warn", "Attachment", name, "on document", doc._id, "is missing content_type");
            }
          });
        }
      });
      if (attachmentError) {
        return callback(createError(BAD_REQUEST, attachmentError));
      }
      if (!("new_edits" in opts)) {
        if ("new_edits" in req2) {
          opts.new_edits = req2.new_edits;
        } else {
          opts.new_edits = true;
        }
      }
      var adapter = this;
      if (!opts.new_edits && !isRemote(adapter)) {
        req2.docs.sort(compareByIdThenRev);
      }
      cleanDocs(req2.docs);
      var ids = req2.docs.map(function(doc) {
        return doc._id;
      });
      this._bulkDocs(req2, opts, function(err, res) {
        if (err) {
          return callback(err);
        }
        if (!opts.new_edits) {
          res = res.filter(function(x) {
            return x.error;
          });
        }
        if (!isRemote(adapter)) {
          for (var i4 = 0, l2 = res.length; i4 < l2; i4++) {
            res[i4].id = res[i4].id || ids[i4];
          }
        }
        callback(null, res);
      });
    }).bind(this);
    this.registerDependentDatabase = adapterFun("registerDependentDatabase", function(dependentDb, callback) {
      var dbOptions = clone(this.__opts);
      if (this.__opts.view_adapter) {
        dbOptions.adapter = this.__opts.view_adapter;
      }
      var depDB = new this.constructor(dependentDb, dbOptions);
      function diffFun(doc) {
        doc.dependentDbs = doc.dependentDbs || {};
        if (doc.dependentDbs[dependentDb]) {
          return false;
        }
        doc.dependentDbs[dependentDb] = true;
        return doc;
      }
      upsert(this, "_local/_pouch_dependentDbs", diffFun).then(function() {
        callback(null, { db: depDB });
      }).catch(callback);
    }).bind(this);
    this.destroy = adapterFun("destroy", function(opts, callback) {
      if (typeof opts === "function") {
        callback = opts;
        opts = {};
      }
      var usePrefix = "use_prefix" in this ? this.use_prefix : true;
      const destroyDb = () => {
        this._destroy(opts, (err, resp) => {
          if (err) {
            return callback(err);
          }
          this._destroyed = true;
          this.emit("destroyed");
          callback(null, resp || { "ok": true });
        });
      };
      if (isRemote(this)) {
        return destroyDb();
      }
      this.get("_local/_pouch_dependentDbs", (err, localDoc) => {
        if (err) {
          if (err.status !== 404) {
            return callback(err);
          } else {
            return destroyDb();
          }
        }
        var dependentDbs = localDoc.dependentDbs;
        var PouchDB2 = this.constructor;
        var deletedMap = Object.keys(dependentDbs).map((name) => {
          var trueName = usePrefix ? name.replace(new RegExp("^" + PouchDB2.prefix), "") : name;
          return new PouchDB2(trueName, this.__opts).destroy();
        });
        Promise.all(deletedMap).then(destroyDb, callback);
      });
    }).bind(this);
  }
  _compact(opts, callback) {
    var changesOpts = {
      return_docs: false,
      last_seq: opts.last_seq || 0
    };
    var promises = [];
    var taskId;
    var compactedDocs = 0;
    const onChange = (row) => {
      this.activeTasks.update(taskId, {
        completed_items: ++compactedDocs
      });
      promises.push(this.compactDocument(row.id, 0));
    };
    const onError4 = (err) => {
      this.activeTasks.remove(taskId, err);
      callback(err);
    };
    const onComplete = (resp) => {
      var lastSeq = resp.last_seq;
      Promise.all(promises).then(() => {
        return upsert(this, "_local/compaction", (doc) => {
          if (!doc.last_seq || doc.last_seq < lastSeq) {
            doc.last_seq = lastSeq;
            return doc;
          }
          return false;
        });
      }).then(() => {
        this.activeTasks.remove(taskId);
        callback(null, { ok: true });
      }).catch(onError4);
    };
    this.info().then((info2) => {
      taskId = this.activeTasks.add({
        name: "database_compaction",
        total_items: info2.update_seq - changesOpts.last_seq
      });
      this.changes(changesOpts).on("change", onChange).on("complete", onComplete).on("error", onError4);
    });
  }
  changes(opts, callback) {
    if (typeof opts === "function") {
      callback = opts;
      opts = {};
    }
    opts = opts || {};
    opts.return_docs = "return_docs" in opts ? opts.return_docs : !opts.live;
    return new Changes$1(this, opts, callback);
  }
  type() {
    return typeof this._type === "function" ? this._type() : this.adapter;
  }
};
AbstractPouchDB.prototype.purge = adapterFun("_purge", function(docId, rev, callback) {
  if (typeof this._purge === "undefined") {
    return callback(createError(UNKNOWN_ERROR, "Purge is not implemented in the " + this.adapter + " adapter."));
  }
  var self2 = this;
  self2._getRevisionTree(docId, (error3, revs) => {
    if (error3) {
      return callback(error3);
    }
    if (!revs) {
      return callback(createError(MISSING_DOC));
    }
    let path;
    try {
      path = findPathToLeaf(revs, rev);
    } catch (error4) {
      return callback(error4.message || error4);
    }
    self2._purge(docId, path, (error4, result4) => {
      if (error4) {
        return callback(error4);
      } else {
        appendPurgeSeq(self2, docId, rev).then(function() {
          return callback(null, result4);
        });
      }
    });
  });
});
var TaskQueue = class {
  constructor() {
    this.isReady = false;
    this.failed = false;
    this.queue = [];
  }
  execute() {
    var fun;
    if (this.failed) {
      while (fun = this.queue.shift()) {
        fun(this.failed);
      }
    } else {
      while (fun = this.queue.shift()) {
        fun();
      }
    }
  }
  fail(err) {
    this.failed = err;
    this.execute();
  }
  ready(db) {
    this.isReady = true;
    this.db = db;
    this.execute();
  }
  addTask(fun) {
    this.queue.push(fun);
    if (this.failed) {
      this.execute();
    }
  }
};
function parseAdapter(name, opts) {
  var match3 = name.match(/([a-z-]*):\/\/(.*)/);
  if (match3) {
    return {
      name: /https?/.test(match3[1]) ? match3[1] + "://" + match3[2] : match3[2],
      adapter: match3[1]
    };
  }
  var adapters = PouchDB.adapters;
  var preferredAdapters = PouchDB.preferredAdapters;
  var prefix2 = PouchDB.prefix;
  var adapterName = opts.adapter;
  if (!adapterName) {
    for (var i3 = 0; i3 < preferredAdapters.length; ++i3) {
      adapterName = preferredAdapters[i3];
      if (adapterName === "idb" && "websql" in adapters && hasLocalStorage() && localStorage["_pouch__websqldb_" + prefix2 + name]) {
        guardedConsole("log", 'PouchDB is downgrading "' + name + '" to WebSQL to avoid data loss, because it was already opened with WebSQL.');
        continue;
      }
      break;
    }
  }
  var adapter = adapters[adapterName];
  var usePrefix = adapter && "use_prefix" in adapter ? adapter.use_prefix : true;
  return {
    name: usePrefix ? prefix2 + name : name,
    adapter: adapterName
  };
}
function inherits(A, B) {
  A.prototype = Object.create(B.prototype, {
    constructor: { value: A }
  });
}
function createClass(parent, init) {
  let klass = function(...args) {
    if (!(this instanceof klass)) {
      return new klass(...args);
    }
    init.apply(this, args);
  };
  inherits(klass, parent);
  return klass;
}
function prepareForDestruction(self2) {
  function onDestroyed(from_constructor) {
    self2.removeListener("closed", onClosed);
    if (!from_constructor) {
      self2.constructor.emit("destroyed", self2.name);
    }
  }
  function onClosed() {
    self2.removeListener("destroyed", onDestroyed);
    self2.constructor.emit("unref", self2);
  }
  self2.once("destroyed", onDestroyed);
  self2.once("closed", onClosed);
  self2.constructor.emit("ref", self2);
}
var PouchInternal = class extends AbstractPouchDB {
  constructor(name, opts) {
    super();
    this._setup(name, opts);
  }
  _setup(name, opts) {
    super._setup();
    opts = opts || {};
    if (name && typeof name === "object") {
      opts = name;
      name = opts.name;
      delete opts.name;
    }
    if (opts.deterministic_revs === void 0) {
      opts.deterministic_revs = true;
    }
    this.__opts = opts = clone(opts);
    this.auto_compaction = opts.auto_compaction;
    this.purged_infos_limit = opts.purged_infos_limit || 1e3;
    this.prefix = PouchDB.prefix;
    if (typeof name !== "string") {
      throw new Error("Missing/invalid DB name");
    }
    var prefixedName = (opts.prefix || "") + name;
    var backend = parseAdapter(prefixedName, opts);
    opts.name = backend.name;
    opts.adapter = opts.adapter || backend.adapter;
    this.name = name;
    this._adapter = opts.adapter;
    PouchDB.emit("debug", ["adapter", "Picked adapter: ", opts.adapter]);
    if (!PouchDB.adapters[opts.adapter] || !PouchDB.adapters[opts.adapter].valid()) {
      throw new Error("Invalid Adapter: " + opts.adapter);
    }
    if (opts.view_adapter) {
      if (!PouchDB.adapters[opts.view_adapter] || !PouchDB.adapters[opts.view_adapter].valid()) {
        throw new Error("Invalid View Adapter: " + opts.view_adapter);
      }
    }
    this.taskqueue = new TaskQueue();
    this.adapter = opts.adapter;
    PouchDB.adapters[opts.adapter].call(this, opts, (err) => {
      if (err) {
        return this.taskqueue.fail(err);
      }
      prepareForDestruction(this);
      this.emit("created", this);
      PouchDB.emit("created", this.name);
      this.taskqueue.ready(this);
    });
  }
};
var PouchDB = createClass(PouchInternal, function(name, opts) {
  PouchInternal.prototype._setup.call(this, name, opts);
});
var a = typeof AbortController !== "undefined" ? AbortController : function() {
  return { abort: function() {
  } };
};
var f$1 = fetch;
var h = Headers;
var ActiveTasks = class {
  constructor() {
    this.tasks = {};
  }
  list() {
    return Object.values(this.tasks);
  }
  add(task) {
    const id = v4();
    this.tasks[id] = {
      id,
      name: task.name,
      total_items: task.total_items,
      created_at: (/* @__PURE__ */ new Date()).toJSON()
    };
    return id;
  }
  get(id) {
    return this.tasks[id];
  }
  /* eslint-disable no-unused-vars */
  remove(id, reason) {
    delete this.tasks[id];
    return this.tasks;
  }
  update(id, updatedTask) {
    const task = this.tasks[id];
    if (typeof task !== "undefined") {
      const mergedTask = {
        id: task.id,
        name: task.name,
        created_at: task.created_at,
        total_items: updatedTask.total_items || task.total_items,
        completed_items: updatedTask.completed_items || task.completed_items,
        updated_at: (/* @__PURE__ */ new Date()).toJSON()
      };
      this.tasks[id] = mergedTask;
    }
    return this.tasks;
  }
};
PouchDB.adapters = {};
PouchDB.preferredAdapters = [];
PouchDB.prefix = "_pouch_";
var eventEmitter = new EE();
function setUpEventEmitter(Pouch) {
  Object.keys(EE.prototype).forEach(function(key) {
    if (typeof EE.prototype[key] === "function") {
      Pouch[key] = eventEmitter[key].bind(eventEmitter);
    }
  });
  var destructListeners = Pouch._destructionListeners = new ExportedMap();
  Pouch.on("ref", function onConstructorRef(db) {
    if (!destructListeners.has(db.name)) {
      destructListeners.set(db.name, []);
    }
    destructListeners.get(db.name).push(db);
  });
  Pouch.on("unref", function onConstructorUnref(db) {
    if (!destructListeners.has(db.name)) {
      return;
    }
    var dbList = destructListeners.get(db.name);
    var pos = dbList.indexOf(db);
    if (pos < 0) {
      return;
    }
    dbList.splice(pos, 1);
    if (dbList.length > 1) {
      destructListeners.set(db.name, dbList);
    } else {
      destructListeners.delete(db.name);
    }
  });
  Pouch.on("destroyed", function onConstructorDestroyed(name) {
    if (!destructListeners.has(name)) {
      return;
    }
    var dbList = destructListeners.get(name);
    destructListeners.delete(name);
    dbList.forEach(function(db) {
      db.emit("destroyed", true);
    });
  });
}
setUpEventEmitter(PouchDB);
PouchDB.adapter = function(id, obj, addToPreferredAdapters) {
  if (obj.valid()) {
    PouchDB.adapters[id] = obj;
    if (addToPreferredAdapters) {
      PouchDB.preferredAdapters.push(id);
    }
  }
};
PouchDB.plugin = function(obj) {
  if (typeof obj === "function") {
    obj(PouchDB);
  } else if (typeof obj !== "object" || Object.keys(obj).length === 0) {
    throw new Error('Invalid plugin: got "' + obj + '", expected an object or a function');
  } else {
    Object.keys(obj).forEach(function(id) {
      PouchDB.prototype[id] = obj[id];
    });
  }
  if (this.__defaults) {
    PouchDB.__defaults = $inject_Object_assign({}, this.__defaults);
  }
  return PouchDB;
};
PouchDB.defaults = function(defaultOpts) {
  let PouchWithDefaults = createClass(PouchDB, function(name, opts) {
    opts = opts || {};
    if (name && typeof name === "object") {
      opts = name;
      name = opts.name;
      delete opts.name;
    }
    opts = $inject_Object_assign({}, PouchWithDefaults.__defaults, opts);
    PouchDB.call(this, name, opts);
  });
  PouchWithDefaults.preferredAdapters = PouchDB.preferredAdapters.slice();
  Object.keys(PouchDB).forEach(function(key) {
    if (!(key in PouchWithDefaults)) {
      PouchWithDefaults[key] = PouchDB[key];
    }
  });
  PouchWithDefaults.__defaults = $inject_Object_assign({}, this.__defaults, defaultOpts);
  return PouchWithDefaults;
};
PouchDB.fetch = function(url, opts) {
  return f$1(url, opts);
};
PouchDB.prototype.activeTasks = PouchDB.activeTasks = new ActiveTasks();
var version = "7.0.0-prerelease";
function getFieldFromDoc(doc, parsedField) {
  var value = doc;
  for (var i3 = 0, len2 = parsedField.length; i3 < len2; i3++) {
    var key = parsedField[i3];
    value = value[key];
    if (!value) {
      break;
    }
  }
  return value;
}
function compare$1(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}
function parseField(fieldName) {
  var fields = [];
  var current = "";
  for (var i3 = 0, len2 = fieldName.length; i3 < len2; i3++) {
    var ch = fieldName[i3];
    if (i3 > 0 && fieldName[i3 - 1] === "\\" && (ch === "$" || ch === ".")) {
      current = current.substring(0, current.length - 1) + ch;
    } else if (ch === ".") {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}
var combinationFields = ["$or", "$nor", "$not"];
function isCombinationalField(field) {
  return combinationFields.indexOf(field) > -1;
}
function getKey(obj) {
  return Object.keys(obj)[0];
}
function getValue(obj) {
  return obj[getKey(obj)];
}
function mergeAndedSelectors(selectors) {
  var res = {};
  var first = { $or: true, $nor: true };
  selectors.forEach(function(selector) {
    Object.keys(selector).forEach(function(field) {
      var matcher3 = selector[field];
      if (typeof matcher3 !== "object") {
        matcher3 = { $eq: matcher3 };
      }
      if (isCombinationalField(field)) {
        if (matcher3 instanceof Array) {
          if (first[field]) {
            first[field] = false;
            res[field] = matcher3;
            return;
          }
          var entries = [];
          res[field].forEach(function(existing) {
            Object.keys(matcher3).forEach(function(key) {
              var m = matcher3[key];
              var longest = Math.max(Object.keys(existing).length, Object.keys(m).length);
              var merged = mergeAndedSelectors([existing, m]);
              if (Object.keys(merged).length <= longest) {
                return;
              }
              entries.push(merged);
            });
          });
          res[field] = entries;
        } else {
          res[field] = mergeAndedSelectors([matcher3]);
        }
      } else {
        var fieldMatchers = res[field] = res[field] || {};
        Object.keys(matcher3).forEach(function(operator) {
          var value = matcher3[operator];
          if (operator === "$gt" || operator === "$gte") {
            return mergeGtGte(operator, value, fieldMatchers);
          } else if (operator === "$lt" || operator === "$lte") {
            return mergeLtLte(operator, value, fieldMatchers);
          } else if (operator === "$ne") {
            return mergeNe(value, fieldMatchers);
          } else if (operator === "$eq") {
            return mergeEq(value, fieldMatchers);
          } else if (operator === "$regex") {
            return mergeRegex(value, fieldMatchers);
          }
          fieldMatchers[operator] = value;
        });
      }
    });
  });
  return res;
}
function mergeGtGte(operator, value, fieldMatchers) {
  if (typeof fieldMatchers.$eq !== "undefined") {
    return;
  }
  if (typeof fieldMatchers.$gte !== "undefined") {
    if (operator === "$gte") {
      if (value > fieldMatchers.$gte) {
        fieldMatchers.$gte = value;
      }
    } else {
      if (value >= fieldMatchers.$gte) {
        delete fieldMatchers.$gte;
        fieldMatchers.$gt = value;
      }
    }
  } else if (typeof fieldMatchers.$gt !== "undefined") {
    if (operator === "$gte") {
      if (value > fieldMatchers.$gt) {
        delete fieldMatchers.$gt;
        fieldMatchers.$gte = value;
      }
    } else {
      if (value > fieldMatchers.$gt) {
        fieldMatchers.$gt = value;
      }
    }
  } else {
    fieldMatchers[operator] = value;
  }
}
function mergeLtLte(operator, value, fieldMatchers) {
  if (typeof fieldMatchers.$eq !== "undefined") {
    return;
  }
  if (typeof fieldMatchers.$lte !== "undefined") {
    if (operator === "$lte") {
      if (value < fieldMatchers.$lte) {
        fieldMatchers.$lte = value;
      }
    } else {
      if (value <= fieldMatchers.$lte) {
        delete fieldMatchers.$lte;
        fieldMatchers.$lt = value;
      }
    }
  } else if (typeof fieldMatchers.$lt !== "undefined") {
    if (operator === "$lte") {
      if (value < fieldMatchers.$lt) {
        delete fieldMatchers.$lt;
        fieldMatchers.$lte = value;
      }
    } else {
      if (value < fieldMatchers.$lt) {
        fieldMatchers.$lt = value;
      }
    }
  } else {
    fieldMatchers[operator] = value;
  }
}
function mergeNe(value, fieldMatchers) {
  if ("$ne" in fieldMatchers) {
    fieldMatchers.$ne.push(value);
  } else {
    fieldMatchers.$ne = [value];
  }
}
function mergeEq(value, fieldMatchers) {
  delete fieldMatchers.$gt;
  delete fieldMatchers.$gte;
  delete fieldMatchers.$lt;
  delete fieldMatchers.$lte;
  delete fieldMatchers.$ne;
  fieldMatchers.$eq = value;
}
function mergeRegex(value, fieldMatchers) {
  if ("$regex" in fieldMatchers) {
    fieldMatchers.$regex.push(value);
  } else {
    fieldMatchers.$regex = [value];
  }
}
function mergeAndedSelectorsNested(obj) {
  for (var prop in obj) {
    if (Array.isArray(obj)) {
      for (var i3 in obj) {
        if (obj[i3]["$and"]) {
          obj[i3] = mergeAndedSelectors(obj[i3]["$and"]);
        }
      }
    }
    var value = obj[prop];
    if (typeof value === "object") {
      mergeAndedSelectorsNested(value);
    }
  }
  return obj;
}
function isAndInSelector(obj, isAnd) {
  for (var prop in obj) {
    if (prop === "$and") {
      isAnd = true;
    }
    var value = obj[prop];
    if (typeof value === "object") {
      isAnd = isAndInSelector(value, isAnd);
    }
  }
  return isAnd;
}
function massageSelector(input) {
  var result4 = clone(input);
  if (isAndInSelector(result4, false)) {
    result4 = mergeAndedSelectorsNested(result4);
    if ("$and" in result4) {
      result4 = mergeAndedSelectors(result4["$and"]);
    }
  }
  ["$or", "$nor"].forEach(function(orOrNor) {
    if (orOrNor in result4) {
      result4[orOrNor].forEach(function(subSelector) {
        var fields2 = Object.keys(subSelector);
        for (var i4 = 0; i4 < fields2.length; i4++) {
          var field2 = fields2[i4];
          var matcher4 = subSelector[field2];
          if (typeof matcher4 !== "object" || matcher4 === null) {
            subSelector[field2] = { $eq: matcher4 };
          }
        }
      });
    }
  });
  if ("$not" in result4) {
    result4["$not"] = mergeAndedSelectors([result4["$not"]]);
  }
  var fields = Object.keys(result4);
  for (var i3 = 0; i3 < fields.length; i3++) {
    var field = fields[i3];
    var matcher3 = result4[field];
    if (typeof matcher3 !== "object" || matcher3 === null) {
      matcher3 = { $eq: matcher3 };
    }
    result4[field] = matcher3;
  }
  normalizeArrayOperators(result4);
  return result4;
}
function normalizeArrayOperators(selector) {
  Object.keys(selector).forEach(function(field) {
    var matcher3 = selector[field];
    if (Array.isArray(matcher3)) {
      matcher3.forEach(function(matcherItem) {
        if (matcherItem && typeof matcherItem === "object") {
          normalizeArrayOperators(matcherItem);
        }
      });
    } else if (field === "$ne") {
      selector.$ne = [matcher3];
    } else if (field === "$regex") {
      selector.$regex = [matcher3];
    } else if (matcher3 && typeof matcher3 === "object") {
      normalizeArrayOperators(matcher3);
    }
  });
}
function pad(str, padWith, upToLength) {
  var padding = "";
  var targetLength = upToLength - str.length;
  while (padding.length < targetLength) {
    padding += padWith;
  }
  return padding;
}
function padLeft(str, padWith, upToLength) {
  var padding = pad(str, padWith, upToLength);
  return padding + str;
}
var MIN_MAGNITUDE = -324;
var MAGNITUDE_DIGITS = 3;
var SEP = "";
function collate(a3, b) {
  if (a3 === b) {
    return 0;
  }
  a3 = normalizeKey(a3);
  b = normalizeKey(b);
  var ai = collationIndex(a3);
  var bi = collationIndex(b);
  if (ai - bi !== 0) {
    return ai - bi;
  }
  switch (typeof a3) {
    case "number":
      return a3 - b;
    case "boolean":
      return a3 < b ? -1 : 1;
    case "string":
      return stringCollate(a3, b);
  }
  return Array.isArray(a3) ? arrayCollate(a3, b) : objectCollate(a3, b);
}
function normalizeKey(key) {
  switch (typeof key) {
    case "undefined":
      return null;
    case "number":
      if (key === Infinity || key === -Infinity || isNaN(key)) {
        return null;
      }
      return key;
    case "object":
      var origKey = key;
      if (Array.isArray(key)) {
        var len2 = key.length;
        key = new Array(len2);
        for (var i3 = 0; i3 < len2; i3++) {
          key[i3] = normalizeKey(origKey[i3]);
        }
      } else if (key instanceof Date) {
        return key.toJSON();
      } else if (key !== null) {
        key = {};
        for (var k in origKey) {
          if (Object.prototype.hasOwnProperty.call(origKey, k)) {
            var val = origKey[k];
            if (typeof val !== "undefined") {
              key[k] = normalizeKey(val);
            }
          }
        }
      }
  }
  return key;
}
function indexify(key) {
  if (key !== null) {
    switch (typeof key) {
      case "boolean":
        return key ? 1 : 0;
      case "number":
        return numToIndexableString(key);
      case "string":
        return key.replace(/\u0002/g, "").replace(/\u0001/g, "").replace(/\u0000/g, "");
      case "object":
        var isArray4 = Array.isArray(key);
        var arr = isArray4 ? key : Object.keys(key);
        var i3 = -1;
        var len2 = arr.length;
        var result4 = "";
        if (isArray4) {
          while (++i3 < len2) {
            result4 += toIndexableString(arr[i3]);
          }
        } else {
          while (++i3 < len2) {
            var objKey = arr[i3];
            result4 += toIndexableString(objKey) + toIndexableString(key[objKey]);
          }
        }
        return result4;
    }
  }
  return "";
}
function toIndexableString(key) {
  var zero = "\0";
  key = normalizeKey(key);
  return collationIndex(key) + SEP + indexify(key) + zero;
}
function parseNumber(str, i3) {
  var originalIdx = i3;
  var num;
  var zero = str[i3] === "1";
  if (zero) {
    num = 0;
    i3++;
  } else {
    var neg = str[i3] === "0";
    i3++;
    var numAsString = "";
    var magAsString = str.substring(i3, i3 + MAGNITUDE_DIGITS);
    var magnitude = parseInt(magAsString, 10) + MIN_MAGNITUDE;
    if (neg) {
      magnitude = -magnitude;
    }
    i3 += MAGNITUDE_DIGITS;
    while (true) {
      var ch = str[i3];
      if (ch === "\0") {
        break;
      } else {
        numAsString += ch;
      }
      i3++;
    }
    numAsString = numAsString.split(".");
    if (numAsString.length === 1) {
      num = parseInt(numAsString, 10);
    } else {
      num = parseFloat(numAsString[0] + "." + numAsString[1]);
    }
    if (neg) {
      num = num - 10;
    }
    if (magnitude !== 0) {
      num = parseFloat(num + "e" + magnitude);
    }
  }
  return { num, length: i3 - originalIdx };
}
function pop(stack, metaStack) {
  var obj = stack.pop();
  if (metaStack.length) {
    var lastMetaElement = metaStack[metaStack.length - 1];
    if (obj === lastMetaElement.element) {
      metaStack.pop();
      lastMetaElement = metaStack[metaStack.length - 1];
    }
    var element = lastMetaElement.element;
    var lastElementIndex = lastMetaElement.index;
    if (Array.isArray(element)) {
      element.push(obj);
    } else if (lastElementIndex === stack.length - 2) {
      var key = stack.pop();
      element[key] = obj;
    } else {
      stack.push(obj);
    }
  }
}
function parseIndexableString(str) {
  var stack = [];
  var metaStack = [];
  var i3 = 0;
  while (true) {
    var collationIndex2 = str[i3++];
    if (collationIndex2 === "\0") {
      if (stack.length === 1) {
        return stack.pop();
      } else {
        pop(stack, metaStack);
        continue;
      }
    }
    switch (collationIndex2) {
      case "1":
        stack.push(null);
        break;
      case "2":
        stack.push(str[i3] === "1");
        i3++;
        break;
      case "3":
        var parsedNum = parseNumber(str, i3);
        stack.push(parsedNum.num);
        i3 += parsedNum.length;
        break;
      case "4":
        var parsedStr = "";
        while (true) {
          var ch = str[i3];
          if (ch === "\0") {
            break;
          }
          parsedStr += ch;
          i3++;
        }
        parsedStr = parsedStr.replace(/\u0001\u0001/g, "\0").replace(/\u0001\u0002/g, "").replace(/\u0002\u0002/g, "");
        stack.push(parsedStr);
        break;
      case "5":
        var arrayElement = { element: [], index: stack.length };
        stack.push(arrayElement.element);
        metaStack.push(arrayElement);
        break;
      case "6":
        var objElement = { element: {}, index: stack.length };
        stack.push(objElement.element);
        metaStack.push(objElement);
        break;
      default:
        throw new Error(
          "bad collationIndex or unexpectedly reached end of input: " + collationIndex2
        );
    }
  }
}
function arrayCollate(a3, b) {
  var len2 = Math.min(a3.length, b.length);
  for (var i3 = 0; i3 < len2; i3++) {
    var sort = collate(a3[i3], b[i3]);
    if (sort !== 0) {
      return sort;
    }
  }
  return a3.length === b.length ? 0 : a3.length > b.length ? 1 : -1;
}
function stringCollate(a3, b) {
  return a3 === b ? 0 : a3 > b ? 1 : -1;
}
function objectCollate(a3, b) {
  var ak = Object.keys(a3), bk = Object.keys(b);
  var len2 = Math.min(ak.length, bk.length);
  for (var i3 = 0; i3 < len2; i3++) {
    var sort = collate(ak[i3], bk[i3]);
    if (sort !== 0) {
      return sort;
    }
    sort = collate(a3[ak[i3]], b[bk[i3]]);
    if (sort !== 0) {
      return sort;
    }
  }
  return ak.length === bk.length ? 0 : ak.length > bk.length ? 1 : -1;
}
function collationIndex(x) {
  var id = ["boolean", "number", "string", "object"];
  var idx = id.indexOf(typeof x);
  if (~idx) {
    if (x === null) {
      return 1;
    }
    if (Array.isArray(x)) {
      return 5;
    }
    return idx < 3 ? idx + 2 : idx + 3;
  }
  if (Array.isArray(x)) {
    return 5;
  }
}
function numToIndexableString(num) {
  if (num === 0) {
    return "1";
  }
  var expFormat = num.toExponential().split(/e\+?/);
  var magnitude = parseInt(expFormat[1], 10);
  var neg = num < 0;
  var result4 = neg ? "0" : "2";
  var magForComparison = (neg ? -magnitude : magnitude) - MIN_MAGNITUDE;
  var magString = padLeft(magForComparison.toString(), "0", MAGNITUDE_DIGITS);
  result4 += SEP + magString;
  var factor = Math.abs(parseFloat(expFormat[0]));
  if (neg) {
    factor = 10 - factor;
  }
  var factorStr = factor.toFixed(20);
  factorStr = factorStr.replace(/\.?0+$/, "");
  result4 += SEP + factorStr;
  return result4;
}
function createFieldSorter(sort) {
  function getFieldValuesAsArray(doc) {
    return sort.map(function(sorting) {
      var fieldName = getKey(sorting);
      var parsedField = parseField(fieldName);
      var docFieldValue = getFieldFromDoc(doc, parsedField);
      return docFieldValue;
    });
  }
  return function(aRow, bRow) {
    var aFieldValues = getFieldValuesAsArray(aRow.doc);
    var bFieldValues = getFieldValuesAsArray(bRow.doc);
    var collation = collate(aFieldValues, bFieldValues);
    if (collation !== 0) {
      return collation;
    }
    return compare$1(aRow.doc._id, bRow.doc._id);
  };
}
function filterInMemoryFields(rows, requestDef, inMemoryFields) {
  rows = rows.filter(function(row) {
    return rowFilter(row.doc, requestDef.selector, inMemoryFields);
  });
  if (requestDef.sort) {
    var fieldSorter = createFieldSorter(requestDef.sort);
    rows = rows.sort(fieldSorter);
    if (typeof requestDef.sort[0] !== "string" && getValue(requestDef.sort[0]) === "desc") {
      rows = rows.reverse();
    }
  }
  if ("limit" in requestDef || "skip" in requestDef) {
    var skip = requestDef.skip || 0;
    var limit = ("limit" in requestDef ? requestDef.limit : rows.length) + skip;
    rows = rows.slice(skip, limit);
  }
  return rows;
}
function rowFilter(doc, selector, inMemoryFields) {
  return inMemoryFields.every(function(field) {
    var matcher3 = selector[field];
    var parsedField = parseField(field);
    var docFieldValue = getFieldFromDoc(doc, parsedField);
    if (isCombinationalField(field)) {
      return matchCominationalSelector(field, matcher3, doc);
    }
    return matchSelector(matcher3, doc, parsedField, docFieldValue);
  });
}
function matchSelector(matcher3, doc, parsedField, docFieldValue) {
  if (!matcher3) {
    return true;
  }
  if (typeof matcher3 === "object") {
    return Object.keys(matcher3).every(function(maybeUserOperator) {
      var userValue = matcher3[maybeUserOperator];
      if (maybeUserOperator.indexOf("$") === 0) {
        return match(maybeUserOperator, doc, userValue, parsedField, docFieldValue);
      } else {
        var subParsedField = parseField(maybeUserOperator);
        if (docFieldValue === void 0 && typeof userValue !== "object" && subParsedField.length > 0) {
          return false;
        }
        var subDocFieldValue = getFieldFromDoc(docFieldValue, subParsedField);
        if (typeof userValue === "object") {
          return matchSelector(userValue, doc, parsedField, subDocFieldValue);
        }
        return match("$eq", doc, userValue, subParsedField, subDocFieldValue);
      }
    });
  }
  return matcher3 === docFieldValue;
}
function matchCominationalSelector(field, matcher3, doc) {
  if (field === "$or") {
    return matcher3.some(function(orMatchers) {
      return rowFilter(doc, orMatchers, Object.keys(orMatchers));
    });
  }
  if (field === "$not") {
    return !rowFilter(doc, matcher3, Object.keys(matcher3));
  }
  return !matcher3.find(function(orMatchers) {
    return rowFilter(doc, orMatchers, Object.keys(orMatchers));
  });
}
function match(userOperator, doc, userValue, parsedField, docFieldValue) {
  if (!matchers[userOperator]) {
    throw new Error('unknown operator "' + userOperator + '" - should be one of $eq, $lte, $lt, $gt, $gte, $exists, $ne, $in, $nin, $size, $mod, $regex, $elemMatch, $type, $allMatch or $all');
  }
  return matchers[userOperator](doc, userValue, parsedField, docFieldValue);
}
function fieldExists(docFieldValue) {
  return typeof docFieldValue !== "undefined" && docFieldValue !== null;
}
function fieldIsNotUndefined(docFieldValue) {
  return typeof docFieldValue !== "undefined";
}
function modField(docFieldValue, userValue) {
  if (typeof docFieldValue !== "number" || parseInt(docFieldValue, 10) !== docFieldValue) {
    return false;
  }
  var divisor = userValue[0];
  var mod = userValue[1];
  return docFieldValue % divisor === mod;
}
function arrayContainsValue(docFieldValue, userValue) {
  return userValue.some(function(val) {
    if (docFieldValue instanceof Array) {
      return docFieldValue.some(function(docFieldValueItem) {
        return collate(val, docFieldValueItem) === 0;
      });
    }
    return collate(val, docFieldValue) === 0;
  });
}
function arrayContainsAllValues(docFieldValue, userValue) {
  return userValue.every(function(val) {
    return docFieldValue.some(function(docFieldValueItem) {
      return collate(val, docFieldValueItem) === 0;
    });
  });
}
function arraySize(docFieldValue, userValue) {
  return docFieldValue.length === userValue;
}
function regexMatch(docFieldValue, userValue) {
  var re2 = new RegExp(userValue);
  return re2.test(docFieldValue);
}
function typeMatch(docFieldValue, userValue) {
  switch (userValue) {
    case "null":
      return docFieldValue === null;
    case "boolean":
      return typeof docFieldValue === "boolean";
    case "number":
      return typeof docFieldValue === "number";
    case "string":
      return typeof docFieldValue === "string";
    case "array":
      return docFieldValue instanceof Array;
    case "object":
      return {}.toString.call(docFieldValue) === "[object Object]";
  }
}
var matchers = {
  "$elemMatch": function(doc, userValue, parsedField, docFieldValue) {
    if (!Array.isArray(docFieldValue)) {
      return false;
    }
    if (docFieldValue.length === 0) {
      return false;
    }
    if (typeof docFieldValue[0] === "object" && docFieldValue[0] !== null) {
      return docFieldValue.some(function(val) {
        return rowFilter(val, userValue, Object.keys(userValue));
      });
    }
    return docFieldValue.some(function(val) {
      return matchSelector(userValue, doc, parsedField, val);
    });
  },
  "$allMatch": function(doc, userValue, parsedField, docFieldValue) {
    if (!Array.isArray(docFieldValue)) {
      return false;
    }
    if (docFieldValue.length === 0) {
      return false;
    }
    if (typeof docFieldValue[0] === "object" && docFieldValue[0] !== null) {
      return docFieldValue.every(function(val) {
        return rowFilter(val, userValue, Object.keys(userValue));
      });
    }
    return docFieldValue.every(function(val) {
      return matchSelector(userValue, doc, parsedField, val);
    });
  },
  "$eq": function(doc, userValue, parsedField, docFieldValue) {
    return fieldIsNotUndefined(docFieldValue) && collate(docFieldValue, userValue) === 0;
  },
  "$gte": function(doc, userValue, parsedField, docFieldValue) {
    return fieldIsNotUndefined(docFieldValue) && collate(docFieldValue, userValue) >= 0;
  },
  "$gt": function(doc, userValue, parsedField, docFieldValue) {
    return fieldIsNotUndefined(docFieldValue) && collate(docFieldValue, userValue) > 0;
  },
  "$lte": function(doc, userValue, parsedField, docFieldValue) {
    return fieldIsNotUndefined(docFieldValue) && collate(docFieldValue, userValue) <= 0;
  },
  "$lt": function(doc, userValue, parsedField, docFieldValue) {
    return fieldIsNotUndefined(docFieldValue) && collate(docFieldValue, userValue) < 0;
  },
  "$exists": function(doc, userValue, parsedField, docFieldValue) {
    if (userValue) {
      return fieldIsNotUndefined(docFieldValue);
    }
    return !fieldIsNotUndefined(docFieldValue);
  },
  "$mod": function(doc, userValue, parsedField, docFieldValue) {
    return fieldExists(docFieldValue) && modField(docFieldValue, userValue);
  },
  "$ne": function(doc, userValue, parsedField, docFieldValue) {
    return userValue.every(function(neValue) {
      return collate(docFieldValue, neValue) !== 0;
    });
  },
  "$in": function(doc, userValue, parsedField, docFieldValue) {
    return fieldExists(docFieldValue) && arrayContainsValue(docFieldValue, userValue);
  },
  "$nin": function(doc, userValue, parsedField, docFieldValue) {
    return fieldExists(docFieldValue) && !arrayContainsValue(docFieldValue, userValue);
  },
  "$size": function(doc, userValue, parsedField, docFieldValue) {
    return fieldExists(docFieldValue) && Array.isArray(docFieldValue) && arraySize(docFieldValue, userValue);
  },
  "$all": function(doc, userValue, parsedField, docFieldValue) {
    return Array.isArray(docFieldValue) && arrayContainsAllValues(docFieldValue, userValue);
  },
  "$regex": function(doc, userValue, parsedField, docFieldValue) {
    return fieldExists(docFieldValue) && typeof docFieldValue == "string" && userValue.every(function(regexValue) {
      return regexMatch(docFieldValue, regexValue);
    });
  },
  "$type": function(doc, userValue, parsedField, docFieldValue) {
    return typeMatch(docFieldValue, userValue);
  }
};
function matchesSelector(doc, selector) {
  if (typeof selector !== "object") {
    throw new Error("Selector error: expected a JSON object");
  }
  selector = massageSelector(selector);
  var row = {
    "doc": doc
  };
  var rowsMatched = filterInMemoryFields([row], { "selector": selector }, Object.keys(selector));
  return rowsMatched && rowsMatched.length === 1;
}
function evalFilter(input) {
  return scopeEval('"use strict";\nreturn ' + input + ";", {});
}
function evalView(input) {
  var code = [
    "return function(doc) {",
    '  "use strict";',
    "  var emitted = false;",
    "  var emit = function (a, b) {",
    "    emitted = true;",
    "  };",
    "  var view = " + input + ";",
    "  view(doc);",
    "  if (emitted) {",
    "    return true;",
    "  }",
    "};"
  ].join("\n");
  return scopeEval(code, {});
}
function validate(opts, callback) {
  if (opts.selector) {
    if (opts.filter && opts.filter !== "_selector") {
      var filterName = typeof opts.filter === "string" ? opts.filter : "function";
      return callback(new Error('selector invalid for filter "' + filterName + '"'));
    }
  }
  callback();
}
function normalize(opts) {
  if (opts.view && !opts.filter) {
    opts.filter = "_view";
  }
  if (opts.selector && !opts.filter) {
    opts.filter = "_selector";
  }
  if (opts.filter && typeof opts.filter === "string") {
    if (opts.filter === "_view") {
      opts.view = normalizeDesignDocFunctionName(opts.view);
    } else {
      opts.filter = normalizeDesignDocFunctionName(opts.filter);
    }
  }
}
function shouldFilter(changesHandler, opts) {
  return opts.filter && typeof opts.filter === "string" && !opts.doc_ids && !isRemote(changesHandler.db);
}
function filter(changesHandler, opts) {
  var callback = opts.complete;
  if (opts.filter === "_view") {
    if (!opts.view || typeof opts.view !== "string") {
      var err = createError(
        BAD_REQUEST,
        "`view` filter parameter not found or invalid."
      );
      return callback(err);
    }
    var viewName = parseDesignDocFunctionName(opts.view);
    changesHandler.db.get("_design/" + viewName[0], function(err2, ddoc) {
      if (changesHandler.isCancelled) {
        return callback(null, { status: "cancelled" });
      }
      if (err2) {
        return callback(generateErrorFromResponse(err2));
      }
      var mapFun = ddoc && ddoc.views && ddoc.views[viewName[1]] && ddoc.views[viewName[1]].map;
      if (!mapFun) {
        return callback(createError(
          MISSING_DOC,
          ddoc.views ? "missing json key: " + viewName[1] : "missing json key: views"
        ));
      }
      opts.filter = evalView(mapFun);
      changesHandler.doChanges(opts);
    });
  } else if (opts.selector) {
    opts.filter = function(doc) {
      return matchesSelector(doc, opts.selector);
    };
    changesHandler.doChanges(opts);
  } else {
    var filterName = parseDesignDocFunctionName(opts.filter);
    changesHandler.db.get("_design/" + filterName[0], function(err2, ddoc) {
      if (changesHandler.isCancelled) {
        return callback(null, { status: "cancelled" });
      }
      if (err2) {
        return callback(generateErrorFromResponse(err2));
      }
      var filterFun = ddoc && ddoc.filters && ddoc.filters[filterName[1]];
      if (!filterFun) {
        return callback(createError(
          MISSING_DOC,
          ddoc && ddoc.filters ? "missing json key: " + filterName[1] : "missing json key: filters"
        ));
      }
      opts.filter = evalFilter(filterFun);
      changesHandler.doChanges(opts);
    });
  }
}
function applyChangesFilterPlugin(PouchDB2) {
  PouchDB2._changesFilterPlugin = {
    validate,
    normalize,
    shouldFilter,
    filter
  };
}
PouchDB.plugin(applyChangesFilterPlugin);
PouchDB.version = version;
var IDB_NULL = Number.MIN_SAFE_INTEGER;
var IDB_FALSE = Number.MIN_SAFE_INTEGER + 1;
var IDB_TRUE = Number.MIN_SAFE_INTEGER + 2;
var TEST_KEY_INVALID = /^[^a-zA-Z_$]|[^a-zA-Z0-9_$]+/;
var TEST_PATH_INVALID = /\\.|(^|\.)[^a-zA-Z_$]|[^a-zA-Z0-9_$.]+/;
function needsSanitise(name, isPath) {
  if (isPath) {
    return TEST_PATH_INVALID.test(name);
  } else {
    return TEST_KEY_INVALID.test(name);
  }
}
var KEY_INVALID = new RegExp(TEST_KEY_INVALID.source, "g");
var PATH_INVALID = new RegExp(TEST_PATH_INVALID.source, "g");
var SLASH = "\\".charCodeAt(0);
var IS_DOT = ".".charCodeAt(0);
function sanitise(name, isPath) {
  var correctCharacters = function(match3) {
    var good = "";
    for (var i3 = 0; i3 < match3.length; i3++) {
      var code = match3.charCodeAt(i3);
      if (code === IS_DOT && isPath && i3 === 0) {
        good += ".";
      } else if (code === SLASH && isPath) {
        continue;
      } else {
        good += "_c" + code + "_";
      }
    }
    return good;
  };
  if (isPath) {
    return name.replace(PATH_INVALID, correctCharacters);
  } else {
    return name.replace(KEY_INVALID, correctCharacters);
  }
}
function needsRewrite(data) {
  for (var key of Object.keys(data)) {
    if (needsSanitise(key)) {
      return true;
    } else if (data[key] === null || typeof data[key] === "boolean") {
      return true;
    } else if (typeof data[key] === "object") {
      return needsRewrite(data[key]);
    }
  }
}
function rewrite(data) {
  if (!needsRewrite(data)) {
    return false;
  }
  var isArray4 = Array.isArray(data);
  var clone5 = isArray4 ? [] : {};
  Object.keys(data).forEach(function(key) {
    var safeKey = isArray4 ? key : sanitise(key);
    if (data[key] === null) {
      clone5[safeKey] = IDB_NULL;
    } else if (typeof data[key] === "boolean") {
      clone5[safeKey] = data[key] ? IDB_TRUE : IDB_FALSE;
    } else if (typeof data[key] === "object") {
      clone5[safeKey] = rewrite(data[key]);
    } else {
      clone5[safeKey] = data[key];
    }
  });
  return clone5;
}
var DOC_STORE = "docs";
var META_STORE = "meta";
function idbError(callback) {
  return function(evt) {
    var message = "unknown_error";
    if (evt.target && evt.target.error) {
      message = evt.target.error.name || evt.target.error.message;
    }
    callback(createError(IDB_ERROR, message, evt.type));
  };
}
function processAttachment(name, src3, doc, isBinary) {
  delete doc._attachments[name].stub;
  if (isBinary) {
    doc._attachments[name].data = src3.attachments[doc._attachments[name].digest].data;
    return Promise.resolve();
  }
  return new Promise(function(resolve) {
    var data = src3.attachments[doc._attachments[name].digest].data;
    readAsBinaryString(data, function(binString) {
      doc._attachments[name].data = thisBtoa(binString);
      delete doc._attachments[name].length;
      resolve();
    });
  });
}
function rawIndexFields(ddoc, viewName) {
  var fields = ddoc.views[viewName].options && ddoc.views[viewName].options.def && ddoc.views[viewName].options.def.fields || [];
  return fields.map(function(field) {
    if (typeof field === "string") {
      return field;
    } else {
      return Object.keys(field)[0];
    }
  });
}
function isPartialFilterView(ddoc, viewName) {
  return viewName in ddoc.views && ddoc.views[viewName].options && ddoc.views[viewName].options.def && ddoc.views[viewName].options.def.partial_filter_selector;
}
function naturalIndexName(fields) {
  return "_find_idx/" + fields.join("/");
}
function correctIndexFields(fields) {
  return ["deleted"].concat(
    fields.map(function(field) {
      if (["_id", "_rev", "_deleted", "_attachments"].includes(field)) {
        return field.substr(1);
      } else {
        return "data." + sanitise(field, true);
      }
    })
  );
}
var POUCHDB_IDB_VERSION = 1;
var versionMultiplier = Math.pow(10, 13);
function createIdbVersion() {
  return versionMultiplier * POUCHDB_IDB_VERSION + (/* @__PURE__ */ new Date()).getTime();
}
function getPouchDbVersion(version3) {
  return Math.floor(version3 / versionMultiplier);
}
function maintainNativeIndexes(openReq, reject) {
  var docStore = openReq.transaction.objectStore(DOC_STORE);
  var ddocsReq = docStore.getAll(IDBKeyRange.bound("_design/", "_design/\uFFFF"));
  ddocsReq.onsuccess = function(e2) {
    var results = e2.target.result;
    var existingIndexNames = Array.from(docStore.indexNames);
    var expectedIndexes = results.filter(function(row) {
      return row.deleted === 0 && row.revs[row.rev].data.views;
    }).map(function(row) {
      return row.revs[row.rev].data;
    }).reduce(function(indexes, ddoc) {
      return Object.keys(ddoc.views).reduce(function(acc, viewName) {
        var fields = rawIndexFields(ddoc, viewName);
        if (fields && fields.length > 0) {
          acc[naturalIndexName(fields)] = correctIndexFields(fields);
        }
        return acc;
      }, indexes);
    }, {});
    var expectedIndexNames = Object.keys(expectedIndexes);
    var systemIndexNames = ["seq"];
    existingIndexNames.forEach(function(index2) {
      if (systemIndexNames.indexOf(index2) === -1 && expectedIndexNames.indexOf(index2) === -1) {
        docStore.deleteIndex(index2);
      }
    });
    var newIndexNames = expectedIndexNames.filter(function(ei) {
      return existingIndexNames.indexOf(ei) === -1;
    });
    try {
      newIndexNames.forEach(function(indexName) {
        docStore.createIndex(indexName, expectedIndexes[indexName]);
      });
    } catch (err) {
      reject(err);
    }
  };
}
function upgradePouchDbSchema(db, pouchdbVersion) {
  if (pouchdbVersion < 1) {
    var docStore = db.createObjectStore(DOC_STORE, { keyPath: "id" });
    docStore.createIndex("seq", "seq", { unique: true });
    db.createObjectStore(META_STORE, { keyPath: "id" });
  }
}
function openDatabase(openDatabases2, api, opts, resolve, reject) {
  var openReq = opts.versionchanged ? indexedDB.open(opts.name) : indexedDB.open(opts.name, createIdbVersion());
  openReq.onupgradeneeded = function(e2) {
    if (e2.oldVersion > 0 && e2.oldVersion < versionMultiplier) {
      throw new Error('Incorrect adapter: you should specify the "idb" adapter to open this DB');
    } else if (e2.oldVersion === 0 && e2.newVersion < versionMultiplier) {
      indexedDB.deleteDatabase(opts.name);
      throw new Error("Database was deleted while open");
    }
    var db = e2.target.result;
    var pouchdbVersion = getPouchDbVersion(e2.oldVersion);
    upgradePouchDbSchema(db, pouchdbVersion);
    maintainNativeIndexes(openReq, reject);
  };
  openReq.onblocked = function(e2) {
    console.error("onblocked, this should never happen", e2);
  };
  openReq.onsuccess = function(e2) {
    var idb = e2.target.result;
    idb.onabort = function(e3) {
      console.error("Database has a global failure", e3.target.error);
      delete openDatabases2[opts.name];
      idb.close();
    };
    idb.onversionchange = function() {
      console.log("Database was made stale, closing handle");
      openDatabases2[opts.name].versionchanged = true;
      idb.close();
    };
    idb.onclose = function() {
      console.log("Database was made stale, closing handle");
      if (opts.name in openDatabases2) {
        openDatabases2[opts.name].versionchanged = true;
      }
    };
    var metadata = { id: META_STORE };
    var txn = idb.transaction([META_STORE], "readwrite");
    txn.oncomplete = function() {
      resolve({ idb, metadata });
    };
    var metaStore = txn.objectStore(META_STORE);
    metaStore.get(META_STORE).onsuccess = function(e3) {
      metadata = e3.target.result || metadata;
      var changed = false;
      if (!("doc_count" in metadata)) {
        changed = true;
        metadata.doc_count = 0;
      }
      if (!("seq" in metadata)) {
        changed = true;
        metadata.seq = 0;
      }
      if (!("db_uuid" in metadata)) {
        changed = true;
        metadata.db_uuid = uuid();
      }
      if (changed) {
        metaStore.put(metadata);
      }
    };
  };
  openReq.onerror = function(e2) {
    reject(e2.target.error);
  };
}
function setup(openDatabases2, api, opts) {
  if (!openDatabases2[opts.name] || openDatabases2[opts.name].versionchanged) {
    opts.versionchanged = openDatabases2[opts.name] && openDatabases2[opts.name].versionchanged;
    openDatabases2[opts.name] = new Promise(function(resolve, reject) {
      openDatabase(openDatabases2, api, opts, resolve, reject);
    });
  }
  return openDatabases2[opts.name];
}
function info(metadata, callback) {
  callback(null, {
    doc_count: metadata.doc_count,
    update_seq: metadata.seq
  });
}
function get(txn, id, opts, callback) {
  if (txn.error) {
    return callback(txn.error);
  }
  txn.txn.objectStore(DOC_STORE).get(id).onsuccess = function(e2) {
    var doc = e2.target.result;
    var rev;
    if (!opts.rev) {
      rev = doc && doc.rev;
    } else {
      rev = opts.latest ? latest(opts.rev, doc) : opts.rev;
    }
    if (!doc || doc.deleted && !opts.rev || !(rev in doc.revs)) {
      callback(createError(MISSING_DOC, "missing"));
      return;
    }
    var result4 = doc.revs[rev].data;
    result4._id = doc.id;
    result4._rev = rev;
    callback(null, {
      doc: result4,
      metadata: doc,
      ctx: txn
    });
  };
}
function parseAttachment(attachment, opts, cb) {
  if (opts.binary) {
    return cb(null, attachment);
  } else {
    readAsBinaryString(attachment, function(binString) {
      cb(null, thisBtoa(binString));
    });
  }
}
function getAttachment(txn, docId, attachId, _, opts, cb) {
  if (txn.error) {
    return cb(txn.error);
  }
  var attachment;
  txn.txn.objectStore(DOC_STORE).get(docId).onsuccess = function(e2) {
    var doc = e2.target.result;
    var rev = doc.revs[opts.rev || doc.rev].data;
    var digest = rev._attachments[attachId].digest;
    attachment = doc.attachments[digest].data;
  };
  txn.txn.oncomplete = function() {
    parseAttachment(attachment, opts, cb);
  };
  txn.txn.onabort = cb;
}
function toObject(array) {
  return array.reduce(function(obj, item) {
    obj[item] = true;
    return obj;
  }, {});
}
var reservedWords = toObject([
  "_id",
  "_rev",
  "_access",
  "_attachments",
  "_deleted",
  "_revisions",
  "_revs_info",
  "_conflicts",
  "_deleted_conflicts",
  "_local_seq",
  "_rev_tree",
  // replication documents
  "_replication_id",
  "_replication_state",
  "_replication_state_time",
  "_replication_state_reason",
  "_replication_stats",
  // Specific to Couchbase Sync Gateway
  "_removed"
]);
var dataWords = toObject([
  "_access",
  "_attachments",
  // replication documents
  "_replication_id",
  "_replication_state",
  "_replication_state_time",
  "_replication_state_reason",
  "_replication_stats"
]);
function parseRevisionInfo(rev) {
  if (!/^\d+-/.test(rev)) {
    return createError(INVALID_REV);
  }
  var idx = rev.indexOf("-");
  var left = rev.substring(0, idx);
  var right = rev.substring(idx + 1);
  return {
    prefix: parseInt(left, 10),
    id: right
  };
}
function makeRevTreeFromRevisions(revisions, opts) {
  var pos = revisions.start - revisions.ids.length + 1;
  var revisionIds = revisions.ids;
  var ids = [revisionIds[0], opts, []];
  for (var i3 = 1, len2 = revisionIds.length; i3 < len2; i3++) {
    ids = [revisionIds[i3], { status: "missing" }, [ids]];
  }
  return [{
    pos,
    ids
  }];
}
function parseDoc(doc, newEdits, dbOpts) {
  if (!dbOpts) {
    dbOpts = {
      deterministic_revs: true
    };
  }
  var nRevNum;
  var newRevId;
  var revInfo;
  var opts = { status: "available" };
  if (doc._deleted) {
    opts.deleted = true;
  }
  if (newEdits) {
    if (!doc._id) {
      doc._id = uuid();
    }
    newRevId = rev$$1(doc, dbOpts.deterministic_revs);
    if (doc._rev) {
      revInfo = parseRevisionInfo(doc._rev);
      if (revInfo.error) {
        return revInfo;
      }
      doc._rev_tree = [{
        pos: revInfo.prefix,
        ids: [revInfo.id, { status: "missing" }, [[newRevId, opts, []]]]
      }];
      nRevNum = revInfo.prefix + 1;
    } else {
      doc._rev_tree = [{
        pos: 1,
        ids: [newRevId, opts, []]
      }];
      nRevNum = 1;
    }
  } else {
    if (doc._revisions) {
      doc._rev_tree = makeRevTreeFromRevisions(doc._revisions, opts);
      nRevNum = doc._revisions.start;
      newRevId = doc._revisions.ids[0];
    }
    if (!doc._rev_tree) {
      revInfo = parseRevisionInfo(doc._rev);
      if (revInfo.error) {
        return revInfo;
      }
      nRevNum = revInfo.prefix;
      newRevId = revInfo.id;
      doc._rev_tree = [{
        pos: nRevNum,
        ids: [newRevId, opts, []]
      }];
    }
  }
  invalidIdError(doc._id);
  doc._rev = nRevNum + "-" + newRevId;
  var result4 = { metadata: {}, data: {} };
  for (var key in doc) {
    if (Object.prototype.hasOwnProperty.call(doc, key)) {
      var specialKey = key[0] === "_";
      if (specialKey && !reservedWords[key]) {
        var error3 = createError(DOC_VALIDATION, key);
        error3.message = DOC_VALIDATION.message + ": " + key;
        throw error3;
      } else if (specialKey && !dataWords[key]) {
        result4.metadata[key.slice(1)] = doc[key];
      } else {
        result4.data[key] = doc[key];
      }
    }
  }
  return result4;
}
function bulkDocs(api, req2, opts, metadata, dbOpts, idbChanges2, callback) {
  var txn;
  var error3;
  var results = [];
  var docs = [];
  var lastWriteIndex;
  var revsLimit = dbOpts.revs_limit || 1e3;
  var rewriteEnabled = dbOpts.name.indexOf("-mrview-") === -1;
  const autoCompaction = dbOpts.auto_compaction;
  function docsRevsLimit(doc) {
    return /^_local/.test(doc.id) ? 1 : revsLimit;
  }
  function rootIsMissing(doc) {
    return doc.rev_tree[0].ids[1].status === "missing";
  }
  function parseBase64(data) {
    try {
      return atob(data);
    } catch (e2) {
      return {
        error: createError(BAD_ARG, "Attachment is not a valid base64 string")
      };
    }
  }
  function fetchExistingDocs(txn2, docs2) {
    var fetched = 0;
    var oldDocs = {};
    function readDone(e2) {
      if (e2.target.result) {
        oldDocs[e2.target.result.id] = e2.target.result;
      }
      if (++fetched === docs2.length) {
        processDocs$$1(txn2, docs2, oldDocs);
      }
    }
    docs2.forEach(function(doc) {
      txn2.objectStore(DOC_STORE).get(doc.id).onsuccess = readDone;
    });
  }
  function revHasAttachment(doc, rev, digest) {
    return doc.revs[rev] && doc.revs[rev].data._attachments && Object.values(doc.revs[rev].data._attachments).find(function(att) {
      return att.digest === digest;
    });
  }
  function processDocs$$1(txn2, docs2, oldDocs) {
    docs2.forEach(function(doc, i4) {
      var newDoc;
      if ("was_delete" in opts && !Object.prototype.hasOwnProperty.call(oldDocs, doc.id)) {
        newDoc = createError(MISSING_DOC, "deleted");
      } else if (opts.new_edits && !Object.prototype.hasOwnProperty.call(oldDocs, doc.id) && rootIsMissing(doc)) {
        newDoc = createError(REV_CONFLICT);
      } else if (Object.prototype.hasOwnProperty.call(oldDocs, doc.id)) {
        newDoc = update(txn2, doc, oldDocs[doc.id]);
        if (newDoc == false) {
          return;
        }
      } else {
        var merged = merge([], doc.rev_tree[0], docsRevsLimit(doc));
        doc.rev_tree = merged.tree;
        doc.stemmedRevs = merged.stemmedRevs;
        newDoc = doc;
        newDoc.isNewDoc = true;
        newDoc.wasDeleted = doc.revs[doc.rev].deleted ? 1 : 0;
      }
      if (newDoc.error) {
        results[i4] = newDoc;
      } else {
        oldDocs[newDoc.id] = newDoc;
        lastWriteIndex = i4;
        write(txn2, newDoc, i4);
      }
    });
  }
  function convertDocFormat(doc) {
    var newDoc = {
      id: doc.metadata.id,
      rev: doc.metadata.rev,
      rev_tree: doc.metadata.rev_tree,
      revs: doc.metadata.revs || {}
    };
    newDoc.revs[newDoc.rev] = {
      data: doc.data,
      deleted: doc.metadata.deleted
    };
    return newDoc;
  }
  function update(txn2, doc, oldDoc) {
    if (doc.rev in oldDoc.revs && !opts.new_edits) {
      return false;
    }
    var isRoot = /^1-/.test(doc.rev);
    if (oldDoc.deleted && !doc.deleted && opts.new_edits && isRoot) {
      var tmp = doc.revs[doc.rev].data;
      tmp._rev = oldDoc.rev;
      tmp._id = oldDoc.id;
      doc = convertDocFormat(parseDoc(tmp, opts.new_edits, dbOpts));
    }
    var merged = merge(oldDoc.rev_tree, doc.rev_tree[0], docsRevsLimit(doc));
    doc.stemmedRevs = merged.stemmedRevs;
    doc.rev_tree = merged.tree;
    var revs = oldDoc.revs;
    revs[doc.rev] = doc.revs[doc.rev];
    doc.revs = revs;
    doc.attachments = oldDoc.attachments;
    var inConflict = opts.new_edits && (oldDoc.deleted && doc.deleted || !oldDoc.deleted && merged.conflicts !== "new_leaf" || oldDoc.deleted && !doc.deleted && merged.conflicts === "new_branch" || oldDoc.rev === doc.rev);
    if (inConflict) {
      return createError(REV_CONFLICT);
    }
    doc.wasDeleted = oldDoc.deleted;
    return doc;
  }
  function write(txn2, doc, i4) {
    var winningRev$$1 = winningRev(doc);
    var writtenRev = doc.rev;
    var isLocal = /^_local/.test(doc.id);
    var theDoc = doc.revs[winningRev$$1].data;
    const isNewDoc = doc.isNewDoc;
    if (rewriteEnabled) {
      var result5 = rewrite(theDoc);
      if (result5) {
        doc.data = result5;
        delete doc.data._attachments;
      } else {
        doc.data = theDoc;
      }
    } else {
      doc.data = theDoc;
    }
    doc.rev = winningRev$$1;
    doc.deleted = doc.revs[winningRev$$1].deleted ? 1 : 0;
    if (!isLocal) {
      doc.seq = ++metadata.seq;
      var delta = 0;
      if (doc.isNewDoc) {
        delta = doc.deleted ? 0 : 1;
      } else if (doc.wasDeleted !== doc.deleted) {
        delta = doc.deleted ? -1 : 1;
      }
      metadata.doc_count += delta;
    }
    delete doc.isNewDoc;
    delete doc.wasDeleted;
    let revsToDelete = doc.stemmedRevs || [];
    if (autoCompaction && !isNewDoc) {
      const result6 = compactTree(doc);
      if (result6.length) {
        revsToDelete = revsToDelete.concat(result6);
      }
    }
    if (revsToDelete.length) {
      revsToDelete.forEach(function(rev) {
        delete doc.revs[rev];
      });
    }
    delete doc.stemmedRevs;
    if (!("attachments" in doc)) {
      doc.attachments = {};
    }
    if (theDoc._attachments) {
      for (var k in theDoc._attachments) {
        var attachment = theDoc._attachments[k];
        if (attachment.stub) {
          if (!(attachment.digest in doc.attachments)) {
            error3 = createError(MISSING_STUB);
            txn2.abort();
            return;
          }
          if (revHasAttachment(doc, writtenRev, attachment.digest)) {
            doc.attachments[attachment.digest].revs[writtenRev] = true;
          }
        } else {
          doc.attachments[attachment.digest] = attachment;
          doc.attachments[attachment.digest].revs = {};
          doc.attachments[attachment.digest].revs[writtenRev] = true;
          theDoc._attachments[k] = {
            stub: true,
            digest: attachment.digest,
            content_type: attachment.content_type,
            length: attachment.length,
            revpos: parseInt(writtenRev, 10)
          };
        }
      }
    }
    if (isLocal && doc.deleted) {
      txn2.objectStore(DOC_STORE).delete(doc.id).onsuccess = function() {
        results[i4] = {
          ok: true,
          id: doc.id,
          rev: "0-0"
        };
      };
      updateSeq(i4);
      return;
    }
    txn2.objectStore(DOC_STORE).put(doc).onsuccess = function() {
      results[i4] = {
        ok: true,
        id: doc.id,
        rev: writtenRev
      };
      updateSeq(i4);
    };
  }
  function updateSeq(i4) {
    if (i4 === lastWriteIndex) {
      txn.objectStore(META_STORE).put(metadata);
    }
  }
  function preProcessAttachment(attachment) {
    if (attachment.stub) {
      return Promise.resolve(attachment);
    }
    var binData;
    if (typeof attachment.data === "string") {
      binData = parseBase64(attachment.data);
      if (binData.error) {
        return Promise.reject(binData.error);
      }
      attachment.data = binStringToBluffer(binData, attachment.content_type);
    } else {
      binData = attachment.data;
    }
    return new Promise(function(resolve) {
      binaryMd5(binData, function(result5) {
        attachment.digest = "md5-" + result5;
        attachment.length = binData.size || binData.length || 0;
        resolve(attachment);
      });
    });
  }
  function preProcessAttachments() {
    var promises = docs.map(function(doc) {
      var data = doc.revs[doc.rev].data;
      if (!data._attachments) {
        return Promise.resolve(data);
      }
      var attachments = Object.keys(data._attachments).map(function(k) {
        data._attachments[k].name = k;
        return preProcessAttachment(data._attachments[k]);
      });
      return Promise.all(attachments).then(function(newAttachments) {
        var processed = {};
        newAttachments.forEach(function(attachment) {
          processed[attachment.name] = attachment;
          delete attachment.name;
        });
        data._attachments = processed;
        return data;
      });
    });
    return Promise.all(promises);
  }
  for (var i3 = 0, len2 = req2.docs.length; i3 < len2; i3++) {
    var result4;
    try {
      result4 = parseDoc(req2.docs[i3], opts.new_edits, dbOpts);
    } catch (err) {
      result4 = err;
    }
    if (result4.error) {
      return callback(result4);
    }
    docs.push(convertDocFormat(result4));
  }
  preProcessAttachments().then(function() {
    api._openTransactionSafely([DOC_STORE, META_STORE], "readwrite", function(err, _txn) {
      if (err) {
        return callback(err);
      }
      txn = _txn;
      txn.onabort = function() {
        callback(error3 || createError(UNKNOWN_ERROR, "transaction was aborted"));
      };
      txn.ontimeout = idbError(callback);
      txn.oncomplete = function() {
        idbChanges2.notify(dbOpts.name);
        callback(null, results);
      };
      fetchExistingDocs(txn, docs);
    });
  }).catch(function(err) {
    callback(err);
  });
}
function allDocsKeys(keys2, docStore, allDocsInner) {
  var valuesBatch = new Array(keys2.length);
  var count = 0;
  keys2.forEach(function(key, index2) {
    docStore.get(key).onsuccess = function(event) {
      if (event.target.result) {
        valuesBatch[index2] = event.target.result;
      } else {
        valuesBatch[index2] = { key, error: "not_found" };
      }
      count++;
      if (count === keys2.length) {
        valuesBatch.forEach(function(doc) {
          allDocsInner(doc);
        });
      }
    };
  });
}
function createKeyRange(start, end, inclusiveEnd, key, descending) {
  try {
    if (start && end) {
      if (descending) {
        return IDBKeyRange.bound(end, start, !inclusiveEnd, false);
      } else {
        return IDBKeyRange.bound(start, end, false, !inclusiveEnd);
      }
    } else if (start) {
      if (descending) {
        return IDBKeyRange.upperBound(start);
      } else {
        return IDBKeyRange.lowerBound(start);
      }
    } else if (end) {
      if (descending) {
        return IDBKeyRange.lowerBound(end, !inclusiveEnd);
      } else {
        return IDBKeyRange.upperBound(end, !inclusiveEnd);
      }
    } else if (key) {
      return IDBKeyRange.only(key);
    }
  } catch (e2) {
    return { error: e2 };
  }
  return null;
}
function handleKeyRangeError(opts, metadata, err, callback) {
  if (err.name === "DataError" && err.code === 0) {
    var returnVal = {
      total_rows: metadata.doc_count,
      offset: opts.skip,
      rows: []
    };
    if (opts.update_seq) {
      returnVal.update_seq = metadata.seq;
    }
    return callback(null, returnVal);
  }
  callback(createError(IDB_ERROR, err.name, err.message));
}
function allDocs(txn, metadata, opts, callback) {
  if (txn.error) {
    return callback(txn.error);
  }
  if (opts.limit === 0) {
    var returnVal = {
      total_rows: metadata.doc_count,
      offset: opts.skip,
      rows: []
    };
    if (opts.update_seq) {
      returnVal.update_seq = metadata.seq;
    }
    return callback(null, returnVal);
  }
  var results = [];
  var processing = [];
  var start = "startkey" in opts ? opts.startkey : false;
  var end = "endkey" in opts ? opts.endkey : false;
  var key = "key" in opts ? opts.key : false;
  var keys2 = "keys" in opts ? opts.keys : false;
  var skip = opts.skip || 0;
  var limit = typeof opts.limit === "number" ? opts.limit : -1;
  var inclusiveEnd = opts.inclusive_end !== false;
  var descending = "descending" in opts && opts.descending ? "prev" : null;
  var keyRange;
  if (!keys2) {
    keyRange = createKeyRange(start, end, inclusiveEnd, key, descending);
    if (keyRange && keyRange.error) {
      return handleKeyRangeError(opts, metadata, keyRange.error, callback);
    }
  }
  var docStore = txn.txn.objectStore(DOC_STORE);
  txn.txn.oncomplete = onTxnComplete;
  if (keys2) {
    return allDocsKeys(opts.keys, docStore, allDocsInner);
  }
  function include_doc(row, doc) {
    var docData = doc.revs[doc.rev].data;
    row.doc = docData;
    row.doc._id = doc.id;
    row.doc._rev = doc.rev;
    if (opts.conflicts) {
      var conflicts = collectConflicts(doc);
      if (conflicts.length) {
        row.doc._conflicts = conflicts;
      }
    }
    if (opts.attachments && docData._attachments) {
      for (var name in docData._attachments) {
        processing.push(processAttachment(name, doc, row.doc, opts.binary));
      }
    }
  }
  function allDocsInner(doc) {
    if (doc.error && keys2) {
      results.push(doc);
      return true;
    }
    var row = {
      id: doc.id,
      key: doc.id,
      value: {
        rev: doc.rev
      }
    };
    var deleted = doc.deleted;
    if (deleted) {
      if (keys2) {
        results.push(row);
        row.value.deleted = true;
        row.doc = null;
      }
    } else if (skip-- <= 0) {
      results.push(row);
      if (opts.include_docs) {
        include_doc(row, doc);
      }
      if (--limit === 0) {
        return false;
      }
    }
    return true;
  }
  function onTxnComplete() {
    Promise.all(processing).then(function() {
      var returnVal2 = {
        total_rows: metadata.doc_count,
        offset: 0,
        rows: results
      };
      if (opts.update_seq) {
        returnVal2.update_seq = metadata.seq;
      }
      callback(null, returnVal2);
    });
  }
  var cursor = descending ? docStore.openCursor(keyRange, descending) : docStore.openCursor(keyRange);
  cursor.onsuccess = function(e2) {
    var doc = e2.target.result && e2.target.result.value;
    if (!doc) {
      return;
    }
    if (/^_local/.test(doc.id)) {
      return e2.target.result.continue();
    }
    var continueCursor = allDocsInner(doc);
    if (continueCursor) {
      e2.target.result.continue();
    }
  };
}
function changes(txn, idbChanges2, api, dbOpts, opts) {
  if (txn.error) {
    return opts.complete(txn.error);
  }
  if (opts.continuous) {
    var id = dbOpts.name + ":" + uuid();
    idbChanges2.addListener(dbOpts.name, id, api, opts);
    idbChanges2.notify(dbOpts.name);
    return {
      cancel: function() {
        idbChanges2.removeListener(dbOpts.name, id);
      }
    };
  }
  var limit = "limit" in opts ? opts.limit : -1;
  if (limit === 0) {
    limit = 1;
  }
  var store = txn.txn.objectStore(DOC_STORE).index("seq");
  var filter3 = filterChange(opts);
  var received = 0;
  var lastSeq = opts.since || 0;
  var results = [];
  var processing = [];
  function onReqSuccess(e2) {
    if (!e2.target.result) {
      return;
    }
    var cursor = e2.target.result;
    var doc = cursor.value;
    doc.data = doc.revs[doc.rev].data;
    doc.data._id = doc.id;
    doc.data._rev = doc.rev;
    if (doc.deleted) {
      doc.data._deleted = true;
    }
    if (opts.doc_ids && opts.doc_ids.indexOf(doc.id) === -1) {
      return cursor.continue();
    }
    var change = opts.processChange(doc.data, doc, opts);
    change.seq = doc.seq;
    lastSeq = doc.seq;
    var filtered = filter3(change);
    if (typeof filtered === "object") {
      return opts.complete(filtered);
    }
    if (filtered) {
      received++;
      if (opts.return_docs) {
        results.push(change);
      }
      if (opts.include_docs && opts.attachments && doc.data._attachments) {
        var promises = [];
        for (var name in doc.data._attachments) {
          var p = processAttachment(name, doc, change.doc, opts.binary);
          promises.push(p);
          processing.push(p);
        }
        Promise.all(promises).then(function() {
          opts.onChange(change);
        });
      } else {
        opts.onChange(change);
      }
    }
    if (received !== limit) {
      cursor.continue();
    }
  }
  function onTxnComplete() {
    Promise.all(processing).then(function() {
      opts.complete(null, {
        results,
        last_seq: lastSeq
      });
    });
  }
  var req2;
  if (opts.descending) {
    req2 = store.openCursor(null, "prev");
  } else {
    req2 = store.openCursor(IDBKeyRange.lowerBound(opts.since, true));
  }
  txn.txn.oncomplete = onTxnComplete;
  req2.onsuccess = onReqSuccess;
}
function getRevisionTree(txn, id, callback) {
  if (txn.error) {
    return callback(txn.error);
  }
  var req2 = txn.txn.objectStore(DOC_STORE).get(id);
  req2.onsuccess = function(e2) {
    if (!e2.target.result) {
      callback(createError(MISSING_DOC));
    } else {
      callback(null, e2.target.result.rev_tree);
    }
  };
}
function doCompaction(txn, id, revs, callback) {
  if (txn.error) {
    return callback(txn.error);
  }
  var docStore = txn.txn.objectStore(DOC_STORE);
  docStore.get(id).onsuccess = function(e2) {
    var doc = e2.target.result;
    traverseRevTree(doc.rev_tree, function(isLeaf, pos, revHash, ctx, opts) {
      var rev = pos + "-" + revHash;
      if (revs.indexOf(rev) !== -1) {
        opts.status = "missing";
      }
    });
    var attachments = [];
    revs.forEach(function(rev) {
      if (rev in doc.revs) {
        if (doc.revs[rev].data._attachments) {
          for (var k in doc.revs[rev].data._attachments) {
            attachments.push(doc.revs[rev].data._attachments[k].digest);
          }
        }
        delete doc.revs[rev];
      }
    });
    attachments.forEach(function(digest) {
      revs.forEach(function(rev) {
        delete doc.attachments[digest].revs[rev];
      });
      if (!Object.keys(doc.attachments[digest].revs).length) {
        delete doc.attachments[digest];
      }
    });
    docStore.put(doc);
  };
  txn.txn.oncomplete = function() {
    callback();
  };
}
function destroy(dbOpts, openDatabases2, idbChanges2, callback) {
  idbChanges2.removeAllListeners(dbOpts.name);
  function doDestroy() {
    var req2 = indexedDB.deleteDatabase(dbOpts.name);
    req2.onsuccess = function() {
      delete openDatabases2[dbOpts.name];
      callback(null, { ok: true });
    };
  }
  if (dbOpts.name in openDatabases2) {
    openDatabases2[dbOpts.name].then(function(res) {
      res.idb.close();
      doDestroy();
    });
  } else {
    doDestroy();
  }
}
var COUCH_COLLATE_LO = null;
var COUCH_COLLATE_HI = "\uFFFF";
var IDB_COLLATE_LO = Number.NEGATIVE_INFINITY;
var IDB_COLLATE_HI = [[[[[[[[[[[[]]]]]]]]]]]];
function externaliseRecord(idbDoc) {
  var doc = idbDoc.revs[idbDoc.rev].data;
  doc._id = idbDoc.id;
  doc._rev = idbDoc.rev;
  if (idbDoc.deleted) {
    doc._deleted = true;
  }
  return doc;
}
function generateKeyRange(opts) {
  function defined(obj, k) {
    return obj[k] !== void 0;
  }
  function convert(key, exact) {
    var filterDeleted = [0].concat(key);
    return filterDeleted.map(function(k) {
      if (k === null && exact) {
        return IDB_NULL;
      } else if (k === true) {
        return IDB_TRUE;
      } else if (k === false) {
        return IDB_FALSE;
      }
      if (!exact) {
        if (k === COUCH_COLLATE_LO) {
          return IDB_COLLATE_LO;
        } else if (Object.prototype.hasOwnProperty.call(k, COUCH_COLLATE_HI)) {
          return IDB_COLLATE_HI;
        }
      }
      return k;
    });
  }
  if (!defined(opts, "inclusive_end")) {
    opts.inclusive_end = true;
  }
  if (!defined(opts, "inclusive_start")) {
    opts.inclusive_start = true;
  }
  if (opts.descending) {
    var realEndkey = opts.startkey, realInclusiveEnd = opts.inclusive_start;
    opts.startkey = opts.endkey;
    opts.endkey = realEndkey;
    opts.inclusive_start = opts.inclusive_end;
    opts.inclusive_end = realInclusiveEnd;
  }
  try {
    if (defined(opts, "key")) {
      return IDBKeyRange.only(convert(opts.key, true));
    }
    if (defined(opts, "startkey") && !defined(opts, "endkey")) {
      return IDBKeyRange.bound(
        convert(opts.startkey),
        [1],
        !opts.inclusive_start,
        true
      );
    }
    if (!defined(opts, "startkey") && defined(opts, "endkey")) {
      return IDBKeyRange.upperBound(convert(opts.endkey), !opts.inclusive_end);
    }
    if (defined(opts, "startkey") && defined(opts, "endkey")) {
      return IDBKeyRange.bound(
        convert(opts.startkey),
        convert(opts.endkey),
        !opts.inclusive_start,
        !opts.inclusive_end
      );
    }
    return IDBKeyRange.only([0]);
  } catch (err) {
    console.error("Could not generate keyRange", err, opts);
    throw Error("Could not generate key range with " + JSON.stringify(opts));
  }
}
function getIndexHandle(pdb, fields, reject) {
  var indexName = naturalIndexName(fields);
  return new Promise(function(resolve) {
    pdb._openTransactionSafely([DOC_STORE], "readonly", function(err, txn) {
      if (err) {
        return idbError(reject)(err);
      }
      txn.onabort = idbError(reject);
      txn.ontimeout = idbError(reject);
      var existingIndexNames = Array.from(txn.objectStore(DOC_STORE).indexNames);
      if (existingIndexNames.indexOf(indexName) === -1) {
        pdb._freshen().then(function() {
          return getIndexHandle(pdb, fields, reject);
        }).then(resolve);
      } else {
        resolve(txn.objectStore(DOC_STORE).index(indexName));
      }
    });
  });
}
function query(idb, signature, opts, fallback) {
  var pdb = this;
  var parts = signature.split("/");
  return new Promise(function(resolve, reject) {
    pdb.get("_design/" + parts[0]).then(function(ddoc) {
      if (isPartialFilterView(ddoc, parts[1])) {
        return fallback(signature, opts).then(resolve, reject);
      }
      var fields = rawIndexFields(ddoc, parts[1]);
      if (!fields) {
        throw new Error("ddoc " + ddoc._id + " with view " + parts[1] + " does not have map.options.def.fields defined.");
      }
      var skip = opts.skip;
      var limit = Number.isInteger(opts.limit) && opts.limit;
      return getIndexHandle(pdb, fields, reject).then(function(indexHandle) {
        var keyRange = generateKeyRange(opts);
        var req2 = indexHandle.openCursor(keyRange, opts.descending ? "prev" : "next");
        var rows = [];
        req2.onerror = idbError(reject);
        req2.onsuccess = function(e2) {
          var cursor = e2.target.result;
          if (!cursor || limit === 0) {
            return resolve({
              rows
            });
          }
          if (skip) {
            cursor.advance(skip);
            skip = false;
            return;
          }
          if (limit) {
            limit = limit - 1;
          }
          rows.push({ doc: externaliseRecord(cursor.value) });
          cursor.continue();
        };
      });
    }).catch(reject);
  });
}
function viewCleanup(idb, fallback) {
  return fallback();
}
function purgeAttachments(doc, revs) {
  if (!doc.attachments) {
    return {};
  }
  for (let key in doc.attachments) {
    const attachment = doc.attachments[key];
    for (let rev of revs) {
      if (attachment.revs[rev]) {
        delete attachment.revs[rev];
      }
    }
    if (Object.keys(attachment.revs).length === 0) {
      delete doc.attachments[key];
    }
  }
  return doc.attachments;
}
function purge(txn, docId, revs, callback) {
  if (txn.error) {
    return callback(txn.error);
  }
  const docStore = txn.txn.objectStore(DOC_STORE);
  const deletedRevs = [];
  let documentWasRemovedCompletely = false;
  docStore.get(docId).onsuccess = (e2) => {
    const doc = e2.target.result;
    for (const rev of revs) {
      doc.rev_tree = removeLeafFromRevTree(doc.rev_tree, rev);
      delete doc.revs[rev];
      deletedRevs.push(rev);
    }
    if (doc.rev_tree.length === 0) {
      docStore.delete(doc.id);
      documentWasRemovedCompletely = true;
      return;
    }
    doc.rev = winningRev(doc);
    doc.data = doc.revs[doc.rev].data;
    doc.attachments = purgeAttachments(doc, revs);
    docStore.put(doc);
  };
  txn.txn.oncomplete = function() {
    callback(null, {
      ok: true,
      deletedRevs,
      documentWasRemovedCompletely
    });
  };
}
var ADAPTER_NAME = "indexeddb";
var idbChanges = new Changes();
var openDatabases = {};
function IdbPouch(dbOpts, callback) {
  if (dbOpts.view_adapter) {
    console.log("Please note that the indexeddb adapter manages _find indexes itself, therefore it is not using your specified view_adapter");
  }
  var api = this;
  var metadata = {};
  var $ = function(fun) {
    return function() {
      var args = Array.prototype.slice.call(arguments);
      setup(openDatabases, api, dbOpts).then(function(res) {
        metadata = res.metadata;
        args.unshift(res.idb);
        fun.apply(api, args);
      }).catch(function(err) {
        var last = args.pop();
        if (typeof last === "function") {
          last(err);
        } else {
          console.error(err);
        }
      });
    };
  };
  var $p = function(fun) {
    return function() {
      var args = Array.prototype.slice.call(arguments);
      return setup(openDatabases, api, dbOpts).then(function(res) {
        metadata = res.metadata;
        args.unshift(res.idb);
        return fun.apply(api, args);
      });
    };
  };
  var $t = function(fun, stores, mode, changes$$1) {
    stores = stores || [DOC_STORE];
    mode = mode || "readonly";
    return function() {
      var args = Array.prototype.slice.call(arguments);
      var txn = {};
      const prom = setup(openDatabases, api, dbOpts).then(function(res) {
        metadata = res.metadata;
        txn.txn = res.idb.transaction(stores, mode);
      }).catch(function(err) {
        console.error("Failed to establish transaction safely");
        console.error(err);
        txn.error = err;
      }).then(function() {
        args.unshift(txn);
        return fun.apply(api, args);
      });
      if (changes$$1) {
        prom.cancel = () => {
          prom.then((res) => {
            if (res && typeof res.cancel === "function") {
              res.cancel();
            }
          });
        };
        return prom;
      }
    };
  };
  api._openTransactionSafely = function(stores, mode, callback2) {
    $t(function(txn, callback3) {
      callback3(txn.error, txn.txn);
    }, stores, mode)(callback2);
  };
  api._remote = false;
  api.type = function() {
    return ADAPTER_NAME;
  };
  api._id = $(function(_, cb) {
    cb(null, metadata.db_uuid);
  });
  api._info = $(function(_, cb) {
    return info(metadata, cb);
  });
  api._get = $t(get);
  api._bulkDocs = $(function(_, req2, opts, callback2) {
    bulkDocs(api, req2, opts, metadata, dbOpts, idbChanges, callback2);
  });
  api._allDocs = $t(function(txn, opts, cb) {
    allDocs(txn, metadata, opts, cb);
  });
  api._getAttachment = $t(getAttachment);
  api._changes = $t(function(txn, opts) {
    return changes(txn, idbChanges, api, dbOpts, opts);
  }, null, null, true);
  api._getRevisionTree = $t(getRevisionTree);
  api._doCompaction = $t(doCompaction, [DOC_STORE], "readwrite");
  api._customFindAbstractMapper = {
    query: $p(query),
    viewCleanup: $p(viewCleanup)
  };
  api._destroy = function(opts, callback2) {
    return destroy(dbOpts, openDatabases, idbChanges, callback2);
  };
  api._close = $(function(db, cb) {
    delete openDatabases[dbOpts.name];
    db.close();
    cb();
  });
  api._freshen = function() {
    return new Promise(function(resolve) {
      api._close(function() {
        $(resolve)();
      });
    });
  };
  api._purge = $t(purge, [DOC_STORE], "readwrite");
  setTimeout(function() {
    callback(null, api);
  });
}
IdbPouch.valid = function() {
  return true;
};
function IndexedDbPouch(PouchDB2) {
  PouchDB2.adapter(ADAPTER_NAME, IdbPouch, true);
}
function pool(promiseFactories, limit) {
  return new Promise(function(resolve, reject) {
    var running = 0;
    var current = 0;
    var done = 0;
    var len2 = promiseFactories.length;
    var err;
    function runNext() {
      running++;
      promiseFactories[current++]().then(onSuccess, onError4);
    }
    function doNext() {
      if (++done === len2) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      } else {
        runNextBatch();
      }
    }
    function onSuccess() {
      running--;
      doNext();
    }
    function onError4(thisErr) {
      running--;
      err = err || thisErr;
      doNext();
    }
    function runNextBatch() {
      while (running < limit && current < len2) {
        runNext();
      }
    }
    runNextBatch();
  });
}
var CHANGES_BATCH_SIZE = 25;
var MAX_SIMULTANEOUS_REVS = 50;
var CHANGES_TIMEOUT_BUFFER = 5e3;
var DEFAULT_HEARTBEAT = 1e4;
var supportsBulkGetMap = {};
var sse = new ExportedSet();
function readAttachmentsAsBlobOrBuffer(row) {
  const doc = row.doc || row.ok;
  const atts = doc && doc._attachments;
  if (!atts) {
    return;
  }
  Object.keys(atts).forEach(function(filename) {
    const att = atts[filename];
    att.data = b64ToBluffer(att.data, att.content_type);
  });
}
function encodeDocId(id) {
  if (/^_design/.test(id)) {
    return "_design/" + encodeURIComponent(id.slice(8));
  }
  if (/^_local/.test(id)) {
    return "_local/" + encodeURIComponent(id.slice(7));
  }
  return encodeURIComponent(id);
}
function preprocessAttachments$1(doc) {
  if (!doc._attachments || !Object.keys(doc._attachments)) {
    return Promise.resolve();
  }
  return Promise.all(Object.keys(doc._attachments).map(function(key) {
    const attachment = doc._attachments[key];
    if (attachment.data && typeof attachment.data !== "string") {
      return new Promise(function(resolve) {
        blobToBase64(attachment.data, resolve);
      }).then(function(b64) {
        attachment.data = b64;
      });
    }
  }));
}
function hasUrlPrefix(opts) {
  if (!opts.prefix) {
    return false;
  }
  const protocol = parseUri(opts.prefix).protocol;
  return protocol === "http" || protocol === "https";
}
function getHost(name, opts) {
  if (hasUrlPrefix(opts)) {
    const dbName = opts.name.substr(opts.prefix.length);
    const prefix2 = opts.prefix.replace(/\/?$/, "/");
    name = prefix2 + encodeURIComponent(dbName);
  }
  const uri = parseUri(name);
  if (uri.user || uri.password) {
    uri.auth = { username: uri.user, password: uri.password };
  }
  const parts = uri.path.replace(/(^\/|\/$)/g, "").split("/");
  uri.db = parts.pop();
  if (uri.db.indexOf("%") === -1) {
    uri.db = encodeURIComponent(uri.db);
  }
  uri.path = parts.join("/");
  return uri;
}
function genDBUrl(opts, path) {
  return genUrl(opts, opts.db + "/" + path);
}
function genUrl(opts, path) {
  const pathDel = !opts.path ? "" : "/";
  return opts.protocol + "://" + opts.host + (opts.port ? ":" + opts.port : "") + "/" + opts.path + pathDel + path;
}
function paramsToStr(params) {
  const paramKeys = Object.keys(params);
  if (paramKeys.length === 0) {
    return "";
  }
  return "?" + paramKeys.map((key) => key + "=" + encodeURIComponent(params[key])).join("&");
}
function shouldCacheBust(opts) {
  const ua = typeof navigator !== "undefined" && navigator.userAgent ? navigator.userAgent.toLowerCase() : "";
  const isIE = ua.indexOf("msie") !== -1;
  const isTrident = ua.indexOf("trident") !== -1;
  const isEdge = ua.indexOf("edge") !== -1;
  const isGET = !("method" in opts) || opts.method === "GET";
  return (isIE || isTrident || isEdge) && isGET;
}
function HttpPouch(opts, callback) {
  const api = this;
  const host = getHost(opts.name, opts);
  const dbUrl = genDBUrl(host, "");
  let dbId;
  opts = clone(opts);
  const ourFetch = function(url, options) {
    options = options || {};
    options.headers = options.headers || new h();
    options.credentials = "include";
    if (opts.auth || host.auth) {
      const nAuth = opts.auth || host.auth;
      const str = nAuth.username + ":" + nAuth.password;
      const token = thisBtoa(unescape(encodeURIComponent(str)));
      options.headers.set("Authorization", "Basic " + token);
    }
    const headers = opts.headers || {};
    Object.keys(headers).forEach(function(key) {
      options.headers.append(key, headers[key]);
    });
    if (shouldCacheBust(options)) {
      url += (url.indexOf("?") === -1 ? "?" : "&") + "_nonce=" + Date.now();
    }
    const fetchFun = opts.fetch || f$1;
    return fetchFun(url, options);
  };
  function adapterFun$$1(name, fun) {
    return adapterFun(name, function(...args) {
      setup2().then(function() {
        return fun.apply(this, args);
      }).catch(function(e2) {
        const callback2 = args.pop();
        callback2(e2);
      });
    }).bind(api);
  }
  function fetchJSON(url, options, callback2) {
    const result4 = {};
    options = options || {};
    options.headers = options.headers || new h();
    if (!options.headers.get("Content-Type")) {
      options.headers.set("Content-Type", "application/json");
    }
    if (!options.headers.get("Accept")) {
      options.headers.set("Accept", "application/json");
    }
    return ourFetch(url, options).then(function(response) {
      result4.ok = response.ok;
      result4.status = response.status;
      return response.json();
    }).then(function(json) {
      result4.data = json;
      if (!result4.ok) {
        result4.data.status = result4.status;
        const err = generateErrorFromResponse(result4.data);
        if (callback2) {
          return callback2(err);
        } else {
          throw err;
        }
      }
      if (Array.isArray(result4.data)) {
        result4.data = result4.data.map(function(v2) {
          if (v2.error || v2.missing) {
            return generateErrorFromResponse(v2);
          } else {
            return v2;
          }
        });
      }
      if (callback2) {
        callback2(null, result4.data);
      } else {
        return result4;
      }
    });
  }
  let setupPromise;
  function setup2() {
    if (opts.skip_setup) {
      return Promise.resolve();
    }
    if (setupPromise) {
      return setupPromise;
    }
    setupPromise = fetchJSON(dbUrl).catch((err) => {
      if (err && err.status && err.status === 404) {
        explainError(404, "PouchDB is just detecting if the remote exists.");
        return fetchJSON(dbUrl, { method: "PUT" });
      } else {
        return Promise.reject(err);
      }
    }).catch((err) => {
      if (err && err.status && err.status === 412) {
        return true;
      }
      return Promise.reject(err);
    });
    setupPromise.catch(() => {
      setupPromise = null;
    });
    return setupPromise;
  }
  immediate$1(function() {
    callback(null, api);
  });
  api._remote = true;
  api.type = function() {
    return "http";
  };
  let pendingDbId;
  api.id = adapterFun$$1("id", (callback2) => {
    if (pendingDbId) {
      pendingDbId.then(() => {
        callback2(null, dbId);
      });
    } else if (dbId) {
      callback2(null, dbId);
    } else {
      pendingDbId = ourFetch(genUrl(host, "")).then((res) => res.json()).catch(() => ({})).then((result4) => {
        dbId = result4 && result4.uuid ? result4.uuid + host.db : dbUrl;
        pendingDbId = null;
        callback2(null, dbId);
      });
    }
  });
  api.compact = adapterFun$$1("compact", function(opts2, callback2) {
    if (typeof opts2 === "function") {
      callback2 = opts2;
      opts2 = {};
    }
    opts2 = clone(opts2);
    fetchJSON(genDBUrl(host, "_compact"), { method: "POST" }).then(function() {
      function ping() {
        api.info(function(err, res) {
          if (res && !res.compact_running) {
            callback2(null, { ok: true });
          } else {
            setTimeout(ping, opts2.interval || 200);
          }
        });
      }
      ping();
    });
  });
  api.bulkGet = adapterFun("bulkGet", function(opts2, callback2) {
    const self2 = this;
    function doBulkGet(cb) {
      const params = {};
      if (opts2.revs) {
        params.revs = true;
      }
      if (opts2.attachments) {
        params.attachments = true;
      }
      if (opts2.latest) {
        params.latest = true;
      }
      fetchJSON(genDBUrl(host, "_bulk_get" + paramsToStr(params)), {
        method: "POST",
        body: JSON.stringify({ docs: opts2.docs })
      }).then(function(result4) {
        if (opts2.attachments && opts2.binary) {
          result4.data.results.forEach(function(res) {
            res.docs.forEach(readAttachmentsAsBlobOrBuffer);
          });
        }
        cb(null, result4.data);
      }).catch(cb);
    }
    function doBulkGetShim() {
      let batchSize = MAX_SIMULTANEOUS_REVS;
      let numBatches = Math.ceil(opts2.docs.length / batchSize);
      let numDone = 0;
      let results = new Array(numBatches);
      function onResult(batchNum) {
        return function(err, res) {
          results[batchNum] = res.results;
          if (++numDone === numBatches) {
            callback2(null, { results: flatten(results) });
          }
        };
      }
      for (let i3 = 0; i3 < numBatches; i3++) {
        const subOpts = pick(opts2, ["revs", "attachments", "binary", "latest"]);
        subOpts.docs = opts2.docs.slice(
          i3 * batchSize,
          Math.min(opts2.docs.length, (i3 + 1) * batchSize)
        );
        bulkGet(self2, subOpts, onResult(i3));
      }
    }
    const dbUrl2 = genUrl(host, "");
    const supportsBulkGet = supportsBulkGetMap[dbUrl2];
    if (typeof supportsBulkGet !== "boolean") {
      doBulkGet(function(err, res) {
        if (err) {
          supportsBulkGetMap[dbUrl2] = false;
          explainError(
            err.status,
            "PouchDB is just detecting if the remote supports the _bulk_get API."
          );
          doBulkGetShim();
        } else {
          supportsBulkGetMap[dbUrl2] = true;
          callback2(null, res);
        }
      });
    } else if (supportsBulkGet) {
      doBulkGet(callback2);
    } else {
      doBulkGetShim();
    }
  });
  api._info = function(callback2) {
    setup2().then(function() {
      return ourFetch(genDBUrl(host, ""));
    }).then(function(response) {
      return response.json();
    }).then(function(info2) {
      info2.host = genDBUrl(host, "");
      callback2(null, info2);
    }).catch(callback2);
  };
  api.fetch = function(path, options) {
    return setup2().then(function() {
      let url = path.substring(0, 1) === "/" ? genUrl(host, path.substring(1)) : genDBUrl(host, path);
      return ourFetch(url, options);
    });
  };
  api.get = adapterFun$$1("get", function(id, opts2, callback2) {
    if (typeof opts2 === "function") {
      callback2 = opts2;
      opts2 = {};
    }
    opts2 = clone(opts2);
    const params = {};
    if (opts2.revs) {
      params.revs = true;
    }
    if (opts2.revs_info) {
      params.revs_info = true;
    }
    if (opts2.latest) {
      params.latest = true;
    }
    if (opts2.open_revs) {
      if (opts2.open_revs !== "all") {
        opts2.open_revs = JSON.stringify(opts2.open_revs);
      }
      params.open_revs = opts2.open_revs;
    }
    if (opts2.rev) {
      params.rev = opts2.rev;
    }
    if (opts2.conflicts) {
      params.conflicts = opts2.conflicts;
    }
    if (opts2.update_seq) {
      params.update_seq = opts2.update_seq;
    }
    id = encodeDocId(id);
    function fetchAttachments(doc) {
      const atts = doc._attachments;
      const filenames = atts && Object.keys(atts);
      if (!atts || !filenames.length) {
        return;
      }
      function fetchData(filename) {
        const att = atts[filename];
        const path = encodeDocId(doc._id) + "/" + encodeAttachmentId(filename) + "?rev=" + doc._rev;
        return ourFetch(genDBUrl(host, path)).then(function(response) {
          if ("buffer" in response) {
            return response.buffer();
          } else {
            return response.blob();
          }
        }).then(function(blob) {
          if (opts2.binary) {
            const typeFieldDescriptor = Object.getOwnPropertyDescriptor(blob.__proto__, "type");
            if (!typeFieldDescriptor || typeFieldDescriptor.set) {
              blob.type = att.content_type;
            }
            return blob;
          }
          return new Promise(function(resolve) {
            blobToBase64(blob, resolve);
          });
        }).then(function(data) {
          delete att.stub;
          delete att.length;
          att.data = data;
        });
      }
      const promiseFactories = filenames.map(function(filename) {
        return function() {
          return fetchData(filename);
        };
      });
      return pool(promiseFactories, 5);
    }
    function fetchAllAttachments(docOrDocs) {
      if (Array.isArray(docOrDocs)) {
        return Promise.all(docOrDocs.map(function(doc) {
          if (doc.ok) {
            return fetchAttachments(doc.ok);
          }
        }));
      }
      return fetchAttachments(docOrDocs);
    }
    const url = genDBUrl(host, id + paramsToStr(params));
    fetchJSON(url).then(function(res) {
      return Promise.resolve().then(function() {
        if (opts2.attachments) {
          return fetchAllAttachments(res.data);
        }
      }).then(function() {
        callback2(null, res.data);
      });
    }).catch(function(e2) {
      e2.docId = id;
      callback2(e2);
    });
  });
  api.remove = adapterFun$$1("remove", function(docOrId, optsOrRev, opts2, cb) {
    let doc;
    if (typeof optsOrRev === "string") {
      doc = {
        _id: docOrId,
        _rev: optsOrRev
      };
      if (typeof opts2 === "function") {
        cb = opts2;
        opts2 = {};
      }
    } else {
      doc = docOrId;
      if (typeof optsOrRev === "function") {
        cb = optsOrRev;
        opts2 = {};
      } else {
        cb = opts2;
        opts2 = optsOrRev;
      }
    }
    const rev = doc._rev || opts2.rev;
    const url = genDBUrl(host, encodeDocId(doc._id)) + "?rev=" + rev;
    fetchJSON(url, { method: "DELETE" }, cb).catch(cb);
  });
  function encodeAttachmentId(attachmentId) {
    return attachmentId.split("/").map(encodeURIComponent).join("/");
  }
  api.getAttachment = adapterFun$$1("getAttachment", function(docId, attachmentId, opts2, callback2) {
    if (typeof opts2 === "function") {
      callback2 = opts2;
      opts2 = {};
    }
    const params = opts2.rev ? "?rev=" + opts2.rev : "";
    const url = genDBUrl(host, encodeDocId(docId)) + "/" + encodeAttachmentId(attachmentId) + params;
    let contentType;
    ourFetch(url, { method: "GET" }).then(function(response) {
      contentType = response.headers.get("content-type");
      if (!response.ok) {
        throw response;
      } else {
        if (typeof process !== "undefined" && !process.browser && typeof response.buffer === "function") {
          return response.buffer();
        } else {
          return response.blob();
        }
      }
    }).then(function(blob) {
      if (typeof process !== "undefined" && !process.browser) {
        const typeFieldDescriptor = Object.getOwnPropertyDescriptor(blob.__proto__, "type");
        if (!typeFieldDescriptor || typeFieldDescriptor.set) {
          blob.type = contentType;
        }
      }
      callback2(null, blob);
    }).catch(function(err) {
      callback2(err);
    });
  });
  api.removeAttachment = adapterFun$$1("removeAttachment", function(docId, attachmentId, rev, callback2) {
    const url = genDBUrl(host, encodeDocId(docId) + "/" + encodeAttachmentId(attachmentId)) + "?rev=" + rev;
    fetchJSON(url, { method: "DELETE" }, callback2).catch(callback2);
  });
  api.putAttachment = adapterFun$$1("putAttachment", function(docId, attachmentId, rev, blob, type, callback2) {
    if (typeof type === "function") {
      callback2 = type;
      type = blob;
      blob = rev;
      rev = null;
    }
    const id = encodeDocId(docId) + "/" + encodeAttachmentId(attachmentId);
    let url = genDBUrl(host, id);
    if (rev) {
      url += "?rev=" + rev;
    }
    if (typeof blob === "string") {
      let binary;
      try {
        binary = thisAtob(blob);
      } catch (err) {
        return callback2(createError(
          BAD_ARG,
          "Attachment is not a valid base64 string"
        ));
      }
      blob = binary ? binStringToBluffer(binary, type) : "";
    }
    fetchJSON(url, {
      headers: new h({ "Content-Type": type }),
      method: "PUT",
      body: blob
    }, callback2).catch(callback2);
  });
  api._bulkDocs = function(req2, opts2, callback2) {
    req2.new_edits = opts2.new_edits;
    setup2().then(function() {
      return Promise.all(req2.docs.map(preprocessAttachments$1));
    }).then(function() {
      return fetchJSON(genDBUrl(host, "_bulk_docs"), {
        method: "POST",
        body: JSON.stringify(req2)
      }, callback2);
    }).catch(callback2);
  };
  api._put = function(doc, opts2, callback2) {
    setup2().then(function() {
      return preprocessAttachments$1(doc);
    }).then(function() {
      return fetchJSON(genDBUrl(host, encodeDocId(doc._id)), {
        method: "PUT",
        body: JSON.stringify(doc)
      });
    }).then(function(result4) {
      callback2(null, result4.data);
    }).catch(function(err) {
      err.docId = doc && doc._id;
      callback2(err);
    });
  };
  api.allDocs = adapterFun$$1("allDocs", function(opts2, callback2) {
    if (typeof opts2 === "function") {
      callback2 = opts2;
      opts2 = {};
    }
    opts2 = clone(opts2);
    const params = {};
    let body;
    let method = "GET";
    if (opts2.conflicts) {
      params.conflicts = true;
    }
    if (opts2.update_seq) {
      params.update_seq = true;
    }
    if (opts2.descending) {
      params.descending = true;
    }
    if (opts2.include_docs) {
      params.include_docs = true;
    }
    if (opts2.attachments) {
      params.attachments = true;
    }
    if (opts2.key) {
      params.key = JSON.stringify(opts2.key);
    }
    if (opts2.start_key) {
      opts2.startkey = opts2.start_key;
    }
    if (opts2.startkey) {
      params.startkey = JSON.stringify(opts2.startkey);
    }
    if (opts2.end_key) {
      opts2.endkey = opts2.end_key;
    }
    if (opts2.endkey) {
      params.endkey = JSON.stringify(opts2.endkey);
    }
    if (typeof opts2.inclusive_end !== "undefined") {
      params.inclusive_end = !!opts2.inclusive_end;
    }
    if (typeof opts2.limit !== "undefined") {
      params.limit = opts2.limit;
    }
    if (typeof opts2.skip !== "undefined") {
      params.skip = opts2.skip;
    }
    const paramStr = paramsToStr(params);
    if (typeof opts2.keys !== "undefined") {
      method = "POST";
      body = { keys: opts2.keys };
    }
    fetchJSON(genDBUrl(host, "_all_docs" + paramStr), {
      method,
      body: JSON.stringify(body)
    }).then(function(result4) {
      if (opts2.include_docs && opts2.attachments && opts2.binary) {
        result4.data.rows.forEach(readAttachmentsAsBlobOrBuffer);
      }
      callback2(null, result4.data);
    }).catch(callback2);
  });
  api._changes = function(opts2) {
    const batchSize = "batch_size" in opts2 ? opts2.batch_size : CHANGES_BATCH_SIZE;
    opts2 = clone(opts2);
    if (opts2.continuous && !("heartbeat" in opts2)) {
      opts2.heartbeat = DEFAULT_HEARTBEAT;
    }
    let requestTimeout = "timeout" in opts2 ? opts2.timeout : 30 * 1e3;
    if ("timeout" in opts2 && opts2.timeout && requestTimeout - opts2.timeout < CHANGES_TIMEOUT_BUFFER) {
      requestTimeout = opts2.timeout + CHANGES_TIMEOUT_BUFFER;
    }
    if ("heartbeat" in opts2 && opts2.heartbeat && requestTimeout - opts2.heartbeat < CHANGES_TIMEOUT_BUFFER) {
      requestTimeout = opts2.heartbeat + CHANGES_TIMEOUT_BUFFER;
    }
    const params = {};
    if ("timeout" in opts2 && opts2.timeout) {
      params.timeout = opts2.timeout;
    }
    const limit = typeof opts2.limit !== "undefined" ? opts2.limit : false;
    let leftToFetch = limit;
    if (opts2.style) {
      params.style = opts2.style;
    }
    if (opts2.include_docs || opts2.filter && typeof opts2.filter === "function") {
      params.include_docs = true;
    }
    if (opts2.attachments) {
      params.attachments = true;
    }
    if (opts2.continuous) {
      if (opts2.sse && typeof EventSource === "undefined") {
        console.error("option sse but EventSource is undefined, maybe you need to polyfill");
      }
      params.feed = opts2.sse ? "eventsource" : "longpoll";
    }
    if (opts2.seq_interval) {
      params.seq_interval = opts2.seq_interval;
    }
    if (opts2.conflicts) {
      params.conflicts = true;
    }
    if (opts2.descending) {
      params.descending = true;
    }
    if (opts2.update_seq) {
      params.update_seq = true;
    }
    if ("heartbeat" in opts2) {
      if (opts2.heartbeat) {
        params.heartbeat = opts2.heartbeat;
      }
    }
    if (opts2.filter && typeof opts2.filter === "string") {
      params.filter = opts2.filter;
    }
    if (opts2.view && typeof opts2.view === "string") {
      params.filter = "_view";
      params.view = opts2.view;
    }
    if (opts2.query_params && typeof opts2.query_params === "object") {
      for (const param_name in opts2.query_params) {
        if (Object.prototype.hasOwnProperty.call(opts2.query_params, param_name)) {
          params[param_name] = opts2.query_params[param_name];
        }
      }
    }
    let method = "GET";
    let body;
    if (opts2.doc_ids) {
      params.filter = "_doc_ids";
      method = "POST";
      body = { doc_ids: opts2.doc_ids };
    } else if (opts2.selector) {
      params.filter = "_selector";
      method = "POST";
      body = { selector: opts2.selector };
    }
    const controller = new a();
    let lastFetchedSeq;
    const fetchData = function(since, callback2) {
      if (opts2.aborted) {
        return;
      }
      params.since = since;
      if (typeof params.since === "object") {
        params.since = JSON.stringify(params.since);
      }
      if (opts2.descending) {
        if (limit) {
          params.limit = leftToFetch;
        }
      } else {
        params.limit = !limit || leftToFetch > batchSize ? batchSize : leftToFetch;
      }
      const url = genDBUrl(host, "_changes" + paramsToStr(params));
      const fetchOpts = {
        signal: controller.signal,
        method,
        body: JSON.stringify(body)
      };
      lastFetchedSeq = since;
      if (opts2.aborted) {
        return;
      }
      if (opts2.continuous && opts2.sse) {
        setup2().then(function() {
          const changes3 = new EventSource(url, { withCredentials: true });
          sse.add(changes3);
          let connectionLost = false;
          function setupTimeout() {
            return setTimeout(() => {
              if (!connectionLost) {
                connectionLost = true;
                console.warn("db connection lost!", { online: navigator.onLine, changes: changes3, sse });
              }
              hbTimeout = setupTimeout();
            }, opts2.heartbeat * 2);
          }
          let hbTimeout = setupTimeout();
          function resetTimer() {
            clearTimeout(hbTimeout);
            hbTimeout = setupTimeout();
            if (connectionLost) {
              connectionLost = false;
              console.info("db connection resumed!", { online: navigator.onLine, changes: changes3, sse });
            }
          }
          changes3.addEventListener("heartbeat", resetTimer);
          changes3.addEventListener("error", callback2);
          changes3.addEventListener("message", (e2) => {
            resetTimer();
            const change = JSON.parse(e2.data);
            callback2(null, { results: [change], last_seq: change.seq });
          });
          fetchOpts.signal.addEventListener("abort", () => {
            sse.delete(changes3);
            clearTimeout(hbTimeout);
            changes3.close();
          });
        }).catch(callback2);
      } else {
        setup2().then(function() {
          return fetchJSON(url, fetchOpts, callback2);
        }).catch(callback2);
      }
    };
    const results = { results: [] };
    const fetched = function(err, res) {
      if (opts2.aborted) {
        return;
      }
      let raw_results_length = 0;
      if (res && res.results) {
        raw_results_length = res.results.length;
        results.last_seq = res.last_seq;
        let pending = null;
        let lastSeq = null;
        if (typeof res.pending === "number") {
          pending = res.pending;
        }
        if (typeof results.last_seq === "string" || typeof results.last_seq === "number") {
          lastSeq = results.last_seq;
        }
        opts2.query_params;
        res.results = res.results.filter(function(c) {
          leftToFetch--;
          const ret = filterChange(opts2)(c);
          if (ret) {
            if (opts2.include_docs && opts2.attachments && opts2.binary) {
              readAttachmentsAsBlobOrBuffer(c);
            }
            if (opts2.return_docs) {
              results.results.push(c);
            }
            opts2.onChange(c, pending, lastSeq);
          }
          return ret;
        });
      } else if (err) {
        opts2.aborted = true;
        opts2.complete(err);
        return;
      }
      if (res && res.last_seq) {
        lastFetchedSeq = res.last_seq;
      }
      const finished = limit && leftToFetch <= 0 || res && raw_results_length < batchSize || opts2.descending;
      if (opts2.continuous && opts2.sse && !(limit && leftToFetch <= 0) || !finished)
        ;
      else if (opts2.continuous && !(limit && leftToFetch <= 0) || !finished) {
        immediate$1(function() {
          fetchData(lastFetchedSeq, fetched);
        });
      } else {
        opts2.complete(null, results);
      }
    };
    fetchData(opts2.since || 0, fetched);
    return {
      cancel: function() {
        opts2.aborted = true;
        controller.abort();
      }
    };
  };
  api.revsDiff = adapterFun$$1("revsDiff", function(req2, opts2, callback2) {
    if (typeof opts2 === "function") {
      callback2 = opts2;
      opts2 = {};
    }
    fetchJSON(genDBUrl(host, "_revs_diff"), {
      method: "POST",
      body: JSON.stringify(req2)
    }, callback2).catch(callback2);
  });
  api._close = function(callback2) {
    callback2();
  };
  api._destroy = function(options, callback2) {
    fetchJSON(genDBUrl(host, ""), { method: "DELETE" }).then(function(json) {
      callback2(null, json);
    }).catch(function(err) {
      if (err.status === 404) {
        callback2(null, { ok: true });
      } else {
        callback2(err);
      }
    });
  };
}
HttpPouch.valid = function() {
  return true;
};
function HttpPouch$1(PouchDB2) {
  PouchDB2.adapter("http", HttpPouch, false);
  PouchDB2.adapter("https", HttpPouch, false);
}
var QueryParseError = class _QueryParseError extends Error {
  constructor(message) {
    super();
    this.status = 400;
    this.name = "query_parse_error";
    this.message = message;
    this.error = true;
    try {
      Error.captureStackTrace(this, _QueryParseError);
    } catch (e2) {
    }
  }
};
var NotFoundError = class _NotFoundError extends Error {
  constructor(message) {
    super();
    this.status = 404;
    this.name = "not_found";
    this.message = message;
    this.error = true;
    try {
      Error.captureStackTrace(this, _NotFoundError);
    } catch (e2) {
    }
  }
};
var BuiltInError = class _BuiltInError extends Error {
  constructor(message) {
    super();
    this.status = 500;
    this.name = "invalid_value";
    this.message = message;
    this.error = true;
    try {
      Error.captureStackTrace(this, _BuiltInError);
    } catch (e2) {
    }
  }
};
function promisedCallback(promise, callback) {
  if (callback) {
    promise.then(function(res) {
      immediate$1(function() {
        callback(null, res);
      });
    }, function(reason) {
      immediate$1(function() {
        callback(reason);
      });
    });
  }
  return promise;
}
function callbackify(fun) {
  return function(...args) {
    var cb = args.pop();
    var promise = fun.apply(this, args);
    if (typeof cb === "function") {
      promisedCallback(promise, cb);
    }
    return promise;
  };
}
function fin(promise, finalPromiseFactory) {
  return promise.then(function(res) {
    return finalPromiseFactory().then(function() {
      return res;
    });
  }, function(reason) {
    return finalPromiseFactory().then(function() {
      throw reason;
    });
  });
}
function sequentialize(queue3, promiseFactory) {
  return function() {
    var args = arguments;
    var that = this;
    return queue3.add(function() {
      return promiseFactory.apply(that, args);
    });
  };
}
function uniq(arr) {
  var theSet = new ExportedSet(arr);
  var result4 = new Array(theSet.size);
  var index2 = -1;
  theSet.forEach(function(value) {
    result4[++index2] = value;
  });
  return result4;
}
function mapToKeysArray(map2) {
  var result4 = new Array(map2.size);
  var index2 = -1;
  map2.forEach(function(value, key) {
    result4[++index2] = key;
  });
  return result4;
}
function createBuiltInError(name) {
  var message = "builtin " + name + " function requires map values to be numbers or number arrays";
  return new BuiltInError(message);
}
function sum(values) {
  var result4 = 0;
  for (var i3 = 0, len2 = values.length; i3 < len2; i3++) {
    var num = values[i3];
    if (typeof num !== "number") {
      if (Array.isArray(num)) {
        result4 = typeof result4 === "number" ? [result4] : result4;
        for (var j = 0, jLen = num.length; j < jLen; j++) {
          var jNum = num[j];
          if (typeof jNum !== "number") {
            throw createBuiltInError("_sum");
          } else if (typeof result4[j] === "undefined") {
            result4.push(jNum);
          } else {
            result4[j] += jNum;
          }
        }
      } else {
        throw createBuiltInError("_sum");
      }
    } else if (typeof result4 === "number") {
      result4 += num;
    } else {
      result4[0] += num;
    }
  }
  return result4;
}
var log = guardedConsole.bind(null, "log");
var isArray = Array.isArray;
var toJSON = JSON.parse;
function evalFunctionWithEval(func, emit2) {
  return scopeEval(
    "return (" + func.replace(/;\s*$/, "") + ");",
    {
      emit: emit2,
      sum,
      log,
      isArray,
      toJSON
    }
  );
}
var TaskQueue$1 = class {
  constructor() {
    this.promise = new Promise(function(fulfill) {
      fulfill();
    });
  }
  add(promiseFactory) {
    this.promise = this.promise.catch(function() {
    }).then(function() {
      return promiseFactory();
    });
    return this.promise;
  }
  finish() {
    return this.promise;
  }
};
function stringify(input) {
  if (!input) {
    return "undefined";
  }
  switch (typeof input) {
    case "function":
      return input.toString();
    case "string":
      return input.toString();
    default:
      return JSON.stringify(input);
  }
}
function createViewSignature(mapFun, reduceFun) {
  return stringify(mapFun) + stringify(reduceFun) + "undefined";
}
async function createView(sourceDB, viewName, mapFun, reduceFun, temporary, localDocName2) {
  const viewSignature = createViewSignature(mapFun, reduceFun);
  let cachedViews;
  if (!temporary) {
    cachedViews = sourceDB._cachedViews = sourceDB._cachedViews || {};
    if (cachedViews[viewSignature]) {
      return cachedViews[viewSignature];
    }
  }
  const promiseForView = sourceDB.info().then(async function(info2) {
    const depDbName = info2.db_name + "-mrview-" + (temporary ? "temp" : stringMd5(viewSignature));
    function diffFunction(doc) {
      doc.views = doc.views || {};
      let fullViewName = viewName;
      if (fullViewName.indexOf("/") === -1) {
        fullViewName = viewName + "/" + viewName;
      }
      const depDbs = doc.views[fullViewName] = doc.views[fullViewName] || {};
      if (depDbs[depDbName]) {
        return;
      }
      depDbs[depDbName] = true;
      return doc;
    }
    await upsert(sourceDB, "_local/" + localDocName2, diffFunction);
    const res = await sourceDB.registerDependentDatabase(depDbName);
    const db = res.db;
    db.auto_compaction = true;
    const view = {
      name: depDbName,
      db,
      sourceDB,
      adapter: sourceDB.adapter,
      mapFun,
      reduceFun
    };
    let lastSeqDoc;
    try {
      lastSeqDoc = await view.db.get("_local/lastSeq");
    } catch (err) {
      if (err.status !== 404) {
        throw err;
      }
    }
    view.seq = lastSeqDoc ? lastSeqDoc.seq : 0;
    if (cachedViews) {
      view.db.once("destroyed", function() {
        delete cachedViews[viewSignature];
      });
    }
    return view;
  });
  if (cachedViews) {
    cachedViews[viewSignature] = promiseForView;
  }
  return promiseForView;
}
var persistentQueues = {};
var tempViewQueue = new TaskQueue$1();
var CHANGES_BATCH_SIZE$1 = 50;
function parseViewName(name) {
  return name.indexOf("/") === -1 ? [name, name] : name.split("/");
}
function isGenOne(changes3) {
  return changes3.length === 1 && /^1-/.test(changes3[0].rev);
}
function emitError(db, e2, data) {
  try {
    db.emit("error", e2);
  } catch (err) {
    guardedConsole(
      "error",
      "The user's map/reduce function threw an uncaught error.\nYou can debug this error by doing:\nmyDatabase.on('error', function (err) { debugger; });\nPlease double-check your map/reduce function."
    );
    guardedConsole("error", e2, data);
  }
}
function createAbstractMapReduce(localDocName2, mapper2, reducer2, ddocValidator2) {
  function tryMap(db, fun, doc) {
    try {
      fun(doc);
    } catch (e2) {
      emitError(db, e2, { fun, doc });
    }
  }
  function tryReduce(db, fun, keys2, values, rereduce) {
    try {
      return { output: fun(keys2, values, rereduce) };
    } catch (e2) {
      emitError(db, e2, { fun, keys: keys2, values, rereduce });
      return { error: e2 };
    }
  }
  function sortByKeyThenValue(x, y) {
    const keyCompare = collate(x.key, y.key);
    return keyCompare !== 0 ? keyCompare : collate(x.value, y.value);
  }
  function sliceResults(results, limit, skip) {
    skip = skip || 0;
    if (typeof limit === "number") {
      return results.slice(skip, limit + skip);
    } else if (skip > 0) {
      return results.slice(skip);
    }
    return results;
  }
  function rowToDocId(row) {
    const val = row.value;
    const docId = val && typeof val === "object" && val._id || row.id;
    return docId;
  }
  function readAttachmentsAsBlobOrBuffer2(res) {
    res.rows.forEach(function(row) {
      const atts = row.doc && row.doc._attachments;
      if (!atts) {
        return;
      }
      Object.keys(atts).forEach(function(filename) {
        const att = atts[filename];
        atts[filename].data = b64ToBluffer(att.data, att.content_type);
      });
    });
  }
  function postprocessAttachments(opts) {
    return function(res) {
      if (opts.include_docs && opts.attachments && opts.binary) {
        readAttachmentsAsBlobOrBuffer2(res);
      }
      return res;
    };
  }
  function addHttpParam(paramName, opts, params, asJson) {
    let val = opts[paramName];
    if (typeof val !== "undefined") {
      if (asJson) {
        val = encodeURIComponent(JSON.stringify(val));
      }
      params.push(paramName + "=" + val);
    }
  }
  function coerceInteger(integerCandidate) {
    if (typeof integerCandidate !== "undefined") {
      const asNumber = Number(integerCandidate);
      if (!isNaN(asNumber) && asNumber === parseInt(integerCandidate, 10)) {
        return asNumber;
      } else {
        return integerCandidate;
      }
    }
  }
  function coerceOptions(opts) {
    opts.group_level = coerceInteger(opts.group_level);
    opts.limit = coerceInteger(opts.limit);
    opts.skip = coerceInteger(opts.skip);
    return opts;
  }
  function checkPositiveInteger(number) {
    if (number) {
      if (typeof number !== "number") {
        return new QueryParseError(`Invalid value for integer: "${number}"`);
      }
      if (number < 0) {
        return new QueryParseError(`Invalid value for positive integer: "${number}"`);
      }
    }
  }
  function checkQueryParseError(options, fun) {
    const startkeyName = options.descending ? "endkey" : "startkey";
    const endkeyName = options.descending ? "startkey" : "endkey";
    if (typeof options[startkeyName] !== "undefined" && typeof options[endkeyName] !== "undefined" && collate(options[startkeyName], options[endkeyName]) > 0) {
      throw new QueryParseError("No rows can match your key range, reverse your start_key and end_key or set {descending : true}");
    } else if (fun.reduce && options.reduce !== false) {
      if (options.include_docs) {
        throw new QueryParseError("{include_docs:true} is invalid for reduce");
      } else if (options.keys && options.keys.length > 1 && !options.group && !options.group_level) {
        throw new QueryParseError("Multi-key fetches for reduce views must use {group: true}");
      }
    }
    ["group_level", "limit", "skip"].forEach(function(optionName) {
      const error3 = checkPositiveInteger(options[optionName]);
      if (error3) {
        throw error3;
      }
    });
  }
  async function httpQuery(db, fun, opts) {
    let params = [];
    let body;
    let method = "GET";
    let ok;
    addHttpParam("reduce", opts, params);
    addHttpParam("include_docs", opts, params);
    addHttpParam("attachments", opts, params);
    addHttpParam("limit", opts, params);
    addHttpParam("descending", opts, params);
    addHttpParam("group", opts, params);
    addHttpParam("group_level", opts, params);
    addHttpParam("skip", opts, params);
    addHttpParam("stale", opts, params);
    addHttpParam("conflicts", opts, params);
    addHttpParam("startkey", opts, params, true);
    addHttpParam("start_key", opts, params, true);
    addHttpParam("endkey", opts, params, true);
    addHttpParam("end_key", opts, params, true);
    addHttpParam("inclusive_end", opts, params);
    addHttpParam("key", opts, params, true);
    addHttpParam("update_seq", opts, params);
    addHttpParam("partition", opts, params);
    params = params.join("&");
    params = params === "" ? "" : "?" + params;
    if (typeof opts.keys !== "undefined") {
      const MAX_URL_LENGTH = 2e3;
      const keysAsString = `keys=${encodeURIComponent(JSON.stringify(opts.keys))}`;
      if (keysAsString.length + params.length + 1 <= MAX_URL_LENGTH) {
        params += (params[0] === "?" ? "&" : "?") + keysAsString;
      } else {
        method = "POST";
        if (typeof fun === "string") {
          body = { keys: opts.keys };
        } else {
          fun.keys = opts.keys;
        }
      }
    }
    if (typeof fun === "string") {
      const parts = parseViewName(fun);
      const response2 = await db.fetch("_design/" + parts[0] + "/_view/" + parts[1] + params, {
        headers: new h({ "Content-Type": "application/json" }),
        method,
        body: JSON.stringify(body)
      });
      ok = response2.ok;
      const result5 = await response2.json();
      if (!ok) {
        result5.status = response2.status;
        throw generateErrorFromResponse(result5);
      }
      result5.rows.forEach(function(row) {
        if (row.value && row.value.error && row.value.error === "builtin_reduce_error") {
          throw new Error(row.reason);
        }
      });
      return new Promise(function(resolve) {
        resolve(result5);
      }).then(postprocessAttachments(opts));
    }
    body = body || {};
    Object.keys(fun).forEach(function(key) {
      if (Array.isArray(fun[key])) {
        body[key] = fun[key];
      } else {
        body[key] = fun[key].toString();
      }
    });
    const response = await db.fetch("_temp_view" + params, {
      headers: new h({ "Content-Type": "application/json" }),
      method: "POST",
      body: JSON.stringify(body)
    });
    ok = response.ok;
    const result4 = await response.json();
    if (!ok) {
      result4.status = response.status;
      throw generateErrorFromResponse(result4);
    }
    return new Promise(function(resolve) {
      resolve(result4);
    }).then(postprocessAttachments(opts));
  }
  function customQuery(db, fun, opts) {
    return new Promise(function(resolve, reject) {
      db._query(fun, opts, function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
  }
  function customViewCleanup(db) {
    return new Promise(function(resolve, reject) {
      db._viewCleanup(function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
  }
  function defaultsTo(value) {
    return function(reason) {
      if (reason.status === 404) {
        return value;
      } else {
        throw reason;
      }
    };
  }
  async function getDocsToPersist(docId, view, docIdsToChangesAndEmits) {
    const metaDocId = "_local/doc_" + docId;
    const defaultMetaDoc = { _id: metaDocId, keys: [] };
    const docData = docIdsToChangesAndEmits.get(docId);
    const indexableKeysToKeyValues = docData[0];
    const changes3 = docData[1];
    function getMetaDoc() {
      if (isGenOne(changes3)) {
        return Promise.resolve(defaultMetaDoc);
      }
      return view.db.get(metaDocId).catch(defaultsTo(defaultMetaDoc));
    }
    function getKeyValueDocs(metaDoc2) {
      if (!metaDoc2.keys.length) {
        return Promise.resolve({ rows: [] });
      }
      return view.db.allDocs({
        keys: metaDoc2.keys,
        include_docs: true
      });
    }
    function processKeyValueDocs(metaDoc2, kvDocsRes) {
      const kvDocs = [];
      const oldKeys = new ExportedSet();
      for (let i3 = 0, len2 = kvDocsRes.rows.length; i3 < len2; i3++) {
        const row = kvDocsRes.rows[i3];
        const doc = row.doc;
        if (!doc) {
          continue;
        }
        kvDocs.push(doc);
        oldKeys.add(doc._id);
        doc._deleted = !indexableKeysToKeyValues.has(doc._id);
        if (!doc._deleted) {
          const keyValue = indexableKeysToKeyValues.get(doc._id);
          if ("value" in keyValue) {
            doc.value = keyValue.value;
          }
        }
      }
      const newKeys = mapToKeysArray(indexableKeysToKeyValues);
      newKeys.forEach(function(key) {
        if (!oldKeys.has(key)) {
          const kvDoc = {
            _id: key
          };
          const keyValue = indexableKeysToKeyValues.get(key);
          if ("value" in keyValue) {
            kvDoc.value = keyValue.value;
          }
          kvDocs.push(kvDoc);
        }
      });
      metaDoc2.keys = uniq(newKeys.concat(metaDoc2.keys));
      kvDocs.push(metaDoc2);
      return kvDocs;
    }
    const metaDoc = await getMetaDoc();
    const keyValueDocs = await getKeyValueDocs(metaDoc);
    return processKeyValueDocs(metaDoc, keyValueDocs);
  }
  function updatePurgeSeq(view) {
    return view.sourceDB.get("_local/purges").then(function(res) {
      const purgeSeq = res.purgeSeq;
      return view.db.get("_local/purgeSeq").then(function(res2) {
        return res2._rev;
      }).catch(function(err) {
        if (err.status !== 404) {
          throw err;
        }
        return void 0;
      }).then(function(rev) {
        return view.db.put({
          _id: "_local/purgeSeq",
          _rev: rev,
          purgeSeq
        });
      });
    }).catch(function(err) {
      if (err.status !== 404) {
        throw err;
      }
    });
  }
  function saveKeyValues(view, docIdsToChangesAndEmits, seq) {
    var seqDocId = "_local/lastSeq";
    return view.db.get(seqDocId).catch(defaultsTo({ _id: seqDocId, seq: 0 })).then(function(lastSeqDoc) {
      var docIds = mapToKeysArray(docIdsToChangesAndEmits);
      return Promise.all(docIds.map(function(docId) {
        return getDocsToPersist(docId, view, docIdsToChangesAndEmits);
      })).then(function(listOfDocsToPersist) {
        var docsToPersist = flatten(listOfDocsToPersist);
        lastSeqDoc.seq = seq;
        docsToPersist.push(lastSeqDoc);
        return view.db.bulkDocs({ docs: docsToPersist });
      }).then(() => updatePurgeSeq(view));
    });
  }
  function getQueue(view) {
    const viewName = typeof view === "string" ? view : view.name;
    let queue3 = persistentQueues[viewName];
    if (!queue3) {
      queue3 = persistentQueues[viewName] = new TaskQueue$1();
    }
    return queue3;
  }
  async function updateView(view, opts) {
    return sequentialize(getQueue(view), function() {
      return updateViewInQueue(view, opts);
    })();
  }
  async function updateViewInQueue(view, opts) {
    let mapResults;
    let doc;
    let taskId;
    function emit2(key, value) {
      const output = { id: doc._id, key: normalizeKey(key) };
      if (typeof value !== "undefined" && value !== null) {
        output.value = normalizeKey(value);
      }
      mapResults.push(output);
    }
    const mapFun = mapper2(view.mapFun, emit2);
    let currentSeq = view.seq || 0;
    function createTask() {
      return view.sourceDB.info().then(function(info2) {
        taskId = view.sourceDB.activeTasks.add({
          name: "view_indexing",
          total_items: info2.update_seq - currentSeq
        });
      });
    }
    function processChange2(docIdsToChangesAndEmits, seq) {
      return function() {
        return saveKeyValues(view, docIdsToChangesAndEmits, seq);
      };
    }
    let indexed_docs = 0;
    const progress = {
      view: view.name,
      indexed_docs
    };
    view.sourceDB.emit("indexing", progress);
    const queue3 = new TaskQueue$1();
    async function processNextBatch() {
      const response = await view.sourceDB.changes({
        return_docs: true,
        conflicts: true,
        include_docs: true,
        style: "all_docs",
        since: currentSeq,
        limit: opts.changes_batch_size
      });
      const purges = await getRecentPurges();
      return processBatch(response, purges);
    }
    function getRecentPurges() {
      return view.db.get("_local/purgeSeq").then(function(res) {
        return res.purgeSeq;
      }).catch(function(err) {
        if (err && err.status !== 404) {
          throw err;
        }
        return -1;
      }).then(function(purgeSeq) {
        return view.sourceDB.get("_local/purges").then(function(res) {
          const recentPurges = res.purges.filter(function(purge2, index2) {
            return index2 > purgeSeq;
          }).map((purge2) => purge2.docId);
          const uniquePurges = recentPurges.filter(function(docId, index2) {
            return recentPurges.indexOf(docId) === index2;
          });
          return Promise.all(uniquePurges.map(function(docId) {
            return view.sourceDB.get(docId).then(function(doc2) {
              return { docId, doc: doc2 };
            }).catch(function(err) {
              if (err.status !== 404) {
                throw err;
              }
              return { docId };
            });
          }));
        }).catch(function(err) {
          if (err && err.status !== 404) {
            throw err;
          }
          return [];
        });
      });
    }
    function processBatch(response, purges) {
      var results = response.results;
      if (!results.length && !purges.length) {
        return;
      }
      for (let purge2 of purges) {
        const index2 = results.findIndex(function(change) {
          return change.id === purge2.docId;
        });
        if (index2 < 0) {
          const entry = {
            _id: purge2.docId,
            doc: {
              _id: purge2.docId,
              _deleted: 1
            },
            changes: []
          };
          if (purge2.doc) {
            entry.doc = purge2.doc;
            entry.changes.push({ rev: purge2.doc._rev });
          }
          results.push(entry);
        }
      }
      var docIdsToChangesAndEmits = createDocIdsToChangesAndEmits(results);
      queue3.add(processChange2(docIdsToChangesAndEmits, currentSeq));
      indexed_docs = indexed_docs + results.length;
      const progress2 = {
        view: view.name,
        last_seq: response.last_seq,
        results_count: results.length,
        indexed_docs
      };
      view.sourceDB.emit("indexing", progress2);
      view.sourceDB.activeTasks.update(taskId, { completed_items: indexed_docs });
      if (results.length < opts.changes_batch_size) {
        return;
      }
      return processNextBatch();
    }
    function createDocIdsToChangesAndEmits(results) {
      const docIdsToChangesAndEmits = new ExportedMap();
      for (let i3 = 0, len2 = results.length; i3 < len2; i3++) {
        const change = results[i3];
        if (change.doc._id[0] !== "_") {
          mapResults = [];
          doc = change.doc;
          if (!doc._deleted) {
            tryMap(view.sourceDB, mapFun, doc);
          }
          mapResults.sort(sortByKeyThenValue);
          const indexableKeysToKeyValues = createIndexableKeysToKeyValues(mapResults);
          docIdsToChangesAndEmits.set(change.doc._id, [
            indexableKeysToKeyValues,
            change.changes
          ]);
        }
        currentSeq = change.seq;
      }
      return docIdsToChangesAndEmits;
    }
    function createIndexableKeysToKeyValues(mapResults2) {
      const indexableKeysToKeyValues = new ExportedMap();
      let lastKey;
      for (let i3 = 0, len2 = mapResults2.length; i3 < len2; i3++) {
        const emittedKeyValue = mapResults2[i3];
        const complexKey = [emittedKeyValue.key, emittedKeyValue.id];
        if (i3 > 0 && collate(emittedKeyValue.key, lastKey) === 0) {
          complexKey.push(i3);
        }
        indexableKeysToKeyValues.set(toIndexableString(complexKey), emittedKeyValue);
        lastKey = emittedKeyValue.key;
      }
      return indexableKeysToKeyValues;
    }
    try {
      await createTask();
      await processNextBatch();
      await queue3.finish();
      view.seq = currentSeq;
      view.sourceDB.activeTasks.remove(taskId);
    } catch (error3) {
      view.sourceDB.activeTasks.remove(taskId, error3);
    }
  }
  function reduceView(view, results, options) {
    if (options.group_level === 0) {
      delete options.group_level;
    }
    const shouldGroup = options.group || options.group_level;
    const reduceFun = reducer2(view.reduceFun);
    const groups = [];
    const lvl = isNaN(options.group_level) ? Number.POSITIVE_INFINITY : options.group_level;
    results.forEach(function(e2) {
      const last = groups[groups.length - 1];
      let groupKey = shouldGroup ? e2.key : null;
      if (shouldGroup && Array.isArray(groupKey)) {
        groupKey = groupKey.slice(0, lvl);
      }
      if (last && collate(last.groupKey, groupKey) === 0) {
        last.keys.push([e2.key, e2.id]);
        last.values.push(e2.value);
        return;
      }
      groups.push({
        keys: [[e2.key, e2.id]],
        values: [e2.value],
        groupKey
      });
    });
    results = [];
    for (let i3 = 0, len2 = groups.length; i3 < len2; i3++) {
      const e2 = groups[i3];
      const reduceTry = tryReduce(view.sourceDB, reduceFun, e2.keys, e2.values, false);
      if (reduceTry.error && reduceTry.error instanceof BuiltInError) {
        throw reduceTry.error;
      }
      results.push({
        // CouchDB just sets the value to null if a non-built-in errors out
        value: reduceTry.error ? null : reduceTry.output,
        key: e2.groupKey
      });
    }
    return { rows: sliceResults(results, options.limit, options.skip) };
  }
  function queryView(view, opts) {
    return sequentialize(getQueue(view), function() {
      return queryViewInQueue(view, opts);
    })();
  }
  async function queryViewInQueue(view, opts) {
    let totalRows;
    const shouldReduce = view.reduceFun && opts.reduce !== false;
    const skip = opts.skip || 0;
    if (typeof opts.keys !== "undefined" && !opts.keys.length) {
      opts.limit = 0;
      delete opts.keys;
    }
    async function fetchFromView(viewOpts) {
      viewOpts.include_docs = true;
      const res = await view.db.allDocs(viewOpts);
      totalRows = res.total_rows;
      return res.rows.map(function(result4) {
        if ("value" in result4.doc && typeof result4.doc.value === "object" && result4.doc.value !== null) {
          const keys2 = Object.keys(result4.doc.value).sort();
          const expectedKeys = ["id", "key", "value"];
          if (!(keys2 < expectedKeys || keys2 > expectedKeys)) {
            return result4.doc.value;
          }
        }
        const parsedKeyAndDocId = parseIndexableString(result4.doc._id);
        return {
          key: parsedKeyAndDocId[0],
          id: parsedKeyAndDocId[1],
          value: "value" in result4.doc ? result4.doc.value : null
        };
      });
    }
    async function onMapResultsReady(rows) {
      let finalResults;
      if (shouldReduce) {
        finalResults = reduceView(view, rows, opts);
      } else if (typeof opts.keys === "undefined") {
        finalResults = {
          total_rows: totalRows,
          offset: skip,
          rows
        };
      } else {
        finalResults = {
          total_rows: totalRows,
          offset: skip,
          rows: sliceResults(rows, opts.limit, opts.skip)
        };
      }
      if (opts.update_seq) {
        finalResults.update_seq = view.seq;
      }
      if (opts.include_docs) {
        const docIds = uniq(rows.map(rowToDocId));
        const allDocsRes = await view.sourceDB.allDocs({
          keys: docIds,
          include_docs: true,
          conflicts: opts.conflicts,
          attachments: opts.attachments,
          binary: opts.binary
        });
        var docIdsToDocs = new ExportedMap();
        allDocsRes.rows.forEach(function(row) {
          docIdsToDocs.set(row.id, row.doc);
        });
        rows.forEach(function(row) {
          var docId = rowToDocId(row);
          var doc = docIdsToDocs.get(docId);
          if (doc) {
            row.doc = doc;
          }
        });
        return finalResults;
      } else {
        return finalResults;
      }
    }
    if (typeof opts.keys !== "undefined") {
      const keys2 = opts.keys;
      const fetchPromises = keys2.map(function(key) {
        const viewOpts = {
          startkey: toIndexableString([key]),
          endkey: toIndexableString([key, {}])
        };
        if (opts.update_seq) {
          viewOpts.update_seq = true;
        }
        return fetchFromView(viewOpts);
      });
      const result4 = await Promise.all(fetchPromises);
      const flattenedResult = flatten(result4);
      return onMapResultsReady(flattenedResult);
    } else {
      const viewOpts = {
        descending: opts.descending
      };
      if (opts.update_seq) {
        viewOpts.update_seq = true;
      }
      let startkey;
      let endkey;
      if ("start_key" in opts) {
        startkey = opts.start_key;
      }
      if ("startkey" in opts) {
        startkey = opts.startkey;
      }
      if ("end_key" in opts) {
        endkey = opts.end_key;
      }
      if ("endkey" in opts) {
        endkey = opts.endkey;
      }
      if (typeof startkey !== "undefined") {
        viewOpts.startkey = opts.descending ? toIndexableString([startkey, {}]) : toIndexableString([startkey]);
      }
      if (typeof endkey !== "undefined") {
        let inclusiveEnd = opts.inclusive_end !== false;
        if (opts.descending) {
          inclusiveEnd = !inclusiveEnd;
        }
        viewOpts.endkey = toIndexableString(
          inclusiveEnd ? [endkey, {}] : [endkey]
        );
      }
      if (typeof opts.key !== "undefined") {
        const keyStart = toIndexableString([opts.key]);
        const keyEnd = toIndexableString([opts.key, {}]);
        if (viewOpts.descending) {
          viewOpts.endkey = keyStart;
          viewOpts.startkey = keyEnd;
        } else {
          viewOpts.startkey = keyStart;
          viewOpts.endkey = keyEnd;
        }
      }
      if (!shouldReduce) {
        if (typeof opts.limit === "number") {
          viewOpts.limit = opts.limit;
        }
        viewOpts.skip = skip;
      }
      const result4 = await fetchFromView(viewOpts);
      return onMapResultsReady(result4);
    }
  }
  async function httpViewCleanup(db) {
    const response = await db.fetch("_view_cleanup", {
      headers: new h({ "Content-Type": "application/json" }),
      method: "POST"
    });
    return response.json();
  }
  async function localViewCleanup(db) {
    try {
      const metaDoc = await db.get("_local/" + localDocName2);
      const docsToViews = new ExportedMap();
      Object.keys(metaDoc.views).forEach(function(fullViewName) {
        const parts = parseViewName(fullViewName);
        const designDocName = "_design/" + parts[0];
        const viewName = parts[1];
        let views = docsToViews.get(designDocName);
        if (!views) {
          views = new ExportedSet();
          docsToViews.set(designDocName, views);
        }
        views.add(viewName);
      });
      const opts = {
        keys: mapToKeysArray(docsToViews),
        include_docs: true
      };
      const res = await db.allDocs(opts);
      const viewsToStatus = {};
      res.rows.forEach(function(row) {
        const ddocName = row.key.substring(8);
        docsToViews.get(row.key).forEach(function(viewName) {
          let fullViewName = ddocName + "/" + viewName;
          if (!metaDoc.views[fullViewName]) {
            fullViewName = viewName;
          }
          const viewDBNames = Object.keys(metaDoc.views[fullViewName]);
          const statusIsGood = row.doc && row.doc.views && row.doc.views[viewName];
          viewDBNames.forEach(function(viewDBName) {
            viewsToStatus[viewDBName] = viewsToStatus[viewDBName] || statusIsGood;
          });
        });
      });
      const dbsToDelete = Object.keys(viewsToStatus).filter(function(viewDBName) {
        return !viewsToStatus[viewDBName];
      });
      const destroyPromises = dbsToDelete.map(function(viewDBName) {
        return sequentialize(getQueue(viewDBName), function() {
          return new db.constructor(viewDBName, db.__opts).destroy();
        })();
      });
      return Promise.all(destroyPromises).then(function() {
        return { ok: true };
      });
    } catch (err) {
      if (err.status === 404) {
        return { ok: true };
      } else {
        throw err;
      }
    }
  }
  async function queryPromised(db, fun, opts) {
    if (typeof db._query === "function") {
      return customQuery(db, fun, opts);
    }
    if (isRemote(db)) {
      return httpQuery(db, fun, opts);
    }
    const updateViewOpts = {
      changes_batch_size: db.__opts.view_update_changes_batch_size || CHANGES_BATCH_SIZE$1
    };
    if (typeof fun !== "string") {
      checkQueryParseError(opts, fun);
      tempViewQueue.add(async function() {
        const view = await createView(
          /* sourceDB */
          db,
          /* viewName */
          "temp_view/temp_view",
          /* mapFun */
          fun.map,
          /* reduceFun */
          fun.reduce,
          /* temporary */
          true,
          /* localDocName */
          localDocName2
        );
        return fin(
          updateView(view, updateViewOpts).then(
            function() {
              return queryView(view, opts);
            }
          ),
          function() {
            return view.db.destroy();
          }
        );
      });
      return tempViewQueue.finish();
    } else {
      const fullViewName = fun;
      const parts = parseViewName(fullViewName);
      const designDocName = parts[0];
      const viewName = parts[1];
      const doc = await db.get("_design/" + designDocName);
      fun = doc.views && doc.views[viewName];
      if (!fun) {
        throw new NotFoundError(`ddoc ${doc._id} has no view named ${viewName}`);
      }
      ddocValidator2(doc, viewName);
      checkQueryParseError(opts, fun);
      const view = await createView(
        /* sourceDB */
        db,
        /* viewName */
        fullViewName,
        /* mapFun */
        fun.map,
        /* reduceFun */
        fun.reduce,
        /* temporary */
        false,
        /* localDocName */
        localDocName2
      );
      if (opts.stale === "ok" || opts.stale === "update_after") {
        if (opts.stale === "update_after") {
          immediate$1(function() {
            updateView(view, updateViewOpts);
          });
        }
        return queryView(view, opts);
      } else {
        await updateView(view, updateViewOpts);
        return queryView(view, opts);
      }
    }
  }
  function abstractQuery(fun, opts, callback) {
    const db = this;
    if (typeof opts === "function") {
      callback = opts;
      opts = {};
    }
    opts = opts ? coerceOptions(opts) : {};
    if (typeof fun === "function") {
      fun = { map: fun };
    }
    const promise = Promise.resolve().then(function() {
      return queryPromised(db, fun, opts);
    });
    promisedCallback(promise, callback);
    return promise;
  }
  const abstractViewCleanup = callbackify(function() {
    const db = this;
    if (typeof db._viewCleanup === "function") {
      return customViewCleanup(db);
    }
    if (isRemote(db)) {
      return httpViewCleanup(db);
    }
    return localViewCleanup(db);
  });
  return {
    query: abstractQuery,
    viewCleanup: abstractViewCleanup
  };
}
var builtInReduce = {
  _sum: function(keys2, values) {
    return sum(values);
  },
  _count: function(keys2, values) {
    return values.length;
  },
  _stats: function(keys2, values) {
    function sumsqr(values2) {
      var _sumsqr = 0;
      for (var i3 = 0, len2 = values2.length; i3 < len2; i3++) {
        var num = values2[i3];
        _sumsqr += num * num;
      }
      return _sumsqr;
    }
    return {
      sum: sum(values),
      min: Math.min.apply(null, values),
      max: Math.max.apply(null, values),
      count: values.length,
      sumsqr: sumsqr(values)
    };
  }
};
function getBuiltIn(reduceFunString) {
  if (/^_sum/.test(reduceFunString)) {
    return builtInReduce._sum;
  } else if (/^_count/.test(reduceFunString)) {
    return builtInReduce._count;
  } else if (/^_stats/.test(reduceFunString)) {
    return builtInReduce._stats;
  } else if (/^_/.test(reduceFunString)) {
    throw new Error(reduceFunString + " is not a supported reduce function.");
  }
}
function mapper(mapFun, emit2) {
  if (typeof mapFun === "function" && mapFun.length === 2) {
    var origMap = mapFun;
    return function(doc) {
      return origMap(doc, emit2);
    };
  } else {
    return evalFunctionWithEval(mapFun.toString(), emit2);
  }
}
function reducer(reduceFun) {
  var reduceFunString = reduceFun.toString();
  var builtIn = getBuiltIn(reduceFunString);
  if (builtIn) {
    return builtIn;
  } else {
    return evalFunctionWithEval(reduceFunString);
  }
}
function ddocValidator(ddoc, viewName) {
  var fun = ddoc.views && ddoc.views[viewName];
  if (typeof fun.map !== "string") {
    throw new NotFoundError("ddoc " + ddoc._id + " has no string view named " + viewName + ", instead found object of type: " + typeof fun.map);
  }
}
var localDocName = "mrviews";
var abstract = createAbstractMapReduce(localDocName, mapper, reducer, ddocValidator);
function query$1(fun, opts, callback) {
  return abstract.query.call(this, fun, opts, callback);
}
function viewCleanup$1(callback) {
  return abstract.viewCleanup.call(this, callback);
}
var mapreduce = {
  query: query$1,
  viewCleanup: viewCleanup$1
};
function fileHasChanged(localDoc, remoteDoc, filename) {
  return !localDoc._attachments || !localDoc._attachments[filename] || localDoc._attachments[filename].digest !== remoteDoc._attachments[filename].digest;
}
function getDocAttachments(db, doc) {
  var filenames = Object.keys(doc._attachments);
  return Promise.all(filenames.map(function(filename) {
    return db.getAttachment(doc._id, filename, { rev: doc._rev });
  }));
}
function getDocAttachmentsFromTargetOrSource(target, src3, doc) {
  var doCheckForLocalAttachments = isRemote(src3) && !isRemote(target);
  var filenames = Object.keys(doc._attachments);
  if (!doCheckForLocalAttachments) {
    return getDocAttachments(src3, doc);
  }
  return target.get(doc._id).then(function(localDoc) {
    return Promise.all(filenames.map(function(filename) {
      if (fileHasChanged(localDoc, doc, filename)) {
        return src3.getAttachment(doc._id, filename);
      }
      return target.getAttachment(localDoc._id, filename);
    }));
  }).catch(function(error3) {
    if (error3.status !== 404) {
      throw error3;
    }
    return getDocAttachments(src3, doc);
  });
}
function createBulkGetOpts(diffs) {
  var requests = [];
  Object.keys(diffs).forEach(function(id) {
    var missingRevs = diffs[id].missing;
    missingRevs.forEach(function(missingRev) {
      requests.push({
        id,
        rev: missingRev
      });
    });
  });
  return {
    docs: requests,
    revs: true,
    latest: true
  };
}
function getDocs(src3, target, diffs, state) {
  diffs = clone(diffs);
  var resultDocs = [], ok = true;
  function getAllDocs() {
    var bulkGetOpts = createBulkGetOpts(diffs);
    if (!bulkGetOpts.docs.length) {
      return;
    }
    return src3.bulkGet(bulkGetOpts).then(function(bulkGetResponse) {
      if (state.cancelled) {
        throw new Error("cancelled");
      }
      return Promise.all(bulkGetResponse.results.map(function(bulkGetInfo) {
        return Promise.all(bulkGetInfo.docs.map(function(doc) {
          var remoteDoc = doc.ok;
          if (doc.error) {
            ok = false;
          }
          if (!remoteDoc || !remoteDoc._attachments) {
            return remoteDoc;
          }
          return getDocAttachmentsFromTargetOrSource(target, src3, remoteDoc).then(function(attachments) {
            var filenames = Object.keys(remoteDoc._attachments);
            attachments.forEach(function(attachment, i3) {
              var att = remoteDoc._attachments[filenames[i3]];
              delete att.stub;
              delete att.length;
              att.data = attachment;
            });
            return remoteDoc;
          });
        }));
      })).then(function(results) {
        resultDocs = resultDocs.concat(flatten(results).filter(Boolean));
      });
    });
  }
  function returnResult() {
    return { ok, docs: resultDocs };
  }
  return Promise.resolve().then(getAllDocs).then(returnResult);
}
var CHECKPOINT_VERSION = 1;
var REPLICATOR = "pouchdb";
var CHECKPOINT_HISTORY_SIZE = 5;
var LOWEST_SEQ = 0;
function updateCheckpoint(db, id, checkpoint, session, returnValue) {
  return db.get(id).catch(function(err) {
    if (err.status === 404) {
      if (db.adapter === "http" || db.adapter === "https") {
        explainError(
          404,
          "PouchDB is just checking if a remote checkpoint exists."
        );
      }
      return {
        session_id: session,
        _id: id,
        history: [],
        replicator: REPLICATOR,
        version: CHECKPOINT_VERSION
      };
    }
    throw err;
  }).then(function(doc) {
    if (returnValue.cancelled) {
      return;
    }
    if (doc.last_seq === checkpoint) {
      return;
    }
    doc.history = (doc.history || []).filter(function(item) {
      return item.session_id !== session;
    });
    doc.history.unshift({
      last_seq: checkpoint,
      session_id: session
    });
    doc.history = doc.history.slice(0, CHECKPOINT_HISTORY_SIZE);
    doc.version = CHECKPOINT_VERSION;
    doc.replicator = REPLICATOR;
    doc.session_id = session;
    doc.last_seq = checkpoint;
    return db.put(doc).catch(function(err) {
      if (err.status === 409) {
        return updateCheckpoint(db, id, checkpoint, session, returnValue);
      }
      throw err;
    });
  });
}
var CheckpointerInternal = class {
  constructor(src3, target, id, returnValue, opts) {
    this.src = src3;
    this.target = target;
    this.id = id;
    this.returnValue = returnValue;
    this.opts = opts || {};
  }
  writeCheckpoint(checkpoint, session) {
    var self2 = this;
    return this.updateTarget(checkpoint, session).then(function() {
      return self2.updateSource(checkpoint, session);
    });
  }
  updateTarget(checkpoint, session) {
    if (this.opts.writeTargetCheckpoint) {
      return updateCheckpoint(
        this.target,
        this.id,
        checkpoint,
        session,
        this.returnValue
      );
    } else {
      return Promise.resolve(true);
    }
  }
  updateSource(checkpoint, session) {
    if (this.opts.writeSourceCheckpoint) {
      var self2 = this;
      return updateCheckpoint(
        this.src,
        this.id,
        checkpoint,
        session,
        this.returnValue
      ).catch(function(err) {
        if (isForbiddenError(err)) {
          self2.opts.writeSourceCheckpoint = false;
          return true;
        }
        throw err;
      });
    } else {
      return Promise.resolve(true);
    }
  }
  getCheckpoint() {
    var self2 = this;
    var since = self2.opts.since || LOWEST_SEQ;
    if (self2.opts && self2.opts.writeSourceCheckpoint && !self2.opts.writeTargetCheckpoint) {
      return self2.src.get(self2.id).then(function(sourceDoc) {
        return sourceDoc.last_seq || since;
      }).catch(function(err) {
        if (err.status !== 404) {
          throw err;
        }
        return since;
      });
    }
    return self2.target.get(self2.id).then(function(targetDoc) {
      if (self2.opts && self2.opts.writeTargetCheckpoint && !self2.opts.writeSourceCheckpoint) {
        return targetDoc.last_seq || since;
      }
      return self2.src.get(self2.id).then(function(sourceDoc) {
        if (targetDoc.version !== sourceDoc.version) {
          return since;
        }
        var version3;
        if (targetDoc.version) {
          version3 = targetDoc.version.toString();
        } else {
          version3 = "undefined";
        }
        if (version3 in comparisons) {
          return comparisons[version3](targetDoc, sourceDoc, since);
        }
        return since;
      }, function(err) {
        if (err.status === 404 && targetDoc.last_seq) {
          return self2.src.put({
            _id: self2.id,
            last_seq: since
          }).then(function() {
            return since;
          }, function(err2) {
            if (isForbiddenError(err2)) {
              self2.opts.writeSourceCheckpoint = false;
              return targetDoc.last_seq;
            }
            return since;
          });
        }
        throw err;
      });
    }).catch(function(err) {
      if (err.status !== 404) {
        throw err;
      }
      return since;
    });
  }
};
var comparisons = {
  "undefined": function(targetDoc, sourceDoc) {
    if (collate(targetDoc.last_seq, sourceDoc.last_seq) === 0) {
      return sourceDoc.last_seq;
    }
    return 0;
  },
  "1": function(targetDoc, sourceDoc, since) {
    return compareReplicationLogs(sourceDoc, targetDoc, since).last_seq;
  }
};
function compareReplicationLogs(srcDoc, tgtDoc, since) {
  if (srcDoc.session_id === tgtDoc.session_id) {
    return {
      last_seq: srcDoc.last_seq,
      history: srcDoc.history
    };
  }
  return compareReplicationHistory(srcDoc.history, tgtDoc.history, since);
}
function compareReplicationHistory(sourceHistory, targetHistory, since) {
  var S2 = sourceHistory[0];
  var sourceRest = sourceHistory.slice(1);
  var T2 = targetHistory[0];
  var targetRest = targetHistory.slice(1);
  if (!S2 || targetHistory.length === 0) {
    return {
      last_seq: since,
      history: []
    };
  }
  var sourceId = S2.session_id;
  if (hasSessionId(sourceId, targetHistory)) {
    return {
      last_seq: S2.last_seq,
      history: sourceHistory
    };
  }
  var targetId = T2.session_id;
  if (hasSessionId(targetId, sourceRest)) {
    return {
      last_seq: T2.last_seq,
      history: targetRest
    };
  }
  return compareReplicationHistory(sourceRest, targetRest, since);
}
function hasSessionId(sessionId, history) {
  var props = history[0];
  var rest = history.slice(1);
  if (!sessionId || history.length === 0) {
    return false;
  }
  if (sessionId === props.session_id) {
    return true;
  }
  return hasSessionId(sessionId, rest);
}
function isForbiddenError(err) {
  return typeof err.status === "number" && Math.floor(err.status / 100) === 4;
}
function Checkpointer(src3, target, id, returnValue, opts) {
  if (!(this instanceof CheckpointerInternal)) {
    return new CheckpointerInternal(src3, target, id, returnValue, opts);
  }
  return Checkpointer;
}
var STARTING_BACK_OFF = 0;
function backOff(opts, returnValue, error3, callback) {
  if (opts.retry === false) {
    returnValue.emit("error", error3);
    returnValue.removeAllListeners();
    return;
  }
  if (typeof opts.back_off_function !== "function") {
    opts.back_off_function = defaultBackOff;
  }
  returnValue.emit("requestError", error3);
  if (returnValue.state === "active" || returnValue.state === "pending") {
    returnValue.emit("paused", error3);
    returnValue.state = "stopped";
    var backOffSet = function backoffTimeSet() {
      opts.current_back_off = STARTING_BACK_OFF;
    };
    var removeBackOffSetter = function removeBackOffTimeSet() {
      returnValue.removeListener("active", backOffSet);
    };
    returnValue.once("paused", removeBackOffSetter);
    returnValue.once("active", backOffSet);
  }
  opts.current_back_off = opts.current_back_off || STARTING_BACK_OFF;
  opts.current_back_off = opts.back_off_function(opts.current_back_off);
  setTimeout(callback, opts.current_back_off);
}
function sortObjectPropertiesByKey(queryParams) {
  return Object.keys(queryParams).sort(collate).reduce(function(result4, key) {
    result4[key] = queryParams[key];
    return result4;
  }, {});
}
function generateReplicationId(src3, target, opts) {
  var docIds = opts.doc_ids ? opts.doc_ids.sort(collate) : "";
  var filterFun = opts.filter ? opts.filter.toString() : "";
  var queryParams = "";
  var filterViewName = "";
  var selector = "";
  if (opts.selector) {
    selector = JSON.stringify(opts.selector);
  }
  if (opts.filter && opts.query_params) {
    queryParams = JSON.stringify(sortObjectPropertiesByKey(opts.query_params));
  }
  if (opts.filter && opts.filter === "_view") {
    filterViewName = opts.view.toString();
  }
  return Promise.all([src3.id(), target.id()]).then(function(res) {
    var queryData = res[0] + res[1] + filterFun + filterViewName + queryParams + docIds + selector;
    return new Promise(function(resolve) {
      binaryMd5(queryData, resolve);
    });
  }).then(function(md5sum) {
    md5sum = md5sum.replace(/\//g, ".").replace(/\+/g, "_");
    return "_local/" + md5sum;
  });
}
function replicate(src3, target, opts, returnValue, result4) {
  var batches = [];
  var currentBatch;
  var pendingBatch = {
    seq: 0,
    changes: [],
    docs: []
  };
  var writingCheckpoint = false;
  var changesCompleted = false;
  var replicationCompleted = false;
  var initial_last_seq = 0;
  var last_seq = 0;
  var continuous = opts.continuous || opts.live || false;
  var batch_size = opts.batch_size || 100;
  var batches_limit = opts.batches_limit || 10;
  var style = opts.style || "all_docs";
  var changesPending = false;
  var doc_ids = opts.doc_ids;
  var selector = opts.selector;
  var repId;
  var checkpointer;
  var changedDocs = [];
  var session = uuid();
  var taskId;
  result4 = result4 || {
    ok: true,
    start_time: (/* @__PURE__ */ new Date()).toISOString(),
    docs_read: 0,
    docs_written: 0,
    doc_write_failures: 0,
    errors: []
  };
  var changesOpts = {};
  returnValue.ready(src3, target);
  function initCheckpointer() {
    if (checkpointer) {
      return Promise.resolve();
    }
    return generateReplicationId(src3, target, opts).then(function(res) {
      returnValue.replicationId = repId = res;
      var checkpointOpts = {};
      if (opts.checkpoint === false) {
        checkpointOpts = { writeSourceCheckpoint: false, writeTargetCheckpoint: false, since: opts.since };
      } else if (opts.checkpoint === "source") {
        checkpointOpts = { writeSourceCheckpoint: true, writeTargetCheckpoint: false, since: opts.since };
      } else if (opts.checkpoint === "target") {
        checkpointOpts = { writeSourceCheckpoint: false, writeTargetCheckpoint: true, since: opts.since };
      } else {
        checkpointOpts = { writeSourceCheckpoint: true, writeTargetCheckpoint: true, since: opts.since };
      }
      checkpointer = new Checkpointer(src3, target, repId, returnValue, checkpointOpts);
    });
  }
  function writeDocs() {
    changedDocs = [];
    if (currentBatch.docs.length === 0) {
      return;
    }
    var docs = currentBatch.docs;
    var bulkOpts = { timeout: opts.timeout };
    return target.bulkDocs({ docs, new_edits: false }, bulkOpts).then(function(res) {
      if (returnValue.cancelled) {
        completeReplication();
        throw new Error("cancelled");
      }
      var errorsById = /* @__PURE__ */ Object.create(null);
      res.forEach(function(res2) {
        if (res2.error) {
          errorsById[res2.id] = res2;
        }
      });
      var errorsNo = Object.keys(errorsById).length;
      result4.doc_write_failures += errorsNo;
      result4.docs_written += docs.length - errorsNo;
      docs.forEach(function(doc) {
        var error3 = errorsById[doc._id];
        if (error3) {
          result4.errors.push(error3);
          var errorName = (error3.name || "").toLowerCase();
          if (errorName === "unauthorized" || errorName === "forbidden") {
            returnValue.emit("denied", clone(error3));
          } else {
            throw error3;
          }
        } else {
          changedDocs.push(doc);
        }
      });
    }, function(err) {
      result4.doc_write_failures += docs.length;
      throw err;
    });
  }
  async function finishBatch() {
    if (currentBatch.error) {
      throw new Error("There was a problem getting docs.");
    }
    result4.last_seq = last_seq = currentBatch.seq;
    var outResult = clone(result4);
    if (changedDocs.length) {
      outResult.docs = changedDocs;
      if (typeof currentBatch.pending === "number") {
        outResult.pending = currentBatch.pending;
        delete currentBatch.pending;
      }
      returnValue.emit("change", outResult);
    }
    writingCheckpoint = true;
    var task = src3.activeTasks.get(taskId);
    if (!currentBatch || !task) {
      return;
    }
    var completed = task.completed_items || 0;
    let total_items;
    if (typeof initial_last_seq === "number") {
      const info2 = await src3.info();
      if (typeof info2.update_seq === "number") {
        total_items = info2.update_seq - initial_last_seq;
      }
    }
    src3.activeTasks.update(taskId, {
      completed_items: completed + currentBatch.changes.length,
      total_items
    });
    return checkpointer.writeCheckpoint(currentBatch.seq, session).then(() => {
      returnValue.emit("checkpoint", { "checkpoint": currentBatch.seq });
      writingCheckpoint = false;
      if (returnValue.cancelled) {
        completeReplication();
        throw new Error("cancelled");
      }
      currentBatch = void 0;
      getChanges();
    }).catch(function(err) {
      onCheckpointError(err);
      throw err;
    });
  }
  function getDiffs() {
    var diff = {};
    currentBatch.changes.forEach(function(change) {
      returnValue.emit("checkpoint", { "revs_diff": change });
      if (change.id === "_user/") {
        return;
      }
      diff[change.id] = change.changes.map(function(x) {
        return x.rev;
      });
    });
    return target.revsDiff(diff).then(function(diffs) {
      if (returnValue.cancelled) {
        completeReplication();
        throw new Error("cancelled");
      }
      currentBatch.diffs = diffs;
    });
  }
  function getBatchDocs() {
    return getDocs(src3, target, currentBatch.diffs, returnValue).then(function(got) {
      currentBatch.error = !got.ok;
      got.docs.forEach(function(doc) {
        delete currentBatch.diffs[doc._id];
        result4.docs_read++;
        currentBatch.docs.push(doc);
      });
    });
  }
  function startNextBatch() {
    if (returnValue.cancelled || currentBatch) {
      return;
    }
    if (batches.length === 0) {
      processPendingBatch(true);
      return;
    }
    currentBatch = batches.shift();
    returnValue.emit("checkpoint", { "start_next_batch": currentBatch.seq });
    getDiffs().then(getBatchDocs).then(writeDocs).then(finishBatch).then(startNextBatch).catch(function(err) {
      abortReplication("batch processing terminated with error", err);
    });
  }
  function processPendingBatch(immediate$$1) {
    if (pendingBatch.changes.length === 0) {
      if (batches.length === 0 && !currentBatch) {
        if (continuous && changesOpts.live || changesCompleted) {
          returnValue.state = "pending";
          returnValue.emit("paused");
        }
        if (changesCompleted) {
          completeReplication();
        }
      }
      return;
    }
    if (immediate$$1 || changesCompleted || pendingBatch.changes.length >= batch_size) {
      batches.push(pendingBatch);
      pendingBatch = {
        seq: 0,
        changes: [],
        docs: []
      };
      if (returnValue.state === "pending" || returnValue.state === "stopped") {
        returnValue.state = "active";
        returnValue.emit("active");
      }
      startNextBatch();
    }
  }
  function abortReplication(reason, err) {
    if (replicationCompleted) {
      return;
    }
    if (!err.message) {
      err.message = reason;
    }
    result4.ok = false;
    result4.status = "aborting";
    batches = [];
    pendingBatch = {
      seq: 0,
      changes: [],
      docs: []
    };
    completeReplication(err);
  }
  function completeReplication(fatalError) {
    if (replicationCompleted) {
      return;
    }
    if (returnValue.cancelled) {
      result4.status = "cancelled";
      if (writingCheckpoint) {
        return;
      }
    }
    result4.status = result4.status || "complete";
    result4.end_time = (/* @__PURE__ */ new Date()).toISOString();
    result4.last_seq = last_seq;
    replicationCompleted = true;
    src3.activeTasks.remove(taskId, fatalError);
    if (fatalError) {
      fatalError = createError(fatalError);
      fatalError.result = result4;
      var errorName = (fatalError.name || "").toLowerCase();
      if (errorName === "unauthorized" || errorName === "forbidden") {
        returnValue.emit("error", fatalError);
        returnValue.removeAllListeners();
      } else {
        backOff(opts, returnValue, fatalError, function() {
          replicate(src3, target, opts, returnValue);
        });
      }
    } else {
      returnValue.emit("complete", result4);
      returnValue.removeAllListeners();
    }
  }
  function onChange(change, pending, lastSeq) {
    if (returnValue.cancelled) {
      return completeReplication();
    }
    if (typeof pending === "number") {
      pendingBatch.pending = pending;
    }
    var filter3 = filterChange(opts)(change);
    if (!filter3) {
      var task = src3.activeTasks.get(taskId);
      if (task) {
        var completed = task.completed_items || 0;
        src3.activeTasks.update(taskId, { completed_items: ++completed });
      }
      return;
    }
    pendingBatch.seq = change.seq || lastSeq;
    pendingBatch.changes.push(change);
    returnValue.emit("checkpoint", { "pending_batch": pendingBatch.seq });
    immediate$1(function() {
      processPendingBatch(batches.length === 0 && changesOpts.live);
    });
  }
  function onChangesComplete(changes3) {
    changesPending = false;
    if (returnValue.cancelled) {
      return completeReplication();
    }
    const done = changes3.results.length < batch_size;
    if (!done) {
      changesOpts.since = changes3.results[changes3.results.length - 1].seq;
      getChanges();
      processPendingBatch(true);
    } else {
      if (changes3.results.length) {
        changesOpts.since = changes3.results[changes3.results.length - 1].seq;
        processPendingBatch(true);
      }
      var complete = function() {
        if (continuous) {
          changesOpts.live = true;
          getChanges();
        } else {
          changesCompleted = true;
        }
        processPendingBatch(true);
      };
      if (!currentBatch && changes3.results.length === 0) {
        writingCheckpoint = true;
        checkpointer.writeCheckpoint(changes3.last_seq, session).then(() => {
          writingCheckpoint = false;
          result4.last_seq = last_seq = changes3.last_seq;
          complete();
        }).catch(onCheckpointError);
      } else {
        complete();
      }
    }
  }
  function onChangesError(err) {
    changesPending = false;
    if (returnValue.cancelled) {
      return completeReplication();
    }
    abortReplication("changes rejected", err);
  }
  function getChanges() {
    if (!(!changesPending && !changesCompleted && batches.length < batches_limit)) {
      return;
    }
    changesPending = true;
    function abortChanges() {
      changes3.cancel();
    }
    function removeListener2() {
      returnValue.removeListener("cancel", abortChanges);
    }
    if (returnValue._changes) {
      returnValue.removeListener("cancel", returnValue._abortChanges);
      returnValue._changes.cancel();
    }
    returnValue.once("cancel", abortChanges);
    var changes3 = src3.changes(changesOpts).on("change", onChange);
    changes3.then(removeListener2, removeListener2);
    changes3.then(onChangesComplete).catch(onChangesError);
    if (opts.retry) {
      returnValue._changes = changes3;
      returnValue._abortChanges = abortChanges;
    }
  }
  async function createTask(checkpoint) {
    const info2 = await src3.info();
    let total_items;
    if (typeof info2.update_seq === "number") {
      total_items = typeof opts.since === "undefined" ? info2.update_seq - checkpoint : info2.update_seq;
    }
    taskId = src3.activeTasks.add({
      name: `${continuous ? "continuous " : ""}replication from ${info2.db_name}`,
      total_items
    });
    return checkpoint;
  }
  function startChanges() {
    initCheckpointer().then(function() {
      if (returnValue.cancelled) {
        completeReplication();
        return;
      }
      return checkpointer.getCheckpoint().then(createTask).then((checkpoint) => {
        last_seq = checkpoint;
        initial_last_seq = checkpoint;
        changesOpts = {
          live: opts.sse && opts.skipInitialBatch,
          since: last_seq,
          limit: batch_size,
          batch_size,
          style,
          doc_ids,
          selector,
          return_docs: true
          // required so we know when we're done
        };
        if (opts.filter) {
          if (typeof opts.filter !== "string") {
            changesOpts.include_docs = true;
          } else {
            changesOpts.filter = opts.filter;
          }
        }
        if ("heartbeat" in opts) {
          changesOpts.heartbeat = opts.heartbeat;
        }
        if (opts.sse) {
          changesOpts.sse = opts.sse;
        }
        if ("timeout" in opts) {
          changesOpts.timeout = opts.timeout;
        }
        if (opts.query_params) {
          changesOpts.query_params = opts.query_params;
        }
        if (opts.view) {
          changesOpts.view = opts.view;
        }
        getChanges();
      });
    }).catch(function(err) {
      abortReplication("getCheckpoint rejected with ", err);
    });
  }
  function onCheckpointError(err) {
    writingCheckpoint = false;
    abortReplication("writeCheckpoint completed with error", err);
  }
  if (returnValue.cancelled) {
    completeReplication();
    return;
  }
  if (!returnValue._addedListeners) {
    returnValue.once("cancel", completeReplication);
    if (typeof opts.complete === "function") {
      returnValue.once("error", opts.complete);
      returnValue.once("complete", function(result5) {
        opts.complete(null, result5);
      });
    }
    returnValue._addedListeners = true;
  }
  startChanges();
}
var Replication = class extends EE {
  constructor() {
    super();
    this.cancelled = false;
    this.state = "pending";
    const promise = new Promise((fulfill, reject) => {
      this.once("complete", fulfill);
      this.once("error", reject);
    });
    this.then = function(resolve, reject) {
      return promise.then(resolve, reject);
    };
    this.catch = function(reject) {
      return promise.catch(reject);
    };
    this.catch(function() {
    });
  }
  cancel() {
    this.cancelled = true;
    this.state = "cancelled";
    this.emit("cancel");
  }
  ready(src3, target) {
    if (this._readyCalled) {
      return;
    }
    this._readyCalled = true;
    const onDestroy = () => {
      this.cancel();
    };
    src3.once("destroyed", onDestroy);
    target.once("destroyed", onDestroy);
    function cleanup() {
      src3.removeListener("destroyed", onDestroy);
      target.removeListener("destroyed", onDestroy);
    }
    this.once("complete", cleanup);
    this.once("error", cleanup);
  }
};
function toPouch(db, opts) {
  var PouchConstructor = opts.PouchConstructor;
  if (typeof db === "string") {
    return new PouchConstructor(db, opts);
  } else {
    return db;
  }
}
function replicateWrapper(src3, target, opts, callback) {
  if (typeof opts === "function") {
    callback = opts;
    opts = {};
  }
  if (typeof opts === "undefined") {
    opts = {};
  }
  if (opts.doc_ids && !Array.isArray(opts.doc_ids)) {
    throw createError(
      BAD_REQUEST,
      "`doc_ids` filter parameter is not a list."
    );
  }
  opts.complete = callback;
  opts = clone(opts);
  opts.continuous = opts.continuous || opts.live;
  opts.retry = "retry" in opts ? opts.retry : false;
  opts.PouchConstructor = opts.PouchConstructor || this;
  var replicateRet = new Replication(opts);
  var srcPouch = toPouch(src3, opts);
  var targetPouch = toPouch(target, opts);
  replicate(srcPouch, targetPouch, opts, replicateRet);
  return replicateRet;
}
function sync(src3, target, opts, callback) {
  if (typeof opts === "function") {
    callback = opts;
    opts = {};
  }
  if (typeof opts === "undefined") {
    opts = {};
  }
  opts = clone(opts);
  opts.PouchConstructor = opts.PouchConstructor || this;
  src3 = toPouch(src3, opts);
  target = toPouch(target, opts);
  return new Sync(src3, target, opts, callback);
}
var Sync = class extends EE {
  constructor(src3, target, opts, callback) {
    super();
    this.canceled = false;
    const optsPush = opts.push ? $inject_Object_assign({}, opts, opts.push) : opts;
    const optsPull = opts.pull ? $inject_Object_assign({}, opts, opts.pull) : opts;
    this.push = replicateWrapper(src3, target, optsPush);
    this.pull = replicateWrapper(target, src3, optsPull);
    this.pushPaused = true;
    this.pullPaused = true;
    const pullChange = (change) => {
      this.emit("change", {
        direction: "pull",
        change
      });
    };
    const pushChange = (change) => {
      this.emit("change", {
        direction: "push",
        change
      });
    };
    const pushDenied = (doc) => {
      this.emit("denied", {
        direction: "push",
        doc
      });
    };
    const pullDenied = (doc) => {
      this.emit("denied", {
        direction: "pull",
        doc
      });
    };
    const pushPaused = () => {
      this.pushPaused = true;
      if (this.pullPaused) {
        this.emit("paused");
      }
    };
    const pullPaused = () => {
      this.pullPaused = true;
      if (this.pushPaused) {
        this.emit("paused");
      }
    };
    const pushActive = () => {
      this.pushPaused = false;
      if (this.pullPaused) {
        this.emit("active", {
          direction: "push"
        });
      }
    };
    const pullActive = () => {
      this.pullPaused = false;
      if (this.pushPaused) {
        this.emit("active", {
          direction: "pull"
        });
      }
    };
    let removed = {};
    const removeAll = (type) => {
      return (event, func) => {
        const isChange = event === "change" && (func === pullChange || func === pushChange);
        const isDenied = event === "denied" && (func === pullDenied || func === pushDenied);
        const isPaused = event === "paused" && (func === pullPaused || func === pushPaused);
        const isActive = event === "active" && (func === pullActive || func === pushActive);
        if (isChange || isDenied || isPaused || isActive) {
          if (!(event in removed)) {
            removed[event] = {};
          }
          removed[event][type] = true;
          if (Object.keys(removed[event]).length === 2) {
            this.removeAllListeners(event);
          }
        }
      };
    };
    if (opts.live) {
      this.push.on("complete", this.pull.cancel.bind(this.pull));
      this.pull.on("complete", this.push.cancel.bind(this.push));
    }
    function addOneListener(ee2, event, listener) {
      if (ee2.listeners(event).indexOf(listener) == -1) {
        ee2.on(event, listener);
      }
    }
    this.on("newListener", function(event) {
      if (event === "change") {
        addOneListener(this.pull, "change", pullChange);
        addOneListener(this.push, "change", pushChange);
      } else if (event === "denied") {
        addOneListener(this.pull, "denied", pullDenied);
        addOneListener(this.push, "denied", pushDenied);
      } else if (event === "active") {
        addOneListener(this.pull, "active", pullActive);
        addOneListener(this.push, "active", pushActive);
      } else if (event === "paused") {
        addOneListener(this.pull, "paused", pullPaused);
        addOneListener(this.push, "paused", pushPaused);
      }
    });
    this.on("removeListener", function(event) {
      if (event === "change") {
        this.pull.removeListener("change", pullChange);
        this.push.removeListener("change", pushChange);
      } else if (event === "denied") {
        this.pull.removeListener("denied", pullDenied);
        this.push.removeListener("denied", pushDenied);
      } else if (event === "active") {
        this.pull.removeListener("active", pullActive);
        this.push.removeListener("active", pushActive);
      } else if (event === "paused") {
        this.pull.removeListener("paused", pullPaused);
        this.push.removeListener("paused", pushPaused);
      }
    });
    this.pull.on("removeListener", removeAll("pull"));
    this.push.on("removeListener", removeAll("push"));
    const promise = Promise.all([
      this.push,
      this.pull
    ]).then((resp) => {
      const out = {
        push: resp[0],
        pull: resp[1]
      };
      this.emit("complete", out);
      if (callback) {
        callback(null, out);
      }
      this.removeAllListeners();
      return out;
    }, (err) => {
      this.cancel();
      if (callback) {
        callback(err);
      } else {
        this.emit("error", err);
      }
      this.removeAllListeners();
      if (callback) {
        throw err;
      }
    });
    this.then = function(success, err) {
      return promise.then(success, err);
    };
    this.catch = function(err) {
      return promise.catch(err);
    };
  }
  cancel() {
    if (!this.canceled) {
      this.canceled = true;
      this.push.cancel();
      this.pull.cancel();
    }
  }
};
function replication(PouchDB2) {
  PouchDB2.replicate = replicateWrapper;
  PouchDB2.sync = sync;
  Object.defineProperty(PouchDB2.prototype, "replicate", {
    get: function() {
      var self2 = this;
      if (typeof this.replicateMethods === "undefined") {
        this.replicateMethods = {
          from: function(other, opts, callback) {
            return self2.constructor.replicate(other, self2, opts, callback);
          },
          to: function(other, opts, callback) {
            return self2.constructor.replicate(self2, other, opts, callback);
          }
        };
      }
      return this.replicateMethods;
    }
  });
  PouchDB2.prototype.sync = function(dbName, opts, callback) {
    return this.constructor.sync(this, dbName, opts, callback);
  };
}
PouchDB.plugin(IndexedDbPouch).plugin(HttpPouch$1).plugin(mapreduce).plugin(replication);

// app/src/make-pouch.js
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var awaitableApis = ["/_view/", "/_search/", "/_all_docs", "/_design_docs", "/_find"];
var activePush;
var pushResolver;
async function rateRetryFetch(url, opts, awaitable, count = 1) {
  if (activePush && awaitable) {
    await activePush;
  }
  const res = await PouchDB.fetch(url, opts);
  if (res.status === 429 && count < 4) {
    console.warn("rate limited, retry no " + count);
    await sleep(count * 800);
    return rateRetryFetch(url, opts, awaitable, count++);
  }
  return res;
}
async function make_pouch_default({
  clientDbName,
  serverDbName,
  clientDbSeeds,
  sessionId,
  preload: preload2
}) {
  PouchDB.prefix = "_ayu_";
  const pouch = new PouchDB(clientDbName, { revs_limit: 200, auto_compaction: true, deterministic_revs: true });
  let couch;
  let sync3;
  const checkpointCache = /* @__PURE__ */ new Map();
  const viewCache = /* @__PURE__ */ new Map();
  const pulledIds = /* @__PURE__ */ new Set();
  const hasCouch = !sessionId.startsWith("ephemeral:");
  let initResolver;
  let inited;
  await pouch.bulkDocs([{ _id: "_local/ayu", sessionId }, ...clientDbSeeds || []]).catch(() => {
  });
  if (hasCouch) {
    couch = new PouchDB(`${location.origin}/_api/_couch/${serverDbName}`, {
      fetch: async (url, opts) => {
        opts.redirect = "error";
        opts.headers.set("X-Requested-With", "XMLHttpRequest");
        const awaitable = awaitableApis.some((elem) => url.includes(elem));
        let viewReqKey = null;
        if (awaitable && (opts.method === "GET" || !opts.method)) {
          const pUrl = new URL(url);
          viewReqKey = pUrl.pathname + [...new URLSearchParams(pUrl.search)].sort().join("_");
          if (activePush) {
            await activePush;
          }
          const maybeCached = viewCache.get(viewReqKey);
          if (maybeCached) {
            return Promise.resolve(new Response(maybeCached, { headers: { "content-type": "application/json" } }));
          }
        }
        let checkpointReqKey = null;
        const [_, idSuffix] = url.split("/_local/");
        if (idSuffix) {
          const checkpointDocId = "_local/" + decodeURIComponent(idSuffix);
          if (checkpointDocId === sync3.pull.replicationId || checkpointDocId === sync3.push.replicationId) {
            checkpointReqKey = checkpointDocId;
            if (opts.method === "GET" || !opts.method) {
              const maybeCached = checkpointCache.get(checkpointDocId);
              if (maybeCached) {
                if (maybeCached._status === 404) {
                  return Promise.resolve(new Response("{}", { status: 404, headers: { "content-type": "application/json" } }));
                }
                return Promise.resolve(new Response(JSON.stringify(maybeCached), { headers: { "content-type": "application/json" } }));
              }
            }
          }
        }
        return rateRetryFetch(url, opts, awaitable).then(async (res) => {
          if (res.status === 401 || res.redirected || res.type === "opaqueredirect") {
            self.session?.refresh();
          }
          if (checkpointReqKey) {
            if (res.ok || res.status === 404) {
              if (res.status === 404) {
                checkpointCache.set(checkpointReqKey, { _status: 404 });
              } else {
                const json = await res.clone().json();
                if ((opts.method === "GET" || !opts.method) && json._rev) {
                  checkpointCache.set(checkpointReqKey, json);
                } else if (opts.method === "PUT" && json.ok) {
                  const newCheckpoint = JSON.parse(opts.body);
                  newCheckpoint._rev = json.rev;
                  checkpointCache.set(checkpointReqKey, newCheckpoint);
                }
              }
            } else {
              checkpointCache.delete(checkpointReqKey);
            }
          } else if (viewReqKey) {
            if (res.ok) {
              viewCache.set(viewReqKey, await res.clone().text());
            } else {
              viewCache.delete(viewReqKey);
            }
          }
          return res;
        });
      },
      skip_setup: true
    });
    const pullDocs = async function(ids, { includeDocs = false } = {}) {
      const pouchRes = await pouch.allDocs({
        include_docs: includeDocs,
        conflicts: false,
        keys: ids
      });
      const docs = [];
      const missingIds = [];
      pouchRes?.rows?.forEach((row) => {
        if (row.error || !row.value) {
          if (row.error !== "not_found") {
            console.error(row);
          }
          missingIds.push(row.key);
        } else if (row.doc) {
          docs.push(row.doc);
        }
      });
      if (hasCouch && missingIds.length > 0) {
        const freshRows = await couch.allDocs({ keys: missingIds, conflicts: true, include_docs: true, attachments: true });
        const freshDocs = freshRows.rows?.filter((row) => !!row.doc).map((row) => {
          pulledIds.add(row.doc._id);
          if (includeDocs) {
            docs.push(row.doc);
          }
          return row.doc;
        });
        freshDocs?.length && pouch.bulkDocs(freshDocs, {
          new_edits: false
        });
      }
      return includeDocs ? docs : true;
    };
    const [sessionDoc] = await pullDocs([sessionId], { includeDocs: true });
    if (!sessionDoc.replications) {
      if (preload2?.length > 0) {
        console.log("preloading docs to new pouch...", preload2);
        await PouchDB.replicate(couch, pouch, { doc_ids: preload2 });
      }
      inited = new Promise((resolve) => {
        initResolver = resolve;
      });
    }
    if (!sessionDoc.startSeq) {
      console.warn("missing session doc start seq, fallback to fullsync", sessionDoc);
    }
    sync3 = PouchDB.sync(pouch, couch, {
      live: true,
      sse: true,
      skipInitialBatch: true,
      // TODO: setup depending on time since last login?
      retry: true,
      heartbeat: 2500,
      batch_size: 50,
      conflicts: true,
      // TODO
      pull: {
        since: sessionDoc.startSeq,
        filter: (doc, _opts) => {
          if (doc._conflicts) {
            console.warn(doc._conflicts);
          }
          if (doc._id.startsWith("_design/")) {
            return false;
          }
          if (doc.type !== "session") {
            viewCache.clear();
          }
          return true;
        }
      },
      push: {
        filter: (doc, _opts) => {
          if (doc._conflicts) {
            console.warn(doc._conflicts);
          }
          if (doc._id.startsWith("count_")) {
            return false;
          }
          if (pulledIds.has(doc._id)) {
            pulledIds.delete(doc._id);
            return false;
          }
          if (doc._id.startsWith("_design/")) {
            return false;
          }
          if (doc.type !== "session") {
            viewCache.clear();
          }
          return true;
        }
      }
      // back_off_function: delay => { return 1000 } // TODO integrate online/offline
    }).on("denied", (err) => {
      console.error("denied", err);
    }).on("error", (err) => {
      console.error(err);
    }).on("paused", () => {
      pushResolver?.();
      activePush = null;
      pushResolver = null;
      console.info("replication paused");
      initResolver?.();
      initResolver = null;
    }).on("active", ({ direction }) => {
      if (direction === "push") {
        activePush = new Promise((resolve) => {
          pushResolver = resolve;
        });
      }
      init?.();
    });
    let init = async () => {
      init = null;
      if (sync3.pull.replicationId && sync3.push.replicationId) {
        let updateReplications = false;
        if (sessionDoc.replications) {
          if (sessionDoc.replications.pull !== sync3.pull.replicationId) {
            console.error("pull replication id cahnged", sessionDoc, sync3.pull);
            updateReplications = true;
          }
          if (sessionDoc.replications.push !== sync3.push.replicationId) {
            console.error("push replication id cahnged", sessionDoc, sync3.push);
            updateReplications = true;
          }
        }
        if (!sessionDoc.replications || updateReplications) {
          sessionDoc.replications = {
            pull: sync3.pull.replicationId,
            push: sync3.push.replicationId
          };
          await pouch.put(sessionDoc);
        }
      }
    };
    sync3.pullDocs = pullDocs;
  }
  function clear() {
    if (hasCouch) {
      sync3.cancel();
      couch.close();
      checkpointCache.clear();
    }
    pouch.close();
  }
  if (inited) {
    await inited;
  }
  return { pouch, couch, sync: sync3, clear };
}

// app/build/deps/falcor-observable.js
function getAugmentedNamespace2(n2) {
  if (n2.__esModule)
    return n2;
  var f = n2.default;
  if (typeof f == "function") {
    var a3 = function a4() {
      if (this instanceof a4) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a3.prototype = f.prototype;
  } else
    a3 = {};
  Object.defineProperty(a3, "__esModule", { value: true });
  Object.keys(n2).forEach(function(k) {
    var d2 = Object.getOwnPropertyDescriptor(n2, k);
    Object.defineProperty(a3, k, d2.get ? d2 : {
      enumerable: true,
      get: function() {
        return n2[k];
      }
    });
  });
  return a3;
}
function symbolObservablePonyfill(root4) {
  var result4;
  var Symbol2 = root4.Symbol;
  if (typeof Symbol2 === "function") {
    if (Symbol2.observable) {
      result4 = Symbol2.observable;
    } else {
      result4 = Symbol2("observable");
      Symbol2.observable = result4;
    }
  } else {
    result4 = "@@observable";
  }
  return result4;
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
var require$$02 = /* @__PURE__ */ getAugmentedNamespace2(es);
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
var symbolObservable = require$$02.default;
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
      const result4 = factory();
      const obs = this.from(result4);
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

// app/build/deps/falcor-router.js
var commonjsGlobal2 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs2(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getAugmentedNamespace3(n2) {
  if (n2.__esModule)
    return n2;
  var f = n2.default;
  if (typeof f == "function") {
    var a3 = function a4() {
      if (this instanceof a4) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a3.prototype = f.prototype;
  } else
    a3 = {};
  Object.defineProperty(a3, "__esModule", { value: true });
  Object.keys(n2).forEach(function(k) {
    var d2 = Object.getOwnPropertyDescriptor(n2, k);
    Object.defineProperty(a3, k, d2.get ? d2 : {
      enumerable: true,
      get: function() {
        return n2[k];
      }
    });
  });
  return a3;
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
        var reducer2 = null;
        keySet.forEach(function(key) {
          if (typeof key === "object") {
            reducer2 = onRange3(out, key, reducer2);
          } else {
            reducer2 = onKey2(out, key, reducer2);
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
function onRange$2(out, range5) {
  out[out.length] = range5;
}
function keyReduce(out, key, range5) {
  if (!isNumber$1(key)) {
    return range5;
  }
  key = +key;
  if (range5) {
    if (key - 1 === range5.to) {
      range5.to = key;
    } else if (key + 1 === range5.from) {
      range5.from = key;
    } else {
      range5 = null;
    }
  }
  if (!range5) {
    range5 = { to: key, from: key };
    out[out.length] = range5;
  }
  return range5;
}
var convertPathKeyToRange$1 = convertPathKeyTo$2(onRange$2, keyReduce);
var rangeToArray$2 = function onRange(range5) {
  var out = [];
  var i3 = range5.from;
  var to = range5.to;
  var outIdx = out.length;
  for (; i3 <= to; ++i3, ++outIdx) {
    out[outIdx] = i3;
  }
  return out;
};
var convertPathKeyTo$1 = convertPathKeyTo$3;
var isNumber = isNumber$2;
var rangeToArray$1 = rangeToArray$2;
function onRange$1(out, range5) {
  var len2 = out.length - 1;
  rangeToArray$1(range5).forEach(function(el) {
    out[++len2] = el;
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
function onRange2(out, range5) {
  var len2 = out.length - 1;
  rangeToArray(range5).forEach(function(el) {
    out[++len2] = el;
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
  for (var i3 = 0, len2 = route.length; i3 < len2; ++i3) {
    if (route[i3].type) {
      var virt = route[i3];
      switch (virt.type) {
        case Keys$5.ranges:
          matched[i3] = convertPathKeyToRange(path[i3]);
          break;
        case Keys$5.integers:
          matched[i3] = convertPathKeyToIntegers(path[i3]);
          break;
        case Keys$5.keys:
          matched[i3] = convertPathKeyToKeys(path[i3]);
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
      if (isArray$3(route[i3]) && !isArray$3(path[i3])) {
        matched[matched.length] = [path[i3]];
      } else {
        matched[matched.length] = path[i3];
      }
    }
  }
  return matched;
};
var isPathValue$1 = function(x) {
  return x.hasOwnProperty("path") && x.hasOwnProperty("value");
};
var slice$1 = function slice(args, index2) {
  var len2 = args.length;
  var out = [];
  var j = 0;
  var i3 = index2;
  while (i3 < len2) {
    out[j] = args[i3];
    ++i3;
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
    var len2 = -1;
    var restOfArgs = slice2(arguments, 1);
    var isJSONObject = !isArray$2(matchedPath);
    if (isJSONObject) {
      restOfArgs = [];
      convertedArguments = matchedPath;
    } else if (isPathValue(matchedPath[0])) {
      convertedArguments = [];
      matchedPath.forEach(function(pV) {
        pV.path = convertPathToRoute2(pV.path, route);
        convertedArguments[++len2] = pV;
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
  throwError: function(err, tokenizer3, token) {
    if (token) {
      throw err + " -- " + tokenizer3.parseString + " with next token: " + token;
    }
    throw err + " -- " + tokenizer3.parseString;
  }
};
var Tokenizer$1 = tokenizerExports;
var TokenTypes$4 = TokenTypes_1;
var E$4 = exceptions$1;
var range$1 = function range(tokenizer3, openingToken, state, out) {
  var token = tokenizer3.peek();
  var dotCount = 1;
  var done = false;
  var inclusive = true;
  var idx = state.indexer.length - 1;
  var from2 = Tokenizer$1.toNumber(state.indexer[idx]);
  var to;
  if (isNaN(from2)) {
    E$4.throwError(E$4.range.precedingNaN, tokenizer3);
  }
  while (!done && !token.done) {
    switch (token.type) {
      case TokenTypes$4.dotSeparator:
        if (dotCount === 3) {
          E$4.throwError(E$4.unexpectedToken, tokenizer3);
        }
        ++dotCount;
        if (dotCount === 3) {
          inclusive = false;
        }
        break;
      case TokenTypes$4.token:
        to = Tokenizer$1.toNumber(tokenizer3.next().token);
        if (isNaN(to)) {
          E$4.throwError(E$4.range.suceedingNaN, tokenizer3);
        }
        done = true;
        break;
      default:
        done = true;
        break;
    }
    if (!done) {
      tokenizer3.next();
      token = tokenizer3.peek();
    } else {
      break;
    }
  }
  state.indexer[idx] = { from: from2, to: inclusive ? to : to - 1 };
};
var TokenTypes$3 = TokenTypes_1;
var E$3 = exceptions$1;
var quoteE = E$3.quote;
var quote$1 = function quote(tokenizer3, openingToken, state, out) {
  var token = tokenizer3.next();
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
          E$3.throwError(quoteE.illegalEscape, tokenizer3);
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
        E$3.throwError(E$3.unexpectedToken, tokenizer3);
    }
    if (done) {
      break;
    }
    token = tokenizer3.next();
  }
  if (innerToken.length === 0) {
    E$3.throwError(quoteE.empty, tokenizer3);
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
var routed$1 = function routed(tokenizer3, openingToken, state, out) {
  var routeToken = tokenizer3.next();
  var named = false;
  var name = "";
  switch (routeToken.token) {
    case RoutedTokens$1.integers:
    case RoutedTokens$1.ranges:
    case RoutedTokens$1.keys:
      break;
    default:
      E$2.throwError(routedE.invalid, tokenizer3);
      break;
  }
  var next = tokenizer3.next();
  if (next.type === TokenTypes$2.colon) {
    named = true;
    next = tokenizer3.next();
    if (next.type !== TokenTypes$2.token) {
      E$2.throwError(routedE.invalid, tokenizer3);
    }
    name = next.token;
    next = tokenizer3.next();
  }
  if (next.type === TokenTypes$2.closingBrace) {
    var outputToken = {
      type: routeToken.token,
      named,
      name
    };
    state.indexer[state.indexer.length] = outputToken;
  } else {
    E$2.throwError(routedE.invalid, tokenizer3);
  }
};
var TokenTypes$1 = TokenTypes_1;
var E$1 = exceptions$1;
var idxE = E$1.indexer;
var range2 = range$1;
var quote2 = quote$1;
var routed2 = routed$1;
var indexer$1 = function indexer(tokenizer3, openingToken, state, out) {
  var token = tokenizer3.next();
  var done = false;
  var allowedMaxLength = 1;
  var routedIndexer = false;
  state.indexer = [];
  while (!token.done) {
    switch (token.type) {
      case TokenTypes$1.token:
      case TokenTypes$1.quote:
        if (state.indexer.length === allowedMaxLength) {
          E$1.throwError(idxE.requiresComma, tokenizer3);
        }
        break;
    }
    switch (token.type) {
      case TokenTypes$1.openingBrace:
        routedIndexer = true;
        routed2(tokenizer3, token, state);
        break;
      case TokenTypes$1.token:
        var t2 = +token.token;
        if (isNaN(t2)) {
          E$1.throwError(idxE.needQuotes, tokenizer3);
        }
        state.indexer[state.indexer.length] = t2;
        break;
      case TokenTypes$1.dotSeparator:
        if (!state.indexer.length) {
          E$1.throwError(idxE.leadingDot, tokenizer3);
        }
        range2(tokenizer3, token, state);
        break;
      case TokenTypes$1.space:
        break;
      case TokenTypes$1.closingBracket:
        done = true;
        break;
      case TokenTypes$1.quote:
        quote2(tokenizer3, token, state);
        break;
      case TokenTypes$1.openingBracket:
        E$1.throwError(idxE.nested, tokenizer3);
        break;
      case TokenTypes$1.commaSeparator:
        ++allowedMaxLength;
        break;
      default:
        E$1.throwError(E$1.unexpectedToken, tokenizer3);
        break;
    }
    if (done) {
      break;
    }
    token = tokenizer3.next();
  }
  if (state.indexer.length === 0) {
    E$1.throwError(idxE.empty, tokenizer3);
  }
  if (state.indexer.length > 1 && routedIndexer) {
    E$1.throwError(idxE.routedTokens, tokenizer3);
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
var head$1 = function head(tokenizer3) {
  var token = tokenizer3.next();
  var state = {};
  var out = [];
  while (!token.done) {
    switch (token.type) {
      case TokenTypes.token:
        var first = +token.token[0];
        if (!isNaN(first)) {
          E.throwError(E.invalidIdentifier, tokenizer3);
        }
        out[out.length] = token.token;
        break;
      case TokenTypes.dotSeparator:
        if (out.length === 0) {
          E.throwError(E.unexpectedToken, tokenizer3);
        }
        break;
      case TokenTypes.space:
        break;
      case TokenTypes.openingBracket:
        indexer2(tokenizer3, token, state, out);
        break;
      default:
        E.throwError(E.unexpectedToken, tokenizer3);
        break;
    }
    token = tokenizer3.next();
  }
  if (out.length === 0) {
    E.throwError(E.invalidPath, tokenizer3);
  }
  return out;
};
var Tokenizer = tokenizerExports;
var head2 = head$1;
var RoutedTokens = RoutedTokens$2;
var parser2 = function parser3(string, extendedRules) {
  return head2(new Tokenizer(string, extendedRules));
};
var src = parser2;
parser2.fromPathsOrPathValues = function(paths, ext) {
  if (!paths) {
    return [];
  }
  var out = [];
  for (var i3 = 0, len2 = paths.length; i3 < len2; i3++) {
    if (typeof paths[i3] === "string") {
      out[i3] = parser2(paths[i3], ext);
    } else if (typeof paths[i3].path === "string") {
      out[i3] = {
        path: parser2(paths[i3].path, ext),
        value: paths[i3].value
      };
    } else {
      out[i3] = paths[i3];
    }
  }
  return out;
};
parser2.fromPath = function(path, ext) {
  if (!path) {
    return [];
  }
  if (typeof path === "string") {
    return parser2(path, ext);
  }
  return path;
};
parser2.RoutedTokens = RoutedTokens;
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
  for (var i3 = 0, len2 = route.length; i3 < len2; ++i3, ++length) {
    var value = route[i3];
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
function cloneArray$2(arr, index2) {
  var a3 = [];
  var len2 = arr.length;
  for (var i3 = index2 || 0; i3 < len2; i3++) {
    a3[i3] = arr[i3];
  }
  return a3;
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
  var get7 = routeObject.get;
  var set5 = routeObject.set;
  var call4 = routeObject.call;
  var el = route[depth];
  el = !isNaN(+el) && +el || el;
  var isArray4 = Array.isArray(el);
  var i3 = 0;
  do {
    var value = el;
    var next;
    if (isArray4) {
      value = value[i3];
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
      if (get7) {
        matchObject.get = actionWrapper(route, get7);
        matchObject.getId = routeObject.getId;
      }
      if (set5) {
        matchObject.set = actionWrapper(route, set5);
        matchObject.setId = routeObject.setId;
      }
      if (call4) {
        matchObject.call = actionWrapper(route, call4);
        matchObject.callId = routeObject.callId;
      }
    } else {
      buildParseTree(next, routeObject, depth + 1);
    }
  } while (isArray4 && ++i3 < el.length);
}
function setHashOrThrowError(parseMap, routeObject) {
  var route = routeObject.route;
  var get7 = routeObject.get;
  var set5 = routeObject.set;
  var call4 = routeObject.call;
  getHashesFromRoute(route).map(function mapHashToString(hash) {
    return hash.join(",");
  }).forEach(function forEachRouteHash(hash) {
    if (get7 && parseMap[hash + "get"] || set5 && parseMap[hash + "set"] || call4 && parseMap[hash + "call"]) {
      throw new Error(errors$1.routeWithSamePrecedence + " " + prettifyRoute2(route));
    }
    if (get7) {
      parseMap[hash + "get"] = true;
    }
    if (set5) {
      parseMap[hash + "set"] = true;
    }
    if (call4) {
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
  var isArray4 = Array.isArray(routeValue);
  var length = isArray4 && routeValue.length || 0;
  var idx = 0;
  var value;
  if (typeof routeValue === "object" && !isArray4) {
    value = routeValue.type;
  } else if (!isArray4) {
    value = routeValue;
  }
  do {
    if (isArray4) {
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
  } while (isArray4 && ++idx < length);
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
  var isArray4 = Array.isArray;
  iterateKeySet$1 = function iterateKeySet4(keySet, note) {
    if (note.isArray === void 0) {
      initializeNote2(keySet, note);
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
            initializeRange2(el, note);
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
        initializeRange2(keySet, note);
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
  function initializeRange2(key, memo) {
    var from2 = memo.from = key.from || 0;
    var to = memo.to = key.to || (typeof key.length === "number" && memo.from + key.length - 1 || 0);
    memo.rangeOffset = memo.from;
    memo.loaded = true;
    if (from2 > to) {
      memo.empty = true;
    }
  }
  function initializeNote2(key, note) {
    note.done = false;
    var isObject4 = note.isObject = !!(key && typeof key === "object");
    note.isArray = isObject4 && isArray4(key);
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
  var iterateKeySet4 = requireIterateKeySet();
  toTree = function toTree4(paths) {
    return paths.reduce(function(acc, path) {
      innerToTree2(acc, path, 0);
      return acc;
    }, {});
  };
  function innerToTree2(seed, path, depth) {
    var keySet = path[depth];
    var iteratorNote = {};
    var key;
    var nextDepth = depth + 1;
    key = iterateKeySet4(keySet, iteratorNote);
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
        innerToTree2(next, path, nextDepth);
      }
      if (!iteratorNote.done) {
        key = iterateKeySet4(keySet, iteratorNote);
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
  var iterateKeySet4 = requireIterateKeySet();
  hasIntersection$1 = function hasIntersection4(tree, path, depth) {
    var current = tree;
    var intersects = true;
    for (; intersects && depth < path.length; ++depth) {
      var key = path[depth];
      var keyType = typeof key;
      if (key && keyType === "object") {
        var note = {};
        var innerKey = iterateKeySet4(key, note);
        var nextDepth = depth + 1;
        do {
          var next = current[innerKey];
          intersects = next !== void 0;
          if (intersects) {
            intersects = hasIntersection4(next, path, nextDepth);
          }
          innerKey = iterateKeySet4(key, note);
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
  var hasIntersection4 = requireHasIntersection$1();
  pathsComplementFromTree = function pathsComplementFromTree4(paths, tree) {
    var out = [];
    var outLength = -1;
    for (var i3 = 0, len2 = paths.length; i3 < len2; ++i3) {
      if (!hasIntersection4(tree, paths[i3], 0)) {
        out[++outLength] = paths[i3];
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
  var hasIntersection4 = requireHasIntersection$1();
  pathsComplementFromLengthTree = function pathsComplementFromLengthTree4(paths, tree) {
    var out = [];
    var outLength = -1;
    for (var i3 = 0, len2 = paths.length; i3 < len2; ++i3) {
      var path = paths[i3];
      if (!hasIntersection4(tree[path.length], path, 0)) {
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
  var isArray4 = Array.isArray;
  var typeOfObject2 = "object";
  var typeOfString = "string";
  var typeOfNumber2 = "number";
  var MAX_SAFE_INTEGER2 = 9007199254740991;
  var MAX_SAFE_INTEGER_DIGITS = 16;
  var MIN_SAFE_INTEGER_DIGITS = 17;
  var abs2 = Math.abs;
  var safeNumberRegEx = /^(0|(\-?[1-9][0-9]*))$/;
  toPaths.exports = function toPaths4(lengths) {
    var pathmap;
    var allPaths = [];
    var allPathsLength = 0;
    for (var length in lengths) {
      if (isSafeNumber(length) && isObject4(pathmap = lengths[length])) {
        var paths = collapsePathMap2(pathmap, 0, parseInt(length, 10)).sets;
        var pathsIndex = -1;
        var pathsCount = paths.length;
        while (++pathsIndex < pathsCount) {
          allPaths[allPathsLength++] = collapsePathSetIndexes2(paths[pathsIndex]);
        }
      }
    }
    return allPaths;
  };
  function isObject4(value) {
    return value !== null && typeof value === typeOfObject2;
  }
  function collapsePathMap2(pathmap, depth, length) {
    var key;
    var code = getHashCode2(String(depth));
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
        subPath = collapsePathMap2(pathmap[key], depth + 1, length);
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
        code = getHashCode2(code + key + subCode);
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
        code = getHashCode2(code + subKeys[subKeysIndex]);
      }
    }
    return {
      code,
      sets: pathsets
    };
  }
  function collapsePathSetIndexes2(pathset) {
    var keysetIndex = -1;
    var keysetCount = pathset.length;
    while (++keysetIndex < keysetCount) {
      var keyset = pathset[keysetIndex];
      if (isArray4(keyset)) {
        pathset[keysetIndex] = collapseIndex2(keyset);
      }
    }
    return pathset;
  }
  function collapseIndex2(keyset) {
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
      keyset.sort(sortListAscending2);
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
  function sortListAscending2(a3, b) {
    return a3 - b;
  }
  function getSortedKeys(map2, keys2, sort) {
    var len2 = 0;
    for (var key in map2) {
      keys2[len2++] = key;
    }
    if (len2 > 1) {
      keys2.sort(sort);
    }
    return len2;
  }
  function getHashCode2(key) {
    var code = 5381;
    var index2 = -1;
    var count = key.length;
    while (++index2 < count) {
      code = (code << 5) + code + key.charCodeAt(index2);
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
    } else if (type !== typeOfNumber2) {
      return false;
    }
    return num % 1 === 0 && abs2(num) <= MAX_SAFE_INTEGER2;
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
  var toPaths4 = requireToPaths();
  var toTree4 = requireToTree();
  collapse$1 = function collapse4(paths) {
    var collapseMap = paths.reduce(function(acc, path) {
      var len2 = path.length;
      if (!acc[len2]) {
        acc[len2] = [];
      }
      acc[len2].push(path);
      return acc;
    }, {});
    Object.keys(collapseMap).forEach(function(collapseKey) {
      collapseMap[collapseKey] = toTree4(collapseMap[collapseKey]);
    });
    return toPaths4(collapseMap);
  };
  return collapse$1;
}
var cloneArray_1;
var hasRequiredCloneArray;
function requireCloneArray() {
  if (hasRequiredCloneArray)
    return cloneArray_1;
  hasRequiredCloneArray = 1;
  function cloneArray3(arr, index2) {
    var a3 = [];
    var len2 = arr.length;
    for (var i3 = index2 || 0; i3 < len2; i3++) {
      a3[i3] = arr[i3];
    }
    return a3;
  }
  cloneArray_1 = cloneArray3;
  return cloneArray_1;
}
var catAndSlice$1;
var hasRequiredCatAndSlice$1;
function requireCatAndSlice$1() {
  if (hasRequiredCatAndSlice$1)
    return catAndSlice$1;
  hasRequiredCatAndSlice$1 = 1;
  catAndSlice$1 = function catAndSlice4(a3, b, slice3) {
    var next = [], i3, j, len2;
    for (i3 = 0, len2 = a3.length; i3 < len2; ++i3) {
      next[i3] = a3[i3];
    }
    for (j = slice3 || 0, len2 = b.length; j < len2; ++j, ++i3) {
      next[i3] = b[j];
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
  var cloneArray3 = requireCloneArray();
  var $ref2 = requireTypes$1().$ref;
  var errors3 = requireErrors();
  followReference$1 = function followReference3(cacheRoot, ref3, maxRefFollow) {
    var current = cacheRoot;
    var refPath = ref3;
    var depth = -1;
    var length = refPath.length;
    var key, next, type;
    var referenceCount = 0;
    while (++depth < length) {
      key = refPath[depth];
      next = current[key];
      type = next && next.$type;
      if (!next || type && type !== $ref2) {
        current = next;
        break;
      }
      if (type && type === $ref2 && depth + 1 < length) {
        var err = new Error(errors3.innerReferences);
        err.throwToNext = true;
        throw err;
      }
      if (depth + 1 === length) {
        if (type === $ref2) {
          depth = -1;
          refPath = next.value;
          length = refPath.length;
          next = cacheRoot;
          referenceCount++;
        }
        if (referenceCount > maxRefFollow) {
          throw new Error(errors3.circularReference);
        }
      }
      current = next;
    }
    return [current, cloneArray3(refPath)];
  };
  return followReference$1;
}
var optimizePathSets$1;
var hasRequiredOptimizePathSets$1;
function requireOptimizePathSets$1() {
  if (hasRequiredOptimizePathSets$1)
    return optimizePathSets$1;
  hasRequiredOptimizePathSets$1 = 1;
  var iterateKeySet4 = requireIterateKeySet();
  var cloneArray3 = requireCloneArray();
  var catAndSlice4 = requireCatAndSlice$1();
  var $types = requireTypes$1();
  var $ref2 = $types.$ref;
  var followReference3 = requireFollowReference$1();
  optimizePathSets$1 = function optimizePathSets4(cache, paths, maxRefFollow) {
    var optimized = [];
    paths.forEach(function(p) {
      optimizePathSet2(cache, cache, p, 0, optimized, [], maxRefFollow);
    });
    return optimized;
  };
  function optimizePathSet2(cache, cacheRoot, pathSet, depth, out, optimizedPath, maxRefFollow) {
    if (cache === void 0) {
      out[out.length] = catAndSlice4(optimizedPath, pathSet, depth);
      return;
    }
    if (cache === null || cache.$type && cache.$type !== $ref2 || typeof cache !== "object") {
      return;
    }
    if (cache.$type === $ref2 && depth === pathSet.length) {
      return;
    }
    var keySet = pathSet[depth];
    var isKeySet = typeof keySet === "object";
    var nextDepth = depth + 1;
    var iteratorNote = false;
    var key = keySet;
    if (isKeySet) {
      iteratorNote = {};
      key = iterateKeySet4(keySet, iteratorNote);
    }
    var next, nextOptimized;
    do {
      next = cache[key];
      var optimizedPathLength = optimizedPath.length;
      if (key !== null) {
        optimizedPath[optimizedPathLength] = key;
      }
      if (next && next.$type === $ref2 && nextDepth < pathSet.length) {
        var refResults = followReference3(cacheRoot, next.value, maxRefFollow);
        next = refResults[0];
        nextOptimized = cloneArray3(refResults[1]);
      } else {
        nextOptimized = optimizedPath;
      }
      optimizePathSet2(
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
        key = iterateKeySet4(keySet, iteratorNote);
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
  function getRangeOrKeySize2(rangeOrKey) {
    if (rangeOrKey == null) {
      return 1;
    } else if (Array.isArray(rangeOrKey)) {
      throw new Error("Unexpected Array found in keySet: " + JSON.stringify(rangeOrKey));
    } else if (typeof rangeOrKey === "object") {
      return getRangeSize2(rangeOrKey);
    } else {
      return 1;
    }
  }
  function getRangeSize2(range5) {
    var to = range5.to;
    var length = range5.length;
    if (to != null) {
      if (isNaN(to) || parseInt(to, 10) !== to) {
        throw new Error("Invalid range, 'to' is not an integer: " + JSON.stringify(range5));
      }
      var from2 = range5.from || 0;
      if (isNaN(from2) || parseInt(from2, 10) !== from2) {
        throw new Error("Invalid range, 'from' is not an integer: " + JSON.stringify(range5));
      }
      if (from2 <= to) {
        return to - from2 + 1;
      } else {
        return 0;
      }
    } else if (length != null) {
      if (isNaN(length) || parseInt(length, 10) !== length) {
        throw new Error("Invalid range, 'length' is not an integer: " + JSON.stringify(range5));
      } else {
        return length;
      }
    } else {
      throw new Error("Invalid range, expected 'to' or 'length': " + JSON.stringify(range5));
    }
  }
  function getPathCount2(pathSet) {
    if (pathSet.length === 0) {
      throw new Error("All paths must have length larger than zero.");
    }
    var numPaths = 1;
    for (var i3 = 0; i3 < pathSet.length; i3++) {
      var segment = pathSet[i3];
      if (Array.isArray(segment)) {
        var numKeys = 0;
        for (var j = 0; j < segment.length; j++) {
          var keySet = segment[j];
          numKeys += getRangeOrKeySize2(keySet);
        }
        numPaths *= numKeys;
      } else {
        numPaths *= getRangeOrKeySize2(segment);
      }
    }
    return numPaths;
  }
  pathCount = getPathCount2;
  return pathCount;
}
var lib2;
var hasRequiredLib;
function requireLib() {
  if (hasRequiredLib)
    return lib2;
  hasRequiredLib = 1;
  lib2 = {
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
  return lib2;
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
var get2 = "get";
var set = "set";
var call = "call";
var matcher$1 = function matcher(rst) {
  return function innerMatcher(method, paths) {
    var matched = [];
    var missing = [];
    match2(rst, paths, method, matched, missing);
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
      collapsedResults.forEach(function(path, i3) {
        var collapsedMatch = reducedMatch[i3];
        var reducedVirtualPath = collapsedMatch.virtual;
        path.forEach(function(atom3, index2) {
          if (!isRoutedToken2(reducedVirtualPath[index2])) {
            reducedVirtualPath[index2] = atom3;
          }
        });
        collapsedMatch.requested = path;
        collapsedMatched.push(reducedMatch[i3]);
      });
    });
    return collapsedMatched;
  };
};
function match2(curr, path, method, matchedFunctions, missingPaths, depth, requested, virtual, precedence) {
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
    methodToUse = get2;
  }
  var currentMatch = curr[Keys$1.match];
  if (currentMatch && isSet && !currentMatch[set]) {
    methodToUse = get2;
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
  var i3, len2, key, next;
  var specificKeys = specificMatcher2(keySet, curr);
  for (i3 = 0, len2 = specificKeys.length; i3 < len2; ++i3) {
    key = specificKeys[i3];
    virtual[depth] = key;
    requested[depth] = key;
    precedence[depth] = Precedence.specific;
    match2(
      curr[specificKeys[i3]],
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
  var keys2 = keySet;
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
      requested[depth] = keys2;
    }
    precedence[depth] = prec;
    match2(
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
    exports.root = typeof window == "object" && window.window === window && window || typeof self == "object" && self.self === self && self || typeof commonjsGlobal2 == "object" && commonjsGlobal2.global === commonjsGlobal2 && commonjsGlobal2;
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
  function isFunction$12(x) {
    return typeof x === "function";
  }
  isFunction.isFunction = isFunction$12;
  return isFunction;
}
var Subscription3 = {};
var isArray2 = {};
var hasRequiredIsArray;
function requireIsArray() {
  if (hasRequiredIsArray)
    return isArray2;
  hasRequiredIsArray = 1;
  isArray2.isArray = Array.isArray || function(x) {
    return x && typeof x.length === "number";
  };
  return isArray2;
}
var isObject = {};
var hasRequiredIsObject;
function requireIsObject() {
  if (hasRequiredIsObject)
    return isObject;
  hasRequiredIsObject = 1;
  function isObject$12(x) {
    return x != null && typeof x === "object";
  }
  isObject.isObject = isObject$12;
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
    function UnsubscriptionError2(errors3) {
      _super.call(this);
      this.errors = errors3;
      var err = Error.call(this, errors3 ? errors3.length + " errors occurred during unsubscription:\n  " + errors3.map(function(err2, i3) {
        return i3 + 1 + ") " + err2.toString();
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
    function Subscription4(unsubscribe2) {
      this.closed = false;
      this._parent = null;
      this._parents = null;
      this._subscriptions = null;
      if (unsubscribe2) {
        this._unsubscribe = unsubscribe2;
      }
    }
    Subscription4.prototype.unsubscribe = function() {
      var hasErrors = false;
      var errors3;
      if (this.closed) {
        return;
      }
      var _a = this, _parent = _a._parent, _parents = _a._parents, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
      this.closed = true;
      this._parent = null;
      this._parents = null;
      this._subscriptions = null;
      var index2 = -1;
      var len2 = _parents ? _parents.length : 0;
      while (_parent) {
        _parent.remove(this);
        _parent = ++index2 < len2 && _parents[index2] || null;
      }
      if (isFunction_1.isFunction(_unsubscribe)) {
        var trial = tryCatch_12.tryCatch(_unsubscribe).call(this);
        if (trial === errorObject_1.errorObject) {
          hasErrors = true;
          errors3 = errors3 || (errorObject_1.errorObject.e instanceof UnsubscriptionError_1.UnsubscriptionError ? flattenUnsubscriptionErrors(errorObject_1.errorObject.e.errors) : [errorObject_1.errorObject.e]);
        }
      }
      if (isArray_1.isArray(_subscriptions)) {
        index2 = -1;
        len2 = _subscriptions.length;
        while (++index2 < len2) {
          var sub = _subscriptions[index2];
          if (isObject_1.isObject(sub)) {
            var trial = tryCatch_12.tryCatch(sub.unsubscribe).call(sub);
            if (trial === errorObject_1.errorObject) {
              hasErrors = true;
              errors3 = errors3 || [];
              var err = errorObject_1.errorObject.e;
              if (err instanceof UnsubscriptionError_1.UnsubscriptionError) {
                errors3 = errors3.concat(flattenUnsubscriptionErrors(err.errors));
              } else {
                errors3.push(err);
              }
            }
          }
        }
      }
      if (hasErrors) {
        throw new UnsubscriptionError_1.UnsubscriptionError(errors3);
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
    Subscription4.EMPTY = function(empty3) {
      empty3.closed = true;
      return empty3;
    }(new Subscription4());
    return Subscription4;
  }();
  Subscription3.Subscription = Subscription$12;
  function flattenUnsubscriptionErrors(errors3) {
    return errors3.reduce(function(errs, err) {
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
    function Subscriber2(destinationOrNext, error3, complete) {
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
          this.destination = new SafeSubscriber(this, destinationOrNext, error3, complete);
          break;
      }
    }
    Subscriber2.prototype[rxSubscriber_1.$$rxSubscriber] = function() {
      return this;
    };
    Subscriber2.create = function(next, error3, complete) {
      var subscriber = new Subscriber2(next, error3, complete);
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
    function SafeSubscriber2(_parentSubscriber, observerOrNext, error3, complete) {
      _super.call(this);
      this._parentSubscriber = _parentSubscriber;
      var next;
      var context = this;
      if (isFunction_1.isFunction(observerOrNext)) {
        next = observerOrNext;
      } else if (observerOrNext) {
        context = observerOrNext;
        next = observerOrNext.next;
        error3 = observerOrNext.error;
        complete = observerOrNext.complete;
        if (isFunction_1.isFunction(context.unsubscribe)) {
          this.add(context.unsubscribe.bind(context));
        }
        context.unsubscribe = this.unsubscribe.bind(this);
      }
      this._context = context;
      this._next = next;
      this._error = error3;
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
  function toSubscriber$1(nextOrObserver, error3, complete) {
    if (nextOrObserver) {
      if (nextOrObserver instanceof Subscriber_1.Subscriber) {
        return nextOrObserver;
      }
      if (nextOrObserver[rxSubscriber_1.$$rxSubscriber]) {
        return nextOrObserver[rxSubscriber_1.$$rxSubscriber]();
      }
    }
    if (!nextOrObserver && !error3 && !complete) {
      return new Subscriber_1.Subscriber(Observer_1.empty);
    }
    return new Subscriber_1.Subscriber(nextOrObserver, error3, complete);
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
    var $$observable2;
    var Symbol2 = context.Symbol;
    if (typeof Symbol2 === "function") {
      if (Symbol2.observable) {
        $$observable2 = Symbol2.observable;
      } else {
        $$observable2 = Symbol2("observable");
        Symbol2.observable = $$observable2;
      }
    } else {
      $$observable2 = "@@observable";
    }
    return $$observable2;
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
    function Observable3(subscribe2) {
      this._isScalar = false;
      if (subscribe2) {
        this._subscribe = subscribe2;
      }
    }
    Observable3.prototype.lift = function(operator) {
      var observable2 = new Observable3();
      observable2.source = this;
      observable2.operator = operator;
      return observable2;
    };
    Observable3.prototype.subscribe = function(observerOrNext, error3, complete) {
      var operator = this.operator;
      var sink = toSubscriber_1.toSubscriber(observerOrNext, error3, complete);
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
    Observable3.create = function(subscribe2) {
      return new Observable3(subscribe2);
    };
    return Observable3;
  }();
  Observable2.Observable = Observable$1;
  return Observable2;
}
var queue2 = {};
var QueueAction = {};
var AsyncAction = {};
var Action = {};
var hasRequiredAction;
function requireAction() {
  if (hasRequiredAction)
    return Action;
  hasRequiredAction = 1;
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
      var error3 = this._execute(state, delay);
      if (error3) {
        return error3;
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
      var index2 = actions.indexOf(this);
      this.work = null;
      this.delay = null;
      this.state = null;
      this.pending = false;
      this.scheduler = null;
      if (index2 !== -1) {
        actions.splice(index2, 1);
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
    function Scheduler2(SchedulerAction, now2) {
      if (now2 === void 0) {
        now2 = Scheduler2.now;
      }
      this.SchedulerAction = SchedulerAction;
      this.now = now2;
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
      var error3;
      this.active = true;
      do {
        if (error3 = action.execute(action.state, action.delay)) {
          break;
        }
      } while (action = actions.shift());
      this.active = false;
      if (error3) {
        while (action = actions.shift()) {
          action.unsubscribe();
        }
        throw error3;
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
    return queue2;
  hasRequiredQueue = 1;
  var QueueAction_1 = requireQueueAction();
  var QueueScheduler_1 = requireQueueScheduler();
  queue2.queue = new QueueScheduler_1.QueueScheduler(QueueAction_1.QueueAction);
  return queue2;
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
  function symbolIteratorPonyfill(root4) {
    var Symbol2 = root4.Symbol;
    if (typeof Symbol2 === "function") {
      if (!Symbol2.iterator) {
        Symbol2.iterator = Symbol2("iterator polyfill");
      }
      return Symbol2.iterator;
    } else {
      var Set_1 = root4.Set;
      if (Set_1 && typeof new Set_1()["@@iterator"] === "function") {
        return "@@iterator";
      }
      var Map_1 = root4.Map;
      if (Map_1) {
        var keys2 = Object.getOwnPropertyNames(Map_1.prototype);
        for (var i3 = 0; i3 < keys2.length; ++i3) {
          var key = keys2[i3];
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
    InnerSubscriber2.prototype._error = function(error3) {
      this.parent.notifyError(error3, this);
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
  function subscribeToResult$1(outerSubscriber, result4, outerValue, outerIndex) {
    var destination = new InnerSubscriber_1.InnerSubscriber(outerSubscriber, outerValue, outerIndex);
    if (destination.closed) {
      return null;
    }
    if (result4 instanceof Observable_1.Observable) {
      if (result4._isScalar) {
        destination.next(result4.value);
        destination.complete();
        return null;
      } else {
        return result4.subscribe(destination);
      }
    } else if (isArray_1.isArray(result4)) {
      for (var i3 = 0, len2 = result4.length; i3 < len2 && !destination.closed; i3++) {
        destination.next(result4[i3]);
      }
      if (!destination.closed) {
        destination.complete();
      }
    } else if (isPromise_1.isPromise(result4)) {
      result4.then(function(value2) {
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
    } else if (result4 && typeof result4[iterator_1.$$iterator] === "function") {
      var iterator2 = result4[iterator_1.$$iterator]();
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
    } else if (result4 && typeof result4[observable_1.$$observable] === "function") {
      var obs = result4[observable_1.$$observable]();
      if (typeof obs.subscribe !== "function") {
        destination.error(new TypeError("Provided object does not correctly implement Symbol.observable"));
      } else {
        return obs.subscribe(new InnerSubscriber_1.InnerSubscriber(outerSubscriber, outerValue, outerIndex));
      }
    } else {
      var value = isObject_1.isObject(result4) ? "an invalid object" : "'" + result4 + "'";
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
    OuterSubscriber2.prototype.notifyError = function(error3, innerSub) {
      this.destination.error(error3);
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
      var result4 = this.factory();
      if (result4) {
        this.add(subscribeToResult_1.subscribeToResult(this, result4));
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
      var len2 = array.length;
      if (len2 > 1) {
        return new ArrayObservable2(array, scheduler);
      } else if (len2 === 1) {
        return new ScalarObservable_1.ScalarObservable(array[0], scheduler);
      } else {
        return new EmptyObservable_1.EmptyObservable(scheduler);
      }
    };
    ArrayObservable2.dispatch = function(state) {
      var array = state.array, index2 = state.index, count = state.count, subscriber = state.subscriber;
      if (index2 >= count) {
        subscriber.complete();
        return;
      }
      subscriber.next(array[index2]);
      if (subscriber.closed) {
        return;
      }
      state.index = index2 + 1;
      this.schedule(state);
    };
    ArrayObservable2.prototype._subscribe = function(subscriber) {
      var index2 = 0;
      var array = this.array;
      var count = array.length;
      var scheduler = this.scheduler;
      if (scheduler) {
        return scheduler.schedule(ArrayObservable2.dispatch, 0, {
          array,
          index: index2,
          count,
          subscriber
        });
      } else {
        for (var i3 = 0; i3 < count && !subscriber.closed; i3++) {
          subscriber.next(array[i3]);
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
      var index2 = state.index, hasError = state.hasError, iterator2 = state.iterator, subscriber = state.subscriber;
      if (hasError) {
        subscriber.error(state.error);
        return;
      }
      var result4 = iterator2.next();
      if (result4.done) {
        subscriber.complete();
        return;
      }
      subscriber.next(result4.value);
      state.index = index2 + 1;
      if (subscriber.closed) {
        if (typeof iterator2.return === "function") {
          iterator2.return();
        }
        return;
      }
      this.schedule(state);
    };
    IteratorObservable2.prototype._subscribe = function(subscriber) {
      var index2 = 0;
      var _a = this, iterator2 = _a.iterator, scheduler = _a.scheduler;
      if (scheduler) {
        return scheduler.schedule(IteratorObservable2.dispatch, 0, {
          index: index2,
          iterator: iterator2,
          subscriber
        });
      } else {
        do {
          var result4 = iterator2.next();
          if (result4.done) {
            subscriber.complete();
            break;
          } else {
            subscriber.next(result4.value);
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
    function StringIterator2(str, idx, len2) {
      if (idx === void 0) {
        idx = 0;
      }
      if (len2 === void 0) {
        len2 = str.length;
      }
      this.str = str;
      this.idx = idx;
      this.len = len2;
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
    function ArrayIterator2(arr, idx, len2) {
      if (idx === void 0) {
        idx = 0;
      }
      if (len2 === void 0) {
        len2 = toLength(arr);
      }
      this.arr = arr;
      this.idx = idx;
      this.len = len2;
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
    var i3 = obj[iterator_1.$$iterator];
    if (!i3 && typeof obj === "string") {
      return new StringIterator(obj);
    }
    if (!i3 && obj.length !== void 0) {
      return new ArrayIterator(obj);
    }
    if (!i3) {
      throw new TypeError("object is not iterable");
    }
    return obj[iterator_1.$$iterator]();
  }
  var maxSafeInteger = Math.pow(2, 53) - 1;
  function toLength(o) {
    var len2 = +o.length;
    if (isNaN(len2)) {
      return 0;
    }
    if (len2 === 0 || !numberIsFinite(len2)) {
      return len2;
    }
    len2 = sign(len2) * Math.floor(Math.abs(len2));
    if (len2 <= 0) {
      return 0;
    }
    if (len2 > maxSafeInteger) {
      return maxSafeInteger;
    }
    return len2;
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
      var arrayLike = state.arrayLike, index2 = state.index, length = state.length, subscriber = state.subscriber;
      if (subscriber.closed) {
        return;
      }
      if (index2 >= length) {
        subscriber.complete();
        return;
      }
      subscriber.next(arrayLike[index2]);
      state.index = index2 + 1;
      this.schedule(state);
    };
    ArrayLikeObservable2.prototype._subscribe = function(subscriber) {
      var index2 = 0;
      var _a = this, arrayLike = _a.arrayLike, scheduler = _a.scheduler;
      var length = arrayLike.length;
      if (scheduler) {
        return scheduler.schedule(ArrayLikeObservable2.dispatch, 0, {
          arrayLike,
          index: index2,
          length,
          subscriber
        });
      } else {
        for (var i3 = 0; i3 < length && !subscriber.closed; i3++) {
          subscriber.next(arrayLike[i3]);
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
    function Notification2(kind, value, error3) {
      this.kind = kind;
      this.value = value;
      this.error = error3;
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
    Notification2.prototype.do = function(next, error3, complete) {
      var kind = this.kind;
      switch (kind) {
        case "N":
          return next && next(this.value);
        case "E":
          return error3 && error3(this.error);
        case "C":
          return complete && complete();
      }
    };
    Notification2.prototype.accept = function(nextOrObserver, error3, complete) {
      if (nextOrObserver && typeof nextOrObserver.next === "function") {
        return this.observe(nextOrObserver);
      } else {
        return this.do(nextOrObserver, error3, complete);
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
    function ErrorObservable2(error3, scheduler) {
      _super.call(this);
      this.error = error3;
      this.scheduler = scheduler;
    }
    ErrorObservable2.create = function(error3, scheduler) {
      return new ErrorObservable2(error3, scheduler);
    };
    ErrorObservable2.dispatch = function(arg) {
      var error3 = arg.error, subscriber = arg.subscriber;
      subscriber.error(error3);
    };
    ErrorObservable2.prototype._subscribe = function(subscriber) {
      var error3 = this.error;
      var scheduler = this.scheduler;
      if (scheduler) {
        return scheduler.schedule(ErrorObservable2.dispatch, 0, {
          error: error3,
          subscriber
        });
      } else {
        subscriber.error(error3);
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
      var result4;
      var index2 = this.index++;
      try {
        result4 = this.project(value, index2);
      } catch (err) {
        this.destination.error(err);
        return;
      }
      this.active++;
      this._innerSub(result4, value, index2);
    };
    MergeMapSubscriber2.prototype._innerSub = function(ish, value, index2) {
      this.add(subscribeToResult_1.subscribeToResult(this, ish, value, index2));
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
      var result4;
      try {
        result4 = this.resultSelector(outerValue, innerValue, outerIndex, innerIndex);
      } catch (err) {
        this.destination.error(err);
        return;
      }
      this.destination.next(result4);
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d2[p] = b[p];
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Subscriber_1 = requireSubscriber();
  function _do$12(nextOrObserver, error3, complete) {
    return this.lift(new DoOperator(nextOrObserver, error3, complete));
  }
  _do._do = _do$12;
  var DoOperator = function() {
    function DoOperator2(nextOrObserver, error3, complete) {
      this.nextOrObserver = nextOrObserver;
      this.error = error3;
      this.complete = complete;
    }
    DoOperator2.prototype.call = function(subscriber, source) {
      return source.subscribe(new DoSubscriber(subscriber, this.nextOrObserver, this.error, this.complete));
    };
    return DoOperator2;
  }();
  var DoSubscriber = function(_super) {
    __extends(DoSubscriber2, _super);
    function DoSubscriber2(destination, nextOrObserver, error3, complete) {
      _super.call(this, destination);
      var safeSubscriber = new Subscriber_1.Subscriber(nextOrObserver, error3, complete);
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
  function materialize5() {
    return this.lift(new MaterializeOperator());
  }
  materialize$1.materialize = materialize5;
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
      var subscriber = arg.subscriber, result4 = arg.result, value = arg.value, index2 = arg.index;
      subscriber.subscribeToProjection(result4, value, index2);
    };
    ExpandSubscriber2.prototype._next = function(value) {
      var destination = this.destination;
      if (destination.closed) {
        this._complete();
        return;
      }
      var index2 = this.index++;
      if (this.active < this.concurrent) {
        destination.next(value);
        var result4 = tryCatch_12.tryCatch(this.project)(value, index2);
        if (result4 === errorObject_1.errorObject) {
          destination.error(errorObject_1.errorObject.e);
        } else if (!this.scheduler) {
          this.subscribeToProjection(result4, value, index2);
        } else {
          var state = { subscriber: this, result: result4, value, index: index2 };
          this.add(this.scheduler.schedule(ExpandSubscriber2.dispatch, 0, state));
        }
      } else {
        this.buffer.push(value);
      }
    };
    ExpandSubscriber2.prototype.subscribeToProjection = function(result4, value, index2) {
      this.active++;
      this.add(subscribeToResult_1.subscribeToResult(this, result4, value, index2));
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
      var result4;
      try {
        result4 = this.accumulator(this.acc, value, this.index++);
      } catch (err) {
        this.destination.error(err);
        return;
      }
      this.acc = result4;
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
      var result4;
      try {
        result4 = this.project.call(this.thisArg, value, this.count++);
      } catch (err) {
        this.destination.error(err);
        return;
      }
      this.destination.next(result4);
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
var filter2 = {};
var hasRequiredFilter$1;
function requireFilter$1() {
  if (hasRequiredFilter$1)
    return filter2;
  hasRequiredFilter$1 = 1;
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
  filter2.filter = filter$12;
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
      var result4;
      try {
        result4 = this.predicate.call(this.thisArg, value, this.count++);
      } catch (err) {
        this.destination.error(err);
        return;
      }
      if (result4) {
        this.destination.next(value);
      }
    };
    return FilterSubscriber2;
  }(Subscriber_1.Subscriber);
  return filter2;
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
        var result4 = void 0;
        try {
          result4 = this.selector(err, this.caught);
        } catch (err2) {
          _super.prototype.error.call(this, err2);
          return;
        }
        this._unsubscribeAndRecycle();
        this.add(subscribeToResult_1.subscribeToResult(this, result4));
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
  var __extends = commonjsGlobal2 && commonjsGlobal2.__extends || function(d2, b) {
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
function symbolObservablePonyfill2(root4) {
  var result4;
  var Symbol2 = root4.Symbol;
  if (typeof Symbol2 === "function") {
    if (Symbol2.observable) {
      result4 = Symbol2.observable;
    } else {
      result4 = Symbol2("observable");
      Symbol2.observable = result4;
    }
  } else {
    result4 = "@@observable";
  }
  return result4;
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
var require$$1 = /* @__PURE__ */ getAugmentedNamespace3(es2);
var outputToObservable;
var hasRequiredOutputToObservable;
function requireOutputToObservable() {
  if (hasRequiredOutputToObservable)
    return outputToObservable;
  hasRequiredOutputToObservable = 1;
  var Observable3 = requireRouterRx().Observable;
  var isArray4 = Array.isArray;
  var $$observable2 = require$$1.default;
  outputToObservable = function outputToObservable2(valueOrObservable) {
    var value = valueOrObservable;
    if (value instanceof Observable3) {
      return value;
    }
    if (!value) {
      return Observable3.of(value);
    }
    if (value[$$observable2]) {
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
    if (isArray4(value)) {
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
  errorToPathValue = function errorToPathValue2(error3, path) {
    var typeValue = {
      $type: "error",
      value: {}
    };
    if (error3.throwToNext) {
      throw error3;
    }
    if (error3 instanceof JSONGraphError3) {
      typeValue = error3.typeValue;
    } else if (error3 instanceof Error) {
      typeValue.value.message = error3.message;
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
  var onNext2 = "N";
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
    if (kind === onNext2) {
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
    var match3 = matchAndPath.match;
    var out;
    try {
      out = match3.action.call(routerInstance, matchAndPath.path);
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
  var isArray4 = Array.isArray;
  var rangeToArray2 = rangeToArray$2;
  var isNumber2 = isNumber$2;
  stripFromRange = function stripFromRange2(argToStrip, range5) {
    var ranges = [];
    var matches = [];
    var toStrip = argToStrip;
    var toStripIsNumber = isNumber2(toStrip);
    if (toStripIsNumber) {
      toStrip = +toStrip;
    }
    if (!toStripIsNumber && typeof toStrip === "string") {
      ranges = [range5];
    } else if (isArray4(toStrip)) {
      var currenRanges = [range5];
      toStrip.forEach(function(atom3) {
        var nextRanges = [];
        currenRanges.forEach(function(currentRename) {
          var matchAndComplement = stripFromRange2(atom3, currentRename);
          if (matchAndComplement[0] !== void 0) {
            matches = matches.concat(matchAndComplement[0]);
          }
          nextRanges = nextRanges.concat(matchAndComplement[1]);
        });
        currenRanges = nextRanges;
      });
      ranges = currenRanges;
    } else if (toStripIsNumber) {
      if (range5.from < toStrip && toStrip < range5.to) {
        ranges[0] = {
          from: range5.from,
          to: toStrip - 1
        };
        ranges[1] = {
          from: toStrip + 1,
          to: range5.to
        };
        matches = [toStrip];
      } else if (range5.from === toStrip && range5.to === toStrip) {
        ranges = [];
        matches = [toStrip];
      } else if (range5.from === toStrip) {
        ranges[0] = {
          from: toStrip + 1,
          to: range5.to
        };
        matches = [toStrip];
      } else if (range5.to === toStrip) {
        ranges[0] = {
          from: range5.from,
          to: toStrip - 1
        };
        matches = [toStrip];
      } else {
        ranges = [range5];
      }
    } else {
      matches = rangeToArray2(range5);
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
  var isArray4 = Array.isArray;
  stripFromArray = function stripFromArray2(toStrip, array) {
    var complement3;
    var matches = [];
    var typeToStrip = typeof toStrip;
    var isRangedArray = typeof array[0] === "object";
    var isNumber2 = typeToStrip === "number";
    var isString = typeToStrip === "string";
    var isRoutedToken3 = !isNumber2 && !isString;
    var routeType = isRoutedToken3 && toStrip.type || false;
    var isKeys = routeType === Keys2.keys;
    var toStripIsArray = isArray4(toStrip);
    if (isKeys) {
      complement3 = [];
      matches = array;
    } else if (toStripIsArray) {
      var currentArray = array;
      toStrip.forEach(function(atom3) {
        var results = stripFromArray2(atom3, currentArray);
        if (results[0] !== void 0) {
          matches = matches.concat(results[0]);
        }
        currentArray = results[1];
      });
      complement3 = currentArray;
    } else if (!isRangedArray && !isRoutedToken3) {
      matches = [toStrip];
      complement3 = array.filter(function(x) {
        return toStrip !== x;
      });
    } else if (isRangedArray && !isRoutedToken3) {
      complement3 = array.reduce(function(comp, range5) {
        var results = stripFromRange2(toStrip, range5);
        if (results[0] !== void 0) {
          matches = matches.concat(results[0]);
        }
        return comp.concat(results[1]);
      }, []);
    } else if (!isRangedArray && isRoutedToken3) {
      complement3 = array.filter(function(el) {
        var type = typeof el;
        if (type === "number") {
          matches[matches.length] = el;
          return false;
        }
        return true;
      });
    } else {
      complement3 = [];
      matches = array;
    }
    return [matches, complement3];
  };
  return stripFromArray;
}
var strip;
var hasRequiredStrip;
function requireStrip() {
  if (hasRequiredStrip)
    return strip;
  hasRequiredStrip = 1;
  var isArray4 = Array.isArray;
  var stripFromArray2 = requireStripFromArray();
  var stripFromRange2 = requireStripFromRange();
  strip = function strip2(matchedAtom, virtualAtom) {
    var relativeComplement = [];
    var matchedResults;
    var typeOfMatched = typeof matchedAtom;
    var isArrayMatched = isArray4(matchedAtom);
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
  catAndSlice = function catAndSlice4(a3, b, slice3) {
    var next = [], i3, j, len2;
    for (i3 = 0, len2 = a3.length; i3 < len2; ++i3) {
      next[i3] = a3[i3];
    }
    for (j = slice3 || 0, len2 = b.length; j < len2; ++j, ++i3) {
      next[i3] = b[j];
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
  var catAndSlice4 = requireCatAndSlice();
  stripPath = function stripPath2(matchedPath, virtualPath) {
    var relativeComplement = [];
    var exactMatch = [];
    var current = [];
    for (var i3 = 0, len2 = virtualPath.length; i3 < len2; ++i3) {
      var matchedAtom = matchedPath[i3];
      var virtualAtom = virtualPath[i3];
      var stripResults = strip2(matchedAtom, virtualAtom);
      var innerMatch = stripResults[0];
      var innerComplement = stripResults[1];
      var hasComplement = innerComplement.length > 0;
      if (hasComplement) {
        var flattendIC = innerComplement.length === 1 ? innerComplement[0] : innerComplement;
        current[i3] = flattendIC;
        relativeComplement[relativeComplement.length] = catAndSlice4(current, matchedPath, i3 + 1);
      }
      exactMatch[i3] = innerMatch;
      current[i3] = innerMatch;
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
  isRange = function isRange2(range5) {
    return range5.hasOwnProperty("to") && range5.hasOwnProperty("from");
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
  var isArray4 = Array.isArray;
  var isRoutedToken3 = isRoutedToken$1;
  var isRange2 = requireIsRange();
  hasAtomIntersection = function hasAtomIntersection2(matchedAtom, virtualAtom) {
    var virtualIsRoutedToken = isRoutedToken3(virtualAtom);
    var isKeys = virtualIsRoutedToken && virtualAtom.type === Keys2.keys;
    var matched = false;
    var i3, len2;
    if (isArray4(matchedAtom)) {
      for (i3 = 0, len2 = matchedAtom.length; i3 < len2 && !matched; ++i3) {
        matched = hasAtomIntersection2(matchedAtom[i3], virtualAtom);
      }
    } else if (doubleEquals(matchedAtom, virtualAtom)) {
      matched = true;
    } else if (isKeys) {
      matched = true;
    } else if (virtualIsRoutedToken) {
      matched = isNumber2(matchedAtom) || isRange2(matchedAtom);
    } else if (isArray4(virtualAtom)) {
      for (i3 = 0, len2 = virtualAtom.length; i3 < len2 && !matched; ++i3) {
        matched = hasAtomIntersection2(matchedAtom, virtualAtom[i3]);
      }
    }
    return matched;
  };
  function isNumber2(x) {
    return String(Number(x)) === String(x);
  }
  function doubleEquals(a3, b) {
    return a3 == b;
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
  hasIntersection = function hasIntersection4(matchedPath, virtualPath) {
    var intersection = true;
    for (var i3 = 0, len2 = virtualPath.length; i3 < len2 && intersection; ++i3) {
      intersection = hasAtomIntersection2(matchedPath[i3], virtualPath[i3]);
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
  var pathUtils3 = requireLib();
  var collapse4 = pathUtils3.collapse;
  var stripPath2 = requireStripPath();
  var hasIntersection4 = requireHasIntersection();
  getExecutableMatches = function getExecutableMatches2(matches, pathSet) {
    var remainingPaths = pathSet;
    var matchAndPaths = [];
    var out = {
      matchAndPaths,
      unhandledPaths: false
    };
    for (var i3 = 0; i3 < matches.length && remainingPaths.length > 0; ++i3) {
      var availablePaths = remainingPaths;
      var match3 = matches[i3];
      remainingPaths = [];
      if (i3 > 0) {
        availablePaths = collapse4(availablePaths);
      }
      for (var j = 0; j < availablePaths.length; ++j) {
        var path = availablePaths[j];
        if (hasIntersection4(path, match3.virtual)) {
          var stripResults = stripPath2(path, match3.virtual);
          matchAndPaths[matchAndPaths.length] = {
            path: stripResults[0],
            match: match3
          };
          remainingPaths = remainingPaths.concat(stripResults[1]);
        } else if (i3 < matches.length - 1) {
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
    var sortedMatches = matches.sort(function(a3, b) {
      if (a3.precedence < b.precedence) {
        return 1;
      } else if (a3.precedence > b.precedence) {
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
var types2;
var hasRequiredTypes;
function requireTypes() {
  if (hasRequiredTypes)
    return types2;
  hasRequiredTypes = 1;
  types2 = {
    $ref: "ref",
    $atom: "atom",
    $error: "error"
  };
  return types2;
}
var followReference;
var hasRequiredFollowReference;
function requireFollowReference() {
  if (hasRequiredFollowReference)
    return followReference;
  hasRequiredFollowReference = 1;
  var cloneArray3 = cloneArray_1$1;
  var $ref2 = requireTypes().$ref;
  var errors3 = exceptions;
  followReference = function followReference3(cacheRoot, ref3, maxRefFollow) {
    var current = cacheRoot;
    var refPath = ref3;
    var depth = -1;
    var length = refPath.length;
    var key, next, type;
    var referenceCount = 0;
    while (++depth < length) {
      key = refPath[depth];
      next = current[key];
      type = next && next.$type;
      if (!next || type && type !== $ref2) {
        current = next;
        break;
      }
      if (type && type === $ref2 && depth + 1 < length) {
        var err = new Error(errors3.innerReferences);
        err.throwToNext = true;
        throw err;
      }
      if (depth + 1 === length) {
        if (type === $ref2) {
          depth = -1;
          refPath = next.value;
          length = refPath.length;
          next = cacheRoot;
          referenceCount++;
        }
        if (referenceCount > maxRefFollow) {
          throw new Error(errors3.circularReference);
        }
      }
      current = next;
    }
    return [current, cloneArray3(refPath)];
  };
  return followReference;
}
var optimizePathSets;
var hasRequiredOptimizePathSets;
function requireOptimizePathSets() {
  if (hasRequiredOptimizePathSets)
    return optimizePathSets;
  hasRequiredOptimizePathSets = 1;
  var iterateKeySet4 = requireLib().iterateKeySet;
  var cloneArray3 = cloneArray_1$1;
  var catAndSlice4 = requireCatAndSlice();
  var $types = requireTypes();
  var $ref2 = $types.$ref;
  var followReference3 = requireFollowReference();
  optimizePathSets = function optimizePathSets4(cache, paths, maxRefFollow) {
    var optimized = [];
    paths.forEach(function(p) {
      optimizePathSet2(cache, cache, p, 0, optimized, [], maxRefFollow);
    });
    return optimized;
  };
  function optimizePathSet2(cache, cacheRoot, pathSet, depth, out, optimizedPath, maxRefFollow) {
    if (cache === void 0) {
      out[out.length] = catAndSlice4(optimizedPath, pathSet, depth);
      return;
    }
    if (cache === null || cache.$type && cache.$type !== $ref2 || typeof cache !== "object") {
      return;
    }
    if (cache.$type === $ref2 && depth === pathSet.length) {
      return;
    }
    var keySet = pathSet[depth];
    var nextDepth = depth + 1;
    var iteratorNote = {};
    var key, next, nextOptimized;
    key = iterateKeySet4(keySet, iteratorNote);
    do {
      next = cache[key];
      var optimizedPathLength = optimizedPath.length;
      if (key !== null) {
        optimizedPath[optimizedPathLength] = key;
      }
      if (next && next.$type === $ref2 && nextDepth < pathSet.length) {
        var refResults = followReference3(cacheRoot, next.value, maxRefFollow);
        next = refResults[0];
        nextOptimized = cloneArray3(refResults[1]);
      } else {
        nextOptimized = optimizedPath;
      }
      optimizePathSet2(
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
        key = iterateKeySet4(keySet, iteratorNote);
      }
    } while (!iteratorNote.done);
  }
  return optimizePathSets;
}
var clone2;
var hasRequiredClone;
function requireClone() {
  if (hasRequiredClone)
    return clone2;
  hasRequiredClone = 1;
  clone2 = function copy(valueType) {
    if (typeof valueType !== "object" || valueType === null) {
      return valueType;
    }
    return Object.keys(valueType).reduce(function(acc, k) {
      acc[k] = valueType[k];
      return acc;
    }, {});
  };
  return clone2;
}
var jsongMerge;
var hasRequiredJsongMerge;
function requireJsongMerge() {
  if (hasRequiredJsongMerge)
    return jsongMerge;
  hasRequiredJsongMerge = 1;
  var iterateKeySet4 = requireLib().iterateKeySet;
  var types3 = requireTypes();
  var $ref2 = types3.$ref;
  var $error2 = types3.$error;
  var clone5 = requireClone();
  var cloneArray3 = cloneArray_1$1;
  var catAndSlice4 = requireCatAndSlice();
  jsongMerge = function jsongMerge2(cache, jsongEnv, routerInstance) {
    var paths = jsongEnv.paths;
    var j = jsongEnv.jsonGraph;
    var references = [];
    var values = [];
    paths.forEach(function(p) {
      merge2({
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
  function merge2(config, cache, message, depth, path, fromParent, fromKey) {
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
      fromParent[fromKey] = clone5(message);
      if (message && message.$type === $error2) {
        config.router._pathErrorHook({ path, value: message });
      }
      if (message && message.$type === $ref2) {
        var references = config.references;
        references.push({
          path: cloneArray3(requestedPath),
          value: message.value
        });
      } else {
        var values = config.values;
        values.push({
          path: cloneArray3(requestedPath),
          value: message && message.type ? message.value : message
        });
      }
      return;
    }
    var outerKey = path[depth];
    var iteratorNote = {};
    var key;
    key = iterateKeySet4(outerKey, iteratorNote);
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
        if (messageRes && messageRes.$type === $ref2 && depth < path.length - 1) {
          nextDepth = 0;
          nextPath = catAndSlice4(messageRes.value, path, depth + 1);
          cache[key] = clone5(messageRes);
          nextIgnoreCount = messageRes.value.length;
          messageRes = messageRoot;
          cacheRes = cacheRoot;
        }
        config.ignoreCount = nextIgnoreCount;
        merge2(
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
      key = iterateKeySet4(outerKey, iteratorNote);
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
  var clone5 = requireClone();
  var types3 = requireTypes();
  var $ref2 = types3.$ref;
  var iterateKeySet4 = requireLib().iterateKeySet;
  pathValueMerge = function pathValueMerge2(cache, pathValue2) {
    var refs = [];
    var values = [];
    var invalidations = [];
    var valueType = true;
    if (pathValue2.invalidated === true) {
      invalidations.push({ path: pathValue2.path });
      valueType = false;
    } else if (pathValue2.value !== null && pathValue2.value.$type === $ref2) {
      refs.push({
        path: pathValue2.path,
        value: pathValue2.value.value
      });
    } else {
      values.push(pathValue2);
    }
    if (valueType) {
      innerPathValueMerge(cache, pathValue2);
    }
    return {
      references: refs,
      values,
      invalidations
    };
  };
  function innerPathValueMerge(cache, pathValue2) {
    var path = pathValue2.path;
    var curr = cache;
    var next, key, cloned, outerKey, iteratorNote;
    var i3, len2;
    for (i3 = 0, len2 = path.length - 1; i3 < len2; ++i3) {
      outerKey = path[i3];
      if (outerKey && typeof outerKey === "object") {
        iteratorNote = {};
        key = iterateKeySet4(outerKey, iteratorNote);
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
              path: path.slice(i3 + 1),
              value: pathValue2.value
            }
          );
          if (!iteratorNote.done) {
            key = iterateKeySet4(outerKey, iteratorNote);
          }
        } else {
          curr = next;
        }
      } while (iteratorNote && !iteratorNote.done);
      if (iteratorNote) {
        return;
      }
    }
    outerKey = path[i3];
    iteratorNote = {};
    key = iterateKeySet4(outerKey, iteratorNote);
    do {
      cloned = clone5(pathValue2.value);
      curr[key] = cloned;
      if (!iteratorNote.done) {
        key = iterateKeySet4(outerKey, iteratorNote);
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
    var len2 = -1;
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
        refs.forEach(function(ref3) {
          references[++len2] = ref3;
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
  var pathUtils3 = requireLib();
  var collapse4 = pathUtils3.collapse;
  var optimizePathSets4 = requireOptimizePathSets();
  var mCGRI = requireMergeCacheAndGatherRefsAndInvalidations();
  var isArray4 = Array.isArray;
  recurseMatchAndExecute = function recurseMatchAndExecute2(match3, actionRunner, paths, method, routerInstance, jsongCache) {
    return _recurseMatchAndExecute(
      match3,
      actionRunner,
      paths,
      method,
      routerInstance,
      jsongCache
    );
  };
  function _recurseMatchAndExecute(match3, actionRunner, paths, method, routerInstance, jsongCache) {
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
        matchedResults = match3(currentMethod, nextPaths);
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
        if (!isArray4(value)) {
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
        pathsToExpand = optimizePathSets4(
          jsongCache,
          pathsToExpand,
          routerInstance.maxRefFollow
        );
        if (pathsToExpand.length) {
          pathsToExpand = collapse4(pathsToExpand);
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
var normalize2;
var hasRequiredNormalize;
function requireNormalize() {
  if (hasRequiredNormalize)
    return normalize2;
  hasRequiredNormalize = 1;
  normalize2 = function normalize3(range5) {
    var from2 = range5.from || 0;
    var to;
    if (typeof range5.to === "number") {
      to = range5.to;
    } else {
      to = from2 + range5.length - 1;
    }
    return { to, from: from2 };
  };
  return normalize2;
}
var normalizePathSets;
var hasRequiredNormalizePathSets;
function requireNormalizePathSets() {
  if (hasRequiredNormalizePathSets)
    return normalizePathSets;
  hasRequiredNormalizePathSets = 1;
  var normalize3 = requireNormalize();
  normalizePathSets = function normalizePathSets2(path) {
    path.forEach(function(key, i3) {
      if (Array.isArray(key)) {
        normalizePathSets2(key);
      } else if (typeof key === "object") {
        path[i3] = normalize3(path[i3]);
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
  var optimizePathSets4 = requireOptimizePathSets();
  var $atom2 = requireTypes().$atom;
  materialize = function materializeMissing(router, paths, jsongEnv) {
    var jsonGraph = jsongEnv.jsonGraph;
    var materializedAtom = { $type: $atom2 };
    optimizePathSets4(jsonGraph, paths, router.maxRefFollow).forEach(function(optMissingPath) {
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
  var falcorPathUtils2 = requireLib();
  function getPathsCount(pathSets) {
    return pathSets.reduce(function(numPaths, pathSet) {
      return numPaths + falcorPathUtils2.pathCount(pathSet);
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
  function noop3() {
  }
  function toRxNewObserver(observer) {
    var onNext2 = observer.onNext;
    var onError4 = observer.onError;
    var onCompleted2 = observer.onCompleted;
    if (typeof onNext2 !== "function" && typeof onError4 !== "function" && typeof onCompleted2 !== "function") {
      return observer;
    }
    return {
      next: typeof onNext2 === "function" ? function(x) {
        this.destination.onNext(x);
      } : noop3,
      error: typeof onError4 === "function" ? function(err) {
        this.destination.onError(err);
      } : noop3,
      complete: typeof onCompleted2 === "function" ? function() {
        this.destination.onCompleted();
      } : noop3,
      destination: observer
    };
  }
  rxNewToRxNewAndOld = function rxNewToRxNewAndOld2(rxNewObservable) {
    var _subscribe5 = rxNewObservable.subscribe;
    rxNewObservable.subscribe = function(observerOrNextFn, errFn, compFn) {
      var subscription;
      if (typeof observerOrNextFn !== "object" || observerOrNextFn === null) {
        subscription = _subscribe5.call(
          this,
          observerOrNextFn,
          errFn,
          compFn
        );
      } else {
        var observer = toRxNewObserver(observerOrNextFn);
        subscription = _subscribe5.call(this, observer);
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
  var get7 = "get";
  var recurseMatchAndExecute2 = requireRecurseMatchAndExecute();
  var normalizePathSets2 = requireNormalizePathSets();
  var materialize5 = requireMaterialize();
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
      var result4 = Observable3.defer(function() {
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
          get7,
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
          return materialize5(router, normPS, jsonGraphEnvelope);
        });
      });
      if (router._methodSummaryHook || router._errorHook) {
        result4 = result4.do(function(response) {
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
      return result4;
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
  var iterateKeySet4 = requireLib().iterateKeySet;
  var cloneArray3 = cloneArray_1$1;
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
      out[out.length] = cloneArray3(currentPath);
      return;
    }
    var key = pathSet[depth];
    if (typeof key !== "object") {
      currentPath[depth] = key;
      _spread(pathSet, depth + 1, out, currentPath);
      return;
    }
    var iteratorNote = {};
    var innerKey = iterateKeySet4(key, iteratorNote);
    do {
      currentPath[depth] = innerKey;
      _spread(pathSet, depth + 1, out, currentPath);
      currentPath.length = depth;
      innerKey = iterateKeySet4(key, iteratorNote);
    } while (!iteratorNote.done);
  }
  return spreadPaths;
}
var getValue2;
var hasRequiredGetValue;
function requireGetValue() {
  if (hasRequiredGetValue)
    return getValue2;
  hasRequiredGetValue = 1;
  getValue2 = function getValue4(cache, path) {
    return path.reduce(function(acc, key) {
      return acc[key];
    }, cache);
  };
  return getValue2;
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
  var getValue4 = requireGetValue();
  var jsongMerge2 = requireJsongMerge();
  var optimizePathSets4 = requireOptimizePathSets();
  var hasIntersection4 = requireHasIntersection();
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
    var match3 = matchAndPath.match;
    var out;
    var arg = matchAndPath.path;
    if (match3.isSet) {
      var paths = spreadPaths2(jsongMessage.paths);
      var optimizedPathsAndPaths = paths.map(function(path) {
        return [
          optimizePathSets4(
            jsongCache,
            [path],
            routerInstance.maxRefFollow
          )[0],
          path
        ];
      }).filter(function(optimizedAndPath) {
        return optimizedAndPath[0] && hasIntersection4(optimizedAndPath[0], match3.virtual);
      });
      var optimizedPaths = optimizedPathsAndPaths.map(function(opp) {
        return opp[0];
      });
      var subSetPaths = optimizedPathsAndPaths.map(function(opp) {
        return opp[1];
      });
      var tmpJsonGraph = subSetPaths.reduce(function(json, path, i3) {
        pathValueMerge2(json, {
          path: optimizedPaths[i3],
          value: getValue4(jsongMessage.jsonGraph, path)
        });
        return json;
      }, {});
      var subJsonGraphEnv = {
        jsonGraph: tmpJsonGraph,
        paths: [match3.requested]
      };
      arg = {};
      jsongMerge2(arg, subJsonGraphEnv, routerInstance);
    }
    try {
      out = match3.action.call(routerInstance, arg);
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
            function(result4) {
              route.results = route.results || [];
              route.results.push({
                time: routerInstance._now(),
                value: result4
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
  var set5 = "set";
  var recurseMatchAndExecute2 = requireRecurseMatchAndExecute();
  var runSetAction = requireRunSetAction();
  var materialize5 = requireMaterialize();
  var Observable3 = requireRouterRx().Observable;
  var spreadPaths2 = requireSpreadPaths();
  var pathValueMerge2 = requirePathValueMerge();
  var optimizePathSets4 = requireOptimizePathSets();
  var hasIntersectionWithTree2 = requireHasIntersectionWithTree();
  var getValue4 = requireGetValue();
  var normalizePathSets2 = requireNormalizePathSets();
  var pathUtils3 = requireLib();
  var collapse4 = pathUtils3.collapse;
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
        set5,
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
              optimizePathSets4(
                details.jsonGraph,
                [path],
                router.maxRefFollow
              )[0]
            ];
          }).filter(function(x) {
            return x[1];
          }).map(function(pathAndOPath) {
            var oPath = pathAndOPath[1];
            var hasIntersection4 = hasIntersectionWithTree2(
              oPath,
              unhandledPathsTree
            );
            if (hasIntersection4) {
              var value = getValue4(
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
          pathIntersection.reduce(function(acc, pathValue2) {
            pathValueMerge2(acc, pathValue2);
            return acc;
          }, jsonGraphFragment);
          jsonGraphEnvelope.paths = collapse4(
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
        return materialize5(router, jsonGraph.paths, jsonGraphEnvelope);
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
    var match3 = matchAndPath.match;
    var matchedPath = matchAndPath.path;
    var out;
    if (match3.isCall) {
      out = Observable3.defer(function() {
        var next;
        try {
          next = match3.action.call(
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
        invsRefsAndValues.references.forEach(function(ref3) {
          refs[++refLen] = ref3;
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
          refs.forEach(function(ref3) {
            var deoptimizedPath = callPathSave1.concat(
              ref3.path.slice(optimizedPathLength)
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
          match3.action.call(routerInstance, matchAndPath.path)
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
  var call4 = "call";
  var runCallAction = requireRunCallAction();
  var recurseMatchAndExecute2 = requireRecurseMatchAndExecute();
  var normalizePathSets2 = requireNormalizePathSets();
  var CallNotFoundError2 = requireCallNotFoundError();
  var materialize5 = requireMaterialize();
  var pathUtils3 = requireLib();
  var collapse4 = pathUtils3.collapse;
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
          call4,
          router,
          jsongCache
        ).map(function(jsongResult) {
          var reportedPaths = jsongResult.reportedPaths;
          var jsongEnv = {
            jsonGraph: jsongResult.jsonGraph
          };
          if (reportedPaths.length) {
            jsongEnv.paths = collapse4(reportedPaths);
          } else {
            jsongEnv.paths = [];
            jsongEnv.jsonGraph = {};
          }
          var invalidated = jsongResult.invalidated;
          if (invalidated && invalidated.length) {
            jsongEnv.invalidated = invalidated;
          }
          materialize5(router, reportedPaths, jsongEnv);
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
var Router$1 = /* @__PURE__ */ getDefaultExportFromCjs2(Router_1);

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
        const users = sessions.map((row) => row.doc).sort((a3, b) => b.lastLogin - a3.lastLogin).reduce((agg, session) => {
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
            _sessions: { $type: "atom", value: sessions.map((row) => row.doc).sort((a3, b) => b.lastLogin - a3.lastLogin) }
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
        const result4 = await dbs.pouch.bulkDocs(docs.map((doc) => {
          if (!doc._id) {
            doc._id = `${Math.floor(Math.random() * 1e3)}:${Math.floor(Math.random() * 1e9)}`;
          }
          doc.changes = [{ userId: session.userId, action: "created", date: Date.now() }];
          return doc;
        }));
        return result4.map((_doc, i3) => {
          return { path: ["_docs", docs[i3]._id], value: docs[i3] };
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
        const result4 = await dbs.pouch.bulkDocs(Object.values(_docs).map(({ value }) => {
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
        result4.forEach((res) => {
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
  getDocs: () => getDocs2
});
var changes2;
function doSync(dbs, since, Observable3, _model) {
  let id;
  let i3 = 0;
  function schedule3(action) {
    if (i3 < 5) {
      i3++;
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
    if (!changes2) {
      changes2 = dbs.pouch.changes({
        since: since || "now",
        live: true,
        timeout: false,
        include_docs: true
      });
      dbs.pouch.info().then((info2) => {
        changes2.lastSeq = info2.update_seq;
      });
      usedFeed = changes2;
    } else {
      if (since !== void 0 && changes2.lastSeq > since) {
        catchupFeed = true;
        console.log("creating pouch _sync catchup feed", since, changes2.lastSeq);
        usedFeed = dbs.pouch.changes({
          since,
          live: true,
          timeout: false,
          include_docs: true
        });
      } else {
        usedFeed = changes2;
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
        let i4 = 0;
        for (const key of changePath) {
          i4++;
          if (!target[key]) {
            target[key] = {};
          }
          if (i4 === changePath.length) {
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
      schedule3(() => {
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
async function getDocs2({ ids, dbs }) {
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
  const s2 = new Date(t2), i3 = { hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
  n2 && (i3.timeZone = n2);
  t2 = { timeZoneName: e2, ...i3 }, n2 = new Intl.DateTimeFormat(r2, t2).formatToParts(s2).find((t3) => "timezonename" === t3.type.toLowerCase());
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
var i2 = class {
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
  var t2 = t2.format(e2).replace(/\u200E/g, ""), [, e2, t2, r2, n2, s2, i3, a3] = /(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/.exec(t2);
  return [r2, e2, t2, n2, s2, i3, a3];
}
function te(t2, e2) {
  var r2 = t2.formatToParts(e2);
  const n2 = [];
  for (let t3 = 0; t3 < r2.length; t3++) {
    var { type: s2, value: i3 } = r2[t3], a3 = Kt[s2];
    "era" === s2 ? n2[a3] = i3 : O(a3) || (n2[a3] = parseInt(i3, 10));
  }
  return n2;
}
var ee = {};
var w = class _w extends i2 {
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
    let [r2, n2, s2, i3, a3, o, u] = (e2.formatToParts ? te : Xt)(e2, t2);
    e2 = +t2, t2 = e2 % 1e3;
    return (pt({ year: r2 = "BC" === i3 ? 1 - Math.abs(r2) : r2, month: n2, day: s2, hour: 24 === a3 ? 0 : a3, minute: o, second: u, millisecond: 0 }) - (e2 -= 0 <= t2 ? t2 : 1e3 + t2)) / 6e4;
  }
  equals(t2) {
    return "iana" === t2.type && t2.name === this.name;
  }
  get isValid() {
    return this.valid;
  }
};
var re = null;
var v = class _v extends i2 {
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
function a2(...t2) {
  t2 = t2.reduce((t3, e2) => t3 + e2.source, "");
  return RegExp(`^${t2}$`);
}
function g(...t2) {
  return (i3) => t2.reduce(([t3, e2, r2], n2) => {
    var [n2, r2, s2] = n2(i3, r2);
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
var Pe = a2(/([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/, Ie);
var Ge = a2(/(\d{4})-?W(\d\d)(?:-?(\d))?/, Ie);
var Be = a2(/(\d{4})-?(\d{3})/, Ie);
var Qe = a2(xe);
var Ke = g(function(t2, e2) {
  return [{ year: T(t2, e2), month: T(t2, e2 + 1, 1), day: T(t2, e2 + 2, 1) }, null, e2 + 3];
}, S, Ze, Le);
var Xe = g(Ce, S, Ze, Le);
var tr = g(Fe, S, Ze, Le);
var er = g(S, Ze, Le);
var ar = g(S);
var ur = a2(/(\d{4})-(\d\d)-(\d\d)/, n);
var lr = a2(e);
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
var sleep2 = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
var sleepRandom = () => {
  const ms = randomInt(500, 1500);
  return sleep2(ms);
};
function escapeId(baseString, doc) {
  let result4 = "";
  let char = "";
  let validTest;
  if (doc) {
    validTest = RegExp(/[a-zA-Z0-9_$<>=\-.!']/);
  } else {
    validTest = RegExp(/[a-z0-9_$+-]/);
  }
  for (let i3 = 0; i3 < baseString.length; i3++) {
    char = baseString.charAt(i3);
    if (!validTest.test(char)) {
      result4 += "(" + char.codePointAt() + ")";
    } else {
      result4 += char;
    }
  }
  return result4;
}

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
  ranges.forEach((range5) => {
    if (to === void 0) {
      to = range5.to;
    } else {
      to = Math.max(to, range5.to);
    }
    if (from2 === void 0) {
      from2 = range5.from;
    } else {
      from2 = Math.min(from2, range5.from);
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
            e2.routes?.forEach((route, i3) => {
              let batchMarker = "";
              if (e2.routes.length > 1) {
                if (i3 === 0) {
                  batchMarker = " (batched >";
                } else if (i3 === e2.routes.length - 1) {
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
                  body: e2.results[i3]?.value.jsonGraph || e2.results[i3]?.value.value
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

// app/build/deps/falcor.js
function getDefaultExportFromCjs3(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getAugmentedNamespace4(n2) {
  if (n2.__esModule)
    return n2;
  var f = n2.default;
  if (typeof f == "function") {
    var a3 = function a4() {
      if (this instanceof a4) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a3.prototype = f.prototype;
  } else
    a3 = {};
  Object.defineProperty(a3, "__esModule", { value: true });
  Object.keys(n2).forEach(function(k) {
    var d2 = Object.getOwnPropertyDescriptor(n2, k);
    Object.defineProperty(a3, k, d2.get ? d2 : {
      enumerable: true,
      get: function() {
        return n2[k];
      }
    });
  });
  return a3;
}
var functionTypeof = "function";
var isFunction$5 = function isFunction2(func) {
  return Boolean(func) && typeof func === functionTypeof;
};
var objTypeof$1 = "object";
var isObject$f = function isObject2(value) {
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
ModelDataSourceAdapter$1.prototype.get = function get3(pathSets) {
  return this._model.get.apply(this._model, pathSets)._toJSONG();
};
ModelDataSourceAdapter$1.prototype.set = function set2(jsongResponse) {
  return this._model.set(jsongResponse)._toJSONG();
};
ModelDataSourceAdapter$1.prototype.call = function call2(path, args, suffixes, paths) {
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
var createHardlink$2 = function createHardlink(from2, to) {
  var backRefs = to.$_refsLength || 0;
  to[__ref$4 + backRefs] = from2;
  to.$_refsLength = backRefs + 1;
  from2.$_refIndex = backRefs;
  from2.$_context = to;
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
var splice$2 = function lruSplice(root4, object) {
  var prev = object.$_prev;
  var next = object.$_next;
  if (next) {
    next.$_prev = prev;
  }
  if (prev) {
    prev.$_next = next;
  }
  object.$_prev = object.$_next = void 0;
  if (object === root4.$_head) {
    root4.$_head = next;
  }
  if (object === root4.$_tail) {
    root4.$_tail = prev;
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
var iterateKeySet$7 = function iterateKeySet2(keySet, note) {
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
  var isObject4 = note.isObject = !!(key && typeof key === "object");
  note.isArray = isObject4 && isArray$9(key);
  note.arrayOffset = 0;
}
var iterateKeySet$6 = iterateKeySet$7;
var toTree$2 = function toTree2(paths) {
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
var hasIntersection$2 = function hasIntersection2(tree, path, depth) {
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
          intersects = hasIntersection2(next, path, nextDepth);
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
var hasIntersection$12 = hasIntersection$2;
var pathsComplementFromTree2 = function pathsComplementFromTree3(paths, tree) {
  var out = [];
  var outLength = -1;
  for (var i3 = 0, len2 = paths.length; i3 < len2; ++i3) {
    if (!hasIntersection$12(tree, paths[i3], 0)) {
      out[++outLength] = paths[i3];
    }
  }
  return out;
};
var hasIntersection3 = hasIntersection$2;
var pathsComplementFromLengthTree2 = function pathsComplementFromLengthTree3(paths, tree) {
  var out = [];
  var outLength = -1;
  for (var i3 = 0, len2 = paths.length; i3 < len2; ++i3) {
    var path = paths[i3];
    if (!hasIntersection3(tree[path.length], path, 0)) {
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
  } catch (e2) {
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
toPaths$2.exports = function toPaths2(lengths) {
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
function sortListAscending(a3, b) {
  return a3 - b;
}
function getKeys$1(map2, keys2, sort) {
  var len2 = 0;
  for (var key in map2) {
    keys2[len2++] = key;
  }
  return len2;
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
var collapse2 = function collapse3(paths) {
  var collapseMap = paths.reduce(function(acc, path) {
    var len2 = path.length;
    if (!acc[len2]) {
      acc[len2] = [];
    }
    acc[len2].push(path);
    return acc;
  }, {});
  Object.keys(collapseMap).forEach(function(collapseKey) {
    collapseMap[collapseKey] = toTree$1(collapseMap[collapseKey]);
  });
  return toPaths$1(collapseMap);
};
var errors$12 = {
  innerReferences: "References with inner references are not allowed.",
  circularReference: "There appears to be a circular reference, maximum reference following exceeded."
};
var errors2 = errors$12;
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
        return { error: new Error(errors2.innerReferences) };
      }
      if (referenceCount >= maxRefFollow) {
        return { error: new Error(errors2.circularReference) };
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
function cloneArray$12(arr, index2) {
  var a3 = [];
  var len2 = arr.length;
  for (var i3 = index2 || 0; i3 < len2; i3++) {
    a3[i3] = arr[i3];
  }
  return a3;
}
var cloneArray_12 = cloneArray$12;
var catAndSlice$12 = function catAndSlice2(a3, b, slice3) {
  var next = [], i3, j, len2;
  for (i3 = 0, len2 = a3.length; i3 < len2; ++i3) {
    next[i3] = a3[i3];
  }
  for (j = slice3 || 0, len2 = b.length; j < len2; ++j, ++i3) {
    next[i3] = b[j];
  }
  return next;
};
var iterateKeySet$4 = iterateKeySet$7;
var cloneArray2 = cloneArray_12;
var catAndSlice3 = catAndSlice$12;
var followReference$12 = followReference_1$1;
var optimizePathSets2 = function optimizePathSets3(cache, paths, maxRefFollow) {
  if (typeof maxRefFollow === "undefined") {
    maxRefFollow = 5;
  }
  var optimized = [];
  for (var i3 = 0, len2 = paths.length; i3 < len2; ++i3) {
    var error3 = optimizePathSet(cache, cache, paths[i3], 0, optimized, [], maxRefFollow);
    if (error3) {
      return { error: error3 };
    }
  }
  return { paths: optimized };
};
function optimizePathSet(cache, cacheRoot, pathSet, depth, out, optimizedPath, maxRefFollow) {
  if (cache === void 0) {
    out[out.length] = catAndSlice3(optimizedPath, pathSet, depth);
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
      var refResults = followReference$12(cacheRoot, next.value, maxRefFollow);
      if (refResults.error) {
        return refResults.error;
      }
      next = refResults.node;
      nextOptimized = cloneArray2(refResults.refPath);
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
function getRangeSize(range5) {
  var to = range5.to;
  var length = range5.length;
  if (to != null) {
    if (isNaN(to) || parseInt(to, 10) !== to) {
      throw new Error("Invalid range, 'to' is not an integer: " + JSON.stringify(range5));
    }
    var from2 = range5.from || 0;
    if (isNaN(from2) || parseInt(from2, 10) !== from2) {
      throw new Error("Invalid range, 'from' is not an integer: " + JSON.stringify(range5));
    }
    if (from2 <= to) {
      return to - from2 + 1;
    } else {
      return 0;
    }
  } else if (length != null) {
    if (isNaN(length) || parseInt(length, 10) !== length) {
      throw new Error("Invalid range, 'length' is not an integer: " + JSON.stringify(range5));
    } else {
      return length;
    }
  } else {
    throw new Error("Invalid range, expected 'to' or 'length': " + JSON.stringify(range5));
  }
}
function getPathCount(pathSet) {
  if (pathSet.length === 0) {
    throw new Error("All paths must have length larger than zero.");
  }
  var numPaths = 1;
  for (var i3 = 0; i3 < pathSet.length; i3++) {
    var segment = pathSet[i3];
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
var pathCount2 = getPathCount;
var _escape = function escape(str) {
  return "_" + str;
};
var _unescape = function unescape2(str) {
  if (str.slice(0, 1) === "_") {
    return str.slice(1);
  } else {
    throw SyntaxError('Expected "_".');
  }
};
var iterateKeySet$3 = iterateKeySet$7;
var materialize2 = function materialize3(pathSet, value) {
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
  pathsComplementFromTree: pathsComplementFromTree2,
  pathsComplementFromLengthTree: pathsComplementFromLengthTree2,
  toJsonKey: jsonKey.toJsonKey,
  isJsonKey: jsonKey.isJsonKey,
  maybeJsonKey: jsonKey.maybeJsonKey,
  hasIntersection: hasIntersection$2,
  toPaths: toPathsExports,
  isIntegerKey: integerKey.isIntegerKey,
  maybeIntegerKey: integerKey.maybeIntegerKey,
  collapse: collapse2,
  followReference: followReference_1$1,
  optimizePathSets: optimizePathSets2,
  pathCount: pathCount2,
  escape: _escape,
  unescape: _unescape,
  materialize: materialize2
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
var clone$4 = function clone3(value) {
  var dest = value;
  if (isObject$a(dest)) {
    dest = isArray$7(value) ? [] : {};
    var src3 = value;
    for (var key in src3) {
      if (key.lastIndexOf(privatePrefix$1, 0) === 0 || !hasOwn$1(src3, key)) {
        continue;
      }
      dest[key] = src3[key];
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
var insertNode$2 = function insertNode(node, parent, key, version3, optimizedPath) {
  node.$_key = key;
  node.$_parent = parent;
  if (version3 !== void 0) {
    node.$_version = version3;
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
  var fromNodeRefsLength = fromNode.$_refsLength || 0, destNodeRefsLength = destNode.$_refsLength || 0, i3 = -1;
  while (++i3 < fromNodeRefsLength) {
    var ref3 = fromNode[__ref$3 + i3];
    if (ref3 !== void 0) {
      ref3.$_context = destNode;
      destNode[__ref$3 + (destNodeRefsLength + i3)] = ref3;
      fromNode[__ref$3 + i3] = void 0;
    }
  }
  destNode.$_refsLength = fromNodeRefsLength + destNodeRefsLength;
  fromNode.$_refsLength = void 0;
  return destNode;
};
var __ref$2 = requireRef();
var unlinkBackReferences$1 = function unlinkBackReferences(node) {
  var i3 = -1, n2 = node.$_refsLength || 0;
  while (++i3 < n2) {
    var ref3 = node[__ref$2 + i3];
    if (ref3 != null) {
      ref3.$_context = ref3.$_refIndex = node[__ref$2 + i3] = void 0;
    }
  }
  node.$_refsLength = void 0;
  return node;
};
var __ref$1 = requireRef();
var unlinkForwardReference$1 = function unlinkForwardReference(reference) {
  var destination = reference.$_context;
  if (destination) {
    var i3 = (reference.$_refIndex || 0) - 1, n2 = (destination.$_refsLength || 0) - 1;
    while (++i3 <= n2) {
      destination[__ref$1 + i3] = destination[__ref$1 + (i3 + 1)];
    }
    destination.$_refsLength = n2;
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
  var prefix2 = reservedPrefix$1;
  var removeNode3 = removeNode$2;
  removeNodeAndDescendants$1 = function removeNodeAndDescendants2(node, parent, key, lru, mergeContext) {
    if (removeNode3(node, parent, key, lru)) {
      if (node.$type !== void 0 && mergeContext && node.$_absolutePath) {
        mergeContext.hasInvalidatedResult = true;
      }
      if (node.$type == null) {
        for (var key2 in node) {
          if (key2[0] !== prefix2 && hasOwn2(node, key2)) {
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
var updateBackReferenceVersions$2 = function updateBackReferenceVersions(nodeArg, version3) {
  var stack = [nodeArg];
  var count = 0;
  do {
    var node = stack[count];
    if (node && node.$_version !== version3) {
      node.$_version = version3;
      stack[count++] = node.$_parent;
      var i3 = -1;
      var n2 = node.$_refsLength || 0;
      while (++i3 < n2) {
        stack[count++] = node[__ref + i3];
      }
    }
  } while (--count > -1);
  return nodeArg;
};
var removeNode$1 = removeNode$2;
var updateBackReferenceVersions$1 = updateBackReferenceVersions$2;
var updateNodeAncestors$3 = function updateNodeAncestors(nodeArg, offset, lru, version3) {
  var child = nodeArg;
  do {
    var node = child.$_parent;
    var size = child.$size = (child.$size || 0) - offset;
    if (size <= 0 && node != null) {
      removeNode$1(child, node, child.$_key, lru);
    } else if (child.$_version !== version3) {
      updateBackReferenceVersions$1(child, version3);
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
var mergeJSONGraphNode$1 = function mergeJSONGraphNode(parent, node, message, key, requestedPath, optimizedPath, version3, expired, lru, comparator2, errorSelector2, replacedPaths) {
  var sizeOffset;
  var cType, mType, cIsObject, mIsObject, cTimestamp, mTimestamp;
  var nodeValue = node && node.value !== void 0 ? node.value : node;
  if (nodeValue === message) {
    if (message === null) {
      node = wrapNode$1(message, void 0, message);
      parent = updateNodeAncestors$2(parent, -node.$size, lru, version3);
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
            insertNode$1(node, parent, key, version3, optimizedPath);
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
        parent = updateNodeAncestors$2(parent, -node.$size, lru, version3);
        node = insertNode$1(node, parent, key, version3, optimizedPath);
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
        parent = updateNodeAncestors$2(parent, sizeOffset, lru, version3);
        node = insertNode$1(node, parent, key, version3, optimizedPath);
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
  var version3 = incrementVersion$2();
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
    var pathCount3 = paths.length;
    while (++pathIndex < pathCount3) {
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
        version3,
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
function setJSONGraphPathSet(path, depth, root4, parent, node, messageRoot, messageParent, message, requestedPaths, optimizedPaths, requestedPath, optimizedPath, version3, expired, lru, comparator2, errorSelector2, replacedPaths) {
  var note = {};
  var branch = depth < path.length - 1;
  var keySet = path[depth];
  var key = iterateKeySet$2(keySet, note);
  var optimizedIndex = optimizedPath.index;
  do {
    requestedPath.depth = depth;
    var results = setNode$1(
      root4,
      parent,
      node,
      messageRoot,
      messageParent,
      message,
      key,
      branch,
      requestedPath,
      optimizedPath,
      version3,
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
          root4,
          nextParent,
          nextNode,
          messageRoot,
          results[3],
          results[2],
          requestedPaths,
          optimizedPaths,
          requestedPath,
          optimizedPath,
          version3,
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
function setReference$1(root4, node, messageRoot, message, requestedPath, optimizedPath, version3, expired, lru, comparator2, errorSelector2, replacedPaths) {
  var reference = node.value;
  optimizedPath.length = 0;
  optimizedPath.push.apply(optimizedPath, reference);
  if (isExpired$5(node)) {
    optimizedPath.index = reference.length;
    expireNode$3(node, expired, lru);
    _result[0] = void 0;
    _result[1] = root4;
    _result[2] = message;
    _result[3] = messageRoot;
    return _result;
  }
  var index2 = 0;
  var container = node;
  var count = reference.length - 1;
  var parent = node = root4;
  var messageParent = message = messageRoot;
  do {
    var key = reference[index2];
    var branch = index2 < count;
    optimizedPath.index = index2;
    var results = setNode$1(
      root4,
      parent,
      node,
      messageRoot,
      messageParent,
      message,
      key,
      branch,
      requestedPath,
      optimizedPath,
      version3,
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
function setNode$1(root4, parent, node, messageRoot, messageParent, message, key, branch, requestedPath, optimizedPath, version3, expired, lru, comparator2, errorSelector2, replacedPaths) {
  var type = node.$type;
  while (type === $ref$4) {
    var results = setReference$1(
      root4,
      node,
      messageRoot,
      message,
      requestedPath,
      optimizedPath,
      version3,
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
    version3,
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
  promote$3 = function lruPromote(root4, object) {
    if (object.$expires === EXPIRES_NEVER) {
      return;
    }
    var head5 = root4.$_head;
    if (!head5) {
      root4.$_head = root4.$_tail = object;
      return;
    }
    if (head5 === object) {
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
    root4.$_head = object;
    object.$_next = head5;
    head5.$_prev = object;
    if (object === root4.$_tail) {
      root4.$_tail = prev;
    }
  };
  return promote$3;
}
var clone$2;
var hasRequiredClone2;
function requireClone2() {
  if (hasRequiredClone2)
    return clone$2;
  hasRequiredClone2 = 1;
  var privatePrefix2 = privatePrefix$2;
  clone$2 = function clone5(node) {
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
var clone$1 = requireClone2();
var $ref$3 = ref;
var $atom = requireAtom();
var $error$3 = error;
var onValue$2 = function onValue(model, node, seed, depth, outerResults, branchInfo, requestedPath, optimizedPath, optimizedLength, isJSONG2) {
  if (node) {
    promote$2(model._root, node);
  }
  if (!seed) {
    return;
  }
  var i3, len2, k, key, curr, prev = null, prevK;
  var materialized = false, valueNode, nodeType = node && node.$type, nodeValue = node && node.value;
  if (nodeValue === void 0) {
    materialized = model._materialized;
  }
  if (materialized) {
    valueNode = { $type: $atom };
  } else if (model._boxed) {
    valueNode = clone$1(node);
  } else if (!isJSONG2 && nodeType === $ref$3) {
    valueNode = void 0;
  } else if (nodeType === $ref$3 || nodeType === $error$3) {
    if (isJSONG2) {
      valueNode = clone$1(node);
    } else {
      valueNode = nodeValue;
    }
  } else if (isJSONG2) {
    var isObject4 = nodeValue && typeof nodeValue === "object";
    var isUserCreatedNode = !node || !node.$_modelCreated;
    if (isObject4 || isUserCreatedNode) {
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
  if (isJSONG2) {
    curr = seed.jsonGraph;
    if (!curr) {
      hasValues = true;
      curr = seed.jsonGraph = {};
      seed.paths = [];
    }
    for (i3 = 0, len2 = optimizedLength - 1; i3 < len2; i3++) {
      key = optimizedPath[i3];
      if (!curr[key]) {
        hasValues = true;
        curr[key] = {};
      }
      curr = curr[key];
    }
    key = optimizedPath[i3];
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
    for (i3 = 0; i3 < depth - 1; i3++) {
      k = requestedPath[i3];
      if (!curr[k]) {
        hasValues = true;
        curr[k] = branchInfo[i3];
      }
      prev = curr;
      prevK = k;
      curr = curr[k];
    }
    k = requestedPath[i3];
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
var hasRequiredFollowReference2;
function requireFollowReference2() {
  if (hasRequiredFollowReference2)
    return followReference_1;
  hasRequiredFollowReference2 = 1;
  var createHardlink3 = createHardlink$2;
  var onValue3 = onValue$2;
  var isExpired3 = requireIsExpired();
  var $ref2 = ref;
  var promote2 = requirePromote();
  function followReference3(model, root4, nodeArg, referenceContainerArg, referenceArg, seed, isJSONG2) {
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
            if (isJSONG2) {
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
                isJSONG2
              );
            } else {
              promote2(model._root, next);
            }
            depth = 0;
            reference = value;
            referenceContainer = next;
            node = root4;
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
      for (var i3 = 0; i3 < depth; i3++) {
        ref3[i3] = reference[i3];
      }
      reference = ref3;
    }
    return [node, reference, referenceContainer];
  }
  followReference_1 = followReference3;
  return followReference_1;
}
var getValueSync;
var hasRequiredGetValueSync;
function requireGetValueSync() {
  if (hasRequiredGetValueSync)
    return getValueSync;
  hasRequiredGetValueSync = 1;
  var followReference3 = requireFollowReference2();
  var clone5 = requireClone2();
  var isExpired3 = requireIsExpired();
  var promote2 = requirePromote();
  var $ref2 = ref;
  var $atom2 = requireAtom();
  var $error2 = error;
  getValueSync = function getValueSync2(model, simplePath, noClone) {
    var root4 = model._root.cache;
    var len2 = simplePath.length;
    var optimizedPath = [];
    var shorted = false, shouldShort = false;
    var depth = 0;
    var key, i3, next = root4, curr = root4, out = root4, type, ref3, refNode;
    var found = true;
    var expired = false;
    while (next && depth < len2) {
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
        shorted = depth < len2;
        break;
      }
      if (depth < len2) {
        if (type === $ref2) {
          if (isExpired3(next)) {
            expired = true;
            out = void 0;
            break;
          }
          ref3 = followReference3(model, root4, root4, next, next.value);
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
    if (depth < len2 && !expired) {
      for (i3 = depth; i3 < len2; ++i3) {
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
      for (i3 = depth; i3 < len2; ++i3) {
        if (simplePath[i3] !== null) {
          optimizedPath[optimizedPath.length] = simplePath[i3];
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
        path: depth === len2 ? simplePath : simplePath.slice(0, depth),
        value: out.value
      };
    } else if (out && model._boxed) {
      out = Boolean(type) && !noClone ? clone5(out) : out;
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
var mergeValueOrInsertBranch$1 = function mergeValueOrInsertBranch(parent, node, key, value, branch, reference, requestedPath, optimizedPath, version3, expired, lru, comparator2, errorSelector2, replacedPaths) {
  var type = getType2(node, reference);
  if (branch || reference) {
    if (type && isExpired$3(node)) {
      type = "expired";
      expireNode$2(node, expired, lru);
    }
    if (type && type !== $ref$2 || isPrimitive$2(node)) {
      node = replaceNode2(node, {}, parent, key, lru, replacedPaths);
      node = insertNode2(node, parent, key, version3, optimizedPath);
      node = updateBackReferenceVersions2(node, version3);
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
      parent = updateNodeAncestors$1(parent, sizeOffset, lru, version3);
      node = insertNode2(node, parent, key, version3, optimizedPath);
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
  var isFunction4 = isFunction$5;
  var isPrimitive3 = isPrimitive$4;
  var expireNode3 = expireNode$5;
  var iterateKeySet4 = lib$1.iterateKeySet;
  var incrementVersion3 = incrementVersionExports;
  var mergeValueOrInsertBranch3 = mergeValueOrInsertBranch$1;
  var NullInPathError2 = NullInPathError_1;
  setPathValues$2 = function setPathValues2(model, pathValues, x, errorSelector2, comparator2) {
    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version3 = incrementVersion3();
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
        version3,
        expired,
        lru,
        comparator2,
        errorSelector2
      );
    }
    var newVersion = cache.$_version;
    var rootChangeHandler = modelRoot.onChange;
    if (isFunction4(rootChangeHandler) && initialVersion !== newVersion) {
      rootChangeHandler();
    }
    return [requestedPaths, optimizedPaths];
  };
  function setPathSet(value, path, depth, root4, parent, node, requestedPaths, optimizedPaths, requestedPath, optimizedPath, version3, expired, lru, comparator2, errorSelector2, replacedPaths) {
    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet4(keySet, note);
    var optimizedIndex = optimizedPath.index;
    do {
      requestedPath.depth = depth;
      var results = setNode2(
        root4,
        parent,
        node,
        key,
        value,
        branch,
        false,
        requestedPath,
        optimizedPath,
        version3,
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
            root4,
            nextParent,
            nextNode,
            requestedPaths,
            optimizedPaths,
            requestedPath,
            optimizedPath,
            version3,
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
      key = iterateKeySet4(keySet, note);
      if (note.done) {
        break;
      }
      optimizedPath.index = optimizedIndex;
    } while (true);
  }
  function setReference2(value, root4, node, requestedPath, optimizedPath, version3, expired, lru, comparator2, errorSelector2, replacedPaths) {
    var reference = node.value;
    optimizedPath.length = 0;
    optimizedPath.push.apply(optimizedPath, reference);
    if (isExpired3(node)) {
      optimizedPath.index = reference.length;
      expireNode3(node, expired, lru);
      return [void 0, root4];
    }
    var container = node;
    var parent = root4;
    node = node.$_context;
    if (node != null) {
      parent = node.$_parent || root4;
      optimizedPath.index = reference.length;
    } else {
      var index2 = 0;
      var count = reference.length - 1;
      parent = node = root4;
      do {
        var key = reference[index2];
        var branch = index2 < count;
        optimizedPath.index = index2;
        var results = setNode2(
          root4,
          parent,
          node,
          key,
          value,
          branch,
          true,
          requestedPath,
          optimizedPath,
          version3,
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
  function setNode2(root4, parent, node, key, value, branch, reference, requestedPath, optimizedPath, version3, expired, lru, comparator2, errorSelector2, replacedPaths) {
    var type = node.$type;
    while (type === $ref2) {
      var results = setReference2(
        value,
        root4,
        node,
        requestedPath,
        optimizedPath,
        version3,
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
      version3,
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
  } catch (e2) {
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
var iterateKeySet$12 = lib$1.iterateKeySet;
complement$1.exports = function complement(requested, optimized, tree) {
  var optimizedComplement = [];
  var requestedComplement = [];
  var intersection = [];
  var i3, iLen;
  for (i3 = 0, iLen = optimized.length; i3 < iLen; ++i3) {
    var oPath = optimized[i3];
    var rPath = requested[i3];
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
  var i3;
  for (i3 = 0; requestTree && i3 < -depthDiff; i3++) {
    requestTree = requestTree[optimizedPath[i3]];
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
      var innerKey = iterateKeySet$12(key, note);
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
        innerKey = iterateKeySet$12(key, note);
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
function arrayConcatSlice(a1, a22, start) {
  var result4 = a1.slice();
  var l1 = result4.length;
  var length = a22.length - start;
  result4.length = l1 + length;
  for (var i3 = 0; i3 < length; ++i3) {
    result4[l1 + i3] = a22[start + i3];
  }
  return result4;
}
function arrayConcatSlice2(a1, a22, a3, start) {
  var result4 = a1.concat(a22);
  var l1 = result4.length;
  var length = a3.length - start;
  result4.length = l1 + length;
  for (var i3 = 0; i3 < length; ++i3) {
    result4[l1 + i3] = a3[start + i3];
  }
  return result4;
}
function arrayConcatElement(a1, element) {
  var result4 = a1.slice();
  result4.push(element);
  return result4;
}
var complementExports = complement$1.exports;
var pathUtils2 = lib$1;
var toTree3 = pathUtils2.toTree;
var toPaths3 = pathUtils2.toPaths;
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
        var len2 = pathSet.length;
        if (!pathMap[len2]) {
          pathMap[len2] = [pathSet];
        } else {
          var pathSetsByLength = pathMap[len2];
          pathSetsByLength[pathSetsByLength.length] = pathSet;
        }
      }
    }
    var pathMapKeys = Object.keys(pathMap);
    var pathMapIdx = 0, pathMapLen = pathMapKeys.length;
    for (; pathMapIdx < pathMapLen; ++pathMapIdx) {
      var pathMapKey = pathMapKeys[pathMapIdx];
      pathMap[pathMapKey] = toTree3(pathMap[pathMapKey]);
    }
  }
  if (model._enablePathCollapse) {
    requestPaths = toPaths3(request._pathMap);
  } else if (pathSetArrayBatch.length === 1) {
    requestPaths = pathSetArrayBatch[0];
  } else {
    requestPaths = Array.prototype.concat.apply([], pathSetArrayBatch);
  }
  var getRequest;
  try {
    getRequest = model._source.get(requestPaths, request._attemptCount);
  } catch (e2) {
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
var version2 = null;
currentCacheVersion$2.setVersion = function setCacheVersion(newVersion) {
  version2 = newVersion;
};
currentCacheVersion$2.getVersion = function getCacheVersion() {
  return version2;
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
          var i3, fn, len2;
          var model = self2.requestQueue.model;
          self2.requestQueue.removeRequest(self2);
          self2._disposed = true;
          if (model._treatDataSourceErrorsAsJSONGraphErrors ? err instanceof InvalidSourceError$3 : !!err) {
            for (i3 = 0, len2 = batchedCallbacks.length; i3 < len2; ++i3) {
              fn = batchedCallbacks[i3];
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
            for (i3 = 0, len2 = batchedCallbacks.length; i3 < len2; ++i3) {
              fn = batchedCallbacks[i3];
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
  for (var i3 = 0, len2 = requested.length; i3 < len2; ++i3) {
    var paths = requested[i3];
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
    var i3, len2;
    var oRemainingPaths = optimizedPaths;
    var rRemainingPaths = requestedPaths;
    var disposed = false;
    var request;
    if (cb === void 0) {
      cb = attemptCount;
      attemptCount = void 0;
    }
    for (i3 = 0, len2 = requests.length; i3 < len2; ++i3) {
      request = requests[i3];
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
    var i3 = requests.length;
    while (--i3 >= 0) {
      if (requests[i3].id === request.id) {
        requests.splice(i3, 1);
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
  onNext: function(v2) {
    if (!this._closed) {
      this._observer.onNext(v2);
    }
  },
  onError: function(e2) {
    if (!this._closed) {
      this._closed = true;
      this._observer.onError(e2);
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
function symbolObservablePonyfill3(root4) {
  var result4;
  var Symbol2 = root4.Symbol;
  if (typeof Symbol2 === "function") {
    if (Symbol2.observable) {
      result4 = Symbol2.observable;
    } else {
      result4 = Symbol2("observable");
      Symbol2.observable = result4;
    }
  } else {
    result4 = "@@observable";
  }
  return result4;
}
var root3;
if (typeof self !== "undefined") {
  root3 = self;
} else if (typeof window !== "undefined") {
  root3 = window;
} else if (typeof global !== "undefined") {
  root3 = global;
} else if (typeof module !== "undefined") {
  root3 = module;
} else {
  root3 = Function("return this")();
}
var result3 = symbolObservablePonyfill3(root3);
var es3 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: result3
});
var require$$12 = /* @__PURE__ */ getAugmentedNamespace4(es3);
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
var $$observable = require$$12.default;
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
ModelResponse$7.prototype.subscribe = ModelResponse$7.prototype.forEach = function subscribe(a3, b, c) {
  var observer = new ModelResponseObserver(a3, b, c);
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
        function(errors3) {
          rejected = true;
          reject(errors3);
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
var tokenizer2 = { exports: {} };
var TokenTypes$62 = {
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
var TokenTypes_12 = TokenTypes$62;
var TokenTypes$52 = TokenTypes_12;
var DOT_SEPARATOR2 = ".";
var COMMA_SEPARATOR2 = ",";
var OPENING_BRACKET2 = "[";
var CLOSING_BRACKET2 = "]";
var OPENING_BRACE2 = "{";
var CLOSING_BRACE2 = "}";
var COLON2 = ":";
var ESCAPE2 = "\\";
var DOUBLE_OUOTES2 = '"';
var SINGE_OUOTES2 = "'";
var SPACE2 = " ";
var SPECIAL_CHARACTERS2 = `\\'"[]., `;
var EXT_SPECIAL_CHARACTERS2 = `\\{}'"[]., :`;
var Tokenizer$22 = tokenizer2.exports = function(string, ext) {
  this._string = string;
  this._idx = -1;
  this._extended = ext;
  this.parseString = "";
};
Tokenizer$22.prototype = {
  /**
   * grabs the next token either from the peek operation or generates the
   * next token.
   */
  next: function() {
    var nextToken = this._nextToken ? this._nextToken : getNext2(this._string, this._idx, this._extended);
    this._idx = nextToken.idx;
    this._nextToken = false;
    this.parseString += nextToken.token.token;
    return nextToken.token;
  },
  /**
   * will peak but not increment the tokenizer
   */
  peek: function() {
    var nextToken = this._nextToken ? this._nextToken : getNext2(this._string, this._idx, this._extended);
    this._nextToken = nextToken;
    return nextToken.token;
  }
};
Tokenizer$22.toNumber = function toNumber2(x) {
  if (!isNaN(+x)) {
    return +x;
  }
  return NaN;
};
function toOutput2(token, type, done) {
  return {
    token,
    done,
    type
  };
}
function getNext2(string, idx, ext) {
  var output = false;
  var token = "";
  var specialChars = ext ? EXT_SPECIAL_CHARACTERS2 : SPECIAL_CHARACTERS2;
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
      case DOT_SEPARATOR2:
        type = TokenTypes$52.dotSeparator;
        break;
      case COMMA_SEPARATOR2:
        type = TokenTypes$52.commaSeparator;
        break;
      case OPENING_BRACKET2:
        type = TokenTypes$52.openingBracket;
        break;
      case CLOSING_BRACKET2:
        type = TokenTypes$52.closingBracket;
        break;
      case OPENING_BRACE2:
        type = TokenTypes$52.openingBrace;
        break;
      case CLOSING_BRACE2:
        type = TokenTypes$52.closingBrace;
        break;
      case SPACE2:
        type = TokenTypes$52.space;
        break;
      case DOUBLE_OUOTES2:
      case SINGE_OUOTES2:
        type = TokenTypes$52.quote;
        break;
      case ESCAPE2:
        type = TokenTypes$52.escape;
        break;
      case COLON2:
        type = TokenTypes$52.colon;
        break;
      default:
        type = TokenTypes$52.unknown;
        break;
    }
    output = toOutput2(character, type, false);
    break;
  } while (!done);
  if (!output && token.length) {
    output = toOutput2(token, TokenTypes$52.token, false);
  }
  if (!output) {
    output = { done: true };
  }
  return {
    token: output,
    idx
  };
}
var tokenizerExports2 = tokenizer2.exports;
var exceptions2 = {
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
  throwError: function(err, tokenizer3, token) {
    if (token) {
      throw err + " -- " + tokenizer3.parseString + " with next token: " + token;
    }
    throw err + " -- " + tokenizer3.parseString;
  }
};
var Tokenizer$12 = tokenizerExports2;
var TokenTypes$42 = TokenTypes_12;
var E$42 = exceptions2;
var range$12 = function range3(tokenizer3, openingToken, state, out) {
  var token = tokenizer3.peek();
  var dotCount = 1;
  var done = false;
  var inclusive = true;
  var idx = state.indexer.length - 1;
  var from2 = Tokenizer$12.toNumber(state.indexer[idx]);
  var to;
  if (isNaN(from2)) {
    E$42.throwError(E$42.range.precedingNaN, tokenizer3);
  }
  while (!done && !token.done) {
    switch (token.type) {
      case TokenTypes$42.dotSeparator:
        if (dotCount === 3) {
          E$42.throwError(E$42.unexpectedToken, tokenizer3);
        }
        ++dotCount;
        if (dotCount === 3) {
          inclusive = false;
        }
        break;
      case TokenTypes$42.token:
        to = Tokenizer$12.toNumber(tokenizer3.next().token);
        if (isNaN(to)) {
          E$42.throwError(E$42.range.suceedingNaN, tokenizer3);
        }
        done = true;
        break;
      default:
        done = true;
        break;
    }
    if (!done) {
      tokenizer3.next();
      token = tokenizer3.peek();
    } else {
      break;
    }
  }
  state.indexer[idx] = { from: from2, to: inclusive ? to : to - 1 };
};
var TokenTypes$32 = TokenTypes_12;
var E$32 = exceptions2;
var quoteE2 = E$32.quote;
var quote$12 = function quote3(tokenizer3, openingToken, state, out) {
  var token = tokenizer3.next();
  var innerToken = "";
  var openingQuote = openingToken.token;
  var escaping = false;
  var done = false;
  while (!token.done) {
    switch (token.type) {
      case TokenTypes$32.token:
      case TokenTypes$32.space:
      case TokenTypes$32.dotSeparator:
      case TokenTypes$32.commaSeparator:
      case TokenTypes$32.openingBracket:
      case TokenTypes$32.closingBracket:
      case TokenTypes$32.openingBrace:
      case TokenTypes$32.closingBrace:
        if (escaping) {
          E$32.throwError(quoteE2.illegalEscape, tokenizer3);
        }
        innerToken += token.token;
        break;
      case TokenTypes$32.quote:
        if (escaping) {
          innerToken += token.token;
          escaping = false;
        } else if (token.token !== openingQuote) {
          innerToken += token.token;
        } else {
          done = true;
        }
        break;
      case TokenTypes$32.escape:
        escaping = true;
        break;
      default:
        E$32.throwError(E$32.unexpectedToken, tokenizer3);
    }
    if (done) {
      break;
    }
    token = tokenizer3.next();
  }
  if (innerToken.length === 0) {
    E$32.throwError(quoteE2.empty, tokenizer3);
  }
  state.indexer[state.indexer.length] = innerToken;
};
var RoutedTokens$22 = {
  integers: "integers",
  ranges: "ranges",
  keys: "keys"
};
var TokenTypes$22 = TokenTypes_12;
var RoutedTokens$12 = RoutedTokens$22;
var E$22 = exceptions2;
var routedE2 = E$22.routed;
var routed$12 = function routed3(tokenizer3, openingToken, state, out) {
  var routeToken = tokenizer3.next();
  var named = false;
  var name = "";
  switch (routeToken.token) {
    case RoutedTokens$12.integers:
    case RoutedTokens$12.ranges:
    case RoutedTokens$12.keys:
      break;
    default:
      E$22.throwError(routedE2.invalid, tokenizer3);
      break;
  }
  var next = tokenizer3.next();
  if (next.type === TokenTypes$22.colon) {
    named = true;
    next = tokenizer3.next();
    if (next.type !== TokenTypes$22.token) {
      E$22.throwError(routedE2.invalid, tokenizer3);
    }
    name = next.token;
    next = tokenizer3.next();
  }
  if (next.type === TokenTypes$22.closingBrace) {
    var outputToken = {
      type: routeToken.token,
      named,
      name
    };
    state.indexer[state.indexer.length] = outputToken;
  } else {
    E$22.throwError(routedE2.invalid, tokenizer3);
  }
};
var TokenTypes$12 = TokenTypes_12;
var E$12 = exceptions2;
var idxE2 = E$12.indexer;
var range4 = range$12;
var quote4 = quote$12;
var routed4 = routed$12;
var indexer$12 = function indexer3(tokenizer3, openingToken, state, out) {
  var token = tokenizer3.next();
  var done = false;
  var allowedMaxLength = 1;
  var routedIndexer = false;
  state.indexer = [];
  while (!token.done) {
    switch (token.type) {
      case TokenTypes$12.token:
      case TokenTypes$12.quote:
        if (state.indexer.length === allowedMaxLength) {
          E$12.throwError(idxE2.requiresComma, tokenizer3);
        }
        break;
    }
    switch (token.type) {
      case TokenTypes$12.openingBrace:
        routedIndexer = true;
        routed4(tokenizer3, token, state);
        break;
      case TokenTypes$12.token:
        var t2 = +token.token;
        if (isNaN(t2)) {
          E$12.throwError(idxE2.needQuotes, tokenizer3);
        }
        state.indexer[state.indexer.length] = t2;
        break;
      case TokenTypes$12.dotSeparator:
        if (!state.indexer.length) {
          E$12.throwError(idxE2.leadingDot, tokenizer3);
        }
        range4(tokenizer3, token, state);
        break;
      case TokenTypes$12.space:
        break;
      case TokenTypes$12.closingBracket:
        done = true;
        break;
      case TokenTypes$12.quote:
        quote4(tokenizer3, token, state);
        break;
      case TokenTypes$12.openingBracket:
        E$12.throwError(idxE2.nested, tokenizer3);
        break;
      case TokenTypes$12.commaSeparator:
        ++allowedMaxLength;
        break;
      default:
        E$12.throwError(E$12.unexpectedToken, tokenizer3);
        break;
    }
    if (done) {
      break;
    }
    token = tokenizer3.next();
  }
  if (state.indexer.length === 0) {
    E$12.throwError(idxE2.empty, tokenizer3);
  }
  if (state.indexer.length > 1 && routedIndexer) {
    E$12.throwError(idxE2.routedTokens, tokenizer3);
  }
  if (state.indexer.length === 1) {
    state.indexer = state.indexer[0];
  }
  out[out.length] = state.indexer;
  state.indexer = void 0;
};
var TokenTypes2 = TokenTypes_12;
var E2 = exceptions2;
var indexer4 = indexer$12;
var head$12 = function head3(tokenizer3) {
  var token = tokenizer3.next();
  var state = {};
  var out = [];
  while (!token.done) {
    switch (token.type) {
      case TokenTypes2.token:
        var first = +token.token[0];
        if (!isNaN(first)) {
          E2.throwError(E2.invalidIdentifier, tokenizer3);
        }
        out[out.length] = token.token;
        break;
      case TokenTypes2.dotSeparator:
        if (out.length === 0) {
          E2.throwError(E2.unexpectedToken, tokenizer3);
        }
        break;
      case TokenTypes2.space:
        break;
      case TokenTypes2.openingBracket:
        indexer4(tokenizer3, token, state, out);
        break;
      default:
        E2.throwError(E2.unexpectedToken, tokenizer3);
        break;
    }
    token = tokenizer3.next();
  }
  if (out.length === 0) {
    E2.throwError(E2.invalidPath, tokenizer3);
  }
  return out;
};
var Tokenizer2 = tokenizerExports2;
var head4 = head$12;
var RoutedTokens2 = RoutedTokens$22;
var parser4 = function parser5(string, extendedRules) {
  return head4(new Tokenizer2(string, extendedRules));
};
var src$1 = parser4;
parser4.fromPathsOrPathValues = function(paths, ext) {
  if (!paths) {
    return [];
  }
  var out = [];
  for (var i3 = 0, len2 = paths.length; i3 < len2; i3++) {
    if (typeof paths[i3] === "string") {
      out[i3] = parser4(paths[i3], ext);
    } else if (typeof paths[i3].path === "string") {
      out[i3] = {
        path: parser4(paths[i3].path, ext),
        value: paths[i3].value
      };
    } else {
      out[i3] = paths[i3];
    }
  }
  return out;
};
parser4.fromPath = function(path, ext) {
  if (!path) {
    return [];
  }
  if (typeof path === "string") {
    return parser4(path, ext);
  }
  return path;
};
parser4.RoutedTokens = RoutedTokens2;
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
  } catch (e2) {
    observer.onError(new InvalidSourceError$2(e2));
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
var isPathValue$3 = function isPathValue2(pathValue2) {
  return isObject$4(pathValue2) && (isArray$5(pathValue2.path) || typeof pathValue2.path === "string");
};
var isObject$3 = isObject$f;
var isJSONEnvelope$4 = function isJSONEnvelope(envelope) {
  return isObject$3(envelope) && "json" in envelope;
};
var isArray$42 = Array.isArray;
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
    if (isArray$42(arg)) {
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
var empty$12 = { dispose: function() {
} };
function ImmediateScheduler$1() {
}
ImmediateScheduler$1.prototype.schedule = function schedule2(action) {
  action();
  return empty$12;
};
ImmediateScheduler$1.prototype.scheduleWithState = function scheduleWithState2(state, action) {
  action(this, state);
  return empty$12;
};
var ImmediateScheduler_1 = ImmediateScheduler$1;
var removeNode2 = removeNode$2;
var updateNodeAncestors2 = updateNodeAncestors$3;
var collect = function collect2(lru, expired, totalArg, max, ratioArg, version3) {
  var total = totalArg;
  var ratio = ratioArg;
  if (typeof ratio !== "number") {
    ratio = 0.75;
  }
  var shouldUpdate = typeof version3 === "number";
  var targetSize = max * ratio;
  var parent, node, size;
  node = expired.pop();
  while (node) {
    size = node.$size || 0;
    total -= size;
    if (shouldUpdate === true) {
      updateNodeAncestors2(node, size, lru, version3);
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
        updateNodeAncestors2(node, size, lru, version3);
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
var isArray$32 = Array.isArray;
var isObject$2 = isObject$f;
var isJSONGraphEnvelope$3 = function isJSONGraphEnvelope(envelope) {
  return isObject$2(envelope) && isArray$32(envelope.paths) && (isObject$2(envelope.jsonGraph) || isObject$2(envelope.jsong) || isObject$2(envelope.json) || isObject$2(envelope.values) || isObject$2(envelope.value));
};
var createHardlink2 = createHardlink$2;
var __prefix = reservedPrefix$1;
var $ref$1 = ref;
var getBoundValue = requireGetBoundValue();
var isArray$22 = Array.isArray;
var hasOwn = hasOwn_1;
var isObject$1 = isObject$f;
var isExpired$2 = isExpired$7;
var isFunction3 = isFunction$5;
var isPrimitive$1 = isPrimitive$4;
var expireNode$1 = expireNode$5;
var incrementVersion2 = incrementVersionExports;
var mergeValueOrInsertBranch2 = mergeValueOrInsertBranch$1;
var NullInPathError = NullInPathError_1;
var setPathMaps = function setPathMaps2(model, pathMapEnvelopes, x, errorSelector2, comparator2) {
  var modelRoot = model._root;
  var lru = modelRoot;
  var expired = modelRoot.expired;
  var version3 = incrementVersion2();
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
      version3,
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
function setPathMap(pathMap, depth, root4, parent, node, requestedPaths, optimizedPaths, requestedPath, optimizedPath, version3, expired, lru, comparator2, errorSelector2) {
  var keys2 = getKeys(pathMap);
  if (keys2 && keys2.length) {
    var keyIndex = 0;
    var keyCount = keys2.length;
    var optimizedIndex = optimizedPath.index;
    do {
      var key = keys2[keyIndex];
      var child = pathMap[key];
      var branch = isObject$1(child) && !child.$type;
      requestedPath.depth = depth;
      var results = setNode(
        root4,
        parent,
        node,
        key,
        child,
        branch,
        false,
        requestedPath,
        optimizedPath,
        version3,
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
            root4,
            nextParent,
            nextNode,
            requestedPaths,
            optimizedPaths,
            requestedPath,
            optimizedPath,
            version3,
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
function setReference(value, root4, node, requestedPath, optimizedPath, version3, expired, lru, comparator2, errorSelector2) {
  var reference = node.value;
  optimizedPath.length = 0;
  optimizedPath.push.apply(optimizedPath, reference);
  if (isExpired$2(node)) {
    optimizedPath.index = reference.length;
    expireNode$1(node, expired, lru);
    return [void 0, root4];
  }
  var container = node;
  var parent = root4;
  node = node.$_context;
  if (node != null) {
    parent = node.$_parent || root4;
    optimizedPath.index = reference.length;
  } else {
    var index2 = 0;
    var count = reference.length - 1;
    optimizedPath.index = index2;
    parent = node = root4;
    do {
      var key = reference[index2];
      var branch = index2 < count;
      var results = setNode(
        root4,
        parent,
        node,
        key,
        value,
        branch,
        true,
        requestedPath,
        optimizedPath,
        version3,
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
function setNode(root4, parent, node, key, value, branch, reference, requestedPath, optimizedPath, version3, expired, lru, comparator2, errorSelector2) {
  var type = node.$type;
  while (type === $ref$1) {
    var results = setReference(
      value,
      root4,
      node,
      requestedPath,
      optimizedPath,
      version3,
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
    version3,
    expired,
    lru,
    comparator2,
    errorSelector2
  );
  return [node, parent];
}
function getKeys(pathMap) {
  if (isObject$1(pathMap) && !pathMap.$type) {
    var keys2 = [];
    var itr = 0;
    if (isArray$22(pathMap)) {
      keys2[itr++] = "length";
    }
    for (var key in pathMap) {
      if (key[0] === __prefix || !hasOwn(pathMap, key)) {
        continue;
      }
      keys2[itr++] = key;
    }
    return keys2;
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
var src2 = {
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
var isArray$12 = Array.isArray;
var isPathValue$12 = isPathValue$3;
var isJSONGraphEnvelope$2 = isJSONGraphEnvelope$3;
var isJSONEnvelope$2 = isJSONEnvelope$4;
var pathSyntax$3 = src$1;
var validateInput$3 = function validateInput(args, allowedInput, method) {
  for (var i3 = 0, len2 = args.length; i3 < len2; ++i3) {
    var arg = args[i3];
    var valid = false;
    if (isArray$12(arg) && allowedInput.path) {
      valid = true;
    } else if (typeof arg === "string" && allowedInput.pathSyntax) {
      try {
        pathSyntax$3.fromPath(arg);
        valid = true;
      } catch (errorMessage) {
        return new Error("Path syntax validation error -- " + errorMessage);
      }
    } else if (isPathValue$12(arg) && allowedInput.pathValue) {
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
    } else if (typeof arg === "function" && i3 + 1 === len2 && allowedInput.selector) {
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
  var keys2 = Object.keys(boxedValue);
  var key;
  var i3;
  var l2;
  for (i3 = 0, l2 = keys2.length; i3 < l2; i3++) {
    key = keys2[i3];
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
      var isObject4 = cacheNext.value && typeof cacheNext.value === "object";
      var isUserCreatedcacheNext = !cacheNext.$_modelCreated;
      var value;
      if (isObject4 || isUserCreatedcacheNext) {
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
function defaultEnvelope(isJSONG2) {
  return isJSONG2 ? { jsonGraph: {}, paths: [] } : { json: {} };
}
var get$3 = function get4(walk, isJSONG2) {
  return function innerGet(model, paths, seed) {
    var nextSeed = isJSONG2 ? seed : [{}];
    var valueNode = nextSeed[0];
    var results = {
      values: nextSeed,
      optimizedPaths: []
    };
    var cache = model._root.cache;
    var boundPath = model._path;
    var currentCachePosition = cache;
    var optimizedPath, optimizedLength;
    var i3, len2;
    var requestedPath = [];
    var derefInfo = [];
    var referenceContainer;
    if (boundPath.length) {
      if (isJSONG2) {
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
    for (i3 = 0, len2 = paths.length; i3 < len2; i3++) {
      walk(
        model,
        cache,
        currentCachePosition,
        paths[i3],
        0,
        valueNode,
        results,
        derefInfo,
        requestedPath,
        optimizedPath,
        optimizedLength,
        isJSONG2,
        false,
        referenceContainer
      );
    }
    mergeInto(valueNode, paths.length ? seed[0] : defaultEnvelope(isJSONG2));
    return results;
  };
};
var promote$1 = requirePromote();
var clone4 = requireClone2();
var onError$1 = function onError2(model, node, depth, requestedPath, outerResults) {
  var value = node.value;
  if (!outerResults.errors) {
    outerResults.errors = [];
  }
  if (model._boxed) {
    value = clone4(node);
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
    for (var i3 = depth; i3 < path.length && !isEmpty; ++i3) {
      if (isEmptyAtom(path[i3])) {
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
  var isArray4 = Array.isArray(atom3);
  if (isArray4 && atom3.length) {
    return false;
  } else if (isArray4) {
    return true;
  }
  var from2 = atom3.from;
  var to = atom3.to;
  if (from2 === void 0 || from2 <= to) {
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
var onValueType$1 = function onValueType(model, node, path, depth, seed, outerResults, branchInfo, requestedPath, optimizedPath, optimizedLength, isJSONG2, fromReference) {
  var currType = node && node.$type;
  if (!node || !currType) {
    var materialized = isMaterialized2(model);
    if (materialized || !isJSONG2) {
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
        isJSONG2
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
    if (isJSONG2 || model._treatErrorsAsValues) {
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
        isJSONG2
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
        isJSONG2
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
      isJSONG2
    );
  }
};
var followReference2 = requireFollowReference2();
var onValueType2 = onValueType$1;
var onValue2 = onValue$2;
var isExpired2 = requireIsExpired();
var iterateKeySet3 = lib$1.iterateKeySet;
var $ref = ref;
var promote = requirePromote();
var walkPath$1 = function walkPath(model, root4, curr, path, depth, seed, outerResults, branchInfo, requestedPath, optimizedPathArg, optimizedLength, isJSONG2, fromReferenceArg, referenceContainerArg) {
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
      isJSONG2,
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
    key = iterateKeySet3(keySet, iteratorNote);
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
        isJSONG2
      );
      if (iteratorNote && !iteratorNote.done) {
        key = iterateKeySet3(keySet, iteratorNote);
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
        if (isJSONG2) {
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
            isJSONG2
          );
        }
        var ref3 = followReference2(
          model,
          root4,
          root4,
          next,
          value,
          seed,
          isJSONG2
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
      root4,
      next,
      path,
      nextDepth,
      seed,
      outerResults,
      branchInfo,
      requestedPath,
      nextOptimizedPath,
      nextOptimizedLength,
      isJSONG2,
      fromReference,
      referenceContainer
    );
    if (iteratorNote && !iteratorNote.done) {
      key = iterateKeySet3(keySet, iteratorNote);
    }
  } while (iteratorNote && !iteratorNote.done);
};
var get$2 = get$3;
var walkPath2 = walkPath$1;
var getWithPathsAsPathMap$2 = get$2(walkPath2, false);
var getWithPathsAsJSONGraph$1 = get$2(walkPath2, true);
var get_12 = {
  getValueSync: requireGetValueSync(),
  getBoundValue: requireGetBoundValue(),
  getWithPathsAsPathMap: getWithPathsAsPathMap$2,
  getWithPathsAsJSONGraph: getWithPathsAsJSONGraph$1
};
var validInput = {
  path: true,
  pathSyntax: true
};
var gets = get_12;
var getWithPathsAsJSONGraph = gets.getWithPathsAsJSONGraph;
var getWithPathsAsPathMap$1 = gets.getWithPathsAsPathMap;
var checkCacheAndReport$2 = function checkCacheAndReport(model, requestedPaths, observer, progressive, isJSONG2, seed, errors3) {
  var results = isJSONG2 ? getWithPathsAsJSONGraph(model, requestedPaths, seed) : getWithPathsAsPathMap$1(model, requestedPaths, seed);
  var valueNode = results.values && results.values[0];
  var completed = !results.requestedMissingPaths || !results.requestedMissingPaths.length || !model._source;
  if (results.errors) {
    var errs = results.errors;
    var errorsLength = errors3.length;
    for (var i3 = 0, len2 = errs.length; i3 < len2; ++i3, ++errorsLength) {
      errors3[errorsLength] = errs[i3];
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
    if (errors3.length) {
      observer.onError(errors3);
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
MaxRetryExceededError$2.is = function(e2) {
  return e2 && e2.name === "MaxRetryExceededError";
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
var getRequestCycle$1 = function getRequestCycle(getResponse, model, results, observer, errors3, count) {
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
    for (var i3 = 0, len2 = requestedMissingPaths.length; i3 < len2; ++i3) {
      boundRequestedMissingPaths[i3] = boundPath.concat(requestedMissingPaths[i3]);
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
      errors3
    );
    if (nextResults) {
      disposable.currentDisposable = getRequestCycle(
        getResponse,
        model,
        nextResults,
        observer,
        errors3,
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
var empty2 = { dispose: function() {
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
  var errors3 = [];
  var model = this.model;
  var isJSONG2 = observer.isJSONG = this.isJSONGraph;
  var isProgressive = this.isProgressive;
  var results = checkCacheAndReport2(
    model,
    this.currentRemainingPaths,
    observer,
    isProgressive,
    isJSONG2,
    seed,
    errors3
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
    return empty2;
  }
  return getRequestCycle2(
    this,
    model,
    results,
    observer,
    errors3,
    1
  );
};
var GetResponse_1 = GetResponse$3;
var pathSyntax$2 = src$1;
var ModelResponse$3 = ModelResponse_1;
var GET_VALID_INPUT$1 = validInput;
var validateInput$2 = validateInput$3;
var GetResponse$2 = GetResponse_1;
var get$1 = function get5() {
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
  var i3 = -1;
  var n2 = array.length;
  var array2 = [];
  while (++i3 < n2) {
    var array3 = selector(array[i3], i3, array);
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
var getWithPathsAsPathMap = get_12.getWithPathsAsPathMap;
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
var isArray3 = Array.isArray;
var isPathValue3 = isPathValue$3;
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
    if (isArray3(arg) || typeof arg === "string") {
      arg = pathSyntax$1.fromPath(arg);
      argType = "PathValues";
    } else if (isPathValue3(arg)) {
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
var set3 = function set4() {
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
          var i3 = 0;
          var len2 = refPath.length;
          validContainer = true;
          for (; validContainer && i3 < len2; ++i3) {
            if (containerPath[i3] !== refPath[i3]) {
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
var getValue3;
var hasRequiredGetValue2;
function requireGetValue2() {
  if (hasRequiredGetValue2)
    return getValue3;
  hasRequiredGetValue2 = 1;
  var ModelResponse2 = ModelResponse_1;
  var pathSyntax3 = src$1;
  getValue3 = function getValue4(path) {
    var parsedPath = pathSyntax3.fromPath(path);
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
  return getValue3;
}
var setValue;
var hasRequiredSetValue;
function requireSetValue() {
  if (hasRequiredSetValue)
    return setValue;
  hasRequiredSetValue = 1;
  var jsong2 = src2;
  var ModelResponse2 = ModelResponse_1;
  var isPathValue4 = isPathValue$3;
  setValue = function setValue2(pathArg, valueArg) {
    var value = isPathValue4(pathArg) ? pathArg : jsong2.pathValue(pathArg, valueArg);
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
  var pathSyntax3 = src$1;
  var getValueSync2 = requireGetValueSync();
  sync$2 = function _getValueSync(pathArg) {
    var path = pathSyntax3.fromPath(pathArg);
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
  var pathSyntax3 = src$1;
  var isPathValue4 = isPathValue$3;
  var setPathValues2 = requireSetPathValues();
  sync$1 = function setValueSync(pathArg, valueArg, errorSelectorArg, comparatorArg) {
    var path = pathSyntax3.fromPath(pathArg);
    var value = valueArg;
    var errorSelector2 = errorSelectorArg;
    var comparator2 = comparatorArg;
    if (isPathValue4(path)) {
      comparator2 = errorSelector2;
      errorSelector2 = value;
      value = path;
    } else {
      value = {
        path,
        value
      };
    }
    if (isPathValue4(value) === false) {
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
var sync2;
var hasRequiredSync;
function requireSync() {
  if (hasRequiredSync)
    return sync2;
  hasRequiredSync = 1;
  var pathSyntax3 = src$1;
  var getBoundValue2 = requireGetBoundValue();
  var InvalidModelError2 = requireInvalidModelError();
  sync2 = function derefSync(boundPathArg) {
    var boundPath = pathSyntax3.fromPath(boundPathArg);
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
  return sync2;
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
    var version3 = gen && gen.$_version;
    return version3 == null ? -1 : version3;
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
  var isFunction4 = isFunction$5;
  var isPrimitive3 = isPrimitive$4;
  var expireNode3 = expireNode$5;
  var iterateKeySet4 = lib$1.iterateKeySet;
  var incrementVersion3 = incrementVersionExports;
  var updateNodeAncestors3 = updateNodeAncestors$3;
  var removeNodeAndDescendants2 = requireRemoveNodeAndDescendants();
  invalidatePathSets = function invalidatePathSets2(model, paths) {
    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version3 = incrementVersion3();
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = bound.length ? getBoundValue2(model, bound).value : cache;
    var parent = node.$_parent || cache;
    var initialVersion = cache.$_version;
    var pathIndex = -1;
    var pathCount3 = paths.length;
    while (++pathIndex < pathCount3) {
      var path = paths[pathIndex];
      invalidatePathSet(path, 0, cache, parent, node, version3, expired, lru);
    }
    var newVersion = cache.$_version;
    var rootChangeHandler = modelRoot.onChange;
    if (isFunction4(rootChangeHandler) && initialVersion !== newVersion) {
      rootChangeHandler();
    }
  };
  function invalidatePathSet(path, depth, root4, parent, node, version3, expired, lru) {
    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet4(keySet, note);
    do {
      var results = invalidateNode(root4, parent, node, key, branch, expired, lru);
      var nextNode = results[0];
      var nextParent = results[1];
      if (nextNode) {
        if (branch) {
          invalidatePathSet(
            path,
            depth + 1,
            root4,
            nextParent,
            nextNode,
            version3,
            expired,
            lru
          );
        } else if (removeNodeAndDescendants2(nextNode, nextParent, key, lru, void 0)) {
          updateNodeAncestors3(nextParent, getSize4(nextNode), lru, version3);
        }
      }
      key = iterateKeySet4(keySet, note);
    } while (!note.done);
  }
  function invalidateReference(root4, node, expired, lru) {
    if (isExpired3(node)) {
      expireNode3(node, expired, lru);
      return [void 0, root4];
    }
    promote2(lru, node);
    var container = node;
    var reference = node.value;
    var parent = root4;
    node = node.$_context;
    if (node != null) {
      parent = node.$_parent || root4;
    } else {
      var index2 = 0;
      var count = reference.length - 1;
      parent = node = root4;
      do {
        var key = reference[index2];
        var branch = index2 < count;
        var results = invalidateNode(root4, parent, node, key, branch, expired, lru);
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
  function invalidateNode(root4, parent, node, key, branch, expired, lru) {
    var type = node.$type;
    while (type === $ref2) {
      var results = invalidateReference(root4, node, expired, lru);
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
  var isObject4 = isObject$f;
  var isExpired3 = isExpired$7;
  var isFunction4 = isFunction$5;
  var isPrimitive3 = isPrimitive$4;
  var expireNode3 = expireNode$5;
  var incrementVersion3 = incrementVersionExports;
  var updateNodeAncestors3 = updateNodeAncestors$3;
  var removeNodeAndDescendants2 = requireRemoveNodeAndDescendants();
  invalidatePathMaps = function invalidatePathMaps2(model, pathMapEnvelopes) {
    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version3 = incrementVersion3();
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = bound.length ? getBoundValue2(model, bound).value : cache;
    var parent = node.$_parent || cache;
    var initialVersion = cache.$_version;
    var pathMapIndex = -1;
    var pathMapCount = pathMapEnvelopes.length;
    while (++pathMapIndex < pathMapCount) {
      var pathMapEnvelope = pathMapEnvelopes[pathMapIndex];
      invalidatePathMap(pathMapEnvelope.json, cache, parent, node, version3, expired, lru);
    }
    var newVersion = cache.$_version;
    var rootChangeHandler = modelRoot.onChange;
    if (isFunction4(rootChangeHandler) && initialVersion !== newVersion) {
      rootChangeHandler();
    }
  };
  function invalidatePathMap(pathMap, root4, parent, node, version3, expired, lru) {
    if (isPrimitive3(pathMap) || pathMap.$type) {
      return;
    }
    for (var key in pathMap) {
      if (key[0] !== __prefix2 && hasOwn2(pathMap, key)) {
        var child = pathMap[key];
        var branch = isObject4(child) && !child.$type;
        var results = invalidateNode(root4, parent, node, key, branch, expired, lru);
        var nextNode = results[0];
        var nextParent = results[1];
        if (nextNode) {
          if (branch) {
            invalidatePathMap(child, root4, nextParent, nextNode, version3, expired, lru);
          } else if (removeNodeAndDescendants2(nextNode, nextParent, key, lru)) {
            updateNodeAncestors3(nextParent, getSize4(nextNode), lru, version3);
          }
        }
      }
    }
  }
  function invalidateReference(root4, node, expired, lru) {
    if (isExpired3(node)) {
      expireNode3(node, expired, lru);
      return [void 0, root4];
    }
    promote2(lru, node);
    var container = node;
    var reference = node.value;
    var parent = root4;
    node = node.$_context;
    if (node != null) {
      parent = node.$_parent || root4;
    } else {
      var index2 = 0;
      var count = reference.length - 1;
      parent = node = root4;
      do {
        var key = reference[index2];
        var branch = index2 < count;
        var results = invalidateNode(root4, parent, node, key, branch, expired, lru);
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
  function invalidateNode(root4, parent, node, key, branch, expired, lru) {
    var type = node.$type;
    while (type === $ref2) {
      var results = invalidateReference(root4, node, expired, lru);
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
var pathSyntax2 = src$1;
var getSize3 = getSize$6;
var isObject3 = isObject$f;
var isPrimitive2 = isPrimitive$4;
var isJSONEnvelope2 = isJSONEnvelope$4;
var isJSONGraphEnvelope2 = isJSONGraphEnvelope$3;
var setCache = setPathMaps;
var setJSONGraphs2 = setJSONGraphs$3;
var jsong = src2;
var ID = 0;
var validateInput2 = validateInput$3;
var noOp3 = function() {
};
var getCache2 = getCache$1;
var get6 = get_12;
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
Model.prototype.set = set3;
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
Model.prototype.call = function call3() {
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
    args[argsIdx] = pathSyntax2.fromPath(arguments[argsIdx]);
    if (!Array.isArray(args[argsIdx]) || !args[argsIdx].length) {
      throw new Error("Invalid argument");
    }
  }
  new InvalidateResponse(this, args).subscribe(noOp3, function(e2) {
    throw e2;
  });
};
Model.prototype.deref = requireDeref();
Model.prototype._hasValidParentReference = requireHasValidParentReference();
Model.prototype.getValue = requireGetValue2();
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
    } else if (isObject3(cacheOrJSONGraphEnvelope)) {
      out = setCache(this, [{ json: cacheOrJSONGraphEnvelope }])[0];
    }
    if (out) {
      get6.getWithPathsAsPathMap(this, out, []);
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
  var result4 = [{}];
  var path = this._path;
  get6.getWithPathsAsJSONGraph(this, paths, result4);
  this._path = path;
  return result4[0].jsonGraph;
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
  var path = pathArg && pathSyntax2.fromPath(pathArg) || [];
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
  var clone5 = new this.constructor(this);
  for (var key in opts) {
    var value = opts[key];
    if (value === "delete") {
      delete clone5[key];
    } else {
      clone5[key] = value;
    }
  }
  clone5.setCache = void 0;
  return clone5;
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
  var clone5 = this._clone();
  clone5._request = new RequestQueue(clone5, scheduler);
  return clone5;
};
Model.prototype.unbatch = function unbatch() {
  var clone5 = this._clone();
  clone5._request = new RequestQueue(clone5, new ImmediateScheduler());
  return clone5;
};
Model.prototype.treatErrorsAsValues = function treatErrorsAsValues() {
  return this._clone({
    _treatErrorsAsValues: true
  });
};
Model.prototype.asDataSource = function asDataSource() {
  return new ModelDataSourceAdapter(this);
};
Model.prototype._materialize = function materialize4() {
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
Model.prototype.toJSON = function toJSON2() {
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
Model.prototype._getPathValuesAsPathMap = get6.getWithPathsAsPathMap;
Model.prototype._getPathValuesAsJSONG = get6.getWithPathsAsJSONGraph;
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
var lib3 = falcor;
falcor.Model = Model_1;
var index = /* @__PURE__ */ getDefaultExportFromCjs3(lib3);

// app/src/store/helpers.js
function extractFromCache({ obj, path, idx = 0, root: root4 = obj, parentAtom, verbose }) {
  if (verbose) {
    console.log({ obj, path, idx });
  }
  if (obj && obj.$type === "atom" && path.length - idx !== 0) {
    const step = path[idx];
    if (obj.value === void 0) {
      return { value: void 0, parentAtom, $type: obj.$type };
    }
    return extractFromCache({ obj: obj.value[step], path, idx: idx + 1, root: root4, parentAtom: { obj, relPath: path.slice(idx) }, verbose });
  } else if (obj && obj.$type === "ref") {
    const newPath = obj.value.concat(path.slice(idx));
    return extractFromCache({ obj: root4, path: newPath, verbose });
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
    return extractFromCache({ obj: obj[step], path, idx: idx + 1, root: root4, verbose });
  }
}

// app/src/falcor/server.js
var Server = class {
  constructor(model) {
    this.dataSource = model.asDataSource();
    this.model = model;
  }
  execute(action) {
    const method = action[1];
    const jsonGraphEnvelope = action[2];
    const callPath = action[2];
    const args = action[3] || [];
    const pathSuffixes = action[4] || [];
    let paths;
    switch (method) {
      case "get":
        paths = action[2];
        return this.dataSource.get(paths)._toJSONG();
      case "set":
        return this.dataSource.set(jsonGraphEnvelope)._toJSONG();
      case "call":
        paths = action[5] || [];
        console.log({ callPath, args, pathSuffixes, paths });
        return this.dataSource.call(callPath, args, pathSuffixes, paths)._toJSONG();
    }
  }
};
function server_default({
  schema,
  useAll,
  cache,
  dbs,
  session,
  fetch: fetch2
}) {
  const FalcorRouter = makeRouter(toFalcorRoutes(schema, useAll));
  const routerInstance = new FalcorRouter({ dbs, session, fetch: fetch2 });
  const serverModel = index({
    cache,
    source: routerInstance,
    maxSize: 5e5,
    collectRatio: 0.75,
    maxRetries: 1
  }).batch().boxValues();
  routerInstance.model = serverModel.withoutDataSource();
  routerInstance.model.getPageKey = function(path, from2) {
    const listCache = extractFromCache({ path, obj: this._root.cache });
    for (let index2 = from2; index2 > 0; index2--) {
      if (listCache.value?.[index2]?.$pageKey !== void 0) {
        return { pageKey: listCache.value[index2].$pageKey, index: index2 };
      }
    }
    return { index: 0 };
  };
  return new Server(serverModel);
}

// app/src/service-worker/falcor-worker.js
function falcor_worker_default({
  dbConf = {},
  dataSources,
  schema,
  onChange,
  clientDbSeeds,
  localOnly = false
} = {}) {
  if (dataSources) {
    console.warn("Additional data sources not implemented yet.");
  }
  if (typeof schema === "function") {
    schema = schema({ defaultPaths: default_routes_default, addPathTags });
  } else if (schema) {
    schema.paths = { ...default_routes_default, ...falcorTags(schema.paths) };
  }
  self.session = {
    loaded: false,
    pendingInit: null,
    value: null,
    dbs: null,
    falcorServer: null,
    clear() {
      self.session.value = null;
      self.session.falcorServer = null;
      self.session.dbs?.clear();
      self.session.dbs = null;
      self.session.loaded = false;
    },
    async logout() {
      self.session.clear();
      const clientsRes = await clients.matchAll();
      const logoutNavs = clientsRes.map((client) => {
        const url = new URL(client.url);
        let cont = "";
        if (url.pathname.length > 1 || url.hash) {
          cont = `&continue=${encodeURIComponent(url.pathname + url.hash)}`;
        }
        return client.postMessage(`navigate:/_api/_session?logout${cont}`);
      });
      await Promise.all(logoutNavs);
    },
    async refresh() {
      let redirectOtherClients = null;
      let newSession;
      try {
        if (localOnly) {
          newSession = { sessionId: "ephemeral:localOnlySession", userId: "anonymous", env: "dev", appName: "ayuApp" };
        } else {
          const sessionReq = await fetch("/_api/_session", {
            redirect: "error",
            headers: {
              "X-Requested-With": "XMLHttpRequest"
            }
          }).catch((error3) => ({ ok: false, error: error3 }));
          if (sessionReq.ok) {
            newSession = await sessionReq.json();
          }
        }
        if (!newSession?.userId || !newSession?.sessionId) {
          self.session.clear();
          redirectOtherClients = "logout";
        } else if (newSession.userId !== self.session.value?.userId || newSession.sessionId !== self.session.value?.sessionId) {
          self.session.clear();
          let newDbConf;
          if (typeof dbConf === "function") {
            newDbConf = dbConf({ userId: newSession.userId, appName: newSession.appName, env: newSession.env, escapeId, org: newSession.org });
          } else {
            newDbConf = dbConf;
          }
          const clientDbName = escapeId(newSession.userId + "__" + newSession.env + "__" + newSession.appName + (newSession.org ? "__" + newSession.org : "__"));
          const serverDbName = "ayu_" + (newSession.env === "prod" ? escapeId(newSession.appName) : escapeId(newSession.env + "__" + newSession.appName));
          self.session.dbs = await make_pouch_default({
            localOnly,
            clientDbSeeds,
            clientDbName,
            serverDbName,
            sessionId: newSession.sessionId,
            preload: newDbConf.preload,
            clientDesignDocs: newDbConf[clientDbName]
          });
          self.session.falcorServer = server_default({ dbs: self.session.dbs, schema, session: newSession });
          if (newSession.userId && !self.session.loaded) {
            redirectOtherClients = "continue";
          }
        }
        self.session.value = newSession;
        if (redirectOtherClients) {
          const clientsRes = await clients.matchAll();
          const clientNavigations = clientsRes.map((client) => {
            const url = new URL(client.url);
            const query2 = new URLSearchParams(url.search);
            if (redirectOtherClients === "continue") {
              if (url.pathname.startsWith("/_ayu/accounts")) {
                const navMessage = "navigate:" + (query2.get("continue") || "/");
                client.postMessage(navMessage);
                client._ayu_lastNavMessage = navMessage;
                return waitForNavigation(client);
              }
            } else {
              let cont = "";
              if (url.pathname.length > 1 || url.hash || url.search > 0) {
                if (query2.get("continue")) {
                  cont = `continue=${query2.get("continue")}`;
                } else {
                  cont = `continue=${encodeURIComponent(url.pathname + url.search + url.hash)}`;
                }
              }
              if (!url.pathname.startsWith("/_ayu/accounts") && !url.pathname.startsWith("/_api/_session?login")) {
                const url2 = `/_ayu/accounts/?${cont}`;
                console.log("redirecting client", url2, newSession, client);
                client.postMessage("navigate:" + url2);
                return waitForNavigation(client);
              }
            }
          });
          await Promise.all(clientNavigations);
        }
        self.session.loaded = true;
      } catch (err) {
        console.error(err);
      }
      self.session.pendingInit = null;
      return newSession;
    }
  };
  console.log("starting service worker..." + (/* @__PURE__ */ new Date()).toGMTString());
  clients.matchAll().then((res) => {
    res.forEach((client) => client.postMessage(JSON.stringify({ hello: "joe" })));
  });
  async function waitForNavigation(targetClient, tries = 20) {
    const curClients = await clients.matchAll();
    if (curClients.find((client) => client.id === targetClient.id)) {
      if (tries) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return waitForNavigation(targetClient, tries - 1);
      } else {
        console.error("could not navigate client ", targetClient);
        return false;
      }
    }
    return true;
  }
  const pending = {};
  function purgeClients() {
    clients.matchAll().then((res) => {
      Object.keys(pending).forEach((clientId) => {
        if (!res.find((el) => el.id === clientId)) {
          console.log(clientId, "disappeared");
          Object.entries(pending[clientId]).forEach(([reqId, exec]) => {
            exec?.unsubscribe?.();
            exec?.dispose();
            delete pending[clientId][reqId];
          });
          delete pending[clientId];
        }
      });
    });
  }
  setInterval(purgeClients, 2e3);
  addEventListener("message", async (e2) => {
    if (self.session.pendingInit) {
      await self.session.pendingInit;
    }
    if ((!self.session.loaded || !self.session.value?.userId) && !self.session.pendingInit) {
      self.session.pendingInit = self.session.refresh();
      await self.session.pendingInit;
    }
    if (!self.session.falcorServer && !self.session.pendingInit) {
      self.session.pendingInit = self.session.refresh();
      await self.session.pendingInit;
    }
    if (self.session.pendingInit) {
      await self.session.pendingInit;
    }
    const data = JSON.parse(e2.data);
    const clientId = e2.source.id;
    const reqId = data[0];
    if (!pending[clientId]) {
      pending[clientId] = {};
    }
    if (reqId === -1) {
      return;
    }
    if (!self.session.falcorServer) {
      return e2.source.postMessage(JSON.stringify({ id: reqId, error: "logged out / no falcor server session active" }));
    }
    const exec = self.session.falcorServer.execute(data).subscribe(
      (result4) => {
        if (data[1] === "call" && data[2]?.[0] === "_sync") {
          onChange?.({
            model: self.session.falcorServer.dataSource._model,
            data: result4.json,
            _where: "service-worker"
          });
        }
        e2.source.postMessage(JSON.stringify({ id: reqId, value: result4 }));
      },
      (error3) => {
        e2.source.postMessage(JSON.stringify({ id: reqId, error: error3 }));
      },
      async (_done) => {
        await e2.source.postMessage(JSON.stringify({ id: reqId, done: true }));
        exec?.unsubscribe?.();
        exec?.dispose();
        delete pending[clientId][reqId];
      }
    );
    pending[clientId][reqId] = exec;
  });
  addEventListener("install", () => {
    console.log("worker installing, skip waiting");
    skipWaiting();
  });
  addEventListener("activate", (event) => {
    console.log("worker activating, claiming clients");
    event.waitUntil(clients.claim().then(() => {
      clients.matchAll().then((res) => {
        res.forEach((client) => client.postMessage(JSON.stringify({ worker: "active" })));
      });
    }));
  });
}
export {
  falcor_worker_default as default
};
