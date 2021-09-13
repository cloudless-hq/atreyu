import { makeRouter, toFalcorRoutes } from './falcor-router.js'

class WorkerServer {
  constructor(dataSource) {
    this.dataSource = dataSource
  }

  execute(action) {
    const method = action[1]
    let paths

    switch (method) {
      case 'get':
        paths = action[2]
        return this.dataSource.get(paths)
      case 'set':
        let jsonGraphEnvelope = action[2]
        return this.dataSource.set(jsonGraphEnvelope)
      case 'call':
        let callPath = action[2]
        let args = action[3] || []
        let pathSuffixes = action[4] || []
        paths = action[5] || []

        return this.dataSource.call(callPath, args, pathSuffixes, paths)
    }
  }
}

export default function ({
  schema,
  dbs
}) {
  const dataRoutes = toFalcorRoutes(schema)
  const FalcorRouter = makeRouter(dataRoutes)
  const routerInstance = new FalcorRouter({ dbs }) // TODO: userId

  // const serverDataSource = falcor({
  //   cache: {},
  //   source: routerInstance
  // }).asDataSource()

  const workerServer = new WorkerServer(routerInstance)

  return workerServer
}
