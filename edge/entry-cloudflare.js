import startWorker from './lib/start-worker.js'
import { handler } from '/_handler.js'
import { getEnv } from '/_env.js'
const { env, folderHash, appName, ayuVersion, rootFolderHash, ayuHash } = getEnv(['env', 'folderHash', 'appName', 'ayuVersion', 'rootFolderHash', 'ayuHash'])

const app = {
  Hash: folderHash,
  rootFolderHash: rootFolderHash,
  ayuVersion: ayuVersion,
  ayuHash: ayuHash,
  appName: appName,
  env: env
}

// FIXME: async needed for parent call then:
/* eslint-disable require-await */
// deno-lint-ignore require-await
startWorker({
  handler: async (arg) => {
    arg.app = app
    return handler(arg)
  },
  app
})
/* eslint-ebable require-await */
