<script>
import data from '/atreyu/src/store/data.js'

let seq
export let doSync = async (dataProxy) => {
  try {
    seq = (await dataProxy._sync(seq))?.json?._seq || seq
  } catch (err) {
    console.log(err)
  } finally {
    setTimeout(() => {
      doSync(dataProxy)
    }, 100)
  }
}

// let versionTooltip = ''
let updatedNotification
let latestHash = ''
let installedHash = ''
let newHash = null
let updating = false
const settingsDocId = 'system:ayu_settings'

let _silent = localStorage.getItem('_silent')
let _updateImmediate = localStorage.getItem('_updateImmediate')
let _updating = localStorage.getItem('_updating')

// TODO: full support for long running observables to avoid this loop

$: {
  if ($data._session.userId$) {
    // the reactive check to ask for updates and reload while the page is open
    const settingsDoc = $data._docs[settingsDocId + '$']

    if (settingsDoc && !$data._hash$loading) {
      latestHash = settingsDoc.folderHash
      installedHash = $data._hash$
    }
    if (latestHash && installedHash && latestHash !== installedHash) {
      newHash = latestHash

      if (_updateImmediate && !updating) {
        doUpdate({ auto: true })
      }
    }
  }
}

// else {
// versionTooltip = `Build: "${settingsDoc.buildName$}"
// Atreyu  Version: "${settingsDoc.version$}"
// Installled Hash: "${installedHash.substr(-8)}"
// Latest     Hash: "${newHash.substr(-8)}"`
//     }
//   } else {
// versionTooltip = `Build: "${settingsDoc.buildName$}"
// Atreyu Version: "${settingsDoc.version$}"
// Installed Hash: "${installedHash.substr(-8)}"`
//   }
// }

// the initial update check to auto install updates on fresh load and preload the required data
async function init () {
  const userId = await $data._session.userId$promise
  // const appHash = await $data._session.userId$promise

  if (userId) {
    doSync($data, data.falcor)

    const [settingsDoc, installedHash] = await Promise.all([
      $data._docs[settingsDocId + '$promise'],
      $data._hash$promise
    ])

    if (settingsDoc?.folderHash) {
      // on dev this will happen if app db hash is updated but server not restarted but applicaiton is reloaded to update
      // if (appHash !== settingsDoc.folderHash) {
      //   alert('Application configuration is corrupt, please contact support to fix this.')
      //   return
      // }

      latestHash = settingsDoc.folderHash

      if ((latestHash && installedHash) && latestHash !== installedHash) {
        doUpdate({})
      }
    }
  }
}
init()

let updated
function closeUpdateNotification (e) {
  const path = e.composedPath()
  if (updated) {
    if (!path.includes(updatedNotification)) {
      closeUpdated()
    }
  }
}

if (_updating) {
  updated = true
}
function closeUpdated () {
  updated = false
  localStorage.removeItem('_updating')
}

async function doUpdate ({ auto, silent }) {
  if (silent) {
    localStorage.setItem('_silent', true)
  }

  if (auto) {
    localStorage.setItem('_updateImmediate', true)
  }
  if (_updating === newHash) {
    newHash = null
  }
  if (!newHash) {
    return
  }
  localStorage.setItem('_updating', newHash)

  updated = false
  updating = true

  const cache = await caches.open('ipfs')
  await cache.delete('/ipfs-map.json')

  await data.falcor.setValue(['_updating'], updating) // TODO: promise mode for set and call

  // if service worker new...
  // await (await navigator.serviceWorker.getRegistration()).update()

  setTimeout(() => {
    location.reload()
  }, 200)
}

// Updated notification with expansion to show changes and changed files, version numbers etc.
</script>

<svelte:body on:mousedown|passive={closeUpdateNotification}  />

{#if newHash && !updating}
  <div aria-live="assertive" class="ayu-update-notification">
    <div class="wrapper1">
      <div class="wrapper2">
        <div class="wrapper3">
          <div class="wrapper4">

            <div class="icon">
              <svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="recycle" class="svg-green" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="currentColor" d="M160 416L80.37 416c-17.81 0-33.59-9.156-42.21-24.5c-8.406-14.94-8.109-32.63 .7969-47.28L108.6 229.6l14.02 48.41c2.031 7 8.422 11.56 15.37 11.56c1.469 0 2.969-.1875 4.453-.625c8.482-2.469 13.37-11.34 10.92-19.81l-25.17-86.94C127 178.1 124.3 174.6 120.6 172.6C116.8 170.5 112.4 170 108.4 171.2L21.46 196.4C12.97 198.9 8.084 207.8 10.54 216.2c2.453 8.5 11.33 13.5 19.82 10.94L81.67 212.3l-70.05 115.3c-14.1 24.69-15.5 54.44-1.344 79.59C24.64 432.8 50.84 448 80.37 448h79.64c8.844 0 15.1-7.156 15.1-16S168.8 416 160 416zM500.4 327.6l-38.74-63.78c-4.592-7.5-14.4-9.906-21.98-5.375c-7.547 4.594-9.951 14.44-5.359 22l38.74 63.78c8.906 14.66 9.203 32.34 .7969 47.28C465.2 406.8 449.4 416 431.6 416h-121l36.68-36.69c6.25-6.25 6.25-16.38 0-22.62s-16.37-6.25-22.62 0l-63.99 64c-6.25 6.25-6.25 16.38 0 22.62l63.99 64C327.8 510.4 331.9 512 335.1 512s8.186-1.562 11.31-4.688c6.25-6.25 6.25-16.38 0-22.62L310.6 448h121c29.53 0 55.72-15.25 70.1-40.81C515.9 382 515.4 352.3 500.4 327.6zM297.4 55.13l50.37 82.91l-45.47-13.19c-8.498-2.5-17.37 2.469-19.82 10.94s2.438 17.34 10.92 19.81l86.92 25.19c1.469 .4062 2.953 .625 4.453 .625c2.672 0 5.328-.6562 7.719-2c3.717-2.031 6.467-5.469 7.654-9.562l25.17-86.94c2.453-8.469-2.438-17.34-10.92-19.81c-8.531-2.469-17.37 2.438-19.83 10.94l-15.57 53.78L324.8 38.5C310.1 14.38 284.4 0 256 0S201.9 14.38 187.2 38.5L157.4 87.69c-4.594 7.562-2.188 17.41 5.357 22c7.531 4.562 17.4 2.125 21.98-5.375l29.89-49.19C223.4 40.63 238.9 32 256 32S288.6 40.63 297.4 55.13z"></path>
              </svg>
            </div>

            <div class="content">
              <p class="title">
                Update available
              </p>
              <p class="subtitle">
                Please make sure your work is saved and update.
              </p>

              <div class="btns">
                <button on:click={() => doUpdate({auto: false})} class="primary btn">
                  Update
                </button>
                <button on:click={() => doUpdate({auto: true})} class="secondary btn">
                  Don't ask again
                </button>
                <button on:click={() => doUpdate({auto: true, silent: true})} class="secondary btn">
                  Silent
                </button>
              </div>
            </div>

            <div class="close-btn-wrapper">
              <button class="close-btn">
                <!-- <span class="sr-only">Close and Remind in 5 minutes</span> -->

                <svg class="close-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if updated && !_silent}
  {#if $data._docs[settingsDocId].buildColor$}
    <div bind:this={updatedNotification} aria-live="assertive" class="ayu-update-notification">
      <div class="wrapper1">
        <div class="wrapper2">
          <div class="wrapper3">
            <div class="wrapper4">

              <div class="icon">
                <svg class="svg-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div class="content">
                <p class="title">
                  {#if !newHash}Update Successfull{:else}Update failed{/if}
                </p>

                <p class="subtitle">
                {#if !newHash && $data._docs[settingsDocId].buildColor$}
                  <br>
                  Build: <span class="build-badge" style="background-color: rgb({$data._docs[settingsDocId].buildColor$.r},{$data._docs[settingsDocId].buildColor$.g},{$data._docs[settingsDocId].buildColor$.b});">
                    {$data._docs[settingsDocId].buildName$}
                  </span><br>

                  System Version: {$data._docs[settingsDocId].version$}<br>
                  Hash: {installedHash.substr(-8)}<br>
                {:else}Please try clearing your browser cache and reload the page. If this does not resolve the issue, contact support. We are sorry for inconvenience!{/if}
                </p>

                <div class="btns">
                  <button on:click={closeUpdated} class="primary btn">
                    OK
                  </button>
                  <button class="secondary btn">
                    Show changes
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
{/if}
