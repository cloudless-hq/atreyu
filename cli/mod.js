import {
  parse,
  join,
  faker,
  basename,
  runDeno,
  italic,
  bold,
  color,
  red
  // analyzeDeps
} from '../deps-deno.js'

import { printHelp } from './help.js'
import { loadConfig } from './config.js'
import buildSvelte from './build-svelte.ts'
import buildServiceWorker from './build-service-worker.js'
import { buildEdge, buildWorkerConfig } from './build-edge.ts'
import { execIpfs, execIpfsStream, add as addIpfs } from './ipfs.js'
import { cloudflareDeploy } from './cloudflare.js'
import { couchUpdt } from './couch.js'
import { toFalcorPaths, toWindowPaths } from '../app/src/schema/helpers.js'
import defaultPaths from '../app/src/schema/default-routes.js'
import { exec } from './exec.js'
import { watch } from './watcher.ts'
import { globToRegExp } from '../deps-deno.js'

// TODO integrate node scripts
// TODO: sourcemaps worker and svelte, use sourcemaps for watch rebuild dependencies
export const version = '0.3.4'
// const denoVersion = '1.14.2'
let buildName = ''
let buildColor = ''
let buildTime = Date.now()
let buildNameColoured = ''

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
  name,
  env,
  start,
  repo,
  sveltePath
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

if (!cmd) {
  cmd = 'dev'
  start = true
}

let {config = {}, runConf = {}} = await loadConfig(env)

// TODO: allow argument relative path for apps different from cwd

// TODO: unify with other schema loader which allows also schema.js
async function loadEdgeSchema () {
  // TODO: support implicit endpoints folder routs
  let schema
  try {
    schema = (await import(projectPath + '/app/schema/index.js')).schema
    if (typeof schema === 'function') {
      schema = schema({ defaultPaths, toFalcorPaths, toWindowPaths })
    }
  } catch (e) {
    console.log('  no schema found, fallback to basic ipfs setup')
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
        console.log('ipfs: ' + data) // TODO: indent/ standard logging formatting library...

        if (data.includes('Daemon is ready')) {
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
    addr: ':80',
    noCheck: true,
    watch: true,
    inspect: true,
    _: [ join(atreyuPath, 'edge', 'entry-deno.js') ]
  })
}

if (config.atreyuVersion && version !== config.atreyuVersion) {
  console.error('please update atreyu to version ' + config.atreyuVersion)
  Deno.exit()
}

// TODO: eject, create, check deno and ayu version updates/ compat.
switch (cmd) {
  case 'version':
    console.log(version)
    break
  case 'help':
    printHelp ({ version })
    break
  case 'init':
    console.log(await execIpfs('init', _[1] || homeConfPath))
    break

  case 'dev':
    let buildRes = []
    async function devBuild ({ batch, clean } = {}) {
      const newConf = await loadConfig(env)
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
        })
      ])

      let buildEmits = buildRes.flatMap( ({ files }) => Object.values(files).flatMap(({ newEmits }) => newEmits ) )

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

      const folderHash = await addIpfs({
        input: _[1],
        repo: repo || homeConfPath,
        clean,
        batch,
        buildEmits,
        name,
        env,
        config
      })
      await couchUpdt({ folderHash, buildColor, config, name, version, buildName, buildTime, appName, env })
    }

    if (start) {
      await doStart()
    }

    await devBuild({ clean: true })

    if (!once) {
      await watch({ watchPath: './', ignore, handler: devBuild })
    } else {
      Deno.exit(1)
    }

    // let { deps, errors } = await analyzeDeps('file:///Users/jan/Dev/igp/convoi.cx/app/schema/falcor.js')
    // const { deps: newDeps, errors: newErrors } = await analyzeDeps( opts.entrypoint )
    // const depsChanged = new Set([...deps, ...newDeps]).size
    // if (depsChanged) { deps = newDeps }
    break

  case 'publish':
    console.log('  🚀 Starting Build for publish: "' + buildNameColoured + '"')
    const edgeSchema = await loadEdgeSchema()

    // todo skip on allready running ask if autorestart in online mode
    // await startDaemon({ publish: true })

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

    const runs = Object.entries(runConf).map(([command, { globs }]) => (async () => {
      console.log(`  ▶️  running ${command}...`)
      await exec(command.split(' '))
    })())
    await Promise.all(runs)

    // TODO: warn and skip ipfs publishing on allready running offline node
    const pubFolderHash = await addIpfs({
      input: _[1],
      repo: repo || homeConfPath,
      name,
      clean: true,
      env,
      config,
      publish: true
    })

    await buildEdge(edgeSchema, buildName)

    await cloudflareDeploy({workers: edgeSchema, appName, env, config, atreyuPath, projectPath})

    await couchUpdt({folderHash: pubFolderHash, buildColor, config, name, version, buildName, buildTime, appName, env})
    Deno.exit(1)

  case 'start':
    console.log(Deno.version)
    doStart()
    break

  default:
    console.log(`${red('unknown sub-command')} ${red(cmd)}\n`)

    printHelp({ version })
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
