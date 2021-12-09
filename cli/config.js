export async function loadConfig (env, appName) {
  let confFile
  let conf

  try {
    confFile = await import(Deno.cwd() + '/ayu.config.js')
    confFile

    conf = { appPath: Deno.cwd(), ...confFile?.default }
  } catch (err) {
    console.warn('  ⚠️ No ayu.config.js found, using defaults')
    conf = { appPath: Deno.cwd() }
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
