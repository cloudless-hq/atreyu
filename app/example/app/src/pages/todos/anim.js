import { flip } from 'svelte/animate'
import { quintOut } from 'svelte/easing'
import { crossfade } from 'svelte/transition'

const [ doSend, doReceive ] = crossfade({
  duration: d => Math.sqrt(d * 200),

  fallback (node, params, x) {
    // console.log('fallback', params, x)
    const style = getComputedStyle(node)
    const transform = style.transform === 'none' ? '' : style.transform
    return {
      duration: 300,
      easing: quintOut,
      css: t => `transform: ${transform} scale(${t}); opacity: ${t};`
    }
  }
})

function send (node, {key, disabled}, {direction}) {
  // console.log('send', key) // , direction, node
  return doSend(...arguments)
}


function receive (node, {key, disabled}, {direction}) {
  // console.log('recieve', key) // , direction, node
  return doReceive(...arguments)
}

export { send, receive, flip }
