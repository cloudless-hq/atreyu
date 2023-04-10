
export function workerdSetup (workerdConfPath, mainScriptPath, config, workerConf) {
  const capnp = `using Workerd = import "/workerd/workerd.capnp";

const config :Workerd.Config = (
  sockets = [
    ( name = "http",
      address = "*",
      http = (),
      service = "main"
    )
  ],

  services = [
    (name = "main", worker = (
      serviceWorkerScript = embed "${mainScriptPath}",
      bindings = [
        # (name="test", service = "test"),
        # (name="pest", service = "pest")
      ],
      compatibilityDate = "2023-03-21"
    )),

    # TODO: (name = "kvTest", worker = (
    #   modules = [ (esModule = embed "kv.js") ],  compatibilityDate = "2023-03-21" )),

    # (name = "kvTest", disk = (path="kvTest", writable=true) ),
  ]
);
`

  console.log(config, workerConf)

  Deno.writeTextFileSync( workerdConfPath, capnp)
}

// (name = "test", worker = (
//   modules = [
//     (esModule = embed "test.js"),
//   ],
//   bindings= [(name="test", text="hello world"), (
//     name="kv", kvNamespace="kvTest"
//   )],
//   globalOutbound= "main",
//   compatibilityDate = "2023-03-21"
// ))
