export default function ({ req, finish, parsedBody, event, stats }) {
  return finish(new Response('OK', {
    status: 200,
    statusText: 'OK',
    headers: {

    }
  }), parsedBody)
}
