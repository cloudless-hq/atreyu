<script>
  import { fromNow, formatTime } from '/_ayu/src/lib/helpers.js'
  import { getContext } from 'svelte'
  const { data } = getContext('ayu')

  $: settings = $data._docs['system:settings$']

  export let key = ''
  export let value = {}
  $: numCookies = Object.keys(value?.httpCookies|| []).length + Object.keys(value?.jsCookies|| []).length

  function block() {
    settings.domainSettings ??= {}
    settings.domainSettings[key] ??= {}

    settings.domainSettings[key].blocked = settings.domainSettings[key].blocked  ? false : '404' 
    $data._docs['system:settings'] = settings
  }

  function snapshot() {
    settings.domainSettings ??= {}
    settings.domainSettings[key] ??= {}

    settings.domainSettings[key].snapshot = !settings.domainSettings[key].snapshot
    $data._docs['system:settings'] = settings
  }

  function lock() {
    settings.domainSettings ??= {}
    settings.domainSettings[key] ??= {}

    settings.domainSettings[key].locked = !settings.domainSettings[key].locked
    $data._docs['system:settings'] = settings
  }

  function archive() {
    // FIXME: simplify this with proxy and auto object creation
    settings.domainSettings ??= {}
    settings.domainSettings[key] ??= {}

    settings.domainSettings[key].archived = !settings.domainSettings[key].archived
    $data._docs['system:settings'] = settings
  }
</script>

<style>
  .last-seen .from-now, .last-seen:hover .time-format {
    display: inline-block;
  }
  .last-seen:hover .from-now, .last-seen .time-format {
    display: none;
  }
</style>

<div class="relative flex group items-center space-x-20 rounded-lg border border-gray-300 bg-white px-6 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">

  <div class="min-w-0 w-3/5">
    <div class="flex-shrink-0 inline-block mb-[5px] mr-4">
    </div>

    <a href="#/domains/{key}" rel="no-preload" class="focus:outline-none inline-block">
      <span class="absolute inset-0" aria-hidden="true"></span>

      {#if value.favicon}
        <img src="{value.favicon}" alt="Domain Icon" style="width: 16px; height: 16px; position: absolute; left: 13px; top: 11px; border-radius: 2px;">
      {/if}

      <p class="truncate text-left font-medium text-sm text-gray-900">{key}</p>

      <div class="text-sm text-left text-gray-500">
        {#if value.lastSeen}
          <div class="last-seen">Last Seen:
            <div class="from-now">{fromNow(value.lastSeen)}</div>
            <div class="time-format">{formatTime(value.lastSeen)}</div>
          </div>
        {/if}

        {#if value.firstSeen}
          <div class="last-seen">First Seen:
            <div class="from-now">{fromNow(value.firstSeen)}</div>
            <div class="time-format">{formatTime(value.firstSeen)}</div>
          </div>
        {/if}
      </div>
    </a>
  </div>

  <div class="min-w-0">
    <p class="truncate text-left text-sm text-gray-500">{Object.keys(value?.paths || []).length} Paths</p>
    <p class="truncate text-left text-sm text-gray-500">
      {#if numCookies}
        {numCookies} Cookies
      {/if}
    </p>
  </div>

  {#if settings?.domainSettings?.[key]?.blocked}
    <span class="absolute top-2 right-2 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">blocked</span>
  {/if}

  {#if settings?.domainSettings?.[key]?.locked}
    <span class="absolute top-2 right-2 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">locked</span>
  {:else if settings?.domainSettings?.[key]?.snapshot}
    <span class="absolute top-2 right-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">snapshot</span>
  {/if}

  <!-- <span class="absolute top-2 right-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">current session</span> -->

  <div class="min-w-0 absolute">
    <!-- // remove(data[$router.domains.domain]?.paths[path]); removedPaths[$router.domains.domain + path] = true;  -->
    <!-- <button title="Delete Session" class=" right-3 invisible group-hover:visible m-1 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Remove">
      <span class="sr-only">Remove</span>
      <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
    </button> -->
  
    <button type="button" class="invisible  group-hover:visible rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" on:click={block}>Block</button>
  
    <button type="button" class="invisible  group-hover:visible rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" on:click={archive}>Archive</button>
  
    <button type="button" class="invisible  group-hover:visible rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" on:click={()=>{ console.log(key, value)}}>Log</button>

    <button type="button" class="invisible  group-hover:visible rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" on:click={snapshot}>Snapshot</button>

    <button type="button" class="invisible  group-hover:visible rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" on:click={lock}>Lock</button>
  </div>
  
</div>
