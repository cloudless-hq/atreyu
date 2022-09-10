export default async function registerWorker (workerPath, loaded) {
  const regs = await navigator.serviceWorker.getRegistrations()

  if (regs.length !== 1) {
    console.log(regs.length + ' worker registrations')
  }

  if (navigator.serviceWorker.controller && navigator.serviceWorker.controller.state) {
    if (!navigator.serviceWorker.controller.state === 'activated') {
      console.warn('worker is ' + navigator.serviceWorker.controller.state)
    } else {
      // todo: unify with getRegistrations logic
      // move to top?
      // return loaded() ?
    }
  }

  let reg
  if (regs.length === 0) {
    reg = await navigator.serviceWorker.register(workerPath, {
      updateViaCache: 'all',
      scope: '/'
    })

    console.log('ServiceWorker registred')
    // navigator.serviceWorker.addEventListener('controllerchange', async () => {}) // this fired before worker was active on slow networks...
  } else {
    await navigator.serviceWorker.ready
    console.log('ServiceWorker ready, allready installed')
    loaded(regs[0])
  }

  navigator.serviceWorker.addEventListener('message', async e => {
    if (e.data === '{"worker":"active"}') {
      // this onlye needs , { once: true } after safari supports client.navigate
      await navigator.serviceWorker.ready
      console.log('ServiceWorker ready after activate')
      loaded(reg)
    } else if (e.data.startsWith('navigate:')) {
      // Fox until safari support client.navigate()
      window.location.href = e.data.replace('navigate:', '')
      // TODO handle logout, cleanup etc
    }
  })
}
