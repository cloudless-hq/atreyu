import { join } from '../deps-deno.ts'
export async function loadConfig (envFlag, cmd, appName, repo, buildName, ayuVersion) {
  let confFile
  let conf

  try {
    confFile = await import('file://' + join('/', Deno.cwd(), 'ayu.config.js'))

    conf = { appPath: Deno.cwd(), ...confFile?.default }
  } catch (_err) {
    // console.error({err, message: 'error loading config'})
    console.warn('  could not load ayu project configuration, falling back to default')
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

  // save pointer to current env overrides
  let envConf = {}
  if (conf[env]) {
    envConf = conf[env]
  }

  // remove all other env overrides from the main config
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
    runConf: confFile?.runConf,
    extraAppEntryPoints: confFile?.extraAppEntryPoints
  }
}
