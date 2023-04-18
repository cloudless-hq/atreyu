import startWorker from './lib/start-worker.js'
import { handler } from '/_handler.js'
import paramsValidation from '/_validation.js'
import { getEnv } from '/_env.js'

const {
  env,
  folderHash,
  appName,
  ayuVersion,
  rootFolderHash,
  ayuHash
} = getEnv([
  'env',
  'folderHash',
  'appName',
  'ayuVersion',
  'rootFolderHash',
  'ayuHash'
])

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

    if (paramsValidation) {
      if (!paramsValidation({ headers: arg.req.headers })) {
        return new Response(JSON.stringify(paramsValidation.errors), { status: 400, headers: { 'content-type': 'application/json' }})
      }
    }

    return handler(arg)
  },
  app
})
/* eslint-ebable require-await */
