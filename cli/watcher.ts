import { globToRegExp } from '../deps-deno.js'

export async function watch ({ watchPath, ignore, handler }: {watchPath: string, ignore: string[], handler: CallableFunction}) {
  const watcher = Deno.watchFs(watchPath, { recursive: true }) // deps handle seperately?
  const ignoreRegex = ignore.map(glob => globToRegExp(glob))

  let locked = false
  let rerun = false

  const queued: Set<string> = new Set()
  async function doHandle (batch: string[]) {
    if (locked) {
      batch.forEach(ent => queued.add(ent))
      rerun = true
      return
    }

    locked = true

    await handler({ batch })

    setTimeout(async () => {
      if (rerun) {
        rerun = false
        const qBatch = [...queued]
        queued.clear()
        await handler({batch: qBatch})
      }
      locked = false
    }, 500)
  }

  const changes: Set<string> = new Set()
  function handleChanges () {
    const batch = [...changes]
    changes.clear()
    console.clear()
    console.info('  🔔 changed:', batch)
    doHandle(batch)
  }

  let timer
  for await (const event of watcher) {
    const cleanedPaths: string[] = event.paths.map(change => change.replace(Deno.cwd(), ''))
    const filteredPaths = cleanedPaths.filter(path => {
      return !ignoreRegex.find(regx => regx.test(path))
    })

    if (filteredPaths.length > 0) {
      filteredPaths.forEach(path => changes.add(path))
      if (timer) {
        clearTimeout(timer)
      }

      timer = setTimeout(() => {
        timer = null
        handleChanges()
      }, 50)
    }
  }
}
