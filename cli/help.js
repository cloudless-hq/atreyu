import {
  setColorEnabled,
  reset,
  bold,
  blue,
  green,
  yellow,
  italic,
  red,
  gray
} from '../deps-deno.ts'

// TODO:
// long and short format man
// -u --upgrade <version>  Upgrade to latest version. (default: master)
// -c --config <file>      Use specific file as configuration.
// -i --init               Create config file in current working dir.
// version
// info print all versions and stats for debugging etc.
export function printHelp ({ ayuVersion }) {
  console.log(`${green('atreyu cli')} - ${ayuVersion}
atreyu - cutting edge web applications

Usage:
  ${green('ayu')}                           ${gray('-- eg: ayu myapp --watch',)}
    equivalent to ayu svelte && ayu edge && ayu add
    Options:
      --watch
        Watches for changes
      --start
        automatically start the local daemon in the background
      --bg
        start daemon in background and exit

  ${green('ayu')} ${yellow('create')}       ${gray('-- eg: ayu create myTodos')}
    creates a new atreyu project. creates a fresh example project with a simple todo application.
    Options:
      <name>
      name of project folder to use

  ${green('ayu')} ${yellow('publish')}      ${gray('-- eg: ayu publish')}
    Publish the current build to the ipfs pinning service configured.

  ${green('ayu')} ${yellow('start')}        ${gray('-- eg: ayu start --bg')}
    Start ipfs server for development. Defaults to offline mode with no ipfs connections and disabled p2p features.
    Options:
      <path>
      path to ipfs repo to start the daemon for
      Optional, defaults to 'ipfs' in current folder
      --online
      start in with ipfs in onine mode, necesary to pin to remote pinning services for publishing
      --bg
      start in background, you can stop the server with ayu stop later,
      this is helpfull, when you constantly run ayu dev without watch mode
      and want to avoid the ipfs startup and shutdown time

  ${green('ayu')} ${yellow('stop')}

  ${green('ayu')} ${yellow('update')}

  ${green('ayu')} ${yellow('info')}
`)
}

// TODO:
// ${green('ayu')} ${yellow('eject')}        ${gray('-- eg: ayu eject /atreyu --force')}
// Eject the whole of atreyu app or parts of it. Needs to have no uncommited
// changes in git or the --force flag.
// Options
//   <path>
//   what to eject from atreyu. To eject the whole app, use *

// ${green('ayu')} ${yellow('add')}        ${gray('-- eg: ayu add --ignore=*.md,test.js')}
// Pushes a folder to the local ipfs daemon for development and sets it to ipns.
// This also creates a manifest file and a file containing the current hash of the folder.
// IPFS is used in offline mode so it is fast and does not publish the folder to the public.
// Is also used to installs a web application into the local ipfs server.
// Options:
//   -i --input=<path>
//   input folder that is pushed. Atreyu internal files are ignored.
//   --repo=<path>
//   ipfs repo to use for publishing
//   Optional, defaults to 'ipfs' in current folder
//   --ignore=<list of files>
//   additional files to ignore

// ${green('ayu')} ${yellow('svelte')}         ${
//   gray(
//     '-- eg: ayu svelte src/my-svelte-components --output dist',
//   )
//   }
//   Compiles one or more folders of svelte components to js modules.
//   Options:
//     <path/1 path/2>
//     input folder, where svelte component files are located
//     optional, default: 'app/components'
//     -o --output=<path>
//     output folder where compiled svelte components are put
//     optional, default: 'build' folder in the same parent folder as the input folder

// ${green('ayu')} ${yellow('new')}
// create a new atreyu project from the minimal template
// Options:
//   <path>
//   folder where to create the project

// `ayu update
// update deployctl to the given version (defaults to latest).

// To update to latest version:
// ayu update

// To update to specific version:
// ayu update v0.1.0

// USAGE:
//     ayu update [OPTIONS] [<version>]

// OPTIONS:
//     -h, --help        Prints help information

// ARGS:
//     <version>         The version to update to (defaults to @latest)
