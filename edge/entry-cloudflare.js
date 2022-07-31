import startWorker from './lib/start-worker.js'
import { handler } from '/$handler.js'
import { getEnv } from '/$env.js'
import { escapeId } from '../app/src/lib/escape-id.js'

async function getAppData () {
  const appData = {}
  const { couchHost, _couchKey, _couchSecret, env, folderHash, appName } = getEnv(['couchHost', '_couchKey', '_couchSecret', 'env', 'folderHash', 'appName'])

  if (couchHost && _couchKey && _couchSecret) {
    const settingsDocId = 'system:settings_' + env
    const safeDbName = env === 'prod' ? escapeId(appName) : escapeId(env + '__' + appName)

    const url = `${couchHost}/${safeDbName}/${settingsDocId}`

    const settingsDocRes = (await fetch(url, {
      headers: {
        Authorization: `Basic ${btoa(_couchKey + ':' + _couchSecret)}`
      }
    }))

    const settingsDoc = await settingsDocRes.json()

    appData.safeDbName = safeDbName
    appData.Hash = settingsDoc.folderHash
    appData.rootFolderHash = settingsDoc.rootFolderHash
    appData.version = settingsDoc.version
  } else {
    appData.Hash = folderHash
  }

  appData.name = appName // TODO: deprecate this key
  appData.appName = appName
  appData.env = env

  return appData
}

let app = {}
startWorker(async arg => {
  if (!app.Hash) {
    app = await getAppData()
  }

  arg.app = app
  return handler(arg)
})
