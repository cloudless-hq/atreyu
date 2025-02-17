export default async function ({ req, finish, event, stats }) {
  const { parsedBody } = await req.parsedBody
  return finish(new Response('OK', {
    status: 200,
    statusText: 'OK',
    headers: {

    }
  }), parsedBody)
}
