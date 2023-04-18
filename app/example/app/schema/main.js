import falcorPaths from './falcor.js'

export function schema ({ defaultPaths, addPathTags }) {
  return {
    paths: {
      '/(#/todos)(/:view)(/:sortBy)': {
        name: 'todos',

        get: {
          tags: ['window'],
          operationId: 'todos' // TODO: make explicit /pages/todos/_page.svelte ?
        }
      },

      ...defaultPaths,
      ...addPathTags(falcorPaths, 'falcor')
    }
  }
}
