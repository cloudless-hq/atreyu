import { join } from '../deps-deno.ts'
import { escapeId } from '../app/src/lib/escape-id.js'

export async function couchUpdt ({ appFolderHash, rootFolderHash, buildColor, config, version, buildName, buildTime, appName, env, resetAppDb, force }) {
  const { couchHost, __couchAdminKey, __couchAdminSecret, _couchKey } = config

  if (!couchHost || !__couchAdminKey) {
    return
  }

  const headers = {
    'Authorization': `Basic ${btoa(__couchAdminKey + ':' + __couchAdminSecret)}`,
    'Content-Type': 'application/json'
  }

  const dbName = env === 'prod' ? escapeId(appName) : escapeId(env + '__' + appName)

  const _id = `system:settings_${env}`

  try {
    const dbRes = await fetch(`${couchHost}/${dbName}`, {
      headers
    })

    let createDb = false
    if (dbRes.status === 404) {
      console.log('  no existing app db found for environment, creating a new one...')
      createDb = true
    } else if (resetAppDb) {
      if (force || confirm(`Do you really want to delete ${dbName}?`)) {
        console.log(`  ♻️ Resetting existing test database ${couchHost}/${dbName}`)
        const deleteRes = await fetch(`${couchHost}/${dbName}`, {
          headers,
          method: 'DELETE'
        })
        if (!deleteRes.ok) {
          console.error('  🛑 ' + await deleteRes.text())
          Deno.exit(1)
        }
        createDb = true
      } else {
        console.error('  🛑 Refusing to erase database outside of test environment!')
      }
    }

    if (createDb) {
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
              '_writer',
              '_admin'
            ]
          }
        })
      })
    }

    let dbSeeds = []
    // TODO: handle updates
    if (createDb) {
      try {
        dbSeeds = (await import('file://' + join('/', Deno.cwd(), 'db-seed.js'))).default
      } catch (_err) { }
    }

    const oldDoc = await (await fetch(`${couchHost}/${dbName}/${_id}`, {headers})).json()
    const _rev = oldDoc?._rev

    console.log(`  🛋  pushing new hash to app db ${couchHost}/${dbName}`)
    const updtRes = await (await fetch(`${couchHost}/${dbName}/_bulk_docs`, {
      body: JSON.stringify({ docs: [
        {
          _id,
          _rev,
          folderHash: appFolderHash,
          rootFolderHash,
          version,
          buildName,
          buildTime,
          buildColor
        },
        ...dbSeeds
      ] }),
      headers,
      method: 'POST'
    })).json()

    let clean = true
    updtRes.forEach(res => {
      if (!res?.ok) {
        clean = false
        console.error('  🛑 Unexpected update result...', res)
      }
    })

    if (clean) {
      console.log('  🏁 app db update finished ' + appFolderHash)
    }
  } catch (err) {
    console.log('  🛑 Error updating app db version...', err)
  }
}
