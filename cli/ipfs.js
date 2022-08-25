import { join, basename, green, yellow } from '../deps-deno.ts'
import { execStream, exec } from './helpers.ts'
import versions from './versions.json' assert { type: 'json' }
const { ipfsVersion } = versions

// async function ipfsFetch (cmd, data) {
//  // todo: convert to http
// }
// TODO: move to generic exec lib
// export async function exec (cmd) {
//   // console.log(cmd)
//   // console.log('\n\n\n')
//   const proc = Deno.run({
//     cmd: cmd.split(' '),
//     // stdout: 'piped',
//     // stderr: 'piped'
//   })
//   const { code } = await proc.status()
//   if (code !== 0) {
//     const rawError = await proc.stderrOutput()
//     const errorString = new TextDecoder().decode(rawError)
//     console.error('rollup error: ', errorString, cmd)
//   }
//   // const rawOutput = await proc.output()
//   // const outStr = new TextDecoder().decode(rawOutput)
//   // proc.close()
//   // return outStr
// }

// console.log({ a: import.meta.url.startsWith('file:/'), b: Deno.mainModule.startsWith('file:'), mainModule: Deno.mainModule, metaUrl: import.meta.url })

export function execIpfsStream (cmd, repo, getData) {
  return execStream({ cmd: ['ipfs', `--config=${repo}`, ...cmd.split(' ')], getData })
}

export function execIpfs (cmd, repo, silent) {
  // verbose console.log(['ipfs', `--config=${repo}`, ...cmd.split(' ')].join(' '))
  return exec(['ipfs', `--config=${repo}`, ...cmd.split(' ')], silent)
}

async function uploadToKvs ({ hash, pinName }) {
  // GET accounts/:account_identifier/storage/kv/namespaces

  // curl -X GET "/accounts/01a7362d577a6c3019a474fd6f485823/storage/kv/namespaces/0f2ac74b498b48028cb68387c421e279/metadata/My-Key" \
  //    -H "X-Auth-Email: user@example.com" \
  //    -H "X-Auth-Key: c2547eb745079dac9320b638f5e225cf483cc5cfdda41"

  // GET accounts/:account_identifier/storage/kv/namespaces/:namespace_identifier/values/:key_name

  // HEAD accounts/:account_identifier/storage/kv/namespaces/:namespace_identifier/values/:key_name

  // curl -X PUT "/accounts/01a7362d577a6c3019a474fd6f485823/storage/kv/namespaces/0f2ac74b498b48028cb68387c421e279/bulk" \
  //    -H "X-Auth-Email: user@example.com" \
  //    -H "X-Auth-Key: c2547eb745079dac9320b638f5e225cf483cc5cfdda41" \
  //    -H "Content-Type: application/json" \
  //    --data '[{"key":"My-Key","value":"Some string","expiration":1578435000,"expiration_ttl":300,"metadata":{"someMetadataKey":"someMetadataValue"},"base64":false}]'
}

export async function add ({
  input = 'app',
  repo,
  clean,
  pin: pinToService,
  batch,
  buildEmits,
  publish,
  env,
  config = {}
}) {
  // TODO: LIBP2P_FORCE_PNET?
  const {
    ipfsGatewayPort: port = 80,
    ipfsApi: ipfsApi = 'http://127.0.0.1:5001'
  } = config

  // TODO: default to short_name from app manifest.json
  const name = basename(Deno.cwd())
  const pinName = env === 'prod' ? name : name + '_' + env

  function ipfs (cmd, {silent} = {}) {
    return execIpfs(cmd, repo, silent)
  }

  async function pin ({ hash, pinName }) {
    if (!config.__ipfsPinningJWT) {
      console.error('  ⚠️ no __ipfsPinningJWT in secrets.js, skipping pinning')
      return
    }
    const ipfsPinningApi = config.__ipfsPinningApi || 'https://api.pinata.cloud/psa'

    // TODO: ipfs pin remote ls --service=pinata handle existing keys
    await ipfs(`pin remote service rm pinata`)
    await ipfs(`pin remote service add pinata ${ipfsPinningApi} ${config.__ipfsPinningJWT}`)

    const listRes = await (await fetch(`${ipfsPinningApi}/pins?status=queued,pinning,pinned,failed&name=${pinName}&limit=100`, {
      headers: { 'Authorization': `Bearer ${config.__ipfsPinningJWT}` }
    })).json()

    let pinRequestId
    let deletions = []
    if (listRes.count > 100) {
      console.error('  🛑 too many pinned objects for the name, limited to 100, please remove manually or raise issue on github to implement paging')
      return
    } else if (listRes.count > 0) {
      // if (prompt(`  ⚠️  remove ${listRes.count - 1} older pins for the name? y/n`, 'n') === 'y') {
      deletions = listRes.results.flatMap(pin => {
        // if (i === listRes.count -1) {
        // pinRequestId = pin.requestid
        // return []
        // } else {
        return pin.requestid
        // }
      })
      // } else {
      // return
      // }
    }
    // else if (listRes.count === 1) {
    // pinRequestId = listRes.results[0].requestid
    // }

    for (let i = 0; i < deletions.length; i++) {
      await fetch(`${ipfsPinningApi}/pins/${deletions[i]}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${config.__ipfsPinningJWT}` }
      }).catch(err => console.error(`  🛑 error deleting pin ${deletions[i]}`, err))
    }

    if (pinRequestId) {
      await ipfs(`pin remote add --service=pinata --name=${pinName} ${hash}`)
      // await fetch(`${ipfsPinningApi}/pins/${pinRequestId}`, {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${config.__ipfsPinningJWT}`, 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name,
      //     cid: hash
      //     // todo: origins or ipfs(`pin remote update --service=pinata --name=${name} ${hash}`)
      //   })
      // }).catch(err => console.error(`  🛑 error updating pin ${deletions[i]}`, err))
    } else {
      await ipfs(`pin remote add --service=pinata --name=${pinName} ${hash}`)
    }
    // TODO check pinning status!
  }

  if (clean) {
    const version = (await ipfs(`version`)).replace('\n', '').replace('ipfs version ', '') // .split('.').map(x => Number(x))
    if (version !== ipfsVersion) {
      console.log(`  ${yellow(' warning: only tested with ipfs version ' + ipfsVersion + ', but found:')}`, version)
    }
  }

  const addCommand = `add -Q --wrap-with-directory=false --chunker=rabin -r --pin=false --ignore=node_modules --ignore=yarn.lock --ignore=secrets.js `
  async function doAdd (fName) {
    if (fName.endsWith('/')) {
      const rootHash = (await ipfs(addCommand + fName)).replace('\n', '')
      return ls(rootHash)
    } else {
      return (await ipfs(addCommand + fName)).replace('\n', '')
    }
    // --cid-version=1
  }

  async function ls (rootHash) {
    const hashMap = {
      [rootHash]: ''
    }
    const map = {
      '': rootHash
    }

    const refHashes = await ipfs(`refs ${rootHash} -r --format "<src>/<dst>/<linkname>"`)

    refHashes.split('\n').map(line => line.split('/')).forEach(entry => {
      if (entry.length === 3) {
        let [from, to, eName] = entry
        from = from.replace('"', '')
        eName = eName.replace('"', '')

        if (hashMap[from] !== undefined ) {
          hashMap[to] = hashMap[from] + '/' + eName

          if (eName) {
            map[hashMap[to]] = to
          }
        } else {
          console.error('unmatched ipfs ref entry: ' + entry)
        }
      }
    })

    return map
  }

  try {
    await Deno.stat(input)
  } catch (_e) {
    console.warn(`  ${input} not found, skipping ipfs...`)
    return
  }

  let listMap
  const watchRes = {}
  if (clean) {
    console.log('  ➕ adding folder to ipfs: ' + input)
    listMap = await doAdd(input + '/')
  } else {
    const changedFiles = ([...batch, ...buildEmits])
      .map(file => join('./', file))
      .filter(file => file.startsWith(input))
      .filter(file => {
        try {
          Deno.statSync(file)
          return true
        } catch (_e) {
          return false
        }
      })

    if (changedFiles.length > 0) {
      console.log(`  ➕ adding ${changedFiles.length} new files to ipfs...`)
      const watchUpdt = changedFiles
        .map(file => doAdd(file))

      const watchHashes = await Promise.all(watchUpdt)
      changedFiles.forEach((f, i) => {
        watchRes[f] = watchHashes[i]
      })
    }
  }

  let curAyuIpfsPath
  if (!Deno.mainModule.startsWith('file:')) {
    const hashRes = await fetch(Deno.mainModule.replace('/cli/mod.js', '', { method: 'HEAD' })).catch(err => console.error(err))
    curAyuIpfsPath = hashRes.headers.get('x-ipfs-path')
    // console.log({ curAyuIpfsPath, mod: Deno.mainModule })
  }

  // if ayu is run from local filesystem add atreyu to the ipfs
  // deployment because it is probably a dev or custom version not available in through http
  // let atreyuFileHashes = {}
  // const atreyuPath = join(Deno.mainModule, '..').replace('file:', '') + '/app/'
  // const dashData = {
  //   logo_url: 'https://dui.ask-joe.co/details/Logo_colour.png',
  //   org_name: 'Cloudless',
  //   login_path: '/login',
  //   apps: Object.entries(keys).map(([key, value]) => {
  //     return {
  //       domain: `http://${value}.ipns.localhost${port == 80 ? '' : ':' + port}`,
  //       name: key
  //     }
  //   }) }
  // Deno.writeTextFileSync(atreyuPath + 'apps/apps/data', JSON.stringify(dashData, null, 2))
  // atreyuFileHashes = await doAdd(atreyuPath) }

  if (clean) {
    await fetch(ipfsApi + '/api/v0/files/mkdir?arg=/apps', {method: 'POST'}).catch(_err => {})

    try {
      await fetch(ipfsApi + `/api/v0/files/rm?arg=/apps/${pinName}&recursive=true`, {method: 'POST'})
      await ipfs(`files cp /ipfs/${listMap['']} /apps/${pinName}`)
    } catch (err) {
      console.error('🛑 Cannot connect to atreyu daemon. Forgot running "ayu start"?\n\n', err)
      return
    }
  } else {
    await Promise.all(Object.entries(watchRes).map(([file]) => ipfs(`files rm ${join('/', 'apps', pinName, file.replace('app', ''))}`, {silent: true})))
    await Promise.all(Object.entries(watchRes).map(([file, hash]) => ipfs(`files cp /ipfs/${hash} ${join('/', 'apps', pinName, file.replace('app', ''))}`)))
  }

  // console.log(await (await fetch(ipfsApi + `/api/v0/files/write?arg=/apps/${input}/ipfs-map.json&truncate=true&create=true`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'multipart/form-data'
  //   }, body: JSON.stringify(listMap, null, 2)
  // })).text())

  // TODO: add installing init atreyu, FIXME: this is not working!
  if (clean && !pinName.startsWith('atreyu')) {
    let localDev = false
    // TODO: unify with deno main module check in this file
    if (!publish && (import.meta.url.startsWith('file:/') || env === 'dev')) {
      console.log('  ⚠️  using local dev version of atreyu...')
      localDev = true
    }
    await ipfs(`files cp ${curAyuIpfsPath ? curAyuIpfsPath + '/app' : (localDev ? '/apps/atreyu_dev' : '/apps/atreyu')} /apps/${pinName}/atreyu`)
  }

  const preHash = (await (await fetch(ipfsApi + `/api/v0/files/stat?arg=/apps/${pinName}&hash=true`, {method: 'POST'})).json()).Hash
  listMap = await ls(preHash)
  Deno.writeTextFileSync(input + '/ipfs-map.json', JSON.stringify(listMap, null, 2))

  const mapRes = await doAdd(input + '/ipfs-map.json')

  await fetch(ipfsApi + `/api/v0/files/rm?arg=/apps/${pinName}/ipfs-map.json`, {method: 'POST'}).catch(_err => {})

  await ipfs(`files cp /ipfs/${mapRes} /apps/${pinName}/ipfs-map.json`)

  // const appFolders= await (await fetch(ipfsApi + `/api/v0/files/ls?arg=/apps/&long=true`, {method: 'POST'})).json()
  // appFolders.Entries.find(({Name}) => Name === name).Hash
  const appFolderHash = (await (await fetch(ipfsApi + `/api/v0/files/stat?arg=/apps/${pinName}&hash=true`, {method: 'POST'})).json()).Hash

  // TODO: allow version history and cleanup in dashboard with hash-history

  let rootFolderHash
  if (publish) {
    const publishActions = []
    if (pinName.startsWith('atreyu')) {
      rootFolderHash = (await doAdd('./'))['']
      await fetch(ipfsApi + `/api/v0/files/rm?arg=/apps/atreyu_repo&recursive=true`, {method: 'POST'})
      await ipfs(`files cp /ipfs/${rootFolderHash} /apps/atreyu_repo`)
      // https://cloudless.mypinata.cloud/ipfs/
      if (pinToService) {
        publishActions.push(pin({ hash: rootFolderHash, pinName: 'atreyu_repo' }))
      }
      publishActions.push(uploadToKvs({ hash: rootFolderHash, pinName: 'atreyu_repo' }))
      console.log(`  publishing atreyu cli version: http://atreyu.localhost/ipfs/${rootFolderHash}/cli/mod.js`)
    }
    if (pinToService) {
      publishActions.push(pin({ hash: appFolderHash, pinName }))
    }
    publishActions.push(uploadToKvs({ hash: appFolderHash, pinName }))

    await Promise.all(publishActions)
  }

  // await Promise.all([
  //   ipfs(`pin add ${atreyuFileHashes['']}`), // update /ipns/${keys.atreyu.cid}
  //   ipfs(`pin add ${folderHash}`), // update /ipns/${keys[name].cid}
  //   ipfs(`name publish --lifetime=2000h --key=atreyu ${atreyuFileHashes['']} --quieter --resolve=false --allow-offline`),
  //   ipfs(`name publish --lifetime=2000h --key=${name} ${folderHash} --quieter --resolve=false --allow-offline`)
  // ])

  console.log(green(`  ✅ added ${pinName}: http://${name}.localhost${port == 80 ? '' : ':' + port}`))

  return { appFolderHash, rootFolderHash }
}
