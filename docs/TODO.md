- https://eslint.org/docs/developer-guide/shareable-configs
- compiler recover on random state
- use first time tw class in watch
- new svlte file ipfs crash
- compile direct to ipfs
- fs based base router
- feed/ updater without db or serviceworker
- standard paths for edge functions without schema config
- cloudflare r3 object store instead of pinata pinning mode
- relay like fragments instead preloading?
- graphql like subscriptions
- sourcemap and css import windi
- conflict resolver functions
- client / server validation functions
- generic conflict view for db and doc (on app or admin level?)
- make default environment global config in repo
- ipfs file progress

// evaluate new router and schema combination?
// const schema = {
//   rows: {
//     length: {
//       get: async () => {
//         const allDocs = await store.getAll()
//         return allDocs.length
//       }
//     },
//     '[{ranges}]': {
//       get: async () => {
//         const allDocs = await store.getAll()
//         return {
//           jsonGraph: {
//             rows: Object.keys(allDocs).map(id => ({ $ref: [ 'docs', id ] }))
//           }
//         }
//       }
//     }
//   },
//   docs: {
//     '[{keys:ids}]': {
//       get: async ({ ids }) => {
//         const docs = await store.get(ids)
//         return Object.values(docs).map(doc => ({ path: ['docs', doc.id], value: doc }))
//         //
//       }
//     }
//   },
//   title: {
//     get: () => {
//         return 'Labelling'
//     }
//   }
// }

- error and loader boundaries/ suspense

    <Suspense fallback={<Loading />}>
        <Albums artistId={artist.id} />
    </Suspense>
- context vs export const data for getting ayu
- server router falcor vs client side
- wrangler vs workerd vs sveltekit and how to acces cloudflare only features / runtime
- keypass and offline first apps?
- atreyu use routing info clientside to terminate path reqs instead of ending in $
- Compile routes to getters/setters instead proxy if they exist?