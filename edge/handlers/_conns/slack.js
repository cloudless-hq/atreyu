/* global Response  */
export default function ({ finish, parsedBody }) {
  return finish(new Response('OK', {
    status: 200,
    statusText: 'OK',
    headers: {}
  }), parsedBody)
}
