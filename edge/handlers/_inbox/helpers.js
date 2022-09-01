/* global fetch */
import { idEscape, authHeaders } from '../couchdb/helpers.js'

const usersByEmail = {
  'jan@ntr.io': {
    userName: 'jan',
    org: 'mia',
    superU: false
  },
  'tester@ntr.io': {
    userName: 'tester',
    org: 'mia',
    superU: false
  }
}

function getUserId (email, userObj) {
  if (userObj) {
    if (userObj.super) {
      return idEscape(userObj.org)
    }
    return idEscape(userObj.userName)
  } else {
    return idEscape(email)
  }
}

export function getUserData (req) {
  const cfAccessEmail = req.headers['cf-access-authenticated-user-email']

  const email = cfAccessEmail ? cfAccessEmail.toLowerCase() : ''
  const userObj = usersByEmail[email]

  let userId = getUserId(email, userObj)

  const superU = userObj ? userObj.superU : false
  const org = userObj ? userObj.org : null

  return { email, userId, superU, org }
}

export async function create ({ doc, userId, dbUrl }) {
  return fetch(dbUrl, {
    method: 'POST',
    body: JSON.stringify(doc),
    headers: await authHeaders({ userId })
  })
}
