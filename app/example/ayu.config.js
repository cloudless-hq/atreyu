import secrets from './secrets.js'
export default {
  defaultEnv: 'dev',
  couchHost: '', // db host url including https://

  kv_namespaces: [ 'ipfs' ],
  ...secrets
}
