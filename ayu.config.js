import secrets from './secrets.js'

export default {
  ELASTIC_URL: 'https://elk.es.europe-west3.gcp.cloud.es.io:9243/logs_dev/_doc/',
  domain: 'atreyu.dev',
  couchHost: 'https://c3b0b243-4f69-4cb1-9ece-1b0561a67cee-bluemix.cloudant.com',
  IPFS_GATEWAY: 'https://cloudless.mypinata.cloud',
  kv_namespaces: ['ipfs'],
  ...secrets
}

export const runConf = {
  'yarn build': { globs: [ 'app/src/deps/**'] }
}
