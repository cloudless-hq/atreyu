let event

export const getWait = (newEvent) => {
  if (newEvent) {
    event = newEvent
  }
  return { waitUntil, event }
}

export default function waitUntil (fn) {
  if (event && event.waitUntil) {
    return event.waitUntil(fn)
  } else {
    // console.warn('waiting called without event context')
    return fn.catch(console.error)
  }
}
