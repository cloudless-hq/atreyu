/* eslint-disable functional/no-this-expression */
/* eslint-disable functional/no-class */
import { makeRouter, toFalcorRoutes } from './falcor-router.js'

class WorkerServer {
  constructor (dataSource) {
    this.dataSource = dataSource
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
        return this.dataSource.get(paths)
      case 'set':
        return this.dataSource.set(jsonGraphEnvelope)
      case 'call':
        paths = action[5] || []
        return this.dataSource.call(callPath, args, pathSuffixes, paths)
    }
  }
}

// TODO: userId, additional dataSources
export default function ({
  schema,
  dbs,
  session
}) {
  const dataRoutes = toFalcorRoutes(schema)
  const FalcorRouter = makeRouter(dataRoutes)
  const routerInstance = new FalcorRouter({ dbs, session })

  // const serverDataSource = falcor({
  //   cache: {},
  //   source: routerInstance
  // }).asDataSource()

  const workerServer = new WorkerServer(routerInstance)

  return workerServer
}
