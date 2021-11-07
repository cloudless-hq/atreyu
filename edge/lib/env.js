export function getEnv (keys) {
  const env = {}
  keys.forEach(key => { env[key] = self[key] })

  return env
}
