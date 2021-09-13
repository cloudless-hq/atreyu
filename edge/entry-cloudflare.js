import startWorker from './lib/start-worker.js'
import stats from './lib/stats.js'
import { handler } from '$handler.js'
import { getEnv } from './lib/env.js'
import { escapeId } from './lib/escape-id.js'

async function getApp () {
  const { appName } = stats.get()
  const { couchHost, _couchKey, _couchSecret, env } =  getEnv(['couchHost', '_couchKey', '_couchSecret', 'env'])
  const settingsDocId = 'system:settings_' + env
  const safeName = escapeId(env + '.' + appName)

  const url = `${couchHost}/${safeName}/${settingsDocId}`

  const settingsDocRes = (await fetch(url, {
      headers: {
          Authorization: `Basic ${btoa(_couchKey + ':' + _couchSecret)}`
      }
  }))
  const settingsDoc = await settingsDocRes.json()

  app.Hash = settingsDoc.folderHash
  app.name = appName
  app.safeName = safeName
  app.env = env
}

const app = { name: null, Hash: null, safeName: null, env: null }

startWorker(async arg => {
  if (!app.Hash) {
    await getApp()
  }

  arg.app = app
  return handler(arg)
})