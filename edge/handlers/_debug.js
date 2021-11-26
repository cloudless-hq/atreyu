export function handler ({ stats, app }) {
  const newResponse = new Response(JSON.stringify({ stats: stats.get(), app }), {
    status: 200,
    statusText: 'OK',
    headers: {
      'content-type': 'application/json'
    }
  })

  return newResponse
}
