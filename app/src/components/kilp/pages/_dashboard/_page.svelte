<script>
  import { onMount, getContext } from 'svelte'

  import { formatBytes } from '/_ayu/src/lib/helpers.js'
  import Domain from './domain.svelte'
  const ctx = getContext('ayu')
  const router = ctx.router
  const dataStore = ctx.data

  let data = {}
  let primaryHost
  $: settings = $dataStore._docs['system:settings$']
 
  onMount(async () => {
    data = await (await fetch('/__ayu_data')).json()
    primaryHost = (await $dataStore._docs['system:settings$promise'])?.hostname
  })

  const groupConf = {
    google: ['www.google.com', 'www.google.ee', 'www.gstatic.com', 'ajax.googleapis.com', 'apis.google.com'],

    storage: ['storage.googleapis.com'],

    auth: ['accounts.google.com'],

    tagmanager: ['www.googletagmanager.com'],

    ads: ['stats.g.doubleclick.net'],

    algolia: ['insights.algolia.io', '3ta8nt85xj-dsn.algolia.net'],

    monitoring: ['eum-eu-west-1.instana.io', 'eum.instana.io'],

    consent: ['geolocation.onetrust.com', 'cdn.cookielaw.org', 'privacyportal.onetrust.com'],

    analytics: ['api.mixpanel.com', 'cdn.mxpnl.com',  'www.google-analytics.com',],

    webfonts: ['p.typekit.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'site-assets.fontawesome.com', 'use.typekit.net']
  }

  const commonHeaders = new Set([
    'if-modified-since',
    'user-agent',
    'accept',
    'accept-encoding',
    'accept-language',
    'cache-control',
    'connection',
    'cookie',
    'host',
    'range',
    'pragma',
    'upgrade-insecure-requests',
    'forwarded',
    'priority',
    'x-via',
    'content-length',
    'content-type',
    'sec-fetch-site',
    'sec-fetch-mode',
    'sec-fetch-dest',
    'if-none-match'
  ])

  $: groups = Object.entries(groupConf)
    .map(([groupName, groupDomains]) => {
      return [
        groupName,
        groupDomains.map(domain => ({ domain, value: data[domain], archived: settings?.domainSettings?.[domain]?.archived })).filter(a => a.value && !a.archived)
      ]
    })

  const grouped = new Set(Object.values(groupConf).flatMap(a => a))

  function displayMimeType (mimetype) {
    if (!mimetype) {
      return '?'
    }
    const cleaned = mimetype.split(';')[0]
    if (cleaned.startsWith('font/')) {
      return 'font'
    }
    if (cleaned.startsWith('video/')) {
      return 'video'
    }
    return cleaned.replace('application/', '').replace('/plain', '').replace('text/', '')
  }

  const removedPaths = {}
  async function remove (doc) {
    const latestDoc = await $dataStore._docs[doc._id ].$promise
    latestDoc._deleted = true
    $dataStore._docs[latestDoc._id] = latestDoc
  }

  async function devmode (doc) {
    const latestDoc = await $dataStore._docs[doc._id ].$promise
    latestDoc.devmode = !latestDoc.devmode
    $dataStore._docs[latestDoc._id] = latestDoc
  }

  async function block (doc) {
    const latestDoc = await $dataStore._docs[doc._id].$promise
    latestDoc.blocked = "404"
    $dataStore._docs[latestDoc._id] = latestDoc
  }

  async function lock (doc) {
    const latestDoc = await $dataStore._docs[doc._id].$promise
    latestDoc.locked = !latestDoc.locked
    $dataStore._docs[latestDoc._id] = latestDoc
  }

  async function archive (doc) {
    const latestDoc = await $dataStore._docs[doc._id].$promise
    latestDoc.archived = !latestDoc.archived
    $dataStore._docs[latestDoc._id] = latestDoc
  }

  let editingDoc = null
  async function edit (doc) {
    const latestDoc = await $dataStore._docs[doc._id].$promise
    editingDoc = JSON.stringify(latestDoc, null, 4)
    // latestDoc.archived = !latestDoc.archived
    // $dataStore._docs[latestDoc._id] = latestDoc
  }

  async function save (docString) {
    const latestDoc = JSON.parse(docString)
    $dataStore._docs[latestDoc._id] = latestDoc
    editingDoc = null
  }
</script>

{#if $router.domains?.domain}
  <header class="pb-8">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:flex xl:items-center xl:justify-between">
      <div class="min-w-0 flex-1">
        <a href="/_dashboard/" class="inline-flex text-gray-900 items-center pb-2">
          <div class=" flex-shrink-0" style="width: 32px; height: 32px;"><svg fill="none" width="100%" height="100%" viewBox="0 0 32 32"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.3316 23.5314C11.7067 24.1562 10.6937 24.1562 10.0688 23.5314L3.66883 17.1314C3.04399 16.5065 3.04399 15.4935 3.66883 14.8686L10.0688 8.46863C10.6937 7.84379 11.7067 7.84379 12.3316 8.46863C12.9564 9.09347 12.9564 10.1065 12.3316 10.7314L8.66294 14.4L27.2002 14.4C28.0839 14.4 28.8002 15.1163 28.8002 16C28.8002 16.8837 28.0839 17.6 27.2002 17.6L8.66294 17.6L12.3316 21.2686C12.9564 21.8935 12.9564 22.9065 12.3316 23.5314Z" fill="currentColor"></path></svg></div>
          <h1 class="ml-3 text-3xl leading-tight font-bold">Resources for</h1>
        </a>

        <h1 class="mt-2 text-xl font-bold leading-7 text-gray-700 sm:truncate sm:text-2xl sm:tracking-tight mb-1">
          {#if data[$router.domains?.domain]?.favicon}
            <img src="{data[$router.domains?.domain]?.favicon}" alt="Domain Icon" style="width: 16px; height: 16px; margin-right: 7px; display: inline-block; border-radius: 2px;">
          {/if}

          {$router.domains.domain}
        </h1>

        <div class="mt-1 flex sm:mt-0 flex-row sm:flex-wrap sm:space-x-8">
          <!-- <div class="mt-2 flex items-center text-sm text-gray-600">
            <svg class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 016 4.193V3.75zm6.5 0v.325a41.622 41.622 0 00-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25zM10 10a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V11a1 1 0 00-1-1H10z" clip-rule="evenodd" />
              <path d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686a41.454 41.454 0 01-9.274 0C3.985 17.585 3 16.402 3 15.055z" />
            </svg>
            Google LLC
          </div>
          <div class="mt-2 flex items-center text-sm text-gray-600">
            <svg class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
            </svg>
            USA
          </div> -->
          <div class="mt-2 flex items-center text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400">
              <path d="M3 3.5A1.5 1.5 0 014.5 2h6.879a1.5 1.5 0 011.06.44l4.122 4.12A1.5 1.5 0 0117 7.622V16.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 16.5v-13z" />
            </svg>

            {Object.keys(data[$router.domains?.domain]?.paths || {}).length} Paths
          </div>

          <!-- <div class="mt-2 flex items-center text-sm text-gray-600">
            <svg class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd" />
            </svg>
            First Seen: January 9, 2020
          </div> -->
        </div>
      </div>

      <!-- <div class="mt-5 flex xl:mt-0 xl:ml-4">
        <span class="hidden sm:block">
          <button type="button" class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
            </svg>
            Edit
          </button>
        </span>

        <span class="ml-3 hidden sm:block">
          <button type="button" class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
              <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
            </svg>
            View
          </button>
        </span>

        <div class="sm:ml-3">
          <label id="listbox-label" for="pub-btn" class="sr-only">Change published status</label>

          <div class="relative">
            <div class="inline-flex divide-x divide-purple-600 rounded-md shadow-sm">
              <div class="inline-flex divide-x divide-purple-600 rounded-md shadow-sm">
                <div class="inline-flex items-center rounded-l-md border border-transparent bg-purple-500 py-2 pl-3 pr-4 text-white shadow-sm">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                  </svg>
                  <p class="ml-2.5 text-sm font-medium">Published</p>
                </div>
                <button type="button" id="pub-btn" class="inline-flex items-center rounded-l-none rounded-r-md bg-purple-500 p-2 text-sm font-medium text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50" aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
                  <span class="sr-only">Change published status</span>
                  <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <
              Select popover, show/hide based on select state.

              Entering: ""
                From: ""
                To: ""
              Leaving: "transition ease-in duration-100"
                From: "opacity-100"
                To: "opacity-0"
            >

            <ul class="absolute left-0 z-10 mt-2 -mr-1 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:left-auto sm:right-0" tabindex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-0">

                Select option, manage highlight styles based on mouseenter/mouseleave and keyboard navigation.

                Highlighted: "text-white bg-purple-500", Not Highlighted: "text-gray-900"

              <li class="text-gray-900 cursor-default select-none p-4 text-sm" id="listbox-option-0" role="option">
                <div class="flex flex-col">
                  <div class="flex justify-between">
                    Selected: "font-semibold", Not Selected: "font-normal"
                    <p class="font-normal">Published</p>

                      Checkmark, only display for selected option.

                      Highlighted: "text-white", Not Highlighted: "text-purple-500"

                    <span class="text-purple-500">

                      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  Highlighted: "text-purple-200", Not Highlighted: "text-gray-500"
                  <p class="text-gray-500 mt-2">This job posting can be viewed by anyone who has the link.</p>
                </div>
              </li>

              More items...
            </ul>
          </div>
        </div>

        <div class="relative ml-3 sm:hidden">
          <button type="button" class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2" id="mobile-menu-button" aria-expanded="false" aria-haspopup="true">
            More
            <svg class="-mr-1 ml-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
            </svg>
          </button>

          <
            Dropdown menu, show/hide based on menu state.

            Entering: "transition ease-out duration-200"
              From: "transform opacity-0 scale-95"
              To: "transform opacity-100 scale-100"
            Leaving: "transition ease-in duration-75"
              From: "transform opacity-100 scale-100"
              To: "transform opacity-0 scale-95"
          >
          <div class="absolute right-0 z-10 mt-2 -mr-1 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="mobile-menu-button" tabindex="-1">
            < Active: "bg-gray-100", Not Active: "" >
            <a href="#tbd" rel="no-preload" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="mobile-menu-item-0">Edit</a>
            <a href="#tbd" rel="no-preload" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="mobile-menu-item-1">View</a>
          </div>
        </div>
      </div> -->
    </div>
  </header>
{/if}

{#if editingDoc}
  <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <!--
      Background backdrop, show/hide based on modal state.

      Entering: "ease-out duration-300"
        From: "opacity-0"
        To: "opacity-100"
      Leaving: "ease-in duration-200"
        From: "opacity-100"
        To: "opacity-0"
    -->
    <div class="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true"></div>

    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <!--
          Modal panel, show/hide based on modal state.

          Entering: "ease-out duration-300"
            From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            To: "opacity-100 translate-y-0 sm:scale-100"
          Leaving: "ease-in duration-200"
            From: "opacity-100 translate-y-0 sm:scale-100"
            To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        -->
        <div class="relative transform overflow-hidden rounded-lg bg-white px-2 pb-3 pt-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div>
            <label for="comment" class="block text-sm/6 font-medium text-gray-900">Change the Path Configuration</label>
            <div class="mt-2">
              <textarea bind:value={ editingDoc } rows="20" name="comment" id="comment" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"></textarea>
            </div>
          </div>

          <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button type="button" class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2" on:click={() => { save(editingDoc)}}>Save</button>
            <button type="button" on:click={() => { editingDoc = false}} class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<div class="pb-10">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 gap-4">
      {#if !$router.domains}
        <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900">Domain Overview</h1>

        {#if data && primaryHost}
          <h2 class="truncate text-base capitalize font-medium leading-7 text-slate-900"><a href="#component" rel="no-preload">Main Site</a></h2>

          <Domain key={primaryHost} value={data[primaryHost]}></Domain>
        {/if}

        {#each groups as [groupName, gEntries]}
          {#if gEntries.length}
            <h2 class="truncate text-base capitalize font-medium leading-7 text-slate-900"><a href="#component" rel="no-preload">{groupName}</a></h2>
          {/if}

          {#each gEntries as gEntry}
            <Domain key={gEntry.domain} value={gEntry.value}></Domain>
          {/each}
        {/each}

        {#each Object.entries(data).filter(([key, value]) => !grouped.has(key) && !value.primaryHost && !settings?.domainSettings[key]?.archived ) as [key, value], i}
          {#if i === 0}
            <h2 class="truncate text-base capitalize font-medium leading-7 text-slate-900"><a href="#component" rel="no-preload">Others</a></h2>
          {/if}
          <Domain {key} {value}></Domain>
        {/each}

        {#each Object.entries(data).filter(([key]) => settings?.domainSettings[key]?.archived) as [key, value], i}
          {#if i === 0}
            <h2 class="truncate text-base capitalize font-medium leading-7 text-slate-900"><a href="#component" rel="no-preload">Archived</a></h2>
          {/if}
          <Domain {key} {value}></Domain>
        {/each}
      {/if}

      {#if $router.domains?.domain}
        {#each Object.entries(data[$router.domains.domain]?.httpCookies || {}).sort() as [key, value], i}
          {#if i === 0}
            <h2 class="truncate text-base font-medium leading-7 text-slate-900"><a href="/#/cookies" rel="no-preload">HTTP Cookies</a></h2>
          {/if}

          <div class="bg-light-100 rounded-lg border border-gray-300 py-3 px-6 h-12 truncate">
            <div class="font-medium inline">{key}</div> = {value}
          </div>
        {/each}

        {#each Object.entries(data[$router.domains.domain]?.jsCookies || {}).sort() as [key, value], i}
          {#if i === 0}
            <h2 class="truncate text-base font-medium leading-7 text-slate-900"><a href="/#/cookies" rel="no-preload">JS Cookies</a></h2>
          {/if}

          <div class="bg-light-100 rounded-lg border border-gray-300 py-3 px-6 h-12 truncate">
            <div class="font-medium inline">{key}</div> = {value}
          </div>
        {/each}

        {#each Object.entries(data[$router.domains.domain]?.reqHeaders || {}).sort().filter(([key]) => !commonHeaders.has(key)) as [key, value], i}
          {#if i === 0}
            <h2 class="truncate text-base font-medium leading-7 text-slate-900"><a href="/#/cookies" rel="no-preload">Extra Request Headers</a></h2>
          {/if}
          <div class="bg-light-100 rounded-lg border border-gray-300 py-3 px-6 h-12 truncate">
            <div class="font-medium inline">{key}</div> = {value}
          </div>
        {/each}

        <h2 class="truncate text-base font-medium leading-7 text-slate-900"><a href="/#/paths" rel="no-preload">Paths</a></h2>
        {#each Object.keys(data[$router.domains.domain]?.paths || {}).sort((a, b) => {
          const lockedA  = data[$router.domains.domain]?.paths[a].locked || data[$router.domains.domain]?.paths[a].archived
          const lockedB  = data[$router.domains.domain]?.paths[b].locked || data[$router.domains.domain]?.paths[b].archived
          
          if (lockedA && !lockedB) {
            return 1
          } else if (!lockedA && lockedB) {
            return -1
          }

          if (a.length > b.length) {
            return 1
          } else if (a.length < b.length) {
            return -1
          }
         
          if (a < b) {
            return -1
          }
            
          if ( a > b) {
            return 1
          }
          return 0
        }) as path}
          {#if !removedPaths[$router.domains.domain + path]}
            <div class="group bg-light-100 rounded-lg border border-gray-300 py-3 px-6 h-12 truncate" style="direction: rtl;text-align: left;">
              <div class="actionButtons absolute mr-14">
                <button type="button" class="invisible group-hover:visible rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" on:click={() => { remove(data[$router.domains.domain]?.paths[path]); removedPaths[$router.domains.domain + path] = true; }}>Delete</button>

                <button type="button" class="invisible group-hover:visible rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" on:click={() => { block(data[$router.domains.domain]?.paths[path]) }}>Block</button>

                <button type="button" class="invisible group-hover:visible rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" on:click={() => { lock(data[$router.domains.domain]?.paths[path]) }}>Lock</button>

                <button type="button" class="invisible group-hover:visible rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" on:click={() => { devmode(data[$router.domains.domain]?.paths[path]) }}>Devmode</button>

                <button type="button" class="invisible group-hover:visible rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" on:click={() => { archive(data[$router.domains.domain]?.paths[path]) }}>Archive</button>

                <button type="button" class="invisible group-hover:visible rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" on:click={()=>{ edit(data[$router.domains.domain]?.paths[path]) }}>Edit</button>
              </div>

              {#if data[$router.domains.domain]?.paths[path].isImage}
                <img src="{data[$router.domains.domain].primaryHost ? '' : 'https://' + $router.domains.domain}{data[$router.domains.domain]?.paths[path].examplePath}" alt="asset preview" class="h-8 inline-block -mt-1 ml-3 float-right hover:bg-gray-200 hover:rounded-md" />
              {:else if data[$router.domains.domain]?.paths[path].contentType.includes('json')}
                <div class="h-8 inline-block -mt-1 ml-3 float-right flex-shrink-0 flex items-center justify-center p-2 bg-blue-300 text-white text-sm font-xs rounded-md">{displayMimeType(data[$router.domains.domain]?.paths[path].contentType)}</div>
              {:else if data[$router.domains.domain]?.paths[path].contentType.includes('html')}
                <div class="h-8 inline-block -mt-1 ml-3 float-right flex-shrink-0 flex items-center justify-center p-2 bg-orange-300 text-white text-sm font-xs rounded-md">{displayMimeType(data[$router.domains.domain]?.paths[path].contentType)}</div>
              {:else if data[$router.domains.domain]?.paths[path].contentType.includes('javascript')}
                <div class="h-8 inline-block -mt-1 ml-3 float-right flex-shrink-0 flex items-center justify-center p-2 bg-yellow-300 text-white text-sm font-xs rounded-md">{displayMimeType(data[$router.domains.domain]?.paths[path].contentType)}</div>
              {:else }
                <div class="h-8 inline-block -mt-1 ml-3 float-right flex-shrink-0 flex items-center justify-center p-2 bg-gray-300 text-white text-sm font-xs rounded-md">{displayMimeType(data[$router.domains.domain]?.paths[path].contentType)}</div>
              {/if}

              {#each data[$router.domains.domain]?.paths[path].statuses as status}
                {#if status !== 200 && status !== 304}
                  <div class="inline-flex items-baseline px-2 py-0.5 ml-2 rounded-full text-xs font-medium bg-orange-100 text-orange-800 float-right">{status}</div>
                {/if}
              {/each}

              {#each data[$router.domains.domain]?.paths[path].methods as method}
                {#if method !== 'GET'}
                  <div class="inline-flex items-baseline px-2 py-0.5 ml-2 rounded-full text-xs font-medium bg-purple-100 text-purple-800 float-right">{method}</div>
                {/if}
              {/each}

              {#if data[$router.domains.domain]?.paths[path].blocked}
                  <div class="inline-flex items-baseline px-2 py-0.5 ml-2 rounded-full text-xs font-medium bg-red-100 text-red-800 float-right">blocked</div>
              {/if}

              {#if data[$router.domains.domain]?.paths[path].devmode}
                  <div class="inline-flex items-baseline px-2 py-0.5 ml-2 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 float-right">dev mode</div>
              {/if}

              {#if data[$router.domains.domain]?.paths[path].locked}
                  <div class="inline-flex items-baseline px-2 py-0.5 ml-2 rounded-full text-xs font-medium bg-orange-100 text-orange-800 float-right">locked</div>
              {/if}

              <bdi>{@html path.split('/').map(part => {
                if (part.includes(':') || part.includes('*')) {
                  return `<div class="inline bg-gray-200 px-1 rounded-md truncate">${part}</div>`
                }
                return part
              }).join('<div class="font-bold inline-block mx-[3px] text-gray-400">/</div>')} ({data[$router.domains.domain]?.paths[path].contentLength ? formatBytes(data[$router.domains.domain]?.paths[path].contentLength) + ', ' : ''}{data[$router.domains.domain]?.paths[path].reqs?.length || 0} reqs)</bdi>
            </div>
          {/if}
        {/each}
      {/if}
    </div>
  </div>
</div>
