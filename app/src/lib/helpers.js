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
