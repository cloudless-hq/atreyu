export default async function ({ req, finish, event, stats }) {
  return finish(new Response('OK', {
    status: 200,
    statusText: 'OK',
    headers: {

    }
  }), await req.parsedBody)
}
