import { join, iter } from '../deps-deno.ts'

export async function recursiveReaddir (path: string) {
  const files: string[] = []
  const getFiles = async (path: string) => {
    for await (const dirEntry of Deno.readDir(path)) {
      if (dirEntry.isDirectory) {
        await getFiles(join(path, dirEntry.name))
      } else if (dirEntry.isFile) {
        files.push(join(path, dirEntry.name))
      }
    }
  }
  await getFiles(path)

  return files
}

export async function execStream ({ cmd, getData, killFun }: {cmd: string[], getData: (arg: string | null, err?: string) => null, killFun: (arg: Deno.Process) => null }) {
  // console.log(cmd.join(' '))

  const proc = Deno.run({
    cmd,
    stdout: 'piped',
    stderr: 'piped'
  })

  killFun?.(proc)

  const procStatusProm = proc.status().then(async ({ code }) => {
    // console.log('finish')
    if (code !== 0) {
      const rawError = await proc.stderrOutput()
      const errorString = new TextDecoder().decode(rawError)
      console.error(errorString)
    }
  })

  // FIXME: this is outdated and probably new ways exist in deno

  await Promise.allSettled([
    (async () => {
      for await (const buffer of iter(proc.stdout)) {
        const str = new TextDecoder().decode(buffer)

        if (getData) {
          getData(str)
          // console.log(str)
        } else {
          console.log(str)
        }
      }
    })(),
    (async () => {
      for await (const buffer of iter(proc.stderr)) {
        const str = new TextDecoder().decode(buffer)

        if (getData) {
          getData(null, str)
          // console.log(str)
        } else {
          console.error(str)
        }
      }
    })()
  ])

  // await proc.close()
  return procStatusProm
}

export async function exec (cmd: string[], silent: boolean, verbose: boolean) {
  if (verbose) {
    console.log(cmd.join(' '))
  }

  const cc =[...cmd]
  const command = new Deno.Command(cc.shift()!, {
    args: cc,
    // stdin: "piped",
    // stdout: "piped",
  })
  // const child = command.spawn()


  const { code, stdout, stderr } = await command.output()

  // console.log(child.stdout)

  // child.stdout.pipeTo(target)
  
  // child.stdin.close();
  // const status = await child.status;
  // console.log(status);


  // const proc = Deno.run({
  //   cmd,
  //   stdout: 'piped',
  //   stderr: 'piped'
  // })
  // console.log('proc', proc)

  // const { code } = await proc.status()

  // console.log('code 2', code)

  if (code !== 0) {
    // const rawError = await proc.stderrOutput()
    const errorString = new TextDecoder().decode(stderr) // new TextDecoder().decode(rawError)
    if (!silent) {
      console.error('exec error: ', errorString, cmd)
    }
  }

  // const rawOutput = await proc.output()
  const outStr = new TextDecoder().decode(stdout) //new TextDecoder().decode(rawOutput)
  // await proc.close()

  return outStr
}
