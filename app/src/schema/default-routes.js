import falcorPaths from './falcor-paths.js'
import windowPaths from './window-paths.js'

import { toFalcorPaths, toWindowPaths} from './helpers.js'

//  TODO: normalize leading slashes warn or auto handle missing leading slashes
// TODO: support * methods?

export default {
  ...toFalcorPaths(falcorPaths),
  ...toWindowPaths(windowPaths),

  '/*': {
    get: {
      tags: [ 'edge', 'service-worker' ],
      operationId: '_ipfs'
    }
  },
  '/_debug': {
    get: {
      tags: [ 'edge' ],
      operationId: '_debug'
    }
  },

  // codespace support
  '/signin*': {
    get: {
      operationId: '_bypass'
    }
  },
  '/atreyu/accounts*': {
    get: {
      // tags: [],
      operationId: '_bypass' // '_accounts'
    }
  },
  '/_feed/*': {
    get: {
      tags: [ 'edge' ],
      operationId: '_feed'
    }
  },
  '/_couch/*': {
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
  '/cdn-cgi/access*': {
    get: {
      // tags: [],
      operationId: '_bypass'
    }
  },
  '/_cors/*': {
    get: {
      tags: [ 'edge', 'service-worker' ],
      operationId: '_cors'
    }
  }
}
