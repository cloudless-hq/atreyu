export default async function startWorker ({ reloadAfterInstall, workerPath = '/build/service-worker.js', isModule } = {}) {
  if(!('navigator' in window) || !('serviceWorker' in navigator)) {
    return
  }
  let regs
  let firstStart = false
  try {
    regs = await navigator.serviceWorker.getRegistrations()
  } catch (err) {
    console.warn(err, 'please try to reload')
    // location.reload()
  }
  if (regs.length !== 1) {
    console.log(regs.length + ' worker registrations', regs)
  }

  if (navigator.serviceWorker.controller && navigator.serviceWorker.controller.state) {
    if (!navigator.serviceWorker.controller.state === 'activated') {
      console.warn('worker is ' + navigator.serviceWorker.controller.state)
    } else {
      // todo: unify with getRegistrations logic
      // move to top?
      // return ?
    }
  }

  let loaded = () => { console.log('worker restarted') }
  navigator.serviceWorker.addEventListener('message', async e => {
    if (e.data === '{"worker":"active"}') {
      await navigator.serviceWorker.ready
      console.log('ServiceWorker start', { reloadAfterInstall, firstStart })
      if ((firstStart || reloadAfterInstall === 'always') && reloadAfterInstall) {
        if (!window.location.search) {
          window.location.reload()
        } else {
          window.location.href = window.location.search
        }
      } else {
        loaded(reg)
      }
    } else if (e.data.startsWith('navigate:')) {
      // Fox until safari support client.navigate()
      const href = e.data.replace('navigate:', '')
      console.log('navigating tab to ' + href)
      window.location.href = href
      // TODO handle logout, cleanup etc
    }
  })

  let reg
  if (regs.length === 0) {
    firstStart = true
    reg = await navigator.serviceWorker.register(workerPath, {
      updateViaCache: 'all',
      scope: '/',
      type: isModule ? 'module' : undefined
    })

    console.log('ServiceWorker registered')
    // navigator.serviceWorker.addEventListener('controllerchange', async () => {}) // this fired before worker was active on slow networks...
    return new Promise(resolve => { loaded = resolve })
  } else {
    await navigator.serviceWorker.ready
    // console.log('ServiceWorker ready, already installed')
    reg = regs[0]
    return regs[0]
  }

  // requires app installation
  // reg.periodicSync.unregister('periodic waky waky')
  // if (reg.periodicSync) {
  //   try {
  //     const tags = await reg.periodicSync.getTags()
  //     if (!tags.includes('periodic waky waky')) {
  //       await reg.periodicSync.register('periodic waky waky', {
  //         minInterval: 30 * 60 * 1000 // 30 mins
  //       })
  //     }
  //   } catch (err) {
  //     console.log('Periodic Sync could not be registered!', err)
  //   }
  // }
}
