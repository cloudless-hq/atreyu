# Atreyu - cutting edge web apps

**attention**: This is early pre-release software. Things will still be missing, break or change without warning.
If you want to try the preview, please consider reaching out with a short description of your usecase to try.ayu@ntr.io, i am happy to give you feedback if the usecase is allready feasible and help you setup.

## Intro
Atreyu is an edge- and serviceworker first metaframework for personal, data heavy web applications. It supports real time data sync, offline usage and values minimal boilerplate with opt in to most features.

Falcor is used for state management, caching, batching and data sharing. Svelte views are bound to a virtual data object with a js proxy based store implementation. The falcor router runs inside a service worker and can serve all open tabs and transparently only forward requests to the edge workers or other sources when it cannot answer itself or needs to refresh data.

## Usecase examples that are a great fit
- Todo Applications
- Messengers/ Chat
- Email clients
- Calendars
- Admin Tools
- Fittness and Health Apps
- Banking and Accounting
- Bookmark and History Managers
- Electron Apps

## Usecase examples that are not a great fit
- Landing Pages
- Web Magazines
- Blogs (though it is a great fit for a standalone post writing application that publishes the posts as static assets)
- Web Shops (though it is a great fit for a standalone product mangagemnt system that publishes to web shops)

With this focus we can exclude a few features of mainstream frameworks that add complexity and have little to negative effect and add features that are usually missing:

## On purpose not in scope
- server side rendering (atreyu apps are open for a long time and the initial load is negligible, but taming complexity and interaction latency is very important)
- Static site generation (atreyu apps are highly dynamic)
- SEO (you would never want your private calendar or email data be indexed publicly)

## Features (all optional)
- routing (schema based with folder based defaults)
- edge function endpoints
- full offline capabilities
- resource sharing between tabs
- local first account-, user- and session management
- preloading and batching
- fullstack reactive data binding without the boilerplate
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

The first time you use atreyu, you need to initialize the atreyu repo, defaulting to  `~/.atreyu`. This is used as for the content adressable asset store and configuration.

```bash
ayu init
```

You can start a standard dev server in the current folder by running `ayu`

For detailed documentation please have a look at https://atreyu.dev

For documentation for working on atreyu itself see [CONTRIBUTING.md](here)
