import ipfsHandler from './handlers/ipfs.js'
import proxyHandler from './handlers/proxy.js'
import { parse, match } from '../lib/routing.js'
import defaultPaths from '../schema/default-routes.js'

export default function ({
  schema,
  proxiedDomains,
  handlers: appHandlers
} = {}) {
  // TODO: gobally precompile schema on build time
  if (typeof schema === 'function') {
    schema = schema({ defaultPaths, addPathTags })
  } else if (schema) {
    schema.paths = { ...defaultPaths, ...schema.paths }
  }

  const handlerConf = parse(schema, ['service-worker'])

  // FIXME: implement same matching logic from specific to unspecific as in edge route matching!
  // TODO: add navigation preloadoing for interesting routes, also possibly use it for couch syncing by setting header to seq
  addEventListener('fetch', event => {
    try {
      // TODO: handle forced login routes for fetch, currently all window fetches are public, only service worker can do authenticated subrequests and expose via falcor
      const url = new URL(event.request.url)
      const req = {
        raw: event.request,
        method: event.request.method,
        headers: Object.fromEntries(event.request.headers.entries()),
        query: Object.fromEntries(url.searchParams.entries()),
        url
      }

      const matched = match(req, handlerConf)
      // console.log(url.href, matched)

      // allowing non http url schemes to prevent browser plugins from breaking
      if (!(['http:', 'https:']).includes(url.protocol)) {
        console.info('bypassing: ' + url.href)
        return
      }
      if (matched?.operationId === '_bypass') {
        // console.info('bypassing: ' + url.href)
        return
      }

      if (url.origin !== location.origin) {
        // custom handling for cors requests
        if (proxiedDomains && (proxiedDomains === '*' || proxiedDomains.includes(url.origin))) {
          return event.respondWith(proxyHandler({ event, req }))
        } else if (proxiedDomains) {
          return event.respondWith(new Response('Cross origin request to this domain forbidden', { status: 403 }))
        } else {
          return
        }
      }

      if (url.pathname === '/_api/_logout') {
        self.session.logout()
        return event.respondWith(new Response('OK'))
      }

      // TODO: support registration.scope and non hash based client side routing
      // if (routes.includes(url.pathname)) {
      //   url.pathname = '/'
      // }
      // TODO: support auth system without falcor server?
      // if ((!self.session.loaded || !self.session.value?.userId) && !self.session.pendingInit) {
      //   self.session.pendingInit = self.session.refresh()
      // }
      // TODO: actually handle and error non matching methods, if not configured in schema
      // if (event.request.method !== 'GET') {
      //   return
      // }
      let handlerRes
      if (matched?.operationId === '_ipfs') {
        handlerRes = ipfsHandler({ event, url: rewrite(new URL(event.request.url)), origUrl: url })
      } else if (matched?.operationId === '_proxy') {
        // if (
        //   req.url.pathname.startsWith('/oauth2') ||
        //   req.url.pathname.startsWith('/login-consent-provider') ||
        //   req.url.pathname.startsWith('/profile/de-DE/login') ||
        //   req.url.href.includes('?return=')
        // ) {
        //   return
        // }

        return event.respondWith(proxyHandler({ event, req }))
      } else if (matched?.operationId) {
        handlerRes = appHandlers[matched.operationId]({ event, req })
      } else if (matched?.handler) {
        handlerRes = matched.handler({ event, req })
      }
      if (!matched && !handlerRes) {
        return event.respondWith(new Response('route not found', { status: 404 }))
      }

      return event.respondWith(handlerRes)
    } catch (fetchError) {
      console.error(fetchError, event)
    }
  })

}

// TODO: only applies to ipfs handler, so move there
// TODO: preload /manifest.json resources and other reqired resources for offline refresh and usage
function rewrite (url) {
  if (url.pathname.endsWith('/')) {
    url.pathname = url.pathname + 'index.html'
    return url
  }

  if (url.pathname.endsWith('.svelte') || url.pathname.endsWith('.ts')) {
    url.pathname = url.pathname.replace('src', 'build').replace('.svelte', '.js')
  } else if (url.pathname === '/svelte/store') {
    url.pathname = '/_ayu/build/deps/svelte-store.js'
    return url
  } else {
    url.pathname = url.pathname.replace('/src/deps/', '/build/deps/')
  }
  return url
}
