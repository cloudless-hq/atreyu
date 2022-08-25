const stats = {
  workerId: Math.round(Math.random() * 10000000000000),
  workerStart: null,
  reqs: 0,
  traceId: 0
}

export default {
  get: () => {
    return stats
  },
  updt: (event, app) => {
    stats.app = app
    stats.traceId = Math.round(Math.random() * 10000000000000)
    stats.time = (new Date()).toISOString()

    if (event) {
      stats.cf = { ...event.request.cf, tlsClientAuth: undefined, tlsExportedAuthenticator: undefined, tlsCipher: undefined }
    }

    if (!stats.workerStart) {
      stats.workerStart = stats.time
    }

    stats.reqs++
    return stats
  }
}
