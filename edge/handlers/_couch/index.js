import { decode } from '../../lib/jwt'
// import { fetchStream } from '../../lib/http.js'
// TODO: support non cloudant couchdb auth:
// import { authHeaders } from './helpers.js'
// await authHeaders({ userId }) // req.headers

const local = (typeof self !== 'undefined' && !!self.Deno) || typeof workerd !== 'undefined'

function getCookie (name, cookieString = '') {
  const v = cookieString.match('(^|;) ?' + name + '=([^;]*)(;|$)')
  return v ? v[2] : null
}

// FIXME: unused text json and formdata will lead to unneeded parsing and cloning!!!!
// FIXME: this only works for global trusted org dbs in admin party
export default {
  async fetch (_, { _couchKey, _couchSecret, couchHost }, { req }) {
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
    let tokenResult
    if (local && !req.headers['cf-access-jwt-assertion']) {
      // no validation for fake null login only in dev mode
      const jwt = getCookie('CF_Authorization', req.headers['cookie'])
      if (jwt) {
        tokenResult = JSON.parse(atob(jwt.split('.')[1]))
      }
    } else {
      const jwt = req.headers['cf-access-jwt-assertion']
      const { valid, payload } = await decode(jwt)
      if (!valid) {
        return new Response('forbidden', { status: 403 })
      }
      tokenResult = payload
    }

    // FIXME: !!!! this is a security issue, we should not allow any path to be proxied
    const href = couchHost + req.url.pathname.replace('/_api/_couch', '') + req.url.search

    console.error('TODO: validate databasess ' + href, tokenResult)
    // ["TODO: validate databasess https://40ce802e-d11b-4726-bb6d-9a1a48bb1781-bluemix.cloudantnosqldb.appdomain.cloud/ayu_user_jan__jasdf(64)nasdf(46)asdf/_bulk_get?revs=true&latest=true", {"dev_mock":true,"email":"jasdf@nasdf.asdf","sessionId":"session:aadd4caa-91ab-4080-9f3e-916239adb6b2"}]

    // TODO: caching req.headers.if-none-match W/"3-a04c2ef5d805577085597f72e1c5922a"

    // if (req.url.pathname.includes('/_changes')) {
    //  const { readable, response } = await fetchStream(href, {
    //    method: req.method,
    //    headers: {
    //      'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}`,
    //      ...req.headers
    //    }
    //  })
    //  return new Response(readable, response)

    delete req.headers.cookie

    return fetch(href, {
      method: req.method,
      // redirect: 'error', error not supported, manual?
      body: req.raw.body,
      headers: {
        ...req.headers,
        // headers: await authHeaders({ userId }) // req.headers
        'Authorization': `Basic ${btoa(_couchKey + ':' + _couchSecret)}`
      }
    })
  }
}
