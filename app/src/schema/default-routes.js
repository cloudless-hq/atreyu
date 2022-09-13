import falcorPaths from './falcor-paths.js'
import windowPaths from './window-paths.js'

import { addPathTags } from './helpers.js'

//  TODO: normalize leading slashes warn or auto handle missing leading slashes
// TODO: support * methods?

export default {
  ...addPathTags(falcorPaths, 'falcor'),
  ...addPathTags(windowPaths, 'window'),

  '/*': {
    get: {
      tags: [ 'edge', 'service-worker' ],
      operationId: '_ipfs'
    }
  },

  // '/_debug': {
  //   get: {
  //     tags: [ 'edge' ],
  //     operationId: '_debug'
  //   }
  // },
  // '/_cors/*': {
  //   get: {
  //     tags: [ 'edge', 'service-worker' ],
  //     operationId: '_cors'
  //   }
  // },
  // codespace support TODO: remove
  // '/signin*': {
  //   get: {
  //     operationId: '_bypass'
  //   }
  // },

  // TODO: not required anymore?
  // '/_ayu/accounts*': {
  //   get: {
  //     operationId: '_bypass' // '_accounts'
  //   }
  // },

  // '/_api/_feed/*': {
  //   get: {
  //     tags: [ 'edge' ],
  //     operationId: '_feed'
  //   }
  // },

  '/_api/_session*': {
    get: {
      tags: [ 'edge' ],
      operationId: '_session'
    },
    post: {
      tags: [ 'edge' ],
      operationId: '_session'
    },
    delete: {
      tags: [ 'edge' ],
      operationId: '_session'
    }
  },
  '/_api/_couch/*': {
    get: {
      tags: [ 'edge' ],
      operationId: '_couch'
    },
    put: {
      tags: [ 'edge' ],
      operationId: '_couch'
    },
    post: {
      tags: [ 'edge' ],
      operationId: '_couch'
    },
    options: {
      tags: [ 'edge' ],
      operationId: '_couch'
    }
  },
  // cloudflare access support
  '/cdn-cgi/access*': {
    get: {
      // tags: [],
      operationId: '_bypass'
    }
  }
}
