import startWorker from '/_ayu/src/service-worker/start-worker.js'
import App from './pages/_app.svelte'

startWorker().then(() => {
  new App({ target: document.querySelector('#app') })
})
