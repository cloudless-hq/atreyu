const obsConf = {
  attributes: false, // attention: setting the visibility will trigger a mutation
  characterData: true,
  childList: true,
  subtree: true,
  attributeOldValue: false,
  characterDataOldValue: false
}

const loadedKeys = new Set()

export default function (node, { key, frames = 2, _contentSelector, _selector }) {
  // TODO: selector and await loading support
  // console.log('hide')

  const mutationObserver = new MutationObserver(_mutations => {
    // mutations.forEach(_mut => filter only specific selectors here )
    // console.log('mutation', mutations)
    stableFrames = 0
    run()
  })

  let scheduler
  let stableFrames = 0
  function run () {
    // console.log('run', stableFrames)
    if (scheduler) {
      cancelAnimationFrame(scheduler)
    }
    scheduler = requestAnimationFrame(() => {
      if (stableFrames >= frames) {
        mutationObserver.disconnect()
        // console.log('show')
        node.style.visibility = 'visible'
        scheduler = null
        stableFrames = 0
      } else {
        stableFrames++
        run()
      }
    })
  }

  if (!loadedKeys.has(key)) {
    node.style.visibility = 'hidden'
    loadedKeys.add(key)
    mutationObserver.observe(node, obsConf)
    run() // need to call scheduler once manually in case the dom is already settled when the action is registered
  }

  return {
    update ({ key }) {
      // console.log('hide after page nav')
      if (!loadedKeys.has(key)) {
        node.style.visibility = 'hidden'
        loadedKeys.add(key)
        mutationObserver.observe(node, obsConf)
        run()
      }
    },

    destroy () {
      if (scheduler) {
        cancelAnimationFrame(scheduler)
        scheduler = null
      }
      mutationObserver.disconnect()
    }
  }
}

// node.dispatchEvent(
//   new CustomEvent('longpress')
// );
// then on:longpress="{() => pressed = true}"
