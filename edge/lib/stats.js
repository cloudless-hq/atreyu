const stats = {
  workerId: Math.round(Math.random() * 10000000000000),
  workerStart: null, // Date.now(), is 0 outside of req, so we assume first req is worker start
  reqs: 0,
  traceId: 0
}

// const { getEnv } = await import('/$env.js').catch(_e => {})
// const { appName } = getEnv(['appName'])
// stats.appName = appName

export default {
  get: () => {
    return stats
  },
  updt: (event) => {
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
