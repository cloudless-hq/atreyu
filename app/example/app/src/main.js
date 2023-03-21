import startWorker from '/_ayu/src/service-worker/start-worker.js'
import App from './pages/_app.svelte'
import Atreyu from '/_ayu/src/components/atreyu.svelte'


// FIXME:
let seq
let timeout
const doSync = async (dataProxy, falcorModel) => {
  try {
    const data = (await dataProxy._sync(seq))?.json

    // falcorModel.invalidate('todos')
    seq = data?._seq || seq
  } catch (err) {
    console.log(err)
  } finally {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      timeout = null
      doSync(dataProxy, falcorModel)
    }, 150)
  }
}

startWorker().then(() => {
  new App({ target: document.querySelector('#app') })
  new Atreyu({ target: document.querySelector('#atreyu'), props: { doSync } })
})
