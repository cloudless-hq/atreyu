export default function (fn, event) {
  if (event && event.waitUntil) {
    return event.waitUntil(fn)
  } else {
    return fn.catch(console.error)
  }
}