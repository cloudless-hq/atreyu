# Atreyu

## Web Apps vs Transitional Web Apps vs Web Pages

zoom in on app side of the spectrum from rich harris. web apps for us much more strict:
- electron apps
- offline apps
- personal data apps
  - email clients
  - messaging/chat clients
  - todo apps
  - notes
  - banking apps
  - calender apps
  - editors
  - Dapps without backends
  - chrome apps
- in between: public data centric apps where SSR makes no sense
- no SSR, no HMR, dev = prod philosophy
- no node if avoidable, node = legacy
- edge first, cloudflare/deno deploy

## devcontainer

## content adressable storage without expiration

- ipfs / manifest map + purging cleaning
- service worker/ edge worker
- couchdb/pouchdb + client side / server side indexes (optional client side request cache) + purging cleaning

## Routing / schema

- window, serviceworker, data, edge

## atreyu data store: proxy + falcor

- falcor: simple schemaless graphql with focus on js objects
- batching
- caching (expiration, invalidation, optimistic updating)
- resolvers clientside with delegation to server side