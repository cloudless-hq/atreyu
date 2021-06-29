export async function handler ({ event, req, app, stats }) {
  const newResponse = new Response(JSON.stringify(stats.get()), {
    status: 200,
    statusText: 'OK',
    headers: {
      'content-type': 'application/json'
    }
  })

  return newResponse
}