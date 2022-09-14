import startWorker from './lib/start-worker.js'
import { handler } from '/_handler.js'
import { schema } from '/_schema.js'
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

    if (schema?.parameters || schema?.requestBody ) {
      const { _params, errors } = execSchema(arg, subSchema, appData[appKey].schema)
      if (errors?.length) {
        return new Response(JSON.stringify(errors), { status: 400, headers: { 'content-type': 'application/json' }})
      }
    }

    return handler(arg)
  },
  app
})
/* eslint-ebable require-await */
