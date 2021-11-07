const appKey = Deno.env.get('appKey')
const homeDir = Deno.env.get('HOME')
let conf = JSON.parse(Deno.readTextFileSync(homeDir + `/.atreyu/${appKey}.json`))

export function getEnv (keys) {
  const env = {}
  keys.forEach(key => {
    env[key] = conf[key]
  })

  return env
}
