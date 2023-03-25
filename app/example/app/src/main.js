import startWorker from '/_ayu/src/service-worker/start-worker.js'
import App from './pages/_app.svelte'
import Atreyu from '/_ayu/src/components/atreyu.svelte'

startWorker().then(() => {
  new App({ target: document.querySelector('#app') })

  new Atreyu({ target: document.querySelector('#atreyu'), props: { onChange: ({ falcorModel }) => {
    falcorModel.invalidate('todos')
  } } })
})
