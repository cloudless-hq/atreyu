import { join } from '../deps-deno.ts'

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

export async function execStream ({ cmd, getData }) {
  const proc = Deno.run({
    cmd,
    stdout: 'piped',
    stderr: 'piped'
  })

  proc.status().then(async ({ code }) => {
    // console.log('finish')
    if (code !== 0) {
      const rawError = await proc.stderrOutput()
      const errorString = new TextDecoder().decode(rawError)
      console.error(errorString)
    }
  })

  for await (const buffer of Deno.iter(proc.stdout)) {
    const str = new TextDecoder().decode(buffer)

    if (getData) {
      getData(str)
    } else {
      console.log(str)
    }
  }

  await proc.close()
}

export async function exec (cmd, silent) {
  const proc = Deno.run({
    cmd,
    stdout: 'piped',
    stderr: 'piped'
  })

  const { code } = await proc.status()

  if (code !== 0) {
    const rawError = await proc.stderrOutput()
    const errorString = new TextDecoder().decode(rawError)
    if (!silent) {
      console.error('exec error: ', errorString, cmd)
    }
  }

  const rawOutput = await proc.output()
  const outStr = new TextDecoder().decode(rawOutput)
  proc.close()

  return outStr
}
