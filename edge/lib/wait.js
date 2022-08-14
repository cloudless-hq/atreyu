let event

export const attachWait = (newEvent) => {
  event = newEvent
  return wait
}

export default function wait (fn) {
  if (event && event.waitUntil) {
    return event.waitUntil(fn)
  } else {
    // console.warn('waiting called without event context')
    return fn.catch(console.error)
  }
}
