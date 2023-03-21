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

export function execIpfsStream ({ cmd, repo, getData, killFun, verbose }) {
  return execStream({ cmd: ['ipfs', `--config=${repo}`, ...cmd.split(' ')], getData, killFun, verbose })
}

export function execIpfs (cmd, repo, silent, verbose) {
  // execIpfsStream(cmd, repo)
  // verbose
  // console.log(['ipfs', `--config=${repo}`, ...cmd.split(' ')].join(' '))
  return exec(['ipfs', `--config=${repo}`, ...cmd.split(' ')], silent, verbose)
}

export async function add ({
  appFolder,
  repo,
  clean,
  pin: pinToService,
  batch,
  buildEmits,
  publish,
  env,
  verbose,
  config = {}
}) {
  // TODO: LIBP2P_FORCE_PNET?
  const {
    ipfsGatewayPort: port = 80,
    ipfsApi: ipfsApi = 'http://127.0.0.1:5001'
  } = config
  // const startTime = Date.now()

  // TODO: default to short_name from app manifest.json
  const name = basename(Deno.cwd())
  const pinName = env === 'prod' ? name : name + '_' + env

  function ipfs (cmd, {silent} = {}) {
    return execIpfs(cmd, repo, silent, verbose)
  }

  const ipfsPinningApi = config.__ipfsPinningApi || 'https://api.pinata.cloud/psa'
  if (pinToService) {
    // TODO: ipfs pin remote ls --service=pinata handle existing keys
    await ipfs(`pin remote service rm pinata`)
    await ipfs(`pin remote service add pinata ${ipfsPinningApi} ${config.__ipfsPinningJWT}`)
  }

  async function pin ({ hash, pinName }) {
    if (!config.__ipfsPinningJWT) {
      console.error('  ⚠️ no __ipfsPinningJWT in secrets.js, skipping pinning')
      return
    }

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

  const addCommand = `add -Q --wrap-with-directory=false --chunker=rabin -r --pin=false --ignore=node_modules --ignore=.git --ignore=yarn.lock --ignore=secrets.js --ignore=*.svelte `
  async function doAdd (fName) {
    if (verbose) {
      console.log('  ipfs cmd: ' + addCommand + fName)
    }

    if (fName.endsWith('/')) {
      const rootHash = (await ipfs(addCommand + fName)).replace('\n', '')
      return { rootHash, ...(await ls(rootHash)) }
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
    const folders = new Set(['QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', rootHash]) // hash of empty folder and root folder always excluded

    // const refHashes = []
    // execIpfsStream({ cmd: `refs ${rootHash} -r --format "<src>/<dst>/<linkname>"`, repo, getData: data => {
    //   refHashes.concat(data.split('\n'))
    // }, verbose })
    // console.log('here', refHashes)

    const refHashes = await ipfs(`refs ${rootHash} -r --format "<src>/<dst>/<linkname>"`)

    refHashes.split('\n').map(line => line.split('/')).forEach(entry => {
      if (entry.length === 3) {
        let [from, to, eName] = entry
        from = from.replace('"', '')
        eName = eName.replace('"', '')

        if (hashMap[from] !== undefined ) {
          hashMap[to] = hashMap[from] + '/' + eName

          if (eName) { // intermediate leafs for big files have no linkname
            folders.add(from)
            map[hashMap[to]] = to
          }
        } else {
          console.error('unmatched ipfs ref entry: ' + entry)
        }
      }
    })
    const fileList = new Map()
    Object.entries(map).forEach(([name, hash]) => {
      if (folders.has(hash) || name === '/ipfs-map.json') {
        return
      }
      if (!fileList.has(hash)) {
        fileList.set(hash, [name])
      } else {
        fileList.set(hash, [name, ...fileList.get(hash)])
      }
    })

    delete map['']
    delete map['/ipfs-map.json']
    return { map, fileList }
  }

  try {
    await Deno.stat(appFolder)
  } catch (_e) {
    console.warn(`  ${appFolder} not found, skipping ipfs...`)
    return
  }

  let ipfsMap
  let newRootHash
  const watchRes = {}
  if (clean) {
    console.log('  ➕ adding folder to ipfs: ' + appFolder)
    const addResult = await doAdd(appFolder + '/')
    ipfsMap = addResult.map
    newRootHash = addResult.rootHash
  } else {
    const changedFiles = ([...batch, ...buildEmits])
      .map(file => join('./', file))
      .filter(file => file.startsWith(appFolder))
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
      if (verbose) {
        console.log(changedFiles)
      }
      const watchUpdt = changedFiles
        .map(file => doAdd(file))

      const watchHashes = await Promise.all(watchUpdt)
      changedFiles.forEach((f, i) => {
        watchRes[f] = watchHashes[i]
      })
    }
  }

  let ayuHash
  if (!Deno.mainModule.startsWith('file:')) {
    const hashRes = await fetch(Deno.mainModule.replace('/cli/mod.js', '/app', { method: 'HEAD' })).catch(err => console.error(err))

    ayuHash = hashRes.headers.get('x-ipfs-path').replace('/ipfs/', '')
  } else {
    ayuHash = (await (await fetch(ipfsApi + '/api/v0/files/stat?arg=/apps/atreyu', { method: 'POST' })).json()).Hash
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
      await ipfs(`files cp /ipfs/${newRootHash} /apps/${pinName}`)
    } catch (err) {
      console.error('🛑 Cannot connect to atreyu daemon. Forgot running "ayu start"?\n\n', err)
      return
    }
  } else {
    await Promise.all(Object.entries(watchRes).map(([file]) => ipfs(`files rm ${join('/', 'apps', pinName, file.replace(appFolder, ''))}`, {silent: true})))
    await Promise.all(Object.entries(watchRes).map(([file, hash]) => ipfs(`files cp /ipfs/${hash} ${join('/', 'apps', pinName, file.replace(appFolder, ''))}`)))
  }

  // console.log(await (await fetch(ipfsApi + `/api/v0/files/write?arg=/apps/${appFolder}/ipfs-map.json&truncate=true&create=true`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'multipart/form-data'
  //   }, body: JSON.stringify(ipfsMap, null, 2)
  // })).text())

  // TODO: add installing init atreyu, FIXME: this is not working!
  if (clean && pinToService && !pinName.startsWith('atreyu')) {
    let localDev = false
    // TODO: unify with deno main module check in this file
    if (!publish && (import.meta.url.startsWith('file:/') || env === 'dev')) {
      console.log('  ⚠️  using local dev version of atreyu...')
      localDev = true
    }
    await ipfs(`files cp /ipfs/${ayuHash ? ayuHash : (localDev ? '/apps/atreyu_dev' : '/apps/atreyu')} /apps/${pinName}/atreyu`)
  }

  const preHash = (await (await fetch(ipfsApi + `/api/v0/files/stat?arg=/apps/${pinName}&hash=true`, {method: 'POST'})).json()).Hash
  const { fileList, map } = await ls(preHash)

  ipfsMap = map
  Deno.writeTextFileSync(appFolder + '/ipfs-map.json', JSON.stringify(ipfsMap, null, 2))

  const mapRes = await doAdd(appFolder + '/ipfs-map.json')

  await fetch(ipfsApi + `/api/v0/files/rm?arg=/apps/${pinName}/ipfs-map.json`, {method: 'POST'}).catch(_err => {})

  await ipfs(`files cp /ipfs/${mapRes} /apps/${pinName}/ipfs-map.json`)

  // const appFolders = await (await fetch(ipfsApi + `/api/v0/files/ls?arg=/apps/&long=true`, {method: 'POST'})).json()
  // appFolders.Entries.find(({Name}) => Name === name).Hash
  const appFolderHash = (await (await fetch(ipfsApi + `/api/v0/files/stat?arg=/apps/${pinName}&hash=true`, {method: 'POST'})).json()).Hash

  fileList.set(appFolderHash + '/ipfs-map.json', ['/ipfs-map.json'])
  // TODO: allow version history and cleanup in dashboard with hash-history

  let rootFolderHash
  if (publish) {
    const publishActions = []
    if (pinName.startsWith('atreyu')) {
      rootFolderHash = (await doAdd('./')).rootHash

      await fetch(ipfsApi + `/api/v0/files/rm?arg=/apps/atreyu_repo&recursive=true`, {method: 'POST'})
      await ipfs(`files cp /ipfs/${rootFolderHash} /apps/atreyu_repo`)
      // https://cloudless.mypinata.cloud/ipfs/
      if (pinToService) {
        publishActions.push(pin({ hash: rootFolderHash, pinName: 'atreyu_repo' }))
      }
      // publishActions.push(uploadToKvs({ hash: rootFolderHash, pinName: 'atreyu_repo' }))
      console.log(`  publishing atreyu cli version: http://atreyu.localhost/ipfs/${rootFolderHash}/cli/mod.js`)
    }
    if (pinToService) {
      publishActions.push(pin({ hash: appFolderHash, pinName }))
    }
    // publishActions.push(uploadToKvs({ hash: appFolderHash, pinName }))

    await Promise.all(publishActions)
  }

  // await Promise.all([
  //   ipfs(`pin add ${ayuRootHash}`), // update /ipns/${keys.atreyu.cid}
  //   ipfs(`pin add ${folderHash}`), // update /ipns/${keys[name].cid}
  //   ipfs(`name publish --lifetime=2000h --key=atreyu ${ayuRootHash} --quieter --resolve=false --allow-offline`),
  //   ipfs(`name publish --lifetime=2000h --key=${name} ${folderHash} --quieter --resolve=false --allow-offline`)
  // ])

  console.log(green(`  ✅ added ${pinName}: http://${name}.localhost${port == 80 ? '' : ':' + port}`))
  // const duration = (Math.floor(Date.now() / 100 - startTime / 100)) / 10
  // duration && console.log('  ' + duration + 's')
  // console.log('')
  return { appFolderHash, rootFolderHash, fileList, ayuHash }
}
