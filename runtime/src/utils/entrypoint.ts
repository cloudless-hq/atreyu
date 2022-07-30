import { resolve, toFileUrl } from '../../deps.ts'

/**
 * Parses the entrypoint to a URL.
 * Ensures the file exists when the entrypoint is a local file.
 */
export async function parseEntrypoint (entrypoint: string): Promise<URL> {
  let entrypointSpecifier: URL

  try {
    entrypointSpecifier =
      (entrypoint.startsWith('https:/') || entrypoint.startsWith('http:/'))
        ? new URL(entrypoint)
        : toFileUrl(resolve(Deno.cwd(), entrypoint))
  } catch (err) {
    console.error( `Failed to parse entrypoint specifier '${entrypoint}': ${err.message}`)
    Deno.exit(1)
  }

  if (entrypointSpecifier.protocol == 'file:') {
    try {
      await Deno.lstat(entrypointSpecifier)
    } catch (err) {
      console.error(`Failed to open entrypoint file at '${entrypointSpecifier}': ${err.message}`)
      Deno.exit(1)
    }
  }

  return entrypointSpecifier
}
