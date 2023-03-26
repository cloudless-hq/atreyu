import { join } from '../deps-deno.ts'
import { escapeId } from '../app/src/lib/helpers.js'
import dbDefaultSeeds from '../app/db-default-seeds.js'

export async function couchUpdt ({ appFolderHash, rootFolderHash, buildColor, config, version, buildName, buildTime, appName, env, resetAppDb, force, ayuHash, verbose }) {
  const { couchHost, __couchAdminKey, __couchAdminSecret, _couchKey } = config

  if (!couchHost || !__couchAdminKey) {
    if (verbose || (couchHost !== __couchAdminKey)) {
      console.log('  no couch admin credentials configured in ayu.config.js, skipping db setup')
    }
    return
  }

  const headers = {
    'Authorization': `Basic ${btoa(__couchAdminKey + ':' + __couchAdminSecret)}`,
    'Content-Type': 'application/json'
  }

  const dbName = 'ayu_' + (env === 'prod' ? escapeId(appName) : escapeId(env + '__' + appName))

  const _id = `system:ayu_settings`

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
        console.log(`  ♻️ Resetting existing database ${couchHost}/${dbName}`)
        const deleteRes = await fetch(`${couchHost}/${dbName}`, {
          headers,
          method: 'DELETE'
        })
        if (!deleteRes.ok) {
          console.error('  🛑 ' + (await deleteRes.text()))
          Deno.exit(1)
        }
        createDb = true
      } else {
        console.error('  🛑 Refusing to erase database outside of test environment!')
      }
    }

    if (createDb) {
      try {
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
      } catch (err) {
        console.error(err)
      }
    }

    const dbSeeds = [...dbDefaultSeeds]
    // TODO: handle updates
    if (createDb) {
      try {
        console.log('  seeding base docs to database')
        dbSeeds.concat((await import('file://' + join('/', Deno.cwd(), 'db-seed.js'))).default)
        // const currentVersions = await (await fetch(`${couchHost}/${dbName}/_bulk_docs`, { body: <ids>, headers })).json()
        // console.log(currentVersions)
      } catch (_err) { /* ignore */ }
    }

    const oldDoc = await (await fetch(`${couchHost}/${dbName}/${_id}`, {headers})).json()
    const _rev = oldDoc?._rev

    console.log(`  🛋  pushing new hash to app db ${couchHost}/${dbName}`)
    const updtRes = await fetch(`${couchHost}/${dbName}/_bulk_docs`, {
      body: JSON.stringify({ docs: [
        {
          _id,
          _rev,
          folderHash: appFolderHash,
          ayuHash,
          rootFolderHash,
          version, // deprecate this key
          ayuVersion: version,
          buildName,
          buildTime,
          buildColor
        },
        ...dbSeeds
      ] }),
      headers,
      method: 'POST'
    })

    // TODO: handle errors and updates

    let clean = true
    if (!updtRes.ok) {
      console.error('  🛑 Error updating app hash', await updtRes.text())
      clean = false
    } else {
      (await updtRes.json()).forEach(res => {
        if (!res?.ok) {
          clean = false
          console.error('  🛑 Unexpected update result...', res)
          console.error(res.reason)
        }
      })
    }

    if (clean) {
      console.log('  🏁 app db update finished ' + appFolderHash)
    }
  } catch (err) {
    console.log('  🛑 Error updating app db version...', err)
  }
}
