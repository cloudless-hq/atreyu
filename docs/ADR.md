# Core Values

  - maximal similarity between live production and local dev environment (eg no special difference between complex hot module replacement with websockets and completely different live updating system)
  - completely type and schemaless prototyping with gradual optional migration to typing and schemas where it makes sense in production
  - minimal amount of code possible to achieve desired results without being "magic" in the rails sense
  - offline capable wherever possible / minimal latency
  - nodejs, common js and npm modules are legacy and are becoming obsolete. we have a bit more thinking and fiddling now, but this is how everything will work in the future, all problems are more or less caused by bad architected npm modules or things that are not quite migrated yet, but this will be much better in a few weeks already, completely natural in a few months to a year. In the meantime running everything through nodejs rollup will make things much simpler...
  - one of the architectures core values is that everything is the same in production and development, even if that makes it slightly more complicated or requires a bit more thinking. this is by design and not a workaround or hack.  for example in vite everything is 100% different for dev and prod and each environment is completely optimized for that usecase, the downside is you never see production bugs (or any code that looks like what will be in production for that matter) in dev before and you cannot be annyoed in development if you see performance problems or other issues that you are forced to understand and get rid of before they ever even reach a test deoployment.  also its much harder to debug or understand production if you don't work in everyday life with the same setup.   we will get rid of all the bugs for sure, but if its still not smooth enough for  some reason for simple frontend tasks, we can have a vite component library, and then only do the data connections and the integration work in the main application repo.

# IPFS

# deno

# cloudflare worker

# falcor

# cloudant/couchdb/pouchdb

# svelte

# Service workers

# Cors proxy

# not wrangler / not terraform
  - support for token based configuration on cloudflare
  - supoort for auto creation of subdomains
  - support for cloudflare access
  - support for real offline local dev system (wrangler uses tunnel to cloudflare for emulating local development)
  - automatic dns and cloudflare access integration