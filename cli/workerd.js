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
  workers
}) {
  // TODO: rename consistent
  config['folderHash'] = appFolderHash
  config['rootFolderHash'] = rootFolderHash
  config['ayuHash'] = ayuHash
  config['workerd'] = true

  const appPrefix = `${appName.replaceAll('.', '__').toLowerCase()}`

  const toSetRoutes = {}
  const serviceBindings = []
  const serviceRefs = []

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
        return value.map(namespace => {
          return {
            name: namespace,
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
        return `(name = "${binding.name}", text = "${binding.text}")`
      } else {
        return `(name = "${binding.name}", kvNamespace = "${binding.name}")`
      }
    })
    .join(',\n        ')

  const services = Object.entries(workers).map(([workerName, { codePath, routes }]) => {
    const cfWorkerName = appPrefix + '__' + workerName

    routes.forEach((route) => {
      toSetRoutes[`${route}`] = cfWorkerName
    })

    const scriptPath = codePath.replace(atreyuPath, projectPath).replace('/handlers/', '/build/').replace('/index', '')

    serviceBindings.push(`(name = "${cfWorkerName}", service = "${cfWorkerName}")`)
    serviceRefs.push({ name: cfWorkerName, capName: `${cfWorkerName.replaceAll('_','').charAt(0).toUpperCase() + cfWorkerName.replaceAll('_','').slice(1)}` })

    const service = `(name = "${cfWorkerName}", worker = (
      compatibilityDate = "2023-04-04",

      bindings = [
        ${bindings}
      ],

      serviceWorkerScript = "${escape(Deno.readTextFileSync(scriptPath))}"
    ))`

    return { name: cfWorkerName, service }
  })

  const capnp = `using Workerd = import "/workerd/workerd.capnp";
${serviceRefs.map(({ name, capName }) => `using ${capName} = import "${appPrefix}/${name.replace(appPrefix, '')}.capnp";`).join('\n')}

const config :Workerd.Config = (
  sockets = [
    ( name = "http",
      address = "*",
      http = (),
      service = "main"
    )
  ],

  services = [
    ( name = "internet",
      network = (
        allow = ["public", "local"], # TODO: only allow local for certain services?
        tlsOptions = (trustBrowserCas = true)
      )
    ),

    (name = "ipfs", disk = (path = "kv-store", writable = true)),

    ${serviceRefs.map(({ capName }) => capName + '.Service').join(',\n    ')},

    (name = "main", worker = (
      compatibilityDate = "2023-04-04",

      bindings = [
        (name = "routes", text = "${JSON.stringify(toSetRoutes).replaceAll('"', '\\"')}"),
        ${serviceBindings.join(',\n        ')},
        ${bindings}
      ],

      serviceWorkerScript = "${escape(Deno.readTextFileSync(mainScriptPath))}"
    ))
  ]
);
`

  services.forEach(({ name, service }) => {
    Deno.writeTextFileSync(
      join(workerdConfPath, '..', appPrefix, name.replace(appPrefix, '') + '.capnp'),
      `using Workerd = import "/workerd/workerd.capnp";
const Service :Workerd.Service = ${service};`)
  })

  Deno.writeTextFileSync(workerdConfPath, capnp)
}

// TODO: (name = "ipfs", worker = (
//   modules = [ (esModule = embed "kv.js") ],  compatibilityDate = "2023-04-04" )),
// (name = "ipfs", disk = (path="kvTest", writable=true) ),
// (name = "test", worker = (
//   modules = [
//     (esModule = embed "test.js"),
//   ],
//   bindings= [(name="test", text="hello world"), (
//     name="kv", kvNamespace="kvTest"
//   )],
//   globalOutbound= "main",
//   compatibilityDate = "2023-04-04"
// ))
