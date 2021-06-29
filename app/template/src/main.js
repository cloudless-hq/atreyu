/* global BroadcastChannel */
import './index.html'
import './global.css'

import App from './App.html'

window.addEventListener('load', () => {
  navigator.serviceWorker.getRegistrations().then(regs => {
    console.log(regs.length + ' worker registrations')

    if (navigator.serviceWorker.controller && navigator.serviceWorker.controller.state) {
      console.log('worker is ' + navigator.serviceWorker.controller.state)
      if (!navigator.serviceWorker.controller.state === 'activated') {
        return
      }
    }

    if (regs.length === 0) {
      navigator.serviceWorker.register('service-worker.js').then(registration => {
        console.log('ServiceWorker registration successful: ', registration)
      }, err => {
        console.log('ServiceWorker registration failed: ', err)
      })
    }
  })
})

const app = new App({
  target: document.body
})

const updatesChannel = new BroadcastChannel('api-updates')
updatesChannel.addEventListener('message', async (event) => {
  // const { cacheName, updatedUrl } = event.data.payload
  // const cache = await caches.open(cacheName)
  // const updatedResponse = await cache.match(updatedUrl)
  // const updatedText = await updatedResponse.text()
  console.log({
    event
  })
})

window.app = app
export default app
