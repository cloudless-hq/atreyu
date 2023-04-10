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
  // analyzeDeps
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
import defaultPaths from '../app/src/schema/default-routes.js'
import { exec, execStream } from './helpers.ts'
import { watch } from './watcher.ts'
import versions from './versions.json' assert { type: 'json' }
import { workerdSetup } from './workerd.js'

const { ayuVersion, denoVersion } = versions

// TODO integrate node scripts
// TODO: sourcemaps worker and svelte, use sourcemaps for watch rebuild dependencies
// TODO: load from tag!
// TODO: handle missing deno dir folder and missing deno home env
// TODO: dynamic import for non essential modules
// TODO: install check versions
// TODO: remove docs js cdns dependency

let buildName = ''
let buildColor = ''
let buildTime = Date.now()
let buildNameColoured = ''

let edgeSchema

function rollBuildMeta () {
  buildName = faker.company.bs()
  buildColor = {r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: Math.floor(Math.random() * 255)}
  buildNameColoured = bold(italic(color(buildName, buildColor)))
  buildTime = Date.now()
}
rollBuildMeta()

// TODO: warn or autofix if no service or edge worker to use custom sevlte library eg. --sveltePath=https://cdn.skypack.dev/svelte@v3.35.0

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

const ignore = [
  '**/.git/**',
  '.git/**',
  '**/**.build.css',
  'node_modules/**',
  '**/node_modules/**',
  'yarn.lock',
  '**/*.svelte.js',
  '**/build/**',
  '**/*.svelte.ssr.js',
  '.gitignore',
  '**/.devcontainer/**',
  'README.md',
  '**/*.svelte.css',
  '**/.github/**',
  '**/*.map',
  '**/ipfs-map.json',
  '**/*.bundle.js'
]

let cmd = _[0]

const home = Deno.env.get('HOME')
const homeConfPath = repo || home + '/.atreyu'
const projectPath = Deno.cwd()
const appName = basename(projectPath)
const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '')

if (help) {
  cmd = 'help'
}
if (version) {
  cmd = 'version'
}

if (!cmd) {
  cmd = 'dev'
}

try {
  Deno.lstatSync(homeConfPath)
} catch (_e) {
  Deno.mkdirSync(homeConfPath)
}

// TODO: dont always clean completely?

let { config = {}, runConf = {}, env, extraAppEntryPoints } = await loadConfig(envFlag, cmd, appName, homeConfPath, buildName, ayuVersion)

const appKey = env === 'prod' ? appName : appName + '_' + env
// TODO: allow argument relative path for apps different from cwd

const workerdConfPath = `${homeConfPath}/config_${env}.capnp`

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
  // console.log('starting...')
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

  const devMode = cmd !== 'publish'
  if (workerd) {
    // workerd --version

    try {
      Deno.lstatSync(workerdConfPath)
    } catch (_e) {
      await workerdSetup(workerdConfPath, '/entry-workerd.js', config)
    }

    execStream({
      cmd: [ 'workerd', 'serve', '--verbose', '--experimental',
        `--import-path=${join(atreyuPath, 'edge')}/`,
        ...(devMode ? ['--watch', '--inspector-addr=localhost:9229'] : []),
        workerdConfPath
      ],
      getData: (data, err) => {
        // if (verbose) {
        console.log('  workerd: ' + err || data)
        // }
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

const input = _[1] || `${appFolder}/src`

// TODO: eject
switch (cmd) {
  case 'version':
    console.log(ayuVersion)
    break

  case 'help':
    printHelp ({ ayuVersion })
    break

  case 'create':
    const result = await doStart()

    await get({ name: _[1] })

    if (result !== 'reused') {
      await stopAll()
      Deno.exit()
    }
    break

  case 'dev':
    edgeSchema = await loadEdgeSchema({ appFolder })
    let buildRes = []
    async function devBuild ({ batch, clean: doClean } = {}) {
      const newConf = await loadConfig(env, cmd, appName, homeConfPath, buildName, ayuVersion)
      config = newConf?.config || {}
      runConf = newConf?.runConf || {}

      rollBuildMeta()
      console.log('  🚀 Starting Build: "' + buildNameColoured + '"')

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

        buildEdge({ workers: edgeSchema, workerd, workerdConfPath, config, buildName, batch, clean: doClean, buildRes, info })
      ])

      buildEmits = buildEmits.concat(buildRes.flatMap( res => res ? Object.values(res.files).flatMap(({ newEmits }) => newEmits ) : [] ))

      // console.log(JSON.stringify(buildRes, null, 2))

      const { appFolderHash } = await addIpfs({
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
      await couchUpdt({ appFolderHash, buildColor, config, version: ayuVersion, buildName, buildTime, appName, verbose, env, resetAppDb: doClean && resetAppDb, force })
    }

    if (!noStart) {
      await doStart()
    }

    await devBuild({ clean: true })

    if (!once) {
      await watch({ watchPath: projectPath, ignore, handler: devBuild })
    } else {
      await stopAll()
      Deno.exit()
    }
    // let { deps, errors } = await analyzeDeps('file:///Users/jan/Dev/igp/closr/app/schema/falcor.js')
    // const { deps: newDeps, errors: newErrors } = await analyzeDeps( opts.entrypoint )
    // const depsChanged = new Set([...deps, ...newDeps]).size
    // if (depsChanged) { deps = newDeps }
    break

  case 'publish':
    console.log('  🚀 Starting Build for publish: "' + buildNameColoured + '"')
    edgeSchema = await loadEdgeSchema({ appFolder })

    if (!noStart) {
      await doStart()
    }

    // FIXME: this file is obsolete?
    Deno.writeTextFileSync( join(home, '.atreyu', `${appKey}.json`), JSON.stringify(config, null, 2))

    const outputTarget = join(input, '..', 'build')
    await resetDir(outputTarget, clean)

    // const startTime = Date.now()
    const runs = Object.entries(runConf).map(([command]) => (async () => { // unused? , { globs }
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

      buildServiceWorker({clean: true, appFolder, info})
    ])

    // const duration = (Math.floor(Date.now() / 100 - startTime / 100)) / 10
    // duration && console.log('  ' + duration + 's')
    // console.log('')

    // TODO: warn and exit ipfs publishing on already running offline node
    const { appFolderHash, rootFolderHash, fileList, ayuFileList, ayuHash } = await addIpfs({
      appFolder,
      repo: homeConfPath,
      pin,
      clean: true,
      env,
      verbose,
      config,
      publish: true
    })

    console.log({fileList, ayuFileList})

    await buildEdge({ workers: edgeSchema, buildName, publish: true, clean: true, info })

    await cloudflareDeploy({ domain: config.domain || domain || appName, workers: edgeSchema, appName, env, config, atreyuPath, projectPath, appFolderHash, rootFolderHash, fileList, ayuHash, resetKvs})

    await couchUpdt({ appFolderHash, rootFolderHash, ayuHash, buildColor, config, version: ayuVersion, buildName, buildTime, appName, env, resetAppDb, force })
    await stopAll()
    Deno.exit()
    break

  case 'stop':
    await stopAll()
    Deno.exit()
    break

  case 'update':
    // TODO: kill daemon and ipfs
    // Deno.exit(0)
    await update()
    break

  case 'info':
    // TODO: show versions and infos for stats, current paths, permissions etc. Deno.exit(0)
    break

  case 'start':
    console.log(Deno.version)
    doStart()
    break

  default:
    console.log(`${red('unknown sub-command')} ${red(cmd)}\n`)

    printHelp({ ayuVersion })
}
