# Atreyu - cutting edge web apps

**attention**: This is pre-release software. Things will break or change without warning.

Atreyu is an edge- and serviceworker first metaframework for personal, data heavy web applications. It supports real time data sync, offline usage and values minimal boilerplate with opt in to most features.

Falcor is used for state management, caching, batching and data sharing. Svelte views are bound to a virtual data object with a js proxy based store implementation. The falcor router runs inside a service worker and can serve all open tabs and transparently only forward requests to the edge workers or other sources when it cannot answer itself or needs to refresh data.

Examples of applications that are a great fit:
- Todo Applications
- Messengers/ Chat
- Calendars
- Admin Tools
- Fittness and Health Apps
- Banking and Accounting
- Bookmark and History Managers
- Electron Apps

Examples of what is not a great fit:
- Landing Pages
- Web Magazines
- Blogs (though it is a great fit for a standalone post writing application that publishes the posts as static assets)
- Web Shops (though it is a great fit for a standalone product mangagemnt system that publishes to web shops)

With this focus we can exclude a few features of mainstream frameworks that add complexity and have little to negative effect and add features that are usually missing:

On purpose not in scope:
- server side rendering
- Static site generation
- SEO

Features (all optional):
- routing (schema based with folder based defaults)
- edge function endpoints
- full offline capabilities
- resource sharing between tabs
- local first account-, user- and session management
- preloading and batching
- integrated persistence, caching, sync and databinding with live updates
- app-like explicit update system


## Stack
- svelte
- windicss
- ipfs as a local asset server and content adressable storage system, ipfs is not required for production sites and is not required to run in a p2p mode
- esbuild
- deno for cli and local development / cloudflare workers for production (workerd for local and selfhosting coming soon)
- netflix falcor
- pouchdb / couchdb

## Installation as user
Dependencies needed:
- [Deno](https://deno.land/)
- [IPFS Cli](https://ipfs.io/). Installation instructions are [here](https://docs.ipfs.io/install/command-line/).

Then install with:

```bash
deno run https://atreyu.dev/ayu@latest/cli/install.js
```

You will see 3 prompts, 2 to check DENO_HOME and HOME environmnet variables, to determine where to install and the final write access to install the cli.

After that you will have the ayu command available. just run `ayu --help` for an overview of the options.

The first time you use atreyu, you need to initialize the atreyu store in your home directory

```bash
ayu init
```

You can start a standard dev server in the current folder by running `ayu`

For detailed documentation please have a look at https://atreyu.dev

## Contributing
For working on atreyu itself.

#### 1. Install dependencies.

You need to have the following installed on your system:

- [Node.js](https://nodejs.org/) (>=16). We recommend using a version manager like [nvm](https://github.com/nvm-sh/nvm) (will be replaced with the deno node compatibility layer as soon as feasible)
- [Yarn](https://yarnpkg.com/) (>=1.22.10).
- [Deno](https://deno.land/) (1.14.2)
- [IPFS Cli](https://ipfs.io/). Installation instructions are [here](https://docs.ipfs.io/install/command-line/).


#### 2. Configure [Deno scripts](https://deno.land/manual/tools/script_installer) to be available on your PATH.

You can achieve that by adding `export PATH="$HOME/.deno/bin:$PATH"` to your rc file.


## All following steps executed in root of this checked out repo:


#### 3. Install nodejs dependencies and build the nodejs dependency bundles for the project.

```bash
yarn install
yarn build
```

#### 4. Install `ayu` CLI.

This step installs the atreyu cli "ayu" on your system, which is  a standard [Deno script](https://deno.land/manual/tools/script_installer).
Deno is a proper sandbox unlike nodejs, so its best to always add permissions explicitly, however you can also omit most these settings and use --allow-all.
please keep in mind that the ESBUILD_BINARY_PATH (the one that includes esbuild-darwin-arm6) permission is currently hard coded, so you need to run this once with prompt and check your actual binary location and architecture.

Run (if you also want to use a standard release use -n ayudev to have both clis available):

```bash
deno install --allow-hrtime --allow-read --allow-env=DENO_DIR,HOME,ESBUILD_BINARY_PATH --allow-net=127.0.0.1:5001,api.cloudflare.com,api.pinata.cloud,registry.npmjs.org --allow-write="$TMPDIR","$HOME"/.atreyu,./,"$DENO_DIR" --allow-run=ipfs,npx,`which deno`,yarn --no-check --prompt --unstable -n ayu -f ./cli/mod.js


after initial exacution add the allow run path for the esbuild binary for example "$HOME"/Library/Caches/esbuild/bin/esbuild-darwin-arm64@0.13.3
```

Permission Prompts are not enabled automatically by `deno install` because of a current deno install bug, you need to add the `--prompt` parameter to beginning of the script manually...

eg. to edit the deno sccript in vscode:
```bash
code `which ayu`
```

add --promt:
```diff
#!/bin/sh
# generated by deno install
-exec deno run --allow-read <...lots of other things...>
+exec deno run --prompt --allow-read <...lots of other things...>
```

If everything is green, you should have `ayu` available on your terminal.

```bash
which ayu # prints the path for the binary
cat `which ayu` # is helpful to check the currently installed parameters
ayu info # prints the help text
```

#### 5. Initialize the atreyu repo including the ipfs repo and configuration setup in your home folder:

Initializes atreyu dev configuration and an IPFS repo for all assets at `~/.atreyu`.

```bash
ayu init
```


#### 6. Start atreyu local development build watcher and the dev daemon, that runs and serves the local dev setup.

```bash
ayu
```

The dev daemon can be killed after the success message when not working on atreyu internals.

TODO: setup node compat publishing https://deno.com/blog/dnt-oak