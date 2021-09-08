<script>
	import data from '/atreyu/src/store/data.js'
  import Menu from '/atreyu/src/components/menu.svelte'

  export let env = 'prod'
  export let userName = null

  // TODO: full support for long running observables to avoid this loop
	let seq
  async function doSync () {
		try {
      seq = (await $data._sync(seq))?.json?._seq || seq
    } catch (err) {
      console.log(err)
    } finally {
      doSync()
    }
	}
	doSync()

  const settingsDocId = env === 'dev' ? `system:settings_${env}_${userName}` : `system:settings_${env}`

  let versionTooltip = ''
  let updatedNotification
  let latestHash = ''
  let installedHash = ''
  let newHash = null
  let updating = false

  let _updateImmediate = localStorage.getItem('_updateImmediate')
  let _updateCounter = Number(localStorage.getItem('_updateCounter'))

  // the initial update check to auto install updates on fresh load and preload the required data
  Promise.all([
    $data._docs[settingsDocId + '$'],
    $data._hash$
  ]).then(([settingsDoc, installedHash]) => {
    if (settingsDoc?.folderHash) {
      latestHash = settingsDoc.folderHash

      // console.log(latestHash, installedHash)
      if (latestHash !== installedHash) {
        if (_updateCounter < 10) {
          doUpdate() // todo counter with blocker
        }
      } else {
        localStorage.setItem('_updateCounter', 1)
      }
    }
  })

  // the reactive check to ask for updates and reload while the page is open
  $: {
    const settingsDoc = $data._docs[settingsDocId + '$']
    if (settingsDoc && !settingsDoc?._loading && !$data._hash$?._loading) {
      latestHash = settingsDoc.folderHash
      installedHash = $data._hash$

      // console.log({latestHash, installedHash, _updateImmediate, _updateCounter, updating})
      if (latestHash !== installedHash) {
        newHash = latestHash
      }

      if (newHash) {
        if (_updateImmediate && _updateCounter < 10 && !updating) {
          doUpdate(true)
        } else {
          versionTooltip = `Build: "${settingsDoc.buildName$}"
Atreyu  Version: "${settingsDoc.version$}"
Installled Hash: "${installedHash.substr(-8)}"
Latest     Hash: "${newHash.substr(-8)}"`
        }
      } else {
        versionTooltip = `Build: "${settingsDoc.buildName$}"
Atreyu Version: "${settingsDoc.version$}"
Installed Hash: "${installedHash.substr(-8)}"`
      }
    }
  }

  let updated
  function closeUpdateNotification (e) {
    if (updated) {
      if (!e.path.includes(updatedNotification)) {
          closeUpdated()
        }
    }
  }

  if (localStorage.getItem('_updating')) {
    updated = true
  }
  function closeUpdated () {
    updated = false
    localStorage.removeItem('_updating')
  }

  async function doUpdate (dontAsk) {
    localStorage.setItem('_updateCounter', _updateCounter + 1)

    if (dontAsk) {
      localStorage.setItem('_updateImmediate', true)
    }
    localStorage.setItem('_updating', true)
    updated = false
    updating = true
    const cache = await caches.open('ipfs')
    await cache.delete('/ipfs-map.json')
    await data.falcor.setValue(['_updating'], updating) // todo promise mode for set and call

    await (await navigator.serviceWorker.getRegistration()).update()
    setTimeout(() => {
      location.reload()
    }, 300)
  }

  // Updated notification with expansion to show changes and changed files, version numbers etc.
</script>

<style>
	.debugger {
		position: fixed;
    width: 2rem;
    height: 2rem;
    opacity: 0;
    padding: 6px;
    bottom: 5px;
    right: 5px;
    border-radius: 100%;
    background-color: rgb(232 232 232);
    cursor: pointer;
    box-shadow: 0 0 #0000, 0 0 #0000, 0 1px 3px 0 rgb(0 0 0 / 10%), 0 1px 2px 0 rgb(0 0 0 / 6%);
  }
  .debugger:hover, .debugger.open {
      opacity: 1;
  }
  .debug-menu {
    position: fixed;
    user-select: none;
    right: 33px;
    bottom: 49px;
  }
  .invisible {
    opacity: 0;
    visibility: hidden;
  }
</style>

<svelte:body on:mousedown|passive={closeUpdateNotification}  />

{#if newHash && !updating}
  <div aria-live="assertive" class="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-end">
    <div class="w-full flex flex-col items-center space-y-4 sm:items-end">
      <!--
        Notification panel, dynamically insert this into the live region when it needs to be displayed

        Entering: "transform ease-out duration-300 transition"
          From: "translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          To: "translate-y-0 opacity-100 sm:translate-x-0"
        Leaving: "transition ease-in duration-100"
          From: "opacity-100"
          To: "opacity-0"
      -->
      <div class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="recycle" class="svg-inline--fa fa-recycle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M160 416L80.37 416c-17.81 0-33.59-9.156-42.21-24.5c-8.406-14.94-8.109-32.63 .7969-47.28L108.6 229.6l14.02 48.41c2.031 7 8.422 11.56 15.37 11.56c1.469 0 2.969-.1875 4.453-.625c8.482-2.469 13.37-11.34 10.92-19.81l-25.17-86.94C127 178.1 124.3 174.6 120.6 172.6C116.8 170.5 112.4 170 108.4 171.2L21.46 196.4C12.97 198.9 8.084 207.8 10.54 216.2c2.453 8.5 11.33 13.5 19.82 10.94L81.67 212.3l-70.05 115.3c-14.1 24.69-15.5 54.44-1.344 79.59C24.64 432.8 50.84 448 80.37 448h79.64c8.844 0 15.1-7.156 15.1-16S168.8 416 160 416zM500.4 327.6l-38.74-63.78c-4.592-7.5-14.4-9.906-21.98-5.375c-7.547 4.594-9.951 14.44-5.359 22l38.74 63.78c8.906 14.66 9.203 32.34 .7969 47.28C465.2 406.8 449.4 416 431.6 416h-121l36.68-36.69c6.25-6.25 6.25-16.38 0-22.62s-16.37-6.25-22.62 0l-63.99 64c-6.25 6.25-6.25 16.38 0 22.62l63.99 64C327.8 510.4 331.9 512 335.1 512s8.186-1.562 11.31-4.688c6.25-6.25 6.25-16.38 0-22.62L310.6 448h121c29.53 0 55.72-15.25 70.1-40.81C515.9 382 515.4 352.3 500.4 327.6zM297.4 55.13l50.37 82.91l-45.47-13.19c-8.498-2.5-17.37 2.469-19.82 10.94s2.438 17.34 10.92 19.81l86.92 25.19c1.469 .4062 2.953 .625 4.453 .625c2.672 0 5.328-.6562 7.719-2c3.717-2.031 6.467-5.469 7.654-9.562l25.17-86.94c2.453-8.469-2.438-17.34-10.92-19.81c-8.531-2.469-17.37 2.438-19.83 10.94l-15.57 53.78L324.8 38.5C310.1 14.38 284.4 0 256 0S201.9 14.38 187.2 38.5L157.4 87.69c-4.594 7.562-2.188 17.41 5.357 22c7.531 4.562 17.4 2.125 21.98-5.375l29.89-49.19C223.4 40.63 238.9 32 256 32S288.6 40.63 297.4 55.13z"></path></svg>
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900">
                Update available
              </p>
              <p class="mt-1 text-sm text-gray-500">
                Please make sure your work is saved and update.
              </p>
              <div class="mt-3 flex space-x-7">
                <button on:click={() => doUpdate(false)} class="bg-white rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Update
                </button>
                <button on:click={() => doUpdate(true)} class="bg-white rounded-md text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Don't ask again
                </button>
              </div>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span class="sr-only">Close and Remind in 5 minutes</span>
                <!-- Heroicon name: solid/x -->
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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

{#if updated}
  {#await $data._docs[settingsDocId].buildColor$ then buildColor}
    <div bind:this={updatedNotification} aria-live="assertive" class="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start">
      <div class="w-full flex flex-col items-center space-y-4 sm:items-end">
        <!--
          Notification panel, dynamically insert this into the live region when it needs to be displayed

          Entering: "transform ease-out duration-300 transition"
            From: "translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            To: "translate-y-0 opacity-100 sm:translate-x-0"
          Leaving: "transition ease-in duration-100"
            From: "opacity-100"
            To: "opacity-0"
        -->
        <div class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p class="text-sm font-medium text-gray-900">
                  {#if !newHash}Update Successfull{:else}Update failed{/if}
                </p>

                <p class="mt-1 text-sm text-gray-500">
                {#if !newHash}
                  <!-- Your update was successful.<br><br> -->
                  <br>
                  Build: <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800" style="background-color: rgb({buildColor.r},{buildColor.g},{buildColor.b});">
                    {$data._docs[settingsDocId].buildName$}
                  </span><br>

                  System Version: {$data._docs[settingsDocId].version$}<br>
                  Hash: {installedHash.substr(-8)}<br>
                {:else}Please try clering your browser cache and reloading the page, if this does not resolve the issue, contact support. We are sorry for inconvencience!{/if}
                </p>
                <div class="mt-3 flex space-x-7">
                  <button on:click={closeUpdated} class="bg-white rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    OK
                  </button>
                  <button class="bg-white rounded-md text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Show changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/await}
{/if}

<Menu let:open let:versionTooltip>
  <div slot="menu-button" class="debugger" class:open title={versionTooltip}>
    <svg aria-hidden="true" focusable="false" data-prefix="fat" data-icon="screwdriver-wrench" class="svg-inline--fa fa-screwdriver-wrench fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M227.3 378.1c-2.385-4.816-8.733-6.089-12.54-2.288l-102.3 102.1c-21.72 21.68-57.39 23.85-79.75 2.818c-23.13-21.77-23.56-58.06-1.217-80.37l150.5-150.2c3.027-3.02 3.027-7.918 0-10.94L181.7 238.8c-3.027-3.02-7.932-3.02-10.96 .002l-148.7 148.5c-28.43 28.38-29.88 76.27-1.078 104.3C34.93 505.2 53.07 512 71.23 512c18.47 0 36.91-7.031 50.1-21.09l103.8-103.6C228.4 384.9 228.9 381.2 227.3 378.1C227.3 378.1 227.4 378.2 227.3 378.1zM222.6 76.15C225.8 80.14 231.8 80.02 234.8 75.86c19.6-27.26 48.34-47.67 81.77-55.66c16.65-3.979 41.91-7 68.42-.0703l-81.38 81.24V208h106.8l81.56-81.48c5.381 22.35 5.301 45.41-.2422 68.54c-7.352 30.67-25.18 57.46-49.19 76.83c-3.512 2.834-3.631 8.162-.4355 11.35c2.775 2.766 7.447 3.307 10.5 .8438c26.64-21.53 46.55-51.21 54.72-85.3c6.369-26.58 5.941-52.31 .2383-76c-1.84-7.641-8.664-12.07-15.66-12.07c-4.07 0-8.195 1.498-11.43 4.73L403.8 192H319.7V108l76.69-76.56c8.791-8.777 4.875-24.1-7.213-27.01C377.1 1.545 364.6 .002 351.7 0c-12.64 0-25.64 1.484-38.85 4.641c-37.16 8.873-69.25 31.49-91.1 61.71C219.8 69.13 219.9 72.98 222.1 75.61C222.3 75.79 222.4 75.97 222.6 76.15zM63.22 432c0 8.836 7.176 16 16.03 16s16.03-7.164 16.03-16c0-8.838-7.178-16-16.03-16S63.22 423.2 63.22 432zM385.3 271.6c-29.41-29.38-75.94-30.82-107.5-5.082L200 188.7V101c0-2.5-1.172-4.844-3.156-6.375l-122-92.1c-3.141-2.438-7.656-2.125-10.5 .7187l-62 61.1C-.4844 67.2-.7969 71.67 1.641 74.86l93.01 121.1c1.516 2 3.859 3.156 6.359 3.156h87.69l77.79 77.79c-25.77 31.55-24.32 78.08 5.086 107.5l113.7 113.8C393.9 507.7 405.3 512 416.6 512s22.64-4.312 31.24-12.91l51.27-51.25c17.17-17.19 17.17-45.25 .0313-62.56L385.3 271.6zM184 184H104.1L18.61 70.73l52.11-52.12l113.3 86.37V184zM487.8 436.5l-51.27 51.25c-10.98 10.97-28.92 10.94-39.96-.0313l-113.7-113.8c-25.1-25.12-25.1-65.97 0-91.09c25.12-25.06 65.97-25.06 91.1 0l113.8 113.7C498.7 407.6 498.8 425.6 487.8 436.5z"></path></svg>
  </div>

  <!-- Entering: "transition ease-out duration-100"
      From: "transform opacity-0 scale-95"
      To: "transform opacity-100 scale-100"
    Leaving: "transition ease-in duration-75"
      From: "transform opacity-100 scale-100"
      To: "transform opacity-0 scale-95" -->

  <div slot="menu" role="menu" class:invisible={!open} class:visible={open} class="debug-menu mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
    <div class="py-1" role="none">
      <!-- Active: "bg-gray-100 text-gray-900", Not Active: "text-gray-700" -->
      <a href="#/todo" class="text-gray-700 group flex items-center px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-0">
        <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
          <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
        </svg>
        App Dashboard
      </a>
      <a href="#/todo" class="text-gray-700 group flex items-center px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-1">
        <!-- Heroicon name: solid/duplicate -->
        <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
          <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
        </svg>
        Tests
      </a>
    </div>
    <div class="py-1" role="none">
      <a href="#/todo" class="text-gray-700 group flex items-center px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-2">
        <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
          <path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd" />
        </svg>
        Versions
      </a>
      <a href="#/todo" class="text-gray-700 group flex items-center px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-3">
        <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
        </svg>
        Purge Now
      </a>
    </div>
    <div class="py-1" role="none">
      <a href="#/todo" class="text-gray-700 group flex items-center px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-4">
        <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
        </svg>
        All Routes
      </a>
      <a href="#/todo" class="text-gray-700 group flex items-center px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-5">
        <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
        </svg>
        Manage Dependencies
      </a>
    </div>
    <div class="py-1" role="none">
      <a href="#/todo" class="text-gray-700 group flex items-center px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-6">
        <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        Get Info
      </a>
    </div>
  </div>
</Menu>