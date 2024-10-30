import makeDataStore from './data.js'
import makeRouterStore from './router.js'

import { schema } from '/schema/main.js'
// eslint-disable-next-line no-restricted-imports
import { setContext, hasContext } from '../../build/deps/svelte-internal.js'

export default function ({ onChange = () => {} } = {}) {
  if (hasContext('ayu')) {
    console.warn('only set the ayu context in the root svelte layout file of your app')
  }

  const data = makeDataStore({ onChange })
  const router = makeRouterStore({ schema, dataStore: data })

  const stores = { data, router }
  setContext('ayu', stores)

  return stores
}
