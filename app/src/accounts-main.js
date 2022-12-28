import startWorker from '/_ayu/src/service-worker/start-worker.js'

startWorker().then(async () => {
  const App = await import('/_ayu/src/components/accounts/_app.svelte')

  new App.default({
    target: document.querySelector('#app'),
    intro: true
  })
})
