import { join } from '../deps-deno.ts'
export async function loadConfig (envFlag, cmd, appName, repo, buildName, ayuVersion) {
  let confFile
  let conf

  try {
    confFile = await import('file://' + join('/', Deno.cwd(), 'ayu.config.js'))

    conf = { appPath: Deno.cwd(), ...confFile?.default }
  } catch (_err) {
    // console.error({err, message: 'error loading config'})
    console.warn('  could not load ayu configuration, falling back to default')
    // if (err not found) {
    //   console.warn('  ⚠️ No ayu.config.js found, using defaults')
    // }
    conf = { appPath: Deno.cwd() }
  }
  // console.log('pre conf', conf)

  let env
  if (!envFlag) {
    if (cmd === 'publish') {
      env = 'prod'
    } else {
      env = conf.defaultEnv || 'dev'
    }
  } else {
    env = envFlag
  }

  let envConf = {}
  if (conf[env]) {
    envConf = conf[env]
  }

  for (const key in conf) {
    if (typeof conf[key] === 'object' && key !== 'kv_namespaces') {
      delete conf[key]
    }
  }

  return {
    env,
    config: {
      ...conf,
      ...envConf,
      appName,
      buildName,
      ayuVersion,
      repo,
      env
    },
    runConf: confFile?.runConf
  }
}
