<script>
  import { fade } from '/svelte/transition'
  import { setContext } from 'svelte'
  import { formatBytes } from '/_ayu/src/lib/helpers.js'

  import Login from './login.svelte'
  import Sessions from './sessions.svelte'
  import Users from './users.svelte'
  import UserMenu from '/_ayu/src/components/user-menu.svelte'
  import Accounts from './accounts.svelte'
	import makeRouterStore from '/_ayu/src/store/router.js'
  import makeDataStore from '/_ayu/src/store/data.js'

  const data = makeDataStore()
  const router = makeRouterStore({ dataStore: data })

  setContext('ayu', { data, router })

  $: newUser = ($router.hash === '#new')

  let localDbNames
  let dataUsage
  async function loadLocalDbs () {
    try {
      const dbs = await indexedDB.databases()
      localDbNames = dbs
        .filter(({ name }) => name?.startsWith('_ayu_') && !name?.includes('-mrview'))
        .map(({ name }) => name?.replace('_ayu_', ''))
    } catch (err) {
       console.error(err)
       localDbNames = []
    }

    if (typeof navigator.storage.estimate === 'function') {
      const { quota, usage, usageDetails } = await navigator.storage?.estimate()
      const percent = Math.floor((usage / quota) * 100)
      const localFiles = formatBytes(usageDetails.caches + usageDetails.serviceWorkerRegistrations)
      const localDocs = formatBytes(usageDetails.indexedDB)

      dataUsage = {
        quota,
        usage,
        percent,
        localFiles,
        localDocs
      }
    }
  }
  if ($router.hash !== '#/sessions' && $router.hash !== '#/users') {
    loadLocalDbs()
  }


  let userData
  function doLoginUser ({ sessionId, email, org }) {
    userData = { sessionId, email, org }
  }

  let view = ''
  $: {
    if ($router.hash === '#/sessions') {
      view = 'sessions'
    } else if ($router.hash === '#/users') {
      view = 'users'
    } else if (localDbNames && (localDbNames?.length === 0 || userData || newUser)) {
      view = 'login'
    } else if (localDbNames) {
      view = 'accounts'
    }
  }
</script>

<style lang="postcss">
  :global(body) {
    @apply bg-gray-100;
  }
	.app {
		text-align: center;
	}
  .storage-footer {
    bottom: 0;
    position: fixed;
    margin-bottom: 16px;
    font-size: 13px;
    margin-right: 21px;
    color: rgba(65, 65, 65, 0.569);
    right: 0;
    text-align: right;
  }
  :global(.ayu-header) {
    position: fixed;
    z-index: 100000;
    height: 63px;
    width: 100vw;
    background: rgb(255 255 255 / 67%);
    backdrop-filter: saturate(180%) blur(5px);
    -webkit-backdrop-filter: saturate(180%) blur(5px);
    border-bottom: 1px solid #00000017;
    backface-visibility: hidden;
    transform: translateZ(0);
  }
</style>

<div class="ayu-header flex items-center">
  <img class="logo sm:px-6 lg:px-8 left-0 absolute h-[35px]" src="/_ayu/assets/logo_black.png" alt="ayu logo" />

  <UserMenu class="sm:px-6 lg:px-8 right-0 absolute" hide={['settings']} />
</div>

<div class="app antialiased font-sans bg-gray-100" transition:fade="{{ duration: 250}}">
  {#if view === 'sessions'}
    <Sessions />
  {:else if view === 'login' }
    <Login {userData} />
  {:else if view === 'accounts'}
    <Accounts {localDbNames} {doLoginUser} />
  {:else if view === 'users'}
    <Users />
  {/if}

  {#if dataUsage}
    <div class="storage-footer">
      <h3>Local Storage</h3>
      {#if dataUsage.percent > 1}
        Available: {formatBytes(dataUsage.quota)}, Total Used: {formatBytes(dataUsage.usage)} ({dataUsage.percent} %)
      {/if}
      Files: {dataUsage.localFiles}, Data: {dataUsage.localDocs}
    </div>
  {/if}
</div>
