<script>
    import Menu from '/atreyu/src/components/menu.svelte'
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
    disable/ enable preloading
    show key names instead of data
    disable/ enable logging
    run tests
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

	<div class="version" on:click={() => show = !show}>{'release: ' + ipfsHash.slice(-6)}</div>
</div> -->
