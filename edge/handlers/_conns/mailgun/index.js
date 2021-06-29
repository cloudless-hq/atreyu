import messageIn from './message_in'
import { create } from '../../../inbox/helpers'

export default async function ({ finish, parsedBody, event, stats }) {
  return finish(create({
    doc: messageIn({ parsedBody, stats, event }),
    userId: 'connectors',
    dbUrl: 'https://couch.cloudless.one/user_jan'
  })) //, parsedBody)
}
