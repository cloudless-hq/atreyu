import { readable } from '../deps/svelte-store.js'
import { Route, merge } from '../deps/util.js'
import { urlLogger } from '../lib/url-logger.js'

// TODO: data saver mode respect for preloader

const components = {}

// Safari does not support idleCallback
const onIdle = window.requestIdleCallback || function (cb) {
  cb({ timeRemaining: function () { return 41 } })
}

export default function (schema = {paths: {}, fallback: true}, { preloadDisabled, _preloadDefault } = {}) {
  const routes = []

  ;([...Object.entries(schema.paths)]).forEach(([path, {get, name}]) => {
    if (get && get.tags?.includes('window')) {
      routes.push({ router: new Route(path), name, security: get.security, operationId: get.operationId })
    }
  })

  function routerState ({ hrefOverride, preload, updateRoute } = {}) {
    const {
      search,
      hash,
      host,
      hostname,
      href,
      origin,
      pathname,
      port,
      protocol
    } = hrefOverride ? new URL(hrefOverride) : window.location

    // , ...(new URLSearchParams(hash.split().replaceAll('?', '&')).entries())
    const params = Object.fromEntries([...(new URLSearchParams(search.replaceAll('?', '&')).entries())])

    const pathParts = pathname.split('/').filter(pathPart => pathPart !== '')
    const matchedRoutes = []
    const data = {}

    // TODO: reuse existing match data from previous routes
    routes.forEach(({ router, name, security, operationId }) => {
      const match = router.match(pathname + search + hash)

      if (match) {
        matchedRoutes.push({ spec: router.spec, security, operationId })
        // console.log(router)
        // todo: sort by AST specificity

        if (matchedRoutes.length === 1) {
          data['match'] = {
            _link: (newParams) => {
              Object.entries(newParams).forEach(([key, val]) => {
                if (typeof val === 'string') {
                  newParams[key] = encodeURIComponent(val)
                }
              })
              return router.reverse(newParams)
            },
            _navigate: (newParams, { replaceState } = {}) => {
              Object.entries(newParams).forEach(([key, val]) => {
                if (typeof val === 'string') {
                  newParams[key] = encodeURIComponent(val)
                }
              })

              const newHref = router.reverse(newParams)

              if (replaceState) {
                window.history.replaceState({ location: newHref }, '', newHref)
              } else {
                window.history.pushState({ location: newHref }, '', newHref)
              }

              updateRoute()
            },
            ...match
          }
        }

        if (name) {
          data[name] = {
            _link: (newParams) => {
              Object.entries(newParams).forEach(([key, val]) => {
                if (typeof val === 'string') {
                  newParams[key] = encodeURIComponent(val)
                }
              })
              return router.reverse(newParams)
            },
            _navigate: (newParams, { replaceState } = {}) => {
              Object.entries(newParams).forEach(([key, val]) => {
                if (typeof val === 'string') {
                  newParams[key] = encodeURIComponent(val)
                }
              })

              const newHref = router.reverse(newParams)

              if (replaceState) {
                window.history.replaceState({ location: newHref }, '', newHref)
              } else {
                window.history.pushState({ location: newHref }, '', newHref)
              }

              updateRoute()
            },
            ...match
          }
        } else {
          merge(data, match)
        }
      }
    })

    delete data._

    // localStorage.getItem('atreyu_userId') ?
    let missing = false
    if (matchedRoutes.length < 1) {
      if (!schema.fallback) {
        missing = true
      }
    } else {
      if (matchedRoutes[0].security) {
        matchedRoutes[0].security.forEach(scheme => {
          if (scheme.atreyu) {
            if (scheme.atreyu.includes('userId') && !userId) {
              console.log('userId required for path, redirecting to /accounts/login')
              location.href = '/accounts/login'
            }
          }
        })
      }
    }

    Object.entries(data).forEach(([key, val]) => {
      if (typeof val === 'string') {
        data[key] = decodeURIComponent(val)
      } else if (typeof val === 'object') {
        Object.entries(data[key]).forEach(([key2, val2]) => {
          if (typeof val2 === 'string') {
            data[key][key2] = decodeURIComponent(val2)
          }
        })
      }
    })

    const allData = {
      params,
      hash,
      host,
      hostname,
      href,
      origin,
      path: pathname,
      port,
      protocol,

      pathParts,
      matchedRoutes,

      _pending: null,
      _error: null,
      _errorComponent: null,
      _preloading: preload,
      ...data
    }

    let page

    if (matchedRoutes[0]?.operationId) {
      page = matchedRoutes[0].operationId
      allData._page = page
    } else if (allData._page) {
      if (allData._subPage) {
        page = `${allData._page}/${allData._subPage}`
      } else {
        page = allData._page
      }
    }

    urlLogger({ missing, method: preload ? 'PRELOAD' : 'GET', url: 'window://' + href, body: allData })

    if (page) {
      if (!components[page]) {
        allData._pending = import(`/src/pages/${page}.svelte`)
          .then(comp => {
            components[page] = comp.default
            allData._component = comp.default
            allData._error = null
            allData._pending = null
            return comp.default
          })
          .catch(err => {
            allData._error = err
            if (!allData._errorComponent) {
              return import(`/src/pages/_error.svelte`)
                .then(errComp => {
                  allData._errorComponent = errComp.default
                })
            }
          })
      } else {
        allData._component = components[page]
      }
    }

    return allData
  }

  function findNode (node) {
    while (node && node.nodeName.toUpperCase() !== 'A') {
      node = node.parentNode
    }
    return (node)
  }

  function getLinks (target) {
    const as = [...target.querySelectorAll('a')]
    return as.reduce((agr, a) => {
      if (a.rel !== 'no-preload' && a.rel !== 'external' && !a.href.startsWith('javascript:')) {
        try {
          agr.push((new URL(a.href)).href) // normalize href
        } catch (err) {
          console.error(a.href, err)
        }
      }
      return agr
    }, [])
  }

  function awaitIdle (cb) {
    setTimeout(() => {
      onIdle(IdleDeadline => {
        const remainingTime = IdleDeadline.timeRemaining()
        if (remainingTime > 48) {
          const startTime = Date.now()
          cb(startTime + remainingTime)
        } else {
          setTimeout(() => {
            awaitIdle(cb)
          }, 100)
        }
      })}, 70)
  }

  const finished = new Set()
  const primary = new Set()
  const secondary = new Set()
  let preloaderInstance
  const newDiv = document.createElement('div')
  newDiv.style = 'display: none;'
  async function doIdleWork (endTime) {
    let todo
    let isSecondary = false
    if (primary.size === 0) {
      todo = secondary
      isSecondary = true
    } else {
      todo = primary
    }

    for (const href of todo) {
      // console.log(href)
      if (finished.has(href)) {
        todo.delete(href)
        continue
      }

      const preloadRouterState = routerState({ hrefOverride: href, preload: true })
      // console.log(preloadRouterState, finished, primary, secondary)

      // console.log(preloadRouterState, preloadRouterState._error, preloadRouterState._pending?.then, !!preloadRouterState._pending?.then)
      if (preloadRouterState._pending?.then) {
        await preloadRouterState._pending
      }

      if (!preloadRouterState._page || preloadRouterState._error) {
        finished.add(href)
        todo.delete(href)
        // console.log(finished, todo)
        continue
      }
      // console.log('start', endTime - Date.now())
      if ((endTime > Date.now() + 20)) {
        finished.add(href)
        todo.delete(href)

        const preloadRouterStore = readable({}, set => {
          set(preloadRouterState)
          return () => {}
        })

        try {
          preloaderInstance = new preloadRouterState._component({ target: newDiv, context: new Map([['router', preloadRouterStore]]) })
        } catch (err) {
          console.error('could not preload the component for: ' + href, err, preloadRouterState._component)
        }
        break
      }
    }
    // console.log('instance', endTime - Date.now())

    if (primary.size > 0 || secondary.size > 0) {
      awaitIdle(endTime => {
        if (!isSecondary) {
          getLinks(newDiv).forEach(link => secondary.add(link)) // pagePreloader
        }
        preloaderInstance?.$destroy()
        preloaderInstance = null
        // console.log('destroyed', endTime - Date.now())
        doIdleWork(endTime)
      })
    } else {
      preloaderInstance?.$destroy()
      preloaderInstance = null
    }
  }

  const routerStore = readable({}, set => {
    // TODO: let keepfocus = false
    let resetScroll = false

    function preventer (e) {
      // TODO keepfocus handling
      const a = findNode(e.target)
      if (!a) {
        return {}
      }
      if (a.rel === 'external') {
        return {}
      }
      if (a.rel === 'replace') {
        console.log('todo replace state impl...')
      }
      if (a.href.startsWith('javascript:')) {
        return {}
      }
      e.preventDefault()
      e.stopPropagation()
      return { prevented: true, a }
    }

    function linkClickHandler (e) {
      // only catch left clicks
      if (e.button !== 0) {
        return
      }
      const {prevented, a} = preventer(e)
      if (!prevented) {
        return
      }
      window.history.pushState({ location: a.href }, '', a.href)
      // const popStateEvent = new PopStateEvent('popstate', {})
      // dispatchEvent(popStateEvent)
      updateRoute()
      resetScroll = !a.hasAttribute('noscroll')
    }

    async function updateRoute () {
      // TODO: is async slightly slower & percievable?
      const newState = routerState({ updateRoute })

      if (newState._pending?.then) {
        set(newState)
        await newState._pending
        await set(newState)
      } else {
        await set(newState)
      }

      if (resetScroll) {
        document.body.focus()
      }

      // TODO: const deep_linked = hash && document.getElementById(hash.slice(1));
      // if (scroll) {
      //   scrollTo(scroll.x, scroll.y);
      // } else if (deep_linked) {
      //   // scroll is an element id (from a hash), we need to compute y
      //   scrollTo(0, deep_linked.getBoundingClientRect().top + scrollY)

      if (!preloadDisabled) {
        awaitIdle(endTime => {
          finished.add(location.href)
          getLinks(document.querySelector('#app')).forEach(link => primary.add(link))
          doIdleWork(endTime)
        })
      }

      if (resetScroll) {
        scrollTo(0, 0)
        resetScroll = false
      }
    }

    updateRoute()

    self.addEventListener('popstate', updateRoute)
    self.addEventListener('mousedown', linkClickHandler)
    self.addEventListener('click', preventer)

    return () => {
      self.removeEventListener('popstate', updateRoute)
      self.removeEventListener('mousedown', linkClickHandler)
      self.addEventListener('click', preventer)
    }
  })

  return routerStore
}
