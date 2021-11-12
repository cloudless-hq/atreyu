import { escapeId } from '../app/src/lib/escape-id.js'

export async function couchUpdt ({folderHash, buildColor, config, name, version, buildName, buildTime, appName, env}) {
  const { couchHost, __couchAdminKey, __couchAdminSecret, couchKey, userId } = config

  if (!couchHost) {
    return
  }

  const headers = { Authorization: `Basic ${btoa(__couchAdminKey + ':' + __couchAdminSecret)}` }

  const dbName = env === 'dev' ? escapeId(env + '_' + userId + '.' + appName) : escapeId(env + '.' + appName)

  const _id = env === 'dev' ? `system:settings_${env}_${userId}` : `system:settings_${env}`

  console.log(`  🛋  pushing new hash to app db ${couchHost}/${dbName}...`)
  try {
    const oldDoc = await (await fetch(`${couchHost}/${dbName}/${_id}`, {headers})).json()
    // if (oldDoc?._rev) {
    //   console.log('  found existing version')
    // }
    const _rev = oldDoc?._rev

    const dbRes =  await fetch(`${couchHost}/${dbName}`, {
      headers
    })

    if (dbRes.status === 404) {
      console.log('  no existing app db found for environment, creating a new one...')
      await fetch(`${couchHost}/${dbName}?partitioned=false`, {
        headers,
        method: 'PUT'
      })

      await fetch(`${couchHost}/${dbName}/_security`, {
        headers,
        method: 'PUT',
        body: JSON.stringify({
          'cloudant': {
            'nobody': [],
            [couchKey]: [
              '_reader',
              '_writer'
            ]
          }
        })
      })
    }

    const updtRes = await (await fetch(`${couchHost}/${dbName}/${_id}`, {
      body: JSON.stringify({
        _id,
        _rev,
        folderHash,
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
      console.log('  🏁 app db update finished')
    }
  } catch (err) {
    console.log('  🛑 Error updating app db version...', err)
  }
}
