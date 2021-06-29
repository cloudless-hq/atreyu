export default function flash (element) {
  requestAnimationFrame(() => {
    element.style.transition = 'none'
    element.style.color = 'rgba(255,62,0,1)'
    element.style.backgroundColor = 'rgba(255,62,0,0.2)'

    setTimeout(() => {
      element.style.color = ''
      element.style.backgroundColor = ''
    }, 150)
  })
}
