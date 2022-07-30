import {
  parse,
  join,
  faker,
  basename,
  italic,
  bold,
  color,
  red
  // analyzeDeps
} from '../deps-deno.ts'

import { runDeno } from '../runtime/mod.ts'
import { update } from './update.ts'
import { printHelp } from './help.js'
import { loadConfig } from './config.js'
import buildSvelte from './svelte.ts'
import buildServiceWorker from './service-worker.js'
import { buildEdge, buildWorkerConfig } from './edge.ts'
import { execIpfs, execIpfsStream, add as addIpfs } from './ipfs.js'
import { cloudflareDeploy } from './cloudflare.js'
import { couchUpdt } from './couch.js'
import { addPathTags } from '../app/src/schema/helpers.js'
import defaultPaths from '../app/src/schema/default-routes.js'
import { exec } from './helpers.ts'
import { watch } from './watcher.ts'
import { globToRegExp } from '../deps-deno.ts'
import versions from './versions.json' assert { type: 'json' }
const { ayuVersion, denoVersion } = versions

// TODO integrate node scripts
// TODO: sourcemaps worker and svelte, use sourcemaps for watch rebuild dependencies
// TODO: load from tag!

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

let {
  _,
  output,
  online,
  help,
  once,
  version,
  name,
  env,
  port = '80',
  start,
  repo,
  domain,
  sveltePath,
  // customAyuRelease,
  verbose
} = parse(Deno.args)

const ignore = [
  '**/.git/**',
  '**/**.build.css',
  'node_modules/**',
  'yarn.lock',
  '**/*.svelte.js',
  '**/build/**',
  '**/*.svelte.ssr.js',
  '.gitignore',
  'README.md',
  '**/*.svelte.css',
  '.github/**',
  '**/*.map',
  '**/ipfs-map.json',
  '**/*.bundle.js'
]

let cmd = _[0]

const home = Deno.env.get('HOME')
const homeConfPath = home + '/.atreyu'
const projectPath = Deno.cwd()
const appName = basename(projectPath)
const atreyuPath = join(Deno.mainModule, '..', '..').replace('file:', '')
// alternative: (import.meta.url.replace('file://', ''), '..', '..')

// TODO: handle servers from schema for env
if (!env) {
  if (cmd === 'publish') {
    env = 'prod'
  } else {
    env = 'dev'
  }
}

if (help) {
  cmd = 'help'
}
if (version) {
  cmd = 'version'
}

if (!cmd) {
  cmd = 'dev'
  start = true
}

let { config = {}, runConf = {} } = await loadConfig(env, appName, repo || homeConfPath)

// TODO: allow argument relative path for apps different from cwd

// TODO: unify with other schema loader which allows also schema.js
async function loadEdgeSchema () {
  // TODO: support implicit endpoints folder routs
  let schema
  try {
    schema = (await Promise.any([
      import('file:' + projectPath + `/app/schema/index.js`),
      import('file:' + projectPath + `/app/schema.js`)
    ])).schema
    if (typeof schema === 'function') {
      schema = schema({ defaultPaths, addPathTags })
    }
  } catch (e) {
    console.log('  no schema found, fallback to basic ipfs setup', e)
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

function startDaemon ({ publish }) {
  const runPath = _[1] || homeConfPath
  const offline = (online || publish) ? '' : ' --offline'
  const ready = new Promise((resolve, _reject) => {
    execIpfsStream(
      'daemon --enable-gc=true --migrate=true' + offline,
      runPath,
      data => {
        if (verbose) {
          console.log('  ipfs: ' + data)
        }

        if (data.startsWith('Initializing daemon...')) {
          const [_, ipfs, repo, _system, _golang] = data.split('\n').map(line => line.split(': ')[1])
          console.log('  ' + Object.entries({ ipfs, repo, atreyu: ayuVersion, ...Deno.version }).map(en => en.join(': ')).join(', '))
        }
        if (data.includes('Daemon is ready')) {
          console.log('  ✅ Started ipfs daemon')
          resolve()
        }
      }
    )
  })
  return ready
}

async function doStart () {
  await startDaemon({})

  runDeno({
    addr: ':' + port,
    noCheck: true,
    watch: true,
    inspect: true,
    _: [ join(atreyuPath, 'edge', 'entry-deno.js') ]
  })
}

if (Deno.version.deno !== denoVersion) {
  console.error(`Your current ayu cli requires deno ${denoVersion} but found ${Deno.version.deno }`)
  if (config.atreyuVersion && ayuVersion !== config.atreyuVersion) {
    console.error(`Also your current project requires atreyu ${config.atreyuVersion} but found ${ayuVersion}, we advice to use the latest ayu version and if necessary update the project and use the deno version required by that setup`)
  }
  Deno.exit(1)
}

// TODO check ipfs: ver

if (config.atreyuVersion && ayuVersion !== config.atreyuVersion) {
  console.error(`Your current project requires atreyu ${config.atreyuVersion} but found ${ayuVersion}`)
  Deno.exit(-1)
}

// TODO: eject, create, check deno and ayu version updates/ compat.
switch (cmd) {
  case 'version':
    console.log(ayuVersion)
    break
  case 'help':
    printHelp ({ ayuVersion })
    break
  case 'init':
    console.log(await execIpfs('init', _[1] || homeConfPath))
    break

  case 'dev':
    edgeSchema = await loadEdgeSchema()

    let buildRes = []
    async function devBuild ({ batch, clean } = {}) {
      const newConf = await loadConfig(env, appName, repo || homeConfPath)
      config = newConf?.config || {}
      runConf = newConf?.runConf || {}

      rollBuildMeta()
      console.log('  🚀 Starting Build: "' + buildNameColoured + '"')

      // todo: fix import path in local worker wrapper?
      await Deno.writeTextFile( join(homeConfPath, `${appName + '_' + env}.json`), JSON.stringify(config, null, 2))

      buildRes = await Promise.all([
        buildSvelte({
          input: _[1],
          buildRes,
          batch,
          clean,
          output,
          sveltePath
        }),

        buildServiceWorker({
          batch,
          buildRes,
          clean
        }),

        buildEdge({ workers: edgeSchema, buildName, batch, clean, buildRes })
      ])

      let buildEmits = buildRes.flatMap( res => res ? Object.values(res.files).flatMap(({ newEmits }) => newEmits ) : [] )

      const runs = Object.entries(runConf).map(([command, { globs, emits }]) => (async () => {
        const regx = globs.map(glob => globToRegExp(glob))

        const matchArray = arr => arr.find(entr => regx.find(regx => regx.test(entr)))

        if (clean || matchArray(buildEmits) || matchArray(batch)) {
          console.log(`  ▶️  running ${command}...`)
          await exec(command.split(' '))
          if (emits) {
            buildEmits = buildEmits.concat(emits)
          }
        }
      })())

      await Promise.all(runs)

      const { appFolderHash } = await addIpfs({
        input: _[1],
        repo: repo || homeConfPath,
        clean,
        batch,
        buildEmits,
        name,
        env,
        config
      })
      await couchUpdt({ appFolderHash, buildColor, config, name, version: ayuVersion, buildName, buildTime, appName, env })
    }

    if (start) {
      await doStart()
    }

    await devBuild({ clean: true })

    if (!once) {
      await watch({ watchPath: projectPath, ignore, handler: devBuild })
    } else {
      Deno.exit(0)
    }

    // let { deps, errors } = await analyzeDeps('file:///Users/jan/Dev/igp/closr/app/schema/falcor.js')
    // const { deps: newDeps, errors: newErrors } = await analyzeDeps( opts.entrypoint )
    // const depsChanged = new Set([...deps, ...newDeps]).size
    // if (depsChanged) { deps = newDeps }
    break

  case 'publish':
    console.log('  🚀 Starting Build for publish: "' + buildNameColoured + '"')
    edgeSchema = await loadEdgeSchema()

    if (start) {
      await doStart()
    }

    Deno.writeTextFileSync( join(home, '.atreyu', `${appName + '_' + env}.json`), JSON.stringify(config, null, 2))

    await Promise.all([
      buildSvelte({
        input: _[1],
        output,
        clean: true,
        dev: false,
        sveltePath
      }),

      buildServiceWorker({clean: true})
    ])

    const runs = Object.entries(runConf).map(([command]) => (async () => { // unused? , { globs }
      console.log(`  ▶️  running ${command}...`)
      await exec(command.split(' '))
    })())
    await Promise.all(runs)

    // TODO: warn and skip ipfs publishing on allready running offline node
    const { appFolderHash, rootFolderHash } = await addIpfs({
      input: _[1],
      repo: repo || homeConfPath,
      name,
      clean: true,
      env,
      config,
      publish: true
    })

    await buildEdge({ workers: edgeSchema, buildName, publish: true, clean: true })

    await cloudflareDeploy({ domain: config.domain || domain || appName, workers: edgeSchema, appName, env, config, atreyuPath, projectPath, appFolderHash, rootFolderHash})

    await couchUpdt({ appFolderHash, rootFolderHash, buildColor, config, name, version: ayuVersion, buildName, buildTime, appName, env})
    Deno.exit(0)

  case 'stop':
    // TODO: kill daemon and ipfs
    Deno.exit(0)

  case 'update':
    // TODO: kill daemon and ipfs
    // Deno.exit(0)
    await update()
    break

  case 'info':
    // Deno.exit(0)
    break

  case 'start':
    console.log(Deno.version)
    doStart()
    break

  default:
    console.log(`${red('unknown sub-command')} ${red(cmd)}\n`)

    printHelp({ ayuVersion })
}

// case 'build':
//   console.log('  🚀 Starting Build: "' + buildNameColoured + '"')
//   // build:svelte build:edge build:service-worker
//   break
// case 'build:edge':
//   console.log('  🚀 Starting Build: "' + buildNameColoured + '"')
//   await buildEdge(await loadEdgeSchema(), buildName)
//   break
// case 'build:svelte':
//   console.log('  🚀 Starting Build: "' + buildNameColoured + '"')
//   buildSvelte({
//     input: _[1],
//     output,
//     sveltePath
//   })
//   break
// case 'add':
//   addIpfs({
//     input: _[1],
//     repo: repo || homeConfPath,
//     name,
//     env,
//     config
//   })
//   break
