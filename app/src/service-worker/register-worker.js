export default async function registerWorker (workerPath, loaded) {
  // if (navigator.serviceWorker.controller && navigator.serviceWorker.controller.state === 'activated') {
  //   // todo: unify with getRegistrations logic
  //   return loaded()
  // }

  const regs = await navigator.serviceWorker.getRegistrations()

  if (regs.length !== 1) {
    console.log(regs.length + ' worker registrations')
  }

  if (navigator.serviceWorker.controller && navigator.serviceWorker.controller.state) {
    if (!navigator.serviceWorker.controller.state === 'activated') {
      console.warn('worker is ' + navigator.serviceWorker.controller.state)
      // return
    }
  }

  if (regs.length === 0) {
    const reg = await navigator.serviceWorker.register(workerPath, {
      updateViaCache: 'all',
      scope: '/'
    })

    console.log('ServiceWorker registred')

    navigator.serviceWorker.addEventListener('message', async e => {
      if (e.data === '{"worker":"active"}') {
        await navigator.serviceWorker.ready
        console.log('ServiceWorker ready')
        loaded(reg)
      }
    }, { once: true })

    // navigator.serviceWorker.addEventListener('controllerchange', async () => {}) // this fired before worker was active on slow networks...
  } else {
    await navigator.serviceWorker.ready
    console.log('ServiceWorker ready')
    loaded(regs[0])
  }
}
