// TODO: only in debug/dev mode
// This is my own code, its in vendor, because i want to release as standdalone package maybe?
const errorHandlers = {
  deleteProperty () {
    console.error('error: calling `delete` on atreyu proxy.')
  },
  defineProperty (oTarget, sKey, oDesc) {
    console.error('error: calling `defineProperty` on atreyu proxy.')
  },
  getOwnPropertyDescriptor (oTarget, sKey) {
    console.error('error: calling `getOwnPropertyDescriptor` on atreyu proxy.')
    return { configurable: true, enumerable: false, value: 5 }
  },
  ownKeys (oTarget, sKey) {
    console.error('error: calling ownKeys on atreyu proxy not supported.')
    return ['ownKeys test']
  },
  getPrototypeOf (target) {
    console.error('error: getting prototype on atreyu proxy not supported.')
    return Object
  }
}

const _start = Symbol('start')
const _end = Symbol('end')

function clean (name, endRegex) {
  let cleanKey
  let delim
  let isPathEnd = false

  const rxRes = endRegex.exec(name)

  if (rxRes) {
    isPathEnd = true
    delim = rxRes[0]
    let suffixLen = name.length - rxRes.index
    cleanKey = name.slice(0, -suffixLen)
  } else {
    cleanKey = name
  }

  cleanKey = !isNaN(Number(cleanKey)) ? Number(cleanKey) : cleanKey

  return { isPathEnd, cleanKey, delim }
}

function makeProxy ({ from, get, set, call, delims = ['$'], id }) {
  const endRegex = new RegExp(`(\\${delims.join('|\\')})$`)

  function objProxy (rootPath, subObj, rev) {
    return new Proxy(subObj, {
      ...errorHandlers,
      has (target, key) {
        if (key === Symbol.iterator) {
          // console.log('iterables not supported yet, plase use array operations')
          return
        }
        if (key === 'length') {
          return true
        }
        console.log('has function trap not well supported', target, key)
        return true
      },
      apply (target, _thisArg, args) {
        const path = [...rootPath]
        path.pop()
        const cleanKey = rootPath[rootPath.length - 1]

        if (cleanKey === 'slice') {
          const arr = {
            length: args[1] - args[0], // TODO: make end max length Math.min(end, items.length)
            [_start]: args[0],
            [_end]: args[1]
          }

          return objProxy(path, arr, rev)
        } else if (cleanKey === 'forEach') {
          console.error('direct forEach call not allowed. please post your use case to get support.')
        } else if (cleanKey === 'map') {
          console.error('direct map call not allowed. please post your use case to get support.')
          console.log(args, target, subObj)
        }

        return call(rootPath, args, '', id)
      },
      set (target, key, newValue, subObjProxy) {
        const { cleanKey } = clean(key, endRegex)

        const path = [...rootPath, cleanKey]

        // subObj = { ...subObj }
        // subObj[cleanKey] = newValue
        let delim = '' // TODO: not impl yet

        return set(path, newValue, delim, id)
      },
      get (obj, key) {
        if (typeof key !== 'string') {
          console.warn('non string key access not supported yet, please raise github issue explaining usecase ', { rootPath, key })
          return []
        }

        let { isPathEnd, cleanKey, delim } = clean(key, endRegex)

        if (cleanKey === 'map') {
          return fun => {
            if (typeof obj[_start] === 'undefined') {
              console.error('map is not allowed on virtual unbounded arrays, you need to use slice first. Please read about non ataomic falcor arrays before you use this!')
              return []
            }
            for (let i = 0; i < obj.length; i++) {
              obj[i] = fun(objProxy([...rootPath, i + obj[_start]], [], rev), i, i + obj[_start])
            }
            return obj
          }
        }

        if (cleanKey === '_rev' && typeof subObj[cleanKey] === 'undefined') {
          return get([...rootPath, cleanKey], subObj, delim, id)
        }

        if (typeof obj?.[_start] !== 'undefined') {
          if (!isNaN(cleanKey)) {
            cleanKey = cleanKey + obj[_start]
          } else if (cleanKey !== 'length') {
            console.error('unexpected slice access, please raise github issue with your usecase')
          }
        }

        if (isPathEnd) {
          return get([...rootPath, cleanKey], subObj[cleanKey], delim, id)
        }

        if (typeof subObj[cleanKey] === 'undefined') {
          if (cleanKey === 'length') {
            return get([...rootPath, cleanKey], 0, delim, id)
          }
          return objProxy([...rootPath, cleanKey], from, rev)
        }

        if (typeof subObj[cleanKey] !== 'object') {
          if (cleanKey === 'length') {
            return get([...rootPath, cleanKey], subObj[cleanKey], delim, id)
          }
          return subObj[cleanKey]
        }

        return objProxy([...rootPath, cleanKey], subObj[cleanKey], rev)
      }
    })
  }

  return objProxy([], from, 0)
}
export { makeProxy }
