import { escapeId } from './edge/lib/escape-id.js'

export async function couchUpdt ({folderHash, buildColor, config, name, version, buildName, buildTime, appName, env}) {
  // console.log({folderHash, config, name})
  const { couchHost, __couchAdminKey, __couchAdminSecret, couchKey, userName } = config
  const headers = { Authorization: `Basic ${btoa(__couchAdminKey + ':' + __couchAdminSecret)}` }

  const dbName = escapeId(env + '.' + appName)

  const _id = env === 'dev' ? `system:settings_${env}_${userName}` : `system:settings_${env}`

  if (!couchHost) {
    return
  }

  try {
    const oldDoc = await (await fetch(`${couchHost}/${dbName}/${_id}`, {headers})).json()

    const _rev = oldDoc?._rev

    const dbRes =  await fetch(`${couchHost}/${dbName}`, {
        headers
    })

    if (dbRes.status === 404) {
      await fetch(`${couchHost}/${dbName}?partitioned=false`, {
          headers,
          method: 'PUT'
      })

      await fetch(`${couchHost}/${dbName}/_security`, {
        headers,
        method: 'PUT',
        body: JSON.stringify({
          "cloudant": {
            "nobody": [],
            [couchKey]: [
                "_reader",
                "_writer"
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

    if (!updtRes.ok) {
      console.error(updtRes)
    }
  } catch (err) {
    console.error(err)
  }
}