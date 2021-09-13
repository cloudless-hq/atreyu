export default {
  servers: [
    {
      url: 'demo.cloudless.one',
      description: 'prod'
    }
  ],

  paths: {
    '/(:page)': {
      get: { tags: [ 'window' ] }
    },

    '/*': {
      get: {
        tags: [ 'edge-worker' ],
        operationId: '_ipfs'
      }
    },

    '/_conns/dialogflow*': {
      post: {
        tags: [ 'edge-worker' ],
        operationId: '_conns/dialogflow'
      }
    },

    'test': {
      get: {
        tags: ['falcor'],
        handler: async ({ dbs }) => {
          const res = await dbs[0].get('a:b9c52d21456f74741245739cdc4b1d6d')
          return {jsonGraph: { test: res.a} }
        }
      }
    },
  }
}