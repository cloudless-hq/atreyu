// deno-lint-ignore-file no-case-declarations no-inner-declarations
import {
  parse,
  join,
  faker,
  basename,
  italic,
  yellow,
  bold,
  color,
  red,
  globToRegExp
} from '../deps-deno.ts'

import { runDeno } from '../runtime/mod.ts'
import { update } from './update.ts'
import { printHelp } from './help.js'
import { loadConfig } from './config.js'
import buildSvelte from './svelte.ts'
import buildServiceWorker from './service-worker.js'
import { buildEdge, buildWorkerConfig } from './edge.ts'
import { execIpfs, execIpfsStream, add as addIpfs, get } from './ipfs.js'
import { cloudflareDeploy } from './cloudflare.js'
import { couchUpdt } from './couch.js'
import { addPathTags } from '../app/src/schema/helpers.js'
import { exec, execStream } from './helpers.ts'
import { watch } from './watcher.ts'
import { workerdSetup } from './workerd.js'

import versions from './versions.json' assert { type: 'json' }
import defaultPaths from '../app/src/schema/default-routes.js'
import ignore from './ignores.js'

// TODO integrate node scripts
// TODO: sourcemaps worker and svelte, use sourcemaps for watch rebuild dependencies
// TODO: load from tag!
// TODO: handle missing deno dir folder and missing deno home env
// TODO: dynamic import for non essential modules
// TODO: install check versions
// TODO: remove docs js cdns dependency


const {
  _,
  appFolder = 'app',
  output,
  online,
  help,
  kill,
  once,
  version,
  env: envFlag,
  port = '80',
  pin,
  clean,
  noStart,
  resetKvs,
  workerd,
  repo,
  domain,
  sveltePath,
  resetAppDb,
  force,
  verbose,
  info,
  ...rest
} = parse(Deno.args)

if (Object.keys(rest).length) {
  console.error(`  ❓ Unknown command line arguments:`, rest)
}

let cmd = _[0]
if (help) {
  cmd = 'help'
}
if (version) {
  cmd = 'version'
}
if (!cmd) {
  cmd = 'dev'
}

let buildMeta
function buildString () {
  return bold(italic(color(buildMeta.buildName, buildMeta.buildColor)))
}
function rollBuildMeta () {
  buildMeta = {
    buildName: faker.company.bs(),
    buildColor: {r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: Math.floor(Math.random() * 255)},
    buildTime: Date.now()
  }
}
rollBuildMeta()

const { ayuVersion, denoVersion } = versions
const home = Deno.env.get('HOME')
const projectPath = Deno.cwd()
const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '')
const homeConfPath = repo || home + '/.atreyu'
const appName = basename(projectPath)
let { config = {}, runConf = {}, extraAppEntryPoints } = await loadConfig(envFlag, cmd, appName, homeConfPath, buildMeta.buildName, ayuVersion)
const env = config.env
const devMode = cmd !== 'publish'
const appKey = env === 'prod' ? appName : appName + '_' + env
const envDir = `${homeConfPath}/${env}`
const workerdConfPath = `${envDir}/main.capnp`
const input = _[1] || `${appFolder}/src`

try {
  Deno.lstatSync(homeConfPath)
} catch (_e) {
  Deno.mkdirSync(homeConfPath)
}
try {
  Deno.lstatSync(envDir)
} catch (_e) {
  Deno.mkdirSync(envDir)
}

// TODO: dont always clean completely?
// TODO: allow argument relative path for apps different from cwd
// TODO: unify with other schema loader which allows also schema.js
async function loadEdgeSchema ({ appFolder }) {
  // TODO: support implicit endpoints folder routes
  const maybeSchema = await import('file:' + projectPath + `/${appFolder}/schema/main.js`).catch(error => ({ error }))
  let schema = maybeSchema?.schema

  if (typeof schema === 'function') {
    schema = schema({ defaultPaths, addPathTags })
  } else if (schema) {
    schema.paths = { ...defaultPaths, ...schema.paths }
  }

  if (!schema) {
    console.warn('  could not load schema, falling back to default') // verbose schemaImports, console.log(maybeSchema)

    schema = {
      paths: {
        '/*': {
          get: {
            tags: [ 'edge', 'service-worker' ],
            operationId: '_ipfs'
          }
        }
      }
    }
  }
  // TODO: get endpoints script for auto handling
  return buildWorkerConfig(schema)
}

let ipfsDaemon
async function startIpfsDaemon () {
  const offline = (online || pin) ? '' : ' --offline'

  try {
    Deno.lstatSync(homeConfPath + '/config')
  } catch (_e) {
    console.log(await execIpfs('init', homeConfPath))
    // ipfs bootstrap rm --all
    // ipfs bootstrap add /ip4/25.196.147.100/tcp/4001/p2p/QmaMqSwWShsPg2RbredZtoneFjXhim7AQkqbLxib45Lx4S
    // disable quic + webTransport
    // add peering
    const ipfsConf = JSON.parse(Deno.readFileSync(homeConfPath + '/config'))
    ipfsConf.Bootstrap = [
      '/dnsaddr/fra1-3.hostnodes.pinata.cloud/p2p/QmPo1ygpngghu5it8u4Mr3ym6SEU2Wp2wA66Z91Y1S1g29',
      '/dnsaddr/nyc1-1.hostnodes.pinata.cloud/p2p/QmRjLSisUCHVpFa5ELVvX3qVPfdxajxWJEHs9kN3EcxAW6',
      '/dnsaddr/nyc1-2.hostnodes.pinata.cloud/p2p/QmPySsdmbczdZYBpbi2oq2WMJ8ErbfxtkG8Mo192UHkfGP',
      '/dnsaddr/nyc1-3.hostnodes.pinata.cloud/p2p/QmSarArpxemsPESa6FNkmuu9iSE1QWqPX2R3Aw6f5jq4D5',
      '/dnsaddr/fra1-1.hostnodes.pinata.cloud/p2p/QmWaik1eJcGHq1ybTWe7sezRfqKNcDRNkeBaLnGwQJz1Cj',
      '/dnsaddr/fra1-2.hostnodes.pinata.cloud/p2p/QmNfpLrQQZr5Ns9FAJKpyzgnDL2GgC6xBug1yUZozKFgu4'
    ]
    ipfsConf.Peering.Peers = [
      { 'Addrs': [ '/dnsaddr/fra1-1.hostnodes.pinata.cloud' ],
        'ID': 'QmWaik1eJcGHq1ybTWe7sezRfqKNcDRNkeBaLnGwQJz1Cj' },
      { 'Addrs': [ '/dnsaddr/fra1-2.hostnodes.pinata.cloud' ],
        'ID': 'QmNfpLrQQZr5Ns9FAJKpyzgnDL2GgC6xBug1yUZozKFgu4' },
      { 'Addrs': [ '/dnsaddr/fra1-3.hostnodes.pinata.cloud' ],
        'ID': 'QmPo1ygpngghu5it8u4Mr3ym6SEU2Wp2wA66Z91Y1S1g29' },
      { 'Addrs': [ '/dnsaddr/nyc1-1.hostnodes.pinata.cloud' ],
        'ID': 'QmRjLSisUCHVpFa5ELVvX3qVPfdxajxWJEHs9kN3EcxAW6' },
      { 'Addrs': [ '/dnsaddr/nyc1-2.hostnodes.pinata.cloud' ],
        'ID': 'QmPySsdmbczdZYBpbi2oq2WMJ8ErbfxtkG8Mo192UHkfGP' },
      { 'Addrs': [ '/dnsaddr/nyc1-3.hostnodes.pinata.cloud' ],
        'ID': 'QmSarArpxemsPESa6FNkmuu9iSE1QWqPX2R3Aw6f5jq4D5' }
    ]
    ipfsConf.Swarm.Transports.Network.QUIC = false
    ipfsConf.Swarm.Transports.Network.WebTransport = false

    Deno.writeFileSync(homeConfPath + '/config', JSON.stringify(ipfsConf, null, 4))
  }

  const ready = new Promise((resolve, _reject) => {
    execIpfsStream({
      cmd: 'daemon --enable-gc=true --migrate=true' + offline,
      repo: homeConfPath,
      getData: data => {
        if (verbose) {
          console.log('  ipfs: ' + data)
        }

        if (data.startsWith('Initializing daemon...')) {
          const [_, ipfs, iRepo, _system, _golang] = data.split('\n').map(line => line.split(': ')[1])
          // TODO: add workerd version
          console.log('  ' + Object.entries({ ipfs, repo: iRepo, atreyu: ayuVersion, ...Deno.version }).map(en => en.join(': ')).join(', '))
        }
        if (data.includes('Daemon is ready')) {
          console.log('  ✅ Started ipfs daemon')
          resolve()
        }
      },
      killFun: proc => { ipfsDaemon = proc }
    })
  })
  return ready
}

let edgeDaemon
async function doStart () {
  if (kill) {
    // TODO handle pid files
    await stopAll()
  }

  // TODO: add gneric timeout for all localhost requests...
  const c = new AbortController()
  const id = setTimeout(() => c.abort(), 1000)
  const res = await fetch('http://localhost:' + port, { signal: c.signal }).catch(error => ({error}))
  clearTimeout(id)

  if (res.ok) {
    console.error('  using existing daemon on port ' + port)
    return 'reused'
  }

  await startIpfsDaemon()

  console.log('  starting local worker runtime on env: ' + yellow(bold(env)))

  if (workerd) {
    // workerd --version

    try {
      Deno.lstatSync(workerdConfPath)
    } catch (_e) {
      // if first start, setup empty workerd conf so it can startup and watch
      await workerdSetup({ appName, workerdConfPath, mainScriptPath: atreyuPath + '/edge/entry-workerd.js', config, atreyuPath, projectPath, workers: {} })
    }

    execStream({
      cmd: [ 'workerd', 'serve', '--verbose', '--experimental',
        ...(devMode ? ['--watch', '--inspector-addr=localhost:9229'] : []),
        workerdConfPath
      ],
      getData: (data, err) => {
        (data || err).split('\n').forEach(line => {
          if (!line) {
            return
          }

          const error = line.split('uncaught exception; source = ')[1] || line.split('failed: ')[1] || line.split('error: ')[1]
          if (error) {
            console.error('  workerd: ❗️ ' + error.trim())
            return
          }

          const warning = line.split('console warning; message = ')[1] || line.split('console warning; description = ')[1]
          if (warning) {
            console.log('  workerd: ⚠️  ' + warning.trim())
            return
          }

          const info = line.split('info: ')[1]
          if (info) {
            console.log('  workerd: ' + info.trim())
            return
          }

          console.error('  workerd: ' + line.trim())
        })
      },
      killFun: proc => { edgeDaemon = proc },
      verbose: true
    })
  } else {
    runDeno({
      addr: ':' + port, // FIXME: localhost requires sudo but 0.0.0.0 works?
      noCheck: true,
      watch: devMode,
      inspect: devMode,
      killFun: proc => { edgeDaemon = proc },
      env: {
        env
      },
      _: [ join(atreyuPath, 'edge', 'entry-deno.js') ]
    })
  }
}

async function stopAll () {
  // NOTICE: deno kill bug prevents this from working rihgt atm
  // await edgeDaemon.kill('SIGKILL')
  // Deno.kill(ipfsDaemon.pid, 'SIGKILL')
  // await Deno.close(ipfsDaemon.rid)

  ipfsDaemon?.pid && await Deno.run({cmd: ['kill', ipfsDaemon.pid]}).status()
  edgeDaemon?.pid && await Deno.run({cmd: ['kill', edgeDaemon.pid]}).status()

  // await edgeDaemon.close()

  ipfsDaemon = null
  edgeDaemon = null
}

if (Deno.version.deno !== denoVersion) {
  console.error(`Your current ayu cli requires deno ${denoVersion} but found ${Deno.version.deno }`)
  if (config.atreyuVersion && ayuVersion !== config.atreyuVersion) {
    console.error(`Also your current project requires atreyu ${config.atreyuVersion} but found ${ayuVersion}, we advice to use the latest ayu version and if necessary update the project and use the deno version required by that setup`)
  }
  Deno.exit(1)
}

// TODO check ipfs: ver, check deno

if (!['update', 'version', 'help', 'info'].includes(cmd) && config.atreyuVersion && ayuVersion !== config.atreyuVersion) {
  console.error(`Your current project requires atreyu ${config.atreyuVersion} but found ${ayuVersion}`)
  Deno.exit(1)
}

async function resetDir (outputTarget, doClean) {
  try {
    if (doClean) {
      console.log('  🐘 recreating:', outputTarget)
      await Deno.remove(outputTarget, { recursive: true })
    }
  } catch (_e) { /* ignore */ }

  try {
    await Deno.mkdir(join(outputTarget), { recursive: true })
  } catch (_e) { /* ignore */ }
}

// TODO: eject
const tasks = {
  version: () => console.log(ayuVersion),

  help: () => printHelp ({ ayuVersion }),

  create: async () => {
    const result = await doStart()

    await get({ name: _[1] })

    if (result !== 'reused') {
      await stopAll()
      Deno.exit()
    }
  },

  dev: async () => {
    const edgeSchema = await loadEdgeSchema({ appFolder })

    let buildRes = []

    async function devBuild ({ batch, clean: doClean } = {}) {
      const newConf = await loadConfig(env, cmd, appName, homeConfPath, buildMeta.buildName, ayuVersion)
      config = newConf?.config || {}
      runConf = newConf?.runConf || {}

      rollBuildMeta()
      console.log('  🚀 Starting Build: "' + buildString() + '"')

      if (!workerd) {
        Deno.writeTextFileSync( join(homeConfPath, `${appKey}.json`), JSON.stringify(config, null, 2))
      }

      let buildEmits = []

      const outputTarget = join(input, '..', 'build')
      await resetDir(outputTarget, doClean)

      const runs = Object.entries(runConf).map(([command, { globs, emits }]) => (async () => {
        const regx = globs.map(glob => globToRegExp(glob))

        const matchArray = arr => arr.find(entr => regx.find(regx => regx.test(entr)))

        if (doClean || matchArray(buildEmits) || matchArray(batch)) {
          console.log(`  ▶️  running ${command}...`)
          await exec(command.split(' '))
          if (emits) {
            buildEmits = buildEmits.concat(emits)
          }
        }
      })())

      await Promise.all(runs)

      buildRes = await Promise.all([
        buildSvelte({
          info,
          input,
          appFolder,
          outputTarget,
          extraAppEntryPoints: newConf?.extraAppEntryPoints,
          buildRes,
          batch,
          clean: doClean,
          output,
          sveltePath
        }),
        buildServiceWorker({
          info,
          batch,
          appFolder,
          buildRes,
          clean: doClean
        }),
        buildEdge({
          workers: edgeSchema,
          workerd,
          buildName: buildMeta.buildName,
          batch,
          clean: doClean,
          buildRes,
          info
        })
      ])

      buildEmits = buildEmits.concat(buildRes.flatMap( res => res ? Object.values(res.files).flatMap(({ newEmits }) => newEmits ) : [] ))

      const { appFolderHash, rootFolderHash, ayuHash } = await addIpfs({
        appFolder,
        repo: homeConfPath,
        clean: doClean,
        pin,
        batch,
        buildEmits,
        verbose,
        env,
        config
      })

      if (workerd) {
        await workerdSetup({
          appName,
          rootFolderHash,
          ayuHash,
          workerdConfPath,
          appFolderHash,
          mainScriptPath: atreyuPath + '/edge/entry-workerd.js',
          config,
          atreyuPath,
          projectPath,
          workers: edgeSchema
        })
      }

      await couchUpdt({
        appFolderHash,
        config,
        version: ayuVersion,
        buildMeta,
        appName,
        verbose,
        env,
        resetAppDb: doClean && resetAppDb,
        force
      })
    }

    if (!noStart) {
      await doStart()
    }

    await devBuild({ clean: true })

    if (!once) {
      // FIXME: move to esbuild watch
      await watch({ watchPath: projectPath, ignore, handler: devBuild })
    } else {
      await stopAll()
      Deno.exit()
    }
  },

  publish: async () => {
    console.log('  🚀 Starting Build for publish: "' + buildString() + '"')
    const edgeSchema = await loadEdgeSchema({ appFolder })

    if (!noStart) {
      await doStart()
    }

    if (!workerd) {
      Deno.writeTextFileSync(join(home, '.atreyu', `${appKey}.json`), JSON.stringify(config, null, 2))
    }

    const outputTarget = join(input, '..', 'build')
    await resetDir(outputTarget, clean)

    const runs = Object.entries(runConf).map(([ command ]) => (async () => { // unused? , { globs }
      console.log(`  ▶️  running ${command}...`)
      await exec(command.split(' '))
    })())
    await Promise.all(runs)

    await Promise.all([
      buildSvelte({
        extraAppEntryPoints,
        input,
        outputTarget,
        appFolder,
        output,
        info,
        clean: true,
        dev: false,
        sveltePath
      }),

      buildServiceWorker({clean: true, appFolder, info}),

      buildEdge({
        workers: edgeSchema,
        buildName: buildMeta.buildName,
        publish: true,
        clean: true,
        info
      })
    ])

    // TODO: warn and exit ipfs publishing on already running offline node
    const { appFolderHash, rootFolderHash, fileList, _ayuFileList, ayuHash } = await addIpfs({
      appFolder,
      repo: homeConfPath,
      pin,
      clean: true,
      env,
      verbose,
      config,
      publish: true
    })

    await cloudflareDeploy({
      domain: config.domain || domain || appName,
      workers: edgeSchema,
      appName,
      env,
      config,
      atreyuPath,
      projectPath,
      appFolderHash,
      rootFolderHash,
      fileList,
      ayuHash,
      resetKvs
    })

    await couchUpdt({
      appFolderHash,
      rootFolderHash,
      ayuHash,
      buildMeta,
      config,
      version: ayuVersion,
      appName,
      resetAppDb,
      force
    })
    await stopAll()
    Deno.exit()
  },

  stop: async () => {
    await stopAll()
    Deno.exit()
  },

  // TODO: kill daemon and ipfs
  // Deno.exit(0)
  update,

  // TODO: show versions and infos for stats, current paths, permissions etc. Deno.exit(0)
  info: () => {},

  start: () => {
    console.log(Deno.version)
    doStart()
  }
}

await (tasks[cmd]?.() || (() => {
  console.log(`${red('unknown sub-command')} ${red(cmd)}\n`)
  printHelp({ ayuVersion })
})())
