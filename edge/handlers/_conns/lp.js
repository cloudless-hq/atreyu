export default function ({ req, finish, parsedBody, event, stats }) {
  return finish(new Response('OK', {
    status: 200,
    statusText: 'OK',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    }
  }), parsedBody)
}