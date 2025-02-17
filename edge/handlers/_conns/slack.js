/* global Response  */
export default async function ({ finish, req }) {
  const { parsedBody } = await req.parsedBody
  return finish(new Response('OK', {
    status: 200,
    statusText: 'OK',
    headers: {}
  }), parsedBody)
}
