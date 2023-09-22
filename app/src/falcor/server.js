/* eslint-disable functional/no-this-expression */
/* eslint-disable functional/no-class */
import { makeRouter, toFalcorRoutes } from './router.js'
import { falcor } from '/_ayu/build/deps/falcor.js'
import { extractFromCache } from '../store/helpers.js'

class Server {
  constructor (model) {
    this.dataSource = model.asDataSource()
    this.model = model
  }

  execute (action) {
    const method = action[1]
    const jsonGraphEnvelope = action[2] // or
    const callPath = action[2]
    const args = action[3] || []
    const pathSuffixes = action[4] || []

    let paths
    switch (method) {
      case 'get':
        paths = action[2]
        return this.dataSource.get(paths)._toJSONG()
      case 'set':
        return this.dataSource.set(jsonGraphEnvelope)._toJSONG()
      case 'call':
        paths = action[5] || []
        console.log({ callPath, args, pathSuffixes, paths })
        return this.dataSource.call(callPath, args, pathSuffixes, paths)._toJSONG()
    }
  }
}

// TODO: userId, additional dataSources
export default function ({
  schema,
  useAll,

  cache,

  dbs,
  session,
  fetch
}) {
  const FalcorRouter = makeRouter(toFalcorRoutes(schema, useAll))
  const routerInstance = new FalcorRouter({ dbs, session, fetch })

  const serverModel = falcor({
    cache,
    source: routerInstance,
    maxSize: 500000,
    collectRatio: 0.75,
    maxRetries: 1
  })
    .batch()
    .boxValues()

  routerInstance.model = serverModel.withoutDataSource()


  // TODO: move to class
  routerInstance.model.getPageKey = function (path, from) {
    const listCache = extractFromCache({ path, obj: this._root.cache })

    for (let index = from; index > 0; index--) {
      if (listCache.value?.[index]?.$pageKey !== undefined) {
        return { pageKey: listCache.value[index].$pageKey, index }
      }
    }
    return { index: 0 }
  }

  return new Server(serverModel)
}
