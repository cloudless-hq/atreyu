import startWorker from '/_ayu/src/service-worker/start-worker.js'

startWorker().then(async () => {
  const App = await import('/_ayu/build/components/accounts/app.svelte.js')

  new App.default({
    target: document.querySelector('#app'),
    intro: true
  })
})
