export async function loadConfig (env, appName) {
  let conf = { }
  let confFile
  try {
    confFile = await import(Deno.cwd() + '/ayu.config.js')
    confFile

    conf = { appPath: Deno.cwd(), ...confFile?.default }
  } catch (err) {
    console.warn(err)
  }
  // console.log('pre conf', conf)

  let envConf = {}
  if (conf[env]) {
    envConf = conf[env]
  }

  for (let key in conf) {
    if (typeof conf[key] === 'object' && key !== 'kv_namespaces') {
      delete conf[key]
    }
  }

  return {
    config: {
      ...conf,
      ...envConf,
      appName,
      env
    },
    runConf: confFile?.runConf
  }
}
