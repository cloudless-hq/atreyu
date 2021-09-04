import { escapeId } from './edge/lib/escape-id.js'

export async function couchUpdt ({folderHash, buildColor, config, name, version, buildName, buildTime, appName, env}) {
    // console.log({folderHash, config, name})

    const { cloudantDomain, __cloudantAdminKey, __cloudantAdminSecret, cloudantKey } = config
    const headers = { Authorization: `Basic ${btoa(__cloudantAdminKey + ':' + __cloudantAdminSecret)}` }

    const dbName = escapeId(appName)

    const _id = `system:settings_${env}`

    if (!cloudantDomain) {
        return
    }

    try {
        const oldDoc = await (await fetch(`https://${cloudantDomain}/${dbName}/${_id}`, {headers})).json()

        const _rev = oldDoc?._rev

        const dbRes =  await fetch(`https://${cloudantDomain}/${dbName}`, {
            headers
        })
        if (dbRes.status === 404) {
            await fetch(`https://${cloudantDomain}/${dbName}?partitioned=false`, {
                headers,
                method: 'PUT'
            })

            await fetch(`https://${cloudantDomain}/${dbName}/_security`, {
                headers,
                method: 'PUT',
                body: JSON.stringify({
                    "cloudant": {
                    "nobody": [],
                    [cloudantKey]: [
                        "_reader",
                        "_writer"
                    ]
                    }
                })
            })
        }


        const updtRes = await fetch(`https://${cloudantDomain}/${dbName}/${_id}`, {
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
        })
    } catch (err) {
        console.error(err)
    }
}