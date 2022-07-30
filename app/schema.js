export const schema = {
  paths: {
    '/*': {
      get: {
        tags: [ 'edge' ],
        operationId: '_ipfs'
      }
    }
  }
}
