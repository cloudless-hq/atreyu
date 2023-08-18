export async function cloudflareDeploy ({
  domain,
  env = 'prod',
  appName,
  services,
  config,
  atreyuPath,
  projectPath,
  appFolderHash,
  rootFolderHash,
  fileList,
  ayuHash,
  resetKvs
}) {
  // const startTime = Date.now()
  if (!config.__cloudflareToken) {
    console.warn('  🛑 missing cloudflare token in secrets.js file at __cloudflareToken')
    return
  }
  const ipfsGateway = 'http://127.0.0.1:8080'

  async function req (path, { method, body, ctype } = {}) {
    const res = await fetch(`https://api.cloudflare.com/client/v4/${path}`, {
      headers: {
        'Authorization': `Bearer ${config.__cloudflareToken}`,
        'Content-Type': ctype || 'application/json'
      },
      method,
      body: (body && typeof body !== 'string') ? JSON.stringify(body) : body
    })
    // console.log(Object.fromEntries(res.headers.entries()), res.status, res.statusText, method)
    const resText = await res.text()
    let json = {}
    try {
      json = JSON.parse(resText)
    } catch (err) {
      console.error(path, err, resText)
    }

    if (json.result_info && json.result_info.total_pages > 1) {
      console.warn(path + ': ATTENTION, only one resource page per cloudflare api supported currently, please restrict the cf token to only the resources used by this project to avoid errors and tighten security. if this is not suffiecient raise an issue on github.')
    }
    if (json.errors && json.errors.length > 0) {
      console.error(path, json.errors)
    }
    if (json.messages && json.messages.length > 0) {
      console.info(path, json.messages)
    }
    return json.result
  }

  const [accounts, zones] = await Promise.all([
    req('accounts'),
    req('zones')
  ])

  if (accounts.length > 1) {
    console.warn('cannot handle more than one cloudflare account per token, using first account only')
  }
  console.log('  🔓 granted access for cloudflare: ' + accounts[0].name)

  const cloudflareAccountId = accounts[0].id

  let cloudflareZoneId = ''

  if (!domain) {
    domain = appName
  }

  // TODO: migrate for worker domains if no wildcard needed
  // If you are currently invoking a Worker using a Route with /*,
  // and your DNS points to 100:: or similar, a Custom Domain is a recommended replacement.
  let dnsName
  if (env === 'prod') {
    dnsName = domain
  } else {
    dnsName = `*.${domain}`
    domain = `${env}.${domain}`
  }

  zones.forEach(zone => {
    if (domain.endsWith(zone.name)) {
      cloudflareZoneId = zone.id
    }
  })
  if (!cloudflareZoneId) {
    console.warn('no zone found for project folder, using the default zone for the cf token. to disable this behaviour use --no-fallback-zone')
  }

  // TODO: remove env vars that are removed
  // TODO: support schedules req(`accounts/${cloudflareAccountId}/workers/services/${workerName}/environments/${env}/schedules`)
  // accounts/{}/workers/services/serviceid?expand=scripts
  // accounts/{}/workers/services/serviceid/environments/production?expand=routes
  // accounts/{}/workers/durable_objects/namespaces
  // {
  //   "result": {
  //     "id": "serviceid",
  //     "default_environment": {
  //       "environment": "production",
  //       "created_on": "2021-11-28T23:25:57.962688Z",
  //       "modified_on": "2022-02-21T00:47:50.940228Z",
  //       "script": {
  //         "id": "serviceid",
  //         "etag": "1344d41e4748563781b1de743430066a3b3eebea3ec7bda90d505bb25b7c02d1",
  //         "handlers": [
  //           "fetch"
  //         ],
  //         "modified_on": "2022-02-21T00:47:50.940228Z",
  //         "created_on": "2021-08-18T09:05:37.747247Z",
  //         "usage_model": "unbound"
  //       }
  //     },
  //     "created_on": "2021-11-28T23:25:57.962688Z",
  //     "modified_on": "2022-02-21T00:47:50.940228Z",
  //     "usage_model": "",
  //     "environments": [
  //       {
  //         "environment": "production",
  //         "created_on": "2021-11-28T23:25:57.962688Z",
  //         "modified_on": "2022-02-21T00:47:50.940228Z"
  //       }
  //     ]
  //   },
  //   "success": true,
  //   "errors": [],
  //   "messages": []
  // }
  // accounts/{}/workers/services/serviceid
  // {
  //   "result": {
  //     "id": "serviceid",
  //     "default_environment": {
  //       "environment": "production",
  //       "created_on": "2021-11-28T23:25:57.962688Z",
  //       "modified_on": "2022-02-21T00:47:50.940228Z",
  //       "script": {
  //         "id": "serviceid",
  //         "etag": "1344d41e4748563781b1de743430066a3b3eebea3ec7bda90d505bb25b7c02d1",
  //         "handlers": [
  //           "fetch"
  //         ],
  //         "modified_on": "2022-02-21T00:47:50.940228Z",
  //         "created_on": "2021-08-18T09:05:37.747247Z",
  //         "usage_model": "unbound"
  //       }
  //     },
  //     "created_on": "2021-11-28T23:25:57.962688Z",
  //     "modified_on": "2022-02-21T00:47:50.940228Z",
  //     "usage_model": "",
  //     "environments": [
  //       {
  //         "environment": "production",
  //         "created_on": "2021-11-28T23:25:57.962688Z",
  //         "modified_on": "2022-02-21T00:47:50.940228Z"
  //       }
  //     ]
  //   },
  //   "success": true,
  //   "errors": [],
  //   "messages": []
  // }
  // accounts/{}/workers/services/serviceid/environments/production/routes
  // {
  //   "result": [
  //     {
  //       "id": "536656de99844ed5b448c95cc163055e",
  //       "pattern": "w.x/*"
  //     }
  //   ],
  //   "success": true,
  //   "errors": [],
  //   "messages": []
  // }
  // accounts/{}/workers/services/serviceid/environments/production/content

  const [_curServices, _curSubdomains, curNamespaces, curOrg, curRoutes, curDns] = await Promise.all([
    req(`accounts/${cloudflareAccountId}/workers/services`),
    req(`accounts/${cloudflareAccountId}/workers/subdomain`),
    req(`accounts/${cloudflareAccountId}/storage/kv/namespaces`),
    req(`accounts/${cloudflareAccountId}/access/organizations`),

    req(`zones/${cloudflareZoneId}/workers/routes`),
    req(`zones/${cloudflareZoneId}/dns_records`)
  ])

  const pinName = env === 'prod' ? appName : appName + '_' + env
  const prefix = pinName + ':'

  const ipfsNsId = curNamespaces.find(curNs => curNs.title === 'ipfs')?.id
  if (!ipfsNsId) {
    return console.error('creating ipfs kv namespace not supported yet, please manually create it in cf dashboard and run again')
  }
  const currKeys = await req(`accounts/${cloudflareAccountId}/storage/kv/namespaces/${ipfsNsId}/keys?prefix=${prefix}`)

  const deletions = []
  currKeys.forEach(({ name }) => {
    const hash = name.replace(prefix, '')
    if (!fileList.has(hash)) {
      deletions.push(name)
    } else if (!resetKvs) {
      fileList.delete(hash)
    }
  })

  if (currKeys.length > 999) {
    console.error('  ATTENTION, only 1000 cf kv pin hash keys max supported in prerelease!')
    return
  }

  // TODO: batch to max parallel
  const blobCTypes = ['image/png', 'image/jpeg', 'font/ttf', 'font/woff2', 'application/octet-stream']
  console.log(`  uploading ${fileList.size} new assets and deleting ${deletions.length} old from kv-store 'ipfs' prefix '${prefix}'`)
  await req(`accounts/${cloudflareAccountId}/storage/kv/namespaces/${ipfsNsId}/bulk`, {
    method: 'PUT',
    body: await Promise.all([...fileList].map(async ([ hash, names ]) => {
      const res = await fetch(`${ipfsGateway}/ipfs/${hash}?filename=${names[0]}`) // filename param required to set propper content type from suffix

      const contentType = res.headers.get('content-type')
      let value
      if (blobCTypes.includes(contentType)) {
        // console.log(contentType, names)
        const blob = await res.blob()

        const base64 = await new Promise((onSuccess, onError) => {
          try {
            const reader = new FileReader()
            reader.onload = e => { onSuccess(e.target.result) }
            reader.readAsDataURL(blob)
          } catch (e) {
            onError(e)
          }
        })

        value = { value: base64.split('base64,')[1], base64: true }
      } else {
        value = { value: await res.text(), base64: false }
      }

      return {
        key: `${pinName}:${hash}`,
        metadata: { names, headers: { 'content-type': contentType } },
        ...value
      }
    }))
  })

  await req(`accounts/${cloudflareAccountId}/storage/kv/namespaces/${ipfsNsId}/bulk`, {
    method: 'DELETE',
    body: deletions
  })

  // "expiration":1578435000,
  // "expiration_ttl":300
  // &cursor=curN"
  // {
  //   "success": true,
  //   "errors": [],
  //   "messages": [],
  //   "result": [
  //     {
  //       "name": "My-Key",
  //       "expiration": 1577836800,
  //       "metadata": {
  //         "someMetadataKey": "someMetadataValue"
  //       }
  //     }
  //   ],
  //   "result_info": {
  //     "count": 1,
  //     "cursor": "curN"
  //   }
  // }

  console.log('  🔎 checked existing workers, domains, namespaces and routes.')

  const dnsAdditions = new Set()

  if (curDns.find(entry => entry.name === dnsName)) {
    console.log('  using existing dns entry')
  } else {
    dnsAdditions.add(dnsName)
  }

  const appPrefix = `${appName.replaceAll('.', '__').toLowerCase()}__`

  const toSetRoutes = {}
  const workerCreations = Object.entries(services).map(async ([workerName, {codePath, routes}]) => {
    const cfWorkerName = appPrefix + workerName

    routes.forEach((route) => {
      toSetRoutes[`${domain}${route}`] = cfWorkerName
    })

    // TODO: nullify removed vars!
    // /environments/${env}/bindings

    // const { default_environment, environments } = await req(`accounts/${cloudflareAccountId}/workers/services/${cfWorkerName}`)
    // // console.log({ default_environment, environments })
    // if (!environments.find(({ environment }) => environment === env)) {
    //   console.log(`creating new cloudflare worker service environmnt ${cfWorkerName} ${env}:`)
    //   console.log(await req(`accounts/${cloudflareAccountId}/workers/services/${cfWorkerName}/environments/${default_environment.environment}/copy/${env}`, { method: 'POST' }))
    // }

    const scriptPath = codePath.replace(atreyuPath, projectPath).replace('/handlers/', '/build/').replace('/index', '')
    const scriptData = Deno.readTextFileSync(scriptPath)

    // TODO: support manual added bindings wihtout removing: { "name":"____managed_externally","type":"inherit"}
    config['env'] = env
    config['folderHash'] = appFolderHash
    config['rootFolderHash'] = rootFolderHash
    config['ayuHash'] = ayuHash
    config['auth_domain'] = curOrg?.auth_domain

    delete config.appPath
    delete config.defaultEnv
    delete config.repo

    if (!config.kv_namespaces) {
      config.kv_namespaces = ['ipfs']
    }

    const bindings = Object.entries(config).flatMap(([key, value]) => {
      if (!key.startsWith('__')) {
        if (key.startsWith('_')) {
          return {
            name: key,
            type: 'secret_text',
            text: value
          }
        } else if (key === 'kv_namespaces') {
          return value.map(namespace => {
            const namespace_id = curNamespaces.find(curNs => curNs.title === namespace)?.id
            if (!namespace_id) {
              console.error('❌ kv namespace not found and auto creation not currently implemented, please create in cf dashboard and run again: ' + namespace)

              return {}
            }

            return {
              name: namespace,
              type: 'kv_namespace',
              namespace_id
            }
          })
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
      .filter(binding => binding.text || binding.namespace_id)

    const bindingsData = JSON.stringify({
      body_part: 'script',
      bindings
    })

    let randomBoundary = ''
    for (let i = 0; i < 24; i++) {
      randomBoundary += Math.floor(Math.random() * 16).toString(16)
    }

    const res = await req(`accounts/${cloudflareAccountId}/workers/services/${cfWorkerName}/environments/${env}?include_subdomain_availability=true`, {
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

    if (res?.size) {
      console.log('    ✅ created worker: ' + cfWorkerName)
    } else {
      console.log('    ❌ failed creating worker: ' + cfWorkerName, res)
    }
  })

  console.log(`  starting deployment of ${workerCreations.length} workers...`)
  await Promise.all(workerCreations)

  const pathDeletions = []
  curRoutes.forEach(route => {
    if (route.environment === env) {
      if (toSetRoutes[route.pattern] === route.script) {
        delete toSetRoutes[route.pattern]
      } else if (route.script.startsWith(appPrefix)) {
        pathDeletions.push(req(`zones/${cloudflareZoneId}/workers/routes/${route.id}`, {
          method: 'DELETE'
        }))
      }
    }
  })

  console.log(`  deleting ${pathDeletions.length} old paths...`)
  await Promise.all(pathDeletions)
  if (pathDeletions.length) {
    console.log(`  ✅ deleted ${pathDeletions.length} old paths.`)
  }

  console.log(`  adding ${Object.entries(toSetRoutes).length} routes...`)
  await Promise.all(Object.entries(toSetRoutes).map(([pattern, workerName]) => {
    const patternConfig = { pattern, script: workerName, environment: env }
    return req(`zones/${cloudflareZoneId}/workers/routes`, {
      method: 'POST',
      body: JSON.stringify(patternConfig)
    })
      .then(res => {
        if (res?.id) {
          console.log('  added route: ' + JSON.stringify(patternConfig))
        } else {
          console.log('  failed adding route: ' + JSON.stringify(patternConfig) )
        }
      })
      .catch(err => console.error(err))
  }))


  // TODO: support worker domains
  // /workers/domains/records
  // Request Method: PUT
  // {"hostname": "test2.closr.cx",
  // "zone_id": "54d23b39aa0c6b23aa40b40e292a7e5b",
  // "service": "gentle-voice-cf2d",
  // "environment": "production"}

  console.log(`  adding ${dnsAdditions.size} dns entries...`)
  await Promise.all(([...dnsAdditions]).map(async dnsEntry => {
    const newDns = {
      name: dnsEntry,
      type: 'AAAA',
      content: '100::',
      proxied: true
    }
    console.log('  adding dns entry for: ' + dnsEntry)

    await req(`zones/${cloudflareZoneId}/dns_records`, {
      method: 'POST',
      body: JSON.stringify(newDns)
    })
  }))
  // TODO: dns and worker deletions
  // TODO: curSubdomains
  // TODO: pattern = "*${domain}/cdn-cgi/access/logout", enabled = false ?
  // https://api.cloudflare.com/client/v4/accounts/{}/workers/scripts/{}/subdomain {enabled: true}
  // TXT _dnslink dnslink=/ipfs/QmduDF2ous2tHtoSuQHLjYpT9hUUPmiftWRKFoZFDfvh DNS only
  // dnslink with gateway, ipfs worker gateway, ipfs worker
  console.log('  🏁 finished cloudflare deployment ' + appFolderHash)
  // const duration = (Math.floor(Date.now() / 100 - startTime / 100)) / 10
  // duration && console.log('  ' + duration + 's')
  // console.log('')
}
