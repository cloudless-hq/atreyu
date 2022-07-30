import { escapeId } from '../app/src/lib/escape-id.js'

export async function couchUpdt ({ appFolderHash, rootFolderHash, buildColor, config, version, buildName, buildTime, appName, env }) {
  const { couchHost, __couchAdminKey, __couchAdminSecret, _couchKey, userId } = config

  if (!couchHost || !__couchAdminKey) {
    return
  }

  const headers = { Authorization: `Basic ${btoa(__couchAdminKey + ':' + __couchAdminSecret)}` }

  const dbName = env === 'dev' ? escapeId(env + '_' + userId + '__' + appName) : env === 'prod' ? escapeId(appName) : escapeId(env + '__' + appName)

  const _id = env === 'dev' ? `system:settings_${env}_${userId}` : `system:settings_${env}`

  console.log(`  🛋  pushing new hash to app db ${couchHost}/${dbName}`)

  try {
    const dbRes = await fetch(`${couchHost}/${dbName}`, {
      headers
    })

    if (dbRes.status === 404) {
      console.log('  no existing app db found for environment, creating a new one...')
      await fetch(`${couchHost}/${dbName}?partitioned=true`, {
        headers,
        method: 'PUT'
      })

      await fetch(`${couchHost}/${dbName}/_security`, {
        headers,
        method: 'PUT',
        body: JSON.stringify({
          'cloudant': {
            'nobody': [],
            [_couchKey]: [
              '_reader',
              '_writer'
            ]
          }
        })
      })
    }

    const oldDoc = await (await fetch(`${couchHost}/${dbName}/${_id}`, {headers})).json()
    const _rev = oldDoc?._rev

    const updtRes = await (await fetch(`${couchHost}/${dbName}/${_id}`, {
      body: JSON.stringify({
        _id,
        _rev,
        folderHash: appFolderHash,
        rootFolderHash,
        version,
        buildName,
        buildTime,
        buildColor
      }),
      headers,
      method: 'PUT'
    })).json()

    if (!updtRes?.ok) {
      console.error('  🛑 Unexpected update result...', updtRes)
    } else {
      console.log('  🏁 app db update finished ' + appFolderHash)
    }
  } catch (err) {
    console.log('  🛑 Error updating app db version...', err)
  }
}
