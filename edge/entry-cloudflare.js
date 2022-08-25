import startWorker from './lib/start-worker.js'
import { handler } from '/$handler.js'
import { getEnv } from '/$env.js'
// import req from './lib/req.js'
// import { escapeId } from '../app/src/lib/helpers.js'

function getAppData () {
  const appData = {}
  const { env, folderHash, appName, ayuVersion, rootFolderHash } = getEnv(['env', 'folderHash', 'appName', 'ayuVersion', 'rootFolderHash'])

  // couchHost, _couchKey, _couchSecret, 'couchHost', '_couchKey', '_couchSecret',
  // if (couchHost && _couchKey && _couchSecret) {
  //   const settingsDocId = 'system:ayu_settings'
  //   const safeDbName = env === 'prod' ? escapeId(appName) : escapeId(env + '__' + appName)

  //   const url = `${couchHost}/${safeDbName}/${settingsDocId}`
  //   const { json: settingsDoc } = await req(url, { headers: { Authorization: `Basic ${btoa(_couchKey + ':' + _couchSecret)}` } })

  //   appData.safeDbName = safeDbName
  //   appData.Hash = settingsDoc.folderHash
  //   appData.version = settingsDoc.version
  // } else {
  appData.Hash = folderHash
  appData.rootFolderHash = rootFolderHash
  appData.version = ayuVersion // todo: deprecate
  appData.ayuVersion = ayuVersion
  // }

  appData.appName = appName
  appData.env = env

  return appData
}

// let app = {}
// if (!app.Hash) {
app = getAppData()
// }
// needed for parent call then:
// deno-lint-ignore require-await
startWorker(async (arg) => {
  arg.app = app
  return handler(arg)
}, app)
