import startWorker from './lib/start-worker.js'
import stats from './lib/stats.js'
import { handler } from '$handler.js'
import { getEnv } from '$env.js'
import { escapeId } from '../app/src/lib/escape-id.js'

async function getApp () {
  const { appName } = stats.get()
  const { couchHost, _couchKey, _couchSecret, env } = getEnv(['couchHost', '_couchKey', '_couchSecret', 'env'])
  if (!couchHost || !_couchKey || !_couchSecret) {
    console.error('no couch configuraiton found for app settings.')
    return
  }

  const settingsDocId = 'system:settings_' + env
  const safeDbName = env === 'prod' ? escapeId(appName) : escapeId(env + '.' + appName)

  const url = `${couchHost}/${safeDbName}/${settingsDocId}`

  const settingsDocRes = (await fetch(url, {
    headers: {
      Authorization: `Basic ${btoa(_couchKey + ':' + _couchSecret)}`
    }
  }))
  const settingsDoc = await settingsDocRes.json()

  if (!settingsDoc.folderHash) {
    console.error('no release hash found in app settings')
  }

  app.Hash = settingsDoc.folderHash
  app.name = appName
  app.safeDbName = safeDbName
  app.env = env
}

const app = { name: null, Hash: null, safeDbName: null, env: null }

startWorker(async arg => {
  if (!app.Hash) {
    await getApp()
  }

  arg.app = app
  return handler(arg)
})
