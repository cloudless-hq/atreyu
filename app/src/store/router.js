import { readable } from '../deps/svelte-store.js'
import { Route, merge } from '../deps/util.js'
import { urlLogger } from '../lib/url-logger.js'

// todo: data saver mode respect

const components = {}
export default function (schema) {
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

    const pathParts = pathname.split('/').filter(pathPart => pathPart !== '')
    const matchedRoutes = []
    const data = {}

    routes.forEach(({ router, name, security, operationId }) => {
      const match = router.match(pathname + search + hash)

      if (match) {
        if (name) {
          matchedRoutes.push({ spec: router.spec, security, operationId })
          data[name] = {
            _link: (params) => {
              Object.entries(params).forEach(([key, val]) => {
                if (typeof val === 'string') {
                  params[key] = encodeURIComponent(val)
                }
              })
              return router.reverse(params)
            },
            _navigate: (params, { replaceState } = {}) => {
              Object.entries(params).forEach(([key, val]) => {
                if (typeof val === 'string') {
                  params[key] = encodeURIComponent(val)
                }
              })
              const newHref = router.reverse(params)

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
          matchedRoutes.push({ spec: router.spec, security, operationId })
          merge(data, match)
        }
      }
    })

    delete data._

    // localStorage.getItem('atreyu_userId') ?
    let missing = false
    if (matchedRoutes.length < 1) {
      missing = true
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
      // console.log(decodeURIComponent(val), val, key, data)
      //   data[key] = decodeURIComponent(val)
    })

    const allData = {
      search,
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
      _preloading: preload,
      ...data
    }

    let page
    if (allData._page) {
      page = allData._page
    } else if (matchedRoutes[0]?.operationId) {
      page = matchedRoutes[0].operationId
      allData._page = page
    }

    urlLogger({ missing, method: preload ? 'PRELOAD' : 'GET', url: 'window://' + href, body: allData })

    if (page) {
      if (!components[page]) {
        allData._pending = import(`/src/pages/${page}.svelte`).then(component => {
          components[page] = component.default
          allData._component = component.default
          allData._pending = null
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
      if (a.rel !== 'no-preload' && a.rel !== 'external') {
        agr.push((new URL(a.href)).href) // normalize href
      }
      return agr
    }, [])
  }

  const finished = new Set()
  const primary = new Set()
  const secondary = new Set()
  let preloaderInstance
  const newDiv = document.createElement('div')
  newDiv.style = 'display: none;'
  async function doIdle () {
    let todo
    let isSecondary = false
    if (primary.size === 0) {
      todo = secondary
      isSecondary = true
    } else {
      todo = primary
    }

    for (const href of todo) {
      todo.delete(href)
      if (finished.has(href)) {
        continue
      }
      finished.add(href)

      const preloadRouterState = routerState({ hrefOverride: href, preload: true })

      if (!preloadRouterState._page) {
        continue
      }

      const preloadRouterStore = readable({}, set => {
        set(preloadRouterState)
        return () => {}
      })

      if (!components[preloadRouterState._page]) {
        components[preloadRouterState._page] = (await import(`/src/pages/${preloadRouterState._page}.svelte`)).default
      }

      preloaderInstance = new components[preloadRouterState._page]({ target: newDiv, context: new Map([['router', preloadRouterStore]]) })
      break
    }
    if (primary.size > 0 || secondary.size > 0) {
      setTimeout(() => {
        window.requestIdleCallback(() => {
          if (!isSecondary) {
            getLinks(newDiv).forEach(link => secondary.add(link)) // pagePreloader
          }
          preloaderInstance?.$destroy()
          preloaderInstance = null
          doIdle()
        })
      }, 150)
    } else {
      preloaderInstance?.$destroy()
      preloaderInstance = null
    }
  }

  const routerStore = readable({}, set => {
    // TODO: let keepfocus = false
    let resetScroll = false

    function linkClickHandler (e) {
      // TODO keepfocus handling
      const a = findNode(e.target)

      if (!a) {
        return
      }

      if (a.rel === 'external') {
        return
      }

      if (a.rel === 'replace') {
        console.log('todo replace state impl...')
      }

      e.preventDefault()
      window.history.pushState({ location: a.href }, '', a.href)
      // const popStateEvent = new PopStateEvent('popstate', {})
      // dispatchEvent(popStateEvent)
      updateRoute()

      resetScroll = !a.hasAttribute('noscroll')
    }

    async function updateRoute () {
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

      setTimeout(() => {
        window.requestIdleCallback(() => {
          finished.add(location.href)
          getLinks(app).forEach(link => primary.add(link))
          doIdle()
        })
      }, 150)

      if (resetScroll) {
        scrollTo(0, 0)
        resetScroll = false
      }
    }

    updateRoute()

    window.addEventListener('popstate', updateRoute)
    window.addEventListener('click', linkClickHandler)

    return () => {
      window.removeEventListener('popstate', updateRoute)
      window.removeEventListener('click', linkClickHandler)
    }
  })

  return routerStore
}
