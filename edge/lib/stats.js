import { getEnv } from '/$env.js'
const { appName } = getEnv(['appName'])

const stats = {
  appName,
  workerId: Math.round(Math.random() * 10000000000000),
  workerStart: null, // Date.now(), is 0 outside of req, so we assume first req is worker start
  reqs: 0,
  traceId: 0
}

export default {
  get: () => {
    return stats
  },
  updt: (event) => {
    stats.traceId = Math.round(Math.random() * 10000000000000)
    stats.time = (new Date()).toISOString()
    if (event) {
      stats.cf = event.request.cf
    }

    if (!stats.workerStart) {
      stats.workerStart = stats.time
    }

    stats.reqs++
    return stats
  }
}
