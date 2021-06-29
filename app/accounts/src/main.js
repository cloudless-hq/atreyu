const App = await import('pages/App.svelte')

new App.default({
  target: document.body,
  intro: true
})
