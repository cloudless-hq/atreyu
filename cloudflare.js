import { basename, join } from './deps-deno.js'

export async function cloudflareDeploy ({ domain, env = 'prod', appName, workers, config }) {
  if (!config.__cloudflareToken) {
    console.error('  🛑 missing cloudflare token in secrets.js file at __cloudflareToken')
    return
  }

  async function req (path, { method, body, ctype } = {}) {

    const res = await fetch(`https://api.cloudflare.com/client/v4/${path}`, {
      headers: {
        'Authorization': `Bearer ${config.__cloudflareToken}`,
        'Content-Type': ctype || 'application/json'
      },
      method,
      body: (body && typeof body !== 'string') ? JSON.stringify(body) : body
    })
    const json = await res.json()
    if (json.result_info && json.result_info.total_pages > 1) {
      console.warn(path + ': ATTENTION, only one resource page per cloudflare api supported currently, please restrict the cf token to only the resources used by this project to avoid errors and tighten security. if this is not suffiecient raise an issue on github.')
    }
    if (json.errors && json.errors.length > 0) {
      console.error(json.errors)
    }
    if (json.messages && json.messages.length > 0) {
      console.info(json.messages)
    }
    return json.result
  }

  const [accounts, zones]= await Promise.all([
    req('accounts'),
    req('zones')
  ])

  if (accounts.length > 1) {
    console.warn('cannot handle more than one cloudflare account per token, using first account only')
  }
  console.log('  🔓 granted access for cloudflare account: ' + accounts[0].name)

  const cloudflareAccountId = accounts[0].id

  let cloudflareZoneId = ''

  if (!domain) {
    if (env === 'prod') {
      domain = appName
    } else {
      domain= `${env}.${appName}`
    }
  }

  zones.forEach(zone => {
    if (domain.endsWith(zone.name)) {
      cloudflareZoneId = zone.id
    }
  })
  if (!cloudflareZoneId) {
    console.warn('no zone found for project folder, using the default zone for the cf token. to disable this behaviour use --no-fallback-zone')
  }

  const [curWorkers, curSubdomains, curNamespaces, curRoutes, curDns] = await Promise.all([
    req(`accounts/${cloudflareAccountId}/workers/scripts`),
    req(`accounts/${cloudflareAccountId}/workers/subdomain`),
    req(`accounts/${cloudflareAccountId}/storage/kv/namespaces`),

    req(`zones/${cloudflareZoneId}/workers/routes`),
    req(`zones/${cloudflareZoneId}/dns_records`)
  ])

  const appPrefix = `${appName.replaceAll('.', '__').toLowerCase()}__${env}__`

  const toSetRoutes = {}
  const workerCreations = Object.entries(workers).map(async ([workerName, {codePath, routes}]) => {
    const cfWorkerName = appPrefix + workerName

    routes.forEach((route) => {
      toSetRoutes[`${domain}${route}`] = cfWorkerName
    })

    const scriptData = Deno.readTextFileSync(join(Deno.cwd(), codePath.replace('handlers/', 'edge/build/')))

    // TODO: support manual added bindings wihtout removing: { "name":"____managed_externally","type":"inherit"}
    config['env'] = env
    const bindings = Object.entries(config).flatMap(([key, value]) => {
      if (!key.startsWith('__')) {
        if (key.startsWith('_')) {
          return {
            name: key,
            type: 'secret_text',
            text: value
          }
        } else if (key === 'kv_namespaces') {
          return value.map(namespace => ({
              name: namespace,
              type: 'kv_namespace',
              namespace_id: curNamespaces.find(curNs => curNs.title === namespace).id
            }))
        } else {
          return {
            name: key,
            type: 'plain_text',
            text: value
          }
        }
      }

      return []
    })

    const bindingsData = JSON.stringify({
      body_part: 'script',
      bindings
    })

    let randomBoundary = ''
    for (let i = 0; i < 24; i++) {
      randomBoundary += Math.floor(Math.random() * 16).toString(16)
    }

    await req(`accounts/${cloudflareAccountId}/workers/scripts/${cfWorkerName}?include_subdomain_availability=true`, {
      method: 'PUT',

      body: `------AtreyuFormBoundary${randomBoundary}
Content-Disposition: form-data; name="metadata"; filename="blob"
Content-Type: application/json

${bindingsData}
------AtreyuFormBoundary${randomBoundary}
Content-Disposition: form-data; name="script"; filename="blob"
Content-Type: application/javascript

${scriptData}
------AtreyuFormBoundary${randomBoundary}--`,

      ctype: `multipart/form-data; boundary=----AtreyuFormBoundary${randomBoundary}`
    })
  })

  await Promise.all(workerCreations)

  const pathDeletions = []
  curRoutes.forEach(route => {
    if (toSetRoutes[route.pattern] === route.script) {
      delete toSetRoutes[route.pattern]
    } else if (route.script.startsWith(appPrefix)) {
      pathDeletions.push(req(`zones/${cloudflareZoneId}/workers/routes/${route.id}`, {
        method: 'DELETE'
      }))
    }
  })

  await Promise.all(pathDeletions)

  const dnsAdditions = new Set()
  Object.entries(toSetRoutes).forEach(async ([pattern, workerName], i) => {
    const patternConfig = { pattern, script: workerName }

    const dnsName = pattern.replace('*', '').split('/')[0]
    if (curDns.filter(entry => entry.name === pattern.replace('*', '') || entry.name ===  pattern.split('/')[0]).length > 0) {
      console.log('  using existin dns entry')
    } else {
      dnsAdditions.add(dnsName)
    }

    req(`zones/${cloudflareZoneId}/workers/routes`, {
      method: 'POST',
      body: JSON.stringify(patternConfig)
    })
      // .then(re => console.log(re))
      .then(routeRes => console.log('  added route: ' + patternConfig.pattern))
      .catch(err => console.log(err))
  })

  await Promise.all(([...dnsAdditions]).map(dnsEntry => {
    const newDns = {
      name: dnsEntry,
      type: 'AAAA',
      content: '100::',
      ttl: 1,
      proxied: true
    }
    console.log('  adding dns entry for: ' + dnsEntry)

    req(`zones/${cloudflareZoneId}/dns_records`, {
      method: 'POST',
      body: JSON.stringify(newDns)
    })
  }))
  // TODO: dns and worker deletions
  // TODO: curSubdomains
  // TODO: pattern = "*${domain}/cdn-cgi/access/logout", enabled = false ?
  // https://api.cloudflare.com/client/v4/accounts/{}/workers/scripts/{}/subdomain {enabled: true}
  // TXT _dnslink dnslink=/ipfs/QmduDF2ous2tHtoSuQHLjYpT9hUUPmiftWRKFKFoZFDfvh DNS only
  // dnslink with gateway, ipfs worker gateway, ipfs worker
}