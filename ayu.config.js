import secrets from './secrets.js'

export default {
  domain: 'atreyu.dev',
  kv_namespaces: ['ipfs'],
  ...secrets
}

// TODO: rename to prebuild step
export const runConf = {
  'pnpm build': { globs: [ 'app/src/deps/**'] }
}

export const extraAppEntryPoints = [ 'app/src/accounts-main.js' ]
