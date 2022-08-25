const appKey = Deno.env.get('appKey')
const homeDir = Deno.env.get('HOME')
const envName = Deno.env.get('env')

let conf = JSON.parse(Deno.readTextFileSync(homeDir + `/.atreyu/${appKey}.json`))
conf.env = envName
// console.log(conf)
export function getEnv (keys) {
  const env = { }

  keys.forEach(key => {
    env[key] = conf[key]
  })

  return env
}
