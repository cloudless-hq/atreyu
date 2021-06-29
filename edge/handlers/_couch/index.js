// import handleFauxton from './fauxton'
import { decode } from '../../lib/jwt'
import { authHeaders } from './helpers'

export async function handler ({ event, req, app }) {
  // if (req.url.pathname === '/_utils') {
  //   return new Response('redirect', {
  //     status: 301,
  //     headers: { 'Location': 'https://' + req.url.hostname + '/_utils/' }
  //   })
  // }
  // if (req.url.pathname.startsWith('/_utils/')) {
  //   return finish(handleFauxton({ req, event }))
  // }
  // if (req.url.pathname === ('/_session') && req.method === 'DELETE') {
  //   return new Response('redirect', {
  //     status: 303,
  //     headers: { 'Location': 'https://' + req.url.hostname + '/cdn-cgi/access/logout' }
  //   })
  // }

  return couchProxy({ url: req.url.href, req, userId: '_admin' })
}

async function couchProxy ({ url, req, userId }) {
  // TODO: caching req.headers.if-none-match W/"3-a04c2ef5d805577085597f72e1c5922a"
  let tokenResult = await decode(req.headers['cf-access-jwt-assertion'])
  if (tokenResult.valid) {
    return fetch(url, {
      method: req.method,
      body: (req.method === 'PUT' || req.method === 'POST') ? req.raw.body : null,
      headers: await authHeaders({ userId }) // req.headers
    })
  }

  return new Response('Auth Error', {
    status: 500,
    headers: {}
  })
}