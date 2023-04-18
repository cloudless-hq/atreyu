export function onChange ({ data, model }) {
  if (data._docs && Object.values(data._docs).some(({ value: doc }) => doc?.type === 'todo')) {
    model.invalidate('todos')
  }
}
