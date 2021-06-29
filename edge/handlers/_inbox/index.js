/* global Response, fetch */
import handleSession from './session'
import couchProxy from '../couchdb/couch-proxy'
import { getUserData } from './helpers'

const dbHost = 'https://couch.cloudless.one'

export default async function ({ req, event, stats, finish }) {
  const { email, userId, superU, org } = getUserData(req)

  if (req.url.pathname.startsWith('/api/user_' + userId)) {
    return finish(couchProxy({ req, userId, url: dbHost + req.url.pathname.replace('/api/', '/') + req.url.search }))
  }

  if ((req.url.pathname === '/api' || req.url.pathname === '/api/') && req.headers['x-pouchdb']) {
    return finish(couchProxy({ req, userId, url: dbHost }))
  }

  // if (req.url.pathname === '/api/logout') {
  //   // TODO: delete session ?
  //   return new Response('redirect', {
  //     status: 303,
  //     headers: { 'Location': 'https://' + req.url.hostname + '/cdn-cgi/access/logout' }
  //   })
  // }

  if (req.url.pathname === '/api/login' || req.url.pathname === '/api') {
    return new Response('redirect', {
      status: 303,
      headers: { 'Location': 'https://' + req.url.hostname }
    })
  }

  if (req.url.pathname === '/api/_session') {
    return finish(handleSession({ req, stats, email, superU, org, userId, dbHost }))
  }

  if (req.url.pathname === '' || req.url.pathname === '/') {
    req.url.pathname = '/index.html'
  }

  return finish(fetch('https://storage.googleapis.com/cloudless-inbox/v1' + req.url.pathname + req.url.search))
  // todo server resource push Link: </css/styles.css>; rel=preload; as=style
}


// if (req.url.hostname.startsWith('inbox.')) {
//   return event.respondWith(
//     inboxHandler({ req, event, stats: stats.get(), finish })
//   )
// }