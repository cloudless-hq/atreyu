import { readable } from '../deps/svelte.js'
import { Route, merge } from '../deps/util.js'
import { urlLogger } from '../lib/url-logger.js'

const components = {}

export default function (schema) {
  const routes = []

  ;([...Object.entries(schema.paths)]).forEach(([path, {get, name}]) => {
    if (get && get.tags?.includes('window')) {
      routes.push({ router: new Route(path), name, security: get.security, operationId: get.operationId })
    }
  })

  function routerState () {
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
    } = window.location

    const pathParts = pathname.split('/').filter(pathPart => pathPart !== '')
    const matchedRoutes = []
    const data = {}

    routes.forEach(({ router, name, security, operationId }) => {
      const match = router.match(pathname + search + hash)

      if (match) {
        if (name) {
          matchedRoutes.push({ spec: router.spec, security, operationId })
          data[name] = {
            link: (params) => router.reverse(params),
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
      ...data
    }

    let page
    if (allData._page) {
      page = allData._page
    } else if (matchedRoutes[0]?.operationId) {
      page = matchedRoutes[0].operationId
      allData._page = page
    }

    if (page) {
      if (!components[page]) {
        allData._pending = import(`/src/pages/${page}.svelte`).then(component => {
          components[page] = component.default
          allData._component = component.default
          allData._pending = null
          // console.log(page, component.default)
        })
      } else {
        allData._component = components[page]
      }
    }

    urlLogger({ missing, method: 'GET', url: 'window://' + href, body: allData })

    return allData
  }

  function findNode (node) {
    while (node && node.nodeName.toUpperCase() !== 'A') {
      node = node.parentNode
    }
    return (node)
  }

  const { subscribe } = readable({}, set => {
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

      e.preventDefault()
      window.history.pushState({location: a.href}, '', a.href)
      const popStateEvent = new PopStateEvent('popstate', {})
      dispatchEvent(popStateEvent)

      resetScroll = !a.hasAttribute('noscroll')
    }

    async function updateRoute () {
      const newState = routerState()
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

  return { subscribe }
}