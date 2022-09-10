// eslint-disable-next-line no-restricted-imports
import { DateTime } from '../deps/luxon.js'

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
// min, max are inclusive
export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
export const sleepRandom = () => {
  const ms = randomInt(500, 1500)
  return sleep(ms)
}

export function escapeId (baseString, doc) {
  let result = ''
  let char = ''
  let validTest
  if (doc) {
    validTest = RegExp(/[a-zA-Z0-9_$<>=\-.!']/)
  } else {
    validTest = RegExp(/[a-z0-9_$+-]/)
  }
  for (let i = 0; i < baseString.length; i++) {
    char = baseString.charAt(i)
    if (!validTest.test(char)) {
      result += '(' + char.codePointAt() + ')'
    } else {
      result += char
    }
  }
  return result
}

export function formatBytes (bytes) {
  const units = [ 'B', 'KB', 'MB', 'GB' ]
  let dim = 0
  let n = parseInt(bytes, 10) || 0

  while (n >= 1024 && ++dim) {
    n = n / 1024
  }
  return n.toFixed(n < 10 && dim > 0 ? 1 : 0) + ' ' + units[dim]
}

export function fromNow (timestamp) {
  return DateTime.fromMillis(timestamp).toRelative()
}

export function formatTime (timestamp) {
  return DateTime.fromMillis(timestamp).toFormat('HH:mm, dd.MM.y')
}
