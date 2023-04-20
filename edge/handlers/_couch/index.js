// import { fetchStream } from '../../lib/http.js'
// import { handler as sessionHandler } from './_session.js'

// TODO: support non cloudant couchdb auth:
// import { authHeaders } from './helpers.js'
// await authHeaders({ userId }) // req.headers

export default {
  fetch (_, { _couchKey, _couchSecret, couchHost }, { req, text }) {
    // TODO: use our own fauxton release instead of cloudant one
    // import handleFauxton from './fauxton'
    // if (req.url.pathname === '/_utils') {
    //   return new Response('redirect', {
    //     status: 301,
    //     headers: { 'Location': 'https://' + req.url.hostname + '/_utils/' }
    //   })
    // }
    // if (req.url.pathname.startsWith('/_utils/')) {
    //   return finish(handleFauxton({ req, event }))
    // }
    // if (req.url.pathname.startsWith('/_api/_session')) {
    //   return sessionHandler({ req, stats, app, parsedBody })
    // }

    const href = couchHost + req.url.pathname.replace('/_api/_couch', '') + req.url.search

    // if (req.url.pathname.includes('/_changes')) {
    //   // const { readable, response } = await fetchStream(href, {
    //   //   method: req.method,
    //   //   headers: {
    //   //     'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}`,
    //   //     ...req.headers
    //   //   }
    //   // })
    //   // return new Response(readable, response)
    // } else {

    delete req.headers.cookie

    return fetch(href, {
      method: req.method,
      // redirect: 'error', error not supported, manual?
      body: text, // TODO: req.raw?.body ?
      headers: {
        ...req.headers,
        'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}`
      }
    })
  }
}

// TODO: support cloudflare jwt decoding and cloudflare access features
// import { decode } from '../../lib/jwt'
// if (req.url.pathname === ('/_session') && req.method === 'DELETE') {
//   return new Response('redirect', {
//     status: 303,
//     headers: { 'Location': 'https://' + req.url.hostname + '/cdn-cgi/access/logout' }
//   })
// }
// async function couchProxy ({ url, req, userId }) {
//   // TODO: caching req.headers.if-none-match W/"3-a04c2ef5d805577085597f72e1c5922a"
//   // let tokenResult = await decode(req.headers['cf-access-jwt-assertion'])
//   // if (tokenResult.valid) {
//     return fetch(url, {
//       method: req.method,
//       body: req.raw.body || null,
//       // headers: await authHeaders({ userId }) // req.headers
//     })
//   // }
//   return new Response('Auth Error', {
//     status: 500,
//     headers: {}
//   })
// }
