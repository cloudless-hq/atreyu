export default function (node, { duration, delay = 0, addClasses, removeClasses }) {
  setTimeout(() => {
    addClasses?.split(' ').forEach(className => {
      if (className.length > 0) {
        node.classList.add(className)
      }
    })

    removeClasses?.split(' ').forEach(className => {
      if (className.length > 0) {
        node.classList.remove(className)
      }
    })
  }, delay)

  return {
    delay,
    duration
  }
}