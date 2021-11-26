import { join, basename, green, yellow } from '../deps-deno.js'
import { execStream, exec } from './exec.js'
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

export function execIpfsStream (cmd, repo, getData) {
  return execStream({ cmd: ['ipfs', `--config=${repo}`, ...cmd.split(' ')], getData })
}

export function execIpfs (cmd, repo, silent) {
  return exec(['ipfs', `--config=${repo}`, ...cmd.split(' ')], silent)
}

export async function add ({
  input = 'app',
  repo,
  clean,
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
  const pinName = name + '_' + env

  function ipfs (cmd, {silent} = {}) {
    return execIpfs(cmd, repo, silent)
  }

  if (clean) {
    const version = (await ipfs(`version`)).replace('\n', '').replace('ipfs version ', '').split('.').map(x => Number(x))
    if (version[1] < 8) {
      console.log(`  ${yellow(' warning: ipfs version must be at least 0.8, found:')}`, version)
    }
  }

  const addCommand = `add -Q --wrap-with-directory=false --chunker=rabin -r --ignore=node_modules --pin=false --ignore=yarn.lock --ignore=package.json `
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

    const refHashes = await ipfs(`refs ${rootHash} -r --format <src>/<dst>/<linkname>`)

    refHashes.split('\n').map(line => line.split('/')).forEach(entry => {
      if (entry.length === 3) {
        const [from, to, eName] = entry

        if (hashMap[from] !== undefined ) {
          hashMap[to] = hashMap[from] + '/' + eName

          if (eName) {
            map[hashMap[to]] = to
          }
        } else {
          console.error('unmatched entry: ' + entry)
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
  let watchRes = {}
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

  // if ayu is run from local filesystem add atreyu to the ipfs
  // deployment because it is probably a dev or custom version not available in through http
  // let atreyuFileHashes = {}
  // if (Deno.mainModule.startsWith('file://')) { // todo fix dev and prod logic for ayu
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
    try {
      await fetch(ipfsApi + '/api/v0/files/mkdir?arg=/apps', {method: 'POST'})
    } catch (_) {}
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

  // TODO: add isntalling init atreyu
  if (clean && pinName !== 'atreyu' + '_' + env) {
    await ipfs(`files cp /apps/atreyu_${env} /apps/${pinName}/atreyu`)
  }

  const preHash = (await (await fetch(ipfsApi + `/api/v0/files/stat?arg=/apps/${pinName}&hash=true`, {method: 'POST'})).json()).Hash
  listMap = await ls(preHash)
  Deno.writeTextFileSync(input + '/ipfs-map.json', JSON.stringify(listMap, null, 2))

  const mapRes = await doAdd(input + '/ipfs-map.json')

  await fetch(ipfsApi + `/api/v0/files/rm?arg=/apps/${pinName}/ipfs-map.json`, {method: 'POST'})
  await ipfs(`files cp /ipfs/${mapRes} /apps/${pinName}/ipfs-map.json`)

  // const appFolders= await (await fetch(ipfsApi + `/api/v0/files/ls?arg=/apps/&long=true`, {method: 'POST'})).json()
  // appFolders.Entries.find(({Name}) => Name === name).Hash
  const folderHash = (await (await fetch(ipfsApi + `/api/v0/files/stat?arg=/apps/${pinName}&hash=true`, {method: 'POST'})).json()).Hash

  // TODO: allow version history and cleanup in dashboard with hash-history
  // Deno.writeTextFileSync(input + '/ipfsHashes', folderHash + '\n', {append: true})

  if (publish) {
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
      await ipfs(`pin remote add --service=pinata --name=${pinName} ${folderHash}`)
      // await fetch(`${ipfsPinningApi}/pins/${pinRequestId}`, {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${config.__ipfsPinningJWT}`, 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name,
      //     cid: folderHash
      //     // todo: origins or ipfs(`pin remote update --service=pinata --name=${name} ${folderHash}`)
      //   })
      // }).catch(err => console.error(`  🛑 error updating pin ${deletions[i]}`, err))
    } else {
      await ipfs(`pin remote add --service=pinata --name=${pinName} ${folderHash}`)
    }
    // TODO check pinning status!
    console.log(green(`  ✅ added ${name} `))
    // http://${keys.atreyu}.ipns.pinata.cloud${port == 80 ? '' : ':' + port}`))
  } else {
    // await Promise.all([
    //   ipfs(`pin add ${atreyuFileHashes['']}`), // update /ipns/${keys.atreyu.cid}
    //   ipfs(`pin add ${folderHash}`), // update /ipns/${keys[name].cid}
    //   // ipfs(`name publish --lifetime=2000h --key=atreyu ${atreyuFileHashes['']} --quieter --resolve=false --allow-offline`),
    //   // ipfs(`name publish --lifetime=2000h --key=${name} ${folderHash} --quieter --resolve=false --allow-offline`)
    // ])

    console.log(green(`  ✅ added ${name}: http://${name}.localhost${port == 80 ? '' : ':' + port}`))
  }

  return folderHash
}
