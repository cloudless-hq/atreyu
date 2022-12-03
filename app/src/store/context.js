import data from './data.js'
import makeRouterStore from './router.js'
import { schema } from '/schema/main.js'
// eslint-disable-next-line no-restricted-imports
import { setContext, hasContext } from '../../build/deps/svelte-internal.js'

export default function () {
  if (hasContext('ayu')) {
    console.warn('only set the ayu context in the svelte file of your app')
  }
  const stores = { data, router: makeRouterStore({ schema, dataStore: data }) }
  setContext('ayu', stores)

  return stores
}
