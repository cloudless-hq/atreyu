import {
  parse,
  join,
  faker,
  basename,
  runDeno,
  yellow,
  italic,
  bold,
  color,
  background,
  red,
  // analyzeDeps,
  globToRegExp
} from '../deps-deno.js'

import { printHelp } from './help.js'
import { loadConfig } from './config.js'
import buildSvelte from './build-svelte.js'
import buildServiceWorker from './build-service-worker.js'
import { buildEdge, buildWorkerConfig } from './build-edge.js'
import { execIpfs, execIpfsStream, add as addIpfs } from './ipfs.js'
import { cloudflareDeploy } from './cloudflare.js'
import { couchUpdt } from './couch.js'
import { toFalcorPaths, toWindowPaths } from '../app/src/schema/helpers.js'
import defaultPaths from '../app/src/schema/default-routes.js'

// TODO integrate node scripts
// TODO: sourcemaps worker and svelte, use sourcemaps for watch rebuild dependencies
export const version = 'v0.1.6-dev'
let buildName = ''
let buildColor = ''
// color("foo", {r: 255, g: 0, b: 255})
// background(str: string, color: number | Rgb)
let buildNameColoured = ''

function rollBuildMeta () {
  buildName = faker.company.bs()
  buildColor = {r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: Math.floor(Math.random() * 255)}
  buildNameColoured = bold(italic(color(buildName, buildColor)))
}
rollBuildMeta()


const buildTime = Date.now()

// TODO: warn or autofix if no service or edge worker to use custom sevlte library eg. --sveltePath=https://cdn.skypack.dev/svelte@v3.35.0

let {
  _,
  output,
  online,
  help,
  name,
  env,
  repo,
  bg,
  sveltePath
} = parse(Deno.args)

const watchIgnore = ([
  '/.git/**',
  'node_modules/**',
  'yarn.lock',
  '**/*.svelte.js',
  '.gitignore',
  'README.md',
  '**/*.svelte.css',
  '.github/**',
  '**/*.map',
  '**/ipfs-map.json',
  '**/*.bundle.js'
]).map(glob => globToRegExp(glob))

let cmd = _[0]
const home = Deno.env.get('HOME')

// TODO: handle servers from schema for env
if (!env) {
  if (cmd === 'publish') {
    env = 'prod'
  } else {
    env = 'dev'
  }
}

if (!cmd || help) {
  cmd = 'help'
}

let config = await loadConfig(env)

// TODO: allow argument relative path for apps different from cwd
const appName = basename(Deno.cwd())

// TODO: unify with other schema loader which allows also schema.js
async function loadEdgeSchema () {
  // TODO: support implicit endpoints folder routs
  let schema
  try {
    schema = (await import(Deno.cwd() + '/app/schema/index.js')).schema
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

async function startDaemon ({ publish }) {
  const runPath = _[1] || home + '/.atreyu'
  const offline = (online || publish) ? '' : ' --offline'
  const ready = new Promise((resolve, reject) => {
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

// TODO: eject, create, check deno and ayu version updates/ compat.
switch (cmd) {
  case 'version':
    console.log(version)
  break

  case 'help':
    printHelp ({ version })
  break

  case 'dev':
    let locked = false
    let rerun = false
    async function devBuild () {
      if (locked) {
        rerun = true
        return
      }
      config = await loadConfig(env)
      console.log('here', config)

      // TODO: if daemon not running: await startDaemon({ifNotExists: true})
      rollBuildMeta()
      console.log('  🚀 Starting Build: "' + buildNameColoured + '"')

      locked = true
      // todo: fix import path in local worker wrapper?
      await Deno.writeTextFile( join(home, '.atreyu', `${appName + '_' + env}.json`), JSON.stringify(config, null, 2))
      const watchConf = await Promise.all([
        buildSvelte({
          input: _[1],
          output,
          sveltePath
        }),

        buildServiceWorker()
      ])
      // console.log(watchConf)
      const folderHash = await addIpfs({
        input: _[1],
        repo: repo || home + '/.atreyu',
        name,
        env,
        config
      })
      await couchUpdt({folderHash, buildColor, config, name, version, buildName, buildTime, appName, env})

      setTimeout(() => {
        locked = false
        if (rerun) {
          rerun = false
          devBuild()
        }
      }, 500)
    }

    await devBuild()

    let debouncer = null
    // let { deps, errors } = await analyzeDeps('file:///Users/jan/Dev/igp/convoi.cx/app/schema/falcor.js')
    const watcher = Deno.watchFs('./', { recursive: true }) //deps

    const changes = new Set()
    function handleChanges () {
      const batch = [...changes]
      changes.clear()
      console.clear()
      console.info('changed', batch)
      devBuild(batch)
    }

    let timer
    for await (const event of watcher) {
      const paths = event.paths.map(change => change.replace(Deno.cwd(), '')).filter(path => {
        return !watchIgnore.find(regx => regx.test(path))
      })

      if (paths.length > 0) {
        paths.forEach(path => changes.add(path))
        if (timer) {
          clearTimeout(timer)
        }

        timer = setTimeout(() => {
          timer = null
          handleChanges()
        }, 20)
      }

      // const { deps: newDeps, errors: newErrors } = await analyzeDeps( opts.entrypoint )
      // const depsChanged = new Set([...deps, ...newDeps]).size
      // if (depsChanged) { deps = newDeps }
    }
  break

  case 'build':
    console.log('  🚀 Starting Build: "' + buildNameColoured + '"')
    // build:svelte build:edge build:service-worker
  break

  case 'build:edge':
    console.log('  🚀 Starting Build: "' + buildNameColoured + '"')
    await buildEdge(await loadEdgeSchema(), buildName)
  break

  case 'build:svelte':
    console.log('  🚀 Starting Build: "' + buildNameColoured + '"')
    buildSvelte({
      input: _[1],
      output,
      sveltePath
    })
  break

  case 'init':
    console.log(await execIpfs('init', _[1] || home + '/.atreyu'))
  break

  case 'add':
    addIpfs({
      input: _[1],
      repo: repo || home + '/.atreyu',
      name,
      env,
      config
    })
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
        dev: false,
        sveltePath
      }),

      buildServiceWorker()
    ])

    // TODO: warn and skip ipfs publishing on allready running offline node
    const pubFolderHash = await addIpfs({
      input: _[1],
      repo: repo || home + '/.atreyu',
      name,
      env,
      config,
      publish: true
    })

    await buildEdge(edgeSchema, buildName)

    cloudflareDeploy({workers: edgeSchema, appName, env, config})

    couchUpdt({folderHash: pubFolderHash, buildColor, config, name, version, buildName, buildTime, appName, env})
  break

  case 'start':
    console.log(Deno.version)
    await startDaemon({})

    // make env file
    // console.log(config)

    runDeno({
      addr: ':80',
      noCheck: true,
      watch: true,
      inspect: true,
      // env: home + '/.atreyu/dev.env',
      _: [ join(import.meta.url.replace('file://', ''), '..', '..', '/edge/entry-deno.js') ]
    })
  break

  default:
    console.log(`${red('unknown sub-command')} ${red(cmd)}\n`)

    printHelp({ version })
}
