export async function loadConfig (env) {
  let conf = {}
  try {
    conf = { ...(await import(Deno.cwd() + '/ayu.config.js')).default }
  } catch (_err) { }
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
    ...conf,
    ...envConf,
    env
  }
  }
