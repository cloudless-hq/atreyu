let conf = {}

export function setEnv (newEnv) {
  conf = newEnv
}

export function getEnv (keys) {
  const env = {}
  keys.forEach(async key => {
    if (typeof Deno !== 'undefined') {
      env[key] = conf[key]
    } else {
      env[key] = self[key]
    }
  })

  return env
}
