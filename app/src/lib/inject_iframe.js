let iframe
let oldBodyOverflow

window.addEventListener('load', _e => {
  if (window?.ayu_settings?.selector) {
    setTimeout(() => {
      // clean other event liteners
      const target = document.querySelector(window.ayu_settings.selector)
      if (!target) {
        return
      }
      const cleanedTarget = target.cloneNode(true)
      target.parentNode.replaceChild(cleanedTarget, target)

      cleanedTarget.addEventListener('click', e => {
        e.preventDefault()

        iframe = document.createElement('iframe')
        iframe.id = 'closr'
        iframe.style= 'position: fixed!important; width: 100%!important; height: 100%!important; z-index: 100000!important; top: 0!important; left: 0!important; border: none!important; margin: 0!important; padding: 0!important;'
        iframe.src = 'http://webchat.localhost/?embedded'
        document.body.appendChild(iframe)
        oldBodyOverflow = document.body.style.getPropertyValue('overflow')
        document.body.style.setProperty('overflow', 'hidden')
      })
    }, 600)
  }
})

window.addEventListener('message', e => {
  if (e.data === 'closeClsr') {
    iframe.remove()
    document.body.style.setProperty('overflow', oldBodyOverflow)
  }
})