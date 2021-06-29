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
} from './deps-deno.js'


  // TODO:
  // long and short format man
  // -u --upgrade <version>  Upgrade to latest version. (default: master)
  // -c --config <file>      Use specific file as configuration.
  // -i --init               Create config file in current working dir.
  // version
  // info print all versions and stats for debugging etc.
export function printHelp ({ version }) {
    console.log(`${green('atreyu cli')} - ${version}
atreyu - cutting edge web applications

Usage:
  ${green('ayu')} ${yellow('init')}
    initialize atreyu. This creates a fresh 'offline' ipfs repo
    for storing and locally serving all static and compiled files.
    It is safe to delete the ipfs folder at any time if it gets too big.
    Options:
      <path>
      ipfs repo to use
      optional, defaults to 'ipfs' folder in current path

  ${green('ayu')} ${yellow('new')}
    create a new atreyu project from the minimal template
    Options:
      <path>
      folder where to create the project


  ${green('ayu')} ${yellow('dev')}         ${
    gray(
        '-- eg: ayu dev myapp --watch',
    )
    }
    equivalent to ayu svelte && ayu edge && ayu add
    Options:
    --watch
      Watches for changes
    --bg
      start daemon in background

  ${green('ayu')} ${yellow('svelte')}         ${
    gray(
      '-- eg: ayu svelte src/my-svelte-components --output dist',
    )
    }
    Compiles one or more folders of svelte components to js modules.
    Options:
      <path/1 path/2>
      input folder, where svelte component files are located
      optional, default: 'app/components'
      -o --output=<path>
      output folder where compiled svelte components are put
      optional, default: 'build' folder in the same parent folder as the input folder

  ${green('ayu')} ${yellow('add')}        ${gray('-- eg: ayu add --ignore=*.md,test.js')}
    Pushes a folder to the local ipfs daemon for development and sets it to ipns.
    This also creates a manifest file and a file containing the current hash of the folder.
    IPFS is used in offline mode so it is fast and does not publish the folder to the public.
    Is also used to installs a web application into the local ipfs server.
    Options:
      -i --input=<path>
      input folder that is pushed. Atreyu internal files are ignored.
      --repo=<path>
      ipfs repo to use for publishing
      Optional, defaults to 'ipfs' in current folder
      --ignore=<list of files>
      additional files to ignore

  ${green('ayu')} ${yellow('publish')}        ${gray('-- eg: ayu publish')}
    Publish the current build to the ipfs pinning service configured.

  ${green('ayu')} ${yellow('start')}        ${gray('-- eg: ayu start --bg')}
    Start offline ipfs server for development.
    Options:
      <path>
      path to ipfs repo to start the daemon for
      Optional, defaults to 'ipfs' in current folder
      --bg
      start in background, you can stop the server with ayu stop later,
      this is helpfull, when you constantly run ayu dev without watch mode
      and want to avoid the ipfs startup and shutdown time

  ${green('ayu')} ${yellow('eject')}        ${gray('-- eg: ayu eject /atreyu --force')}
    Eject the whole of atreyu app or parts of it. Needs to have no uncommited
    changes in git or the --force flag.
    Options
      <path>
      what to eject from atreyu. To eject the whole app, use *
`)
}
