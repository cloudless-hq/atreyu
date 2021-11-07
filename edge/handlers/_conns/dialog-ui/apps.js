const pathParts = req.url.pathname.split('/')
if (pathParts[pathParts.length - 2] === 'apps') {
  const appName = pathParts[pathParts.length - 1]
  if (req.method === 'GET') {
    const payload = {}
    for (const [key, value] of req.url.searchParams.entries()) {
      payload[key] = value
    }
    const { res } = await fulfillments[`get_${appName}_data`]({ event, payload })
    const newResponse = new Response(JSON.stringify(res), {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*'
      }
    })
    return newResponse
  }
  else if (req.method === 'POST') {
    const { res } = await fulfillments[`do_${appName}`]({ event, parsedBody })
    const newResponse = new Response(JSON.stringify(res), {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*'
      }
    })
    return newResponse
  }
  else if (req.method === 'OPTIONS') {
    const newResponse = new Response(null, {
      status: 204,
      statusText: 'OK',
      headers: {
        Allow: 'OPTIONS, GET, POST',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*'
      }
    })
    return newResponse
  }
}