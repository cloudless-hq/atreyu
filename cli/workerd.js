import { join } from '../deps-deno.ts'

function escape (str) {
  return str.replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll('"', '\\x22').replaceAll('#', '\\x23')
}

export function workerdSetup ({
  appName,
  appFolderHash,
  rootFolderHash,
  ayuHash,
  workerdConfPath,
  mainScriptPath,
  atreyuPath,
  projectPath,
  config,
  services
}) {
  // TODO: rename consistent
  config['folderHash'] = appFolderHash
  config['rootFolderHash'] = rootFolderHash
  config['ayuHash'] = ayuHash
  config['workerd'] = 'true'

  const appPrefix = `${appName.replaceAll('.', '__').toLowerCase()}`

  const toSetRoutes = {}
  const serviceBindings = []
  const serviceRefs = []

  const customKvNamespaces = []

  if (!config.kv_namespaces) {
    config.kv_namespaces = ['ipfs']
  }
  const bindings = Object.entries(config).flatMap(([key, value]) => {
    if (['appPath', 'defaultEnv', 'repo'].includes(key)) {
      return []
    }

    if (!key.startsWith('__')) {
      if (key.startsWith('_')) {
        return {
          name: key,
          type: 'secret_text',
          text: value
        }
      } else if (key === 'kv_namespaces') {
        return value.map(nsName => {
          if (nsName !== 'ipfs') {
            customKvNamespaces.push(nsName)
          }
          return {
            name: nsName,
            type: 'kv_namespace'
          }
        })
      } else {
        // TODO: json support
        return {
          name: key,
          type: 'plain_text',
          text: value
        }
      }
    }

    return []
  })
    .filter(binding => binding.text || binding.type === 'kv_namespace')
    .map(binding => {
      if (binding.text) {
        return `(name = "${binding.name}", text = "${escape(binding.text)}")`
      } else {
        return `(name = "${binding.name}", kvNamespace = "${binding.name}")`
      }
    })
    .join(',\n        ')

  const serviceDefs = Object.entries(services).map(([workerName, { codePath, routes }]) => {
    const cfWorkerName = appPrefix + '__' + workerName

    routes.forEach((route) => {
      toSetRoutes[`${route}`] = cfWorkerName
    })

    const scriptPath = codePath.replace(atreyuPath, projectPath).replace('/handlers/', '/build/').replace('/index', '')

    serviceBindings.push(`(name = "${cfWorkerName}", service = "${cfWorkerName}")`)
    serviceRefs.push({ name: cfWorkerName, capName: `${cfWorkerName.replaceAll('_','X').replaceAll('-','X').charAt(0).toUpperCase() + cfWorkerName.replaceAll('_','X').replaceAll('-','X').slice(1)}` })

    const service = `(name = "${cfWorkerName}", worker = (
      compatibilityDate = "2023-08-01",
      bindings = [
        ${bindings}
      ],

      serviceWorkerScript = "${escape(Deno.readTextFileSync(scriptPath))}"
    ))`

    return { name: cfWorkerName, service }
  })

  const envDir = join(workerdConfPath, '..')
  const appDir = join(envDir, appPrefix)

  try {
    Deno.lstatSync(appDir)
  } catch (_e) {
    Deno.mkdirSync(appDir)
  }

  try {
    Deno.lstatSync(envDir + '/kv-store')
  } catch (_e) {
    Deno.mkdirSync(envDir + '/kv-store')
  }

  customKvNamespaces.forEach(customNs => {
    try {
      Deno.lstatSync(envDir + '/kv-store/' + customNs)
    } catch (_e) {
      Deno.mkdirSync(envDir + '/kv-store/' + customNs)
    }
  })

  const customKvNamespaceBindings = customKvNamespaces.map(name => `( name = "${name}", disk = (path = "${envDir}/kv-store/${name}", writable = true))`).join(',\n    ')

  const capnp = `using Workerd = import "/workerd/workerd.capnp";
${serviceRefs.map(({ name, capName }) => `using ${capName} = import "${appPrefix}/${name.replace(appPrefix + '__', '')}.capnp";`).join('\n')}

const config :Workerd.Config = (
  sockets = [
    ( name = "http",
      address = "*",
      http = (),
      service = "main"
    )
  ],

  services = [
    # TODO: only allow local for certain services?
    ( name = "internet",
      network = ( allow = ["public", "local"], tlsOptions = (trustBrowserCas = true) )
    ),

    ( name = "kvStore", disk = (path = "${envDir}/kv-store", writable = true)),

    ${customKvNamespaceBindings ? customKvNamespaceBindings + ',' : ''}

    ${serviceRefs.map(({ capName }) => capName + '.Service').join(',\n    ')},

    (name = "ipfs", worker = (
      compatibilityDate = "2023-08-01",
      bindings = [ ( name = "kvStore", service = "kvStore") ],
      modules = [ (esModule = "${escape(Deno.readTextFileSync(join(mainScriptPath, '..', 'workerd-kvstore.js')))}") ]
    )),

    (name = "main", worker = (
      compatibilityDate = "2023-08-01",
      bindings = [
        (name = "routes", text = "${JSON.stringify(toSetRoutes).replaceAll('"', '\\"')}"),
        ${serviceBindings.join(',\n        ')},
        ${bindings}
      ],
      modules = [ (esModule = "${escape(Deno.readTextFileSync(mainScriptPath))}") ]
    ))
  ]
);
`

  serviceDefs.forEach(({ name, service }) => {
    Deno.writeTextFileSync(
      join(appDir, name.replace(appPrefix + '__', '') + '.capnp'),
      `using Workerd = import "/workerd/workerd.capnp";
const Service :Workerd.Service = ${service};`)
  })

  Deno.writeTextFileSync(workerdConfPath, capnp)
}

// TODO:
// (name = "test", worker = (
//   modules = [
//     (esModule = embed "test.js"),
//   ],
//   bindings= [( name="kv", kvNamespace="kvTest" )],
//   globalOutbound= "main"
