// import {
//   italic,
//   bold,
//   color,
//   red,
//   green
// } from '../deps-deno.ts'

// FIXME: need to import install command from new ayu version instead in case permissions are upadted etc.
import { install } from './install.js'

import versions from './versions.json' assert { type: 'json' }
const { ayuVersion: curAyuVersion, ipfsVersion: _curIpfsversion, denoVersion: _curDenoVersion } = versions

export async function update (): Promise<void> {
  const { ayuVersion: newAyuVersion, ipfsVersion: _newIpfsVersino, denoVersion: _newDenoVersion, error } = await getVersions()

  if (error) {
    console.error(error)
    Deno.exit(1)
  }

  if (curAyuVersion === newAyuVersion) {
    console.log('  You are using the latest ayu version ' + curAyuVersion)
    Deno.exit()
  } else {
    console.log(`  Updating from ayu version ${curAyuVersion} to ${newAyuVersion}`)
    install(newAyuVersion)
  }
}

export async function getVersions (): Promise<{ ayuVersion?: string; ipfsVersion?: string; denoVersion?: string; versions?: string[], error?: string }> {
  const aborter = new AbortController()
  const timer = setTimeout(() => aborter.abort(), 3500)
  const response = await fetch('https://atreyu.dev/ayu@latest/cli/versions.json', { signal: aborter.signal })

  if (!response.ok) {
    return { error: 'couldn`t fetch the latest version - try again after some time' }
  }

  const data = await response.text()
  clearTimeout(timer)
  return JSON.parse(data)
}
