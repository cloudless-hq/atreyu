<script>
  import Menu from '/_ayu/src/components/menu.svelte'
  import trans from '/_ayu/src/class-transition.js'
  import data from '/_ayu/src/store/data.js'

  const settingsDoc = $data._docs['_local/ayu'].$

  $: console.log(settingsDoc)

  function toggle (key) {
    localStorage.setItem('ayu_' + key, !JSON.parse(localStorage.getItem('ayu_' + key) || 'true'))
    location.reload()
  }

  let preload = localStorage.getItem('ayu_preload') === null ? true : JSON.parse(localStorage.getItem('ayu_preload'))
  let updateImmediate = localStorage.getItem('ayu_updateImmediate') === null ? true : JSON.parse(localStorage.getItem('ayu_updateImmediate'))
  let verbose = localStorage.getItem('ayu_verbose') === null ? true : JSON.parse(localStorage.getItem('ayu_verbose'))
  let logging = localStorage.getItem('ayu_logging') === null ? true : JSON.parse(localStorage.getItem('ayu_logging'))
  let batching = localStorage.getItem('ayu_batching') === null ? true : JSON.parse(localStorage.getItem('ayu_batching'))

  let showDevMenu = false
  document.addEventListener('keydown', e => {
    if (e.key === 'Alt') {
      showDevMenu = true
    }
  })
  document.addEventListener('keyup', e => {
    if (e.key === 'Alt') {
      showDevMenu = false
    }
  })
</script>

<style lang="postcss">
	.debugger {
		position: fixed;
    width: 2.5rem;
    height: 2.5rem;
    /* opacity: 0; */
    padding: 10px;
    bottom: 9px;
    right: 11px;
    border-radius: 100%;
    backdrop-filter: saturate(180%) blur(2px);
    background: hsla(0, 0%, 100%, 0.3);
    cursor: pointer;
    box-shadow: 1px 1px 9px #a7a7a7;
  }
  /* .debugger:hover, .debugger.open {
    opacity: 1;
  } */
  .debugger.disabled {
    display: none;
  }
  .debug-menu {
    backdrop-filter: saturate(180%) blur(5px);
    background: hsla(0, 0%, 100%, 0.8);
    position: fixed;
    user-select: none;
    right: 39px;
    bottom: 56px;
  }

  a[role=menuitem], div[role=menuitem] {
    cursor: pointer;
  }

  :global(.debug-menu.menu-in) {
    @apply ease-out duration-200 opacity-100 scale-100;
  }

  :global(.debug-menu.menu-out) {
    @apply ease-in duration-75 opacity-0 scale-95;
  }
</style>

<Menu let:open let:versionTooltip>
  <div slot="menu-button" class="debugger" class:open class:disabled={!showDevMenu && !open} title={versionTooltip}>
    <svg aria-hidden="true" focusable="false" data-prefix="fat" data-icon="screwdriver-wrench" class="svg-inline--fa fa-screwdriver-wrench fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M227.3 378.1c-2.385-4.816-8.733-6.089-12.54-2.288l-102.3 102.1c-21.72 21.68-57.39 23.85-79.75 2.818c-23.13-21.77-23.56-58.06-1.217-80.37l150.5-150.2c3.027-3.02 3.027-7.918 0-10.94L181.7 238.8c-3.027-3.02-7.932-3.02-10.96 .002l-148.7 148.5c-28.43 28.38-29.88 76.27-1.078 104.3C34.93 505.2 53.07 512 71.23 512c18.47 0 36.91-7.031 50.1-21.09l103.8-103.6C228.4 384.9 228.9 381.2 227.3 378.1C227.3 378.1 227.4 378.2 227.3 378.1zM222.6 76.15C225.8 80.14 231.8 80.02 234.8 75.86c19.6-27.26 48.34-47.67 81.77-55.66c16.65-3.979 41.91-7 68.42-.0703l-81.38 81.24V208h106.8l81.56-81.48c5.381 22.35 5.301 45.41-.2422 68.54c-7.352 30.67-25.18 57.46-49.19 76.83c-3.512 2.834-3.631 8.162-.4355 11.35c2.775 2.766 7.447 3.307 10.5 .8438c26.64-21.53 46.55-51.21 54.72-85.3c6.369-26.58 5.941-52.31 .2383-76c-1.84-7.641-8.664-12.07-15.66-12.07c-4.07 0-8.195 1.498-11.43 4.73L403.8 192H319.7V108l76.69-76.56c8.791-8.777 4.875-24.1-7.213-27.01C377.1 1.545 364.6 .002 351.7 0c-12.64 0-25.64 1.484-38.85 4.641c-37.16 8.873-69.25 31.49-91.1 61.71C219.8 69.13 219.9 72.98 222.1 75.61C222.3 75.79 222.4 75.97 222.6 76.15zM63.22 432c0 8.836 7.176 16 16.03 16s16.03-7.164 16.03-16c0-8.838-7.178-16-16.03-16S63.22 423.2 63.22 432zM385.3 271.6c-29.41-29.38-75.94-30.82-107.5-5.082L200 188.7V101c0-2.5-1.172-4.844-3.156-6.375l-122-92.1c-3.141-2.438-7.656-2.125-10.5 .7187l-62 61.1C-.4844 67.2-.7969 71.67 1.641 74.86l93.01 121.1c1.516 2 3.859 3.156 6.359 3.156h87.69l77.79 77.79c-25.77 31.55-24.32 78.08 5.086 107.5l113.7 113.8C393.9 507.7 405.3 512 416.6 512s22.64-4.312 31.24-12.91l51.27-51.25c17.17-17.19 17.17-45.25 .0313-62.56L385.3 271.6zM184 184H104.1L18.61 70.73l52.11-52.12l113.3 86.37V184zM487.8 436.5l-51.27 51.25c-10.98 10.97-28.92 10.94-39.96-.0313l-113.7-113.8c-25.1-25.12-25.1-65.97 0-91.09c25.12-25.06 65.97-25.06 91.1 0l113.8 113.7C498.7 407.6 498.8 425.6 487.8 436.5z"></path></svg>
  </div>

  <div
    slot="menu"
    role="menu"
    in:trans="{{ duration: 200, addClasses: 'menu-in', removeClasses: 'menu-out' }}"
    out:trans="{{ duration: 75, addClasses: 'menu-out', removeClasses: 'menu-in' }}"
    class="debug-menu mt-2 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
    <div class="py-1" role="none">
      <div class="text-gray-700 group flex items-center px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-0" on:mousedown={() => { toggle('preload') }}>
        <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
          <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
        </svg>

        {preload ? 'Disable' : 'Enable'} Preloading
      </div>

      <div class="text-gray-700 group flex items-center px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-1" on:mousedown={() => { toggle('logging') }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>

        {logging ? 'Disable' : 'Enable'} Router Logging
      </div>

      {#if logging}
        <div class="text-gray-700 group flex items-center px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-1" on:mousedown={() => { toggle('verbose') }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>

          {verbose ? 'Disable' : 'Enable'} Verbose Logging
        </div>
      {/if}

      <div class="text-gray-700 group flex items-center px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-1" on:mousedown={() => { toggle('updating') }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>

        {updateImmediate ? 'Disable' : 'Enable'} Auto Updating
      </div>

      <div class="text-gray-700 group flex items-center px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-1" on:mousedown={() => { toggle('batching') }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122" />
        </svg>

        {batching ? 'Disable' : 'Enable'} Request Batching
      </div>
    </div>

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
        Restart Service Worker
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

<!-- disable/ enable preloading
show key names instead of data
disable/ enable logging
run tests -->

<!--
<script>
	import { onMount } from  'svelte/internal.js'
	let ipfsHash = ''
	let show = false

	onMount(async () => {
		ipfsHash = await (await fetch('/ipfsHash')).text()
	})
</script>

<style>
	.dev-tool {
		position: fixed;
		bottom: 0;
		right: 0;
	}
	.version {
		cursor: pointer;
		font-size: 13px;
		color: rgba(0, 0, 0, .2);
		margin: 8px;
		z-index: 9;
		bottom: 0;
		right: 0;
	}
	.pane {
		padding: 20px;
		margin: 8px;
    background: #00000094;
    border-radius: 20px;
	}
</style>

<div class="dev-tool">
	{#if show}
		<div class="pane">
			Hi
		</div>
	{/if}

	<div class="version" on:mousedown={() => show = !show}>{'release: ' + ipfsHash.slice(-6)}</div>
</div> -->
