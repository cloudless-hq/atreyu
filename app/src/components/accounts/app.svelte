<script>
  import { formatBytes } from '/_ayu/src/lib/helpers.js'
  import Login from './login.svelte.js'
  import Sessions from './sessions.svelte.js'
  // import Confirmation from './confirmation.svelte.js'
  import UserSwitcher from './user-switcher.svelte.js'
	import makeRouterStore from '/_ayu/src/store/router.js'
  import data from '/_ayu/src/store/data.js'

  const router = makeRouterStore()

	import { fade } from '/svelte/transition'

  $: newUser = ($router.hash === '#new')

  let userDbs

  let logedInData
  let dataUsage
  let loggedInDbName
  let session = {}
  async function init () {
    try {
      const dbs = await indexedDB.databases()
      userDbs = dbs
        .filter(({ name }) => name?.startsWith('_ayu_') && !name?.includes('-mrview'))
        .map(({ name }) => name?.replace('_ayu_', ''))
    } catch (err) {
       console.error(err)
       userDbs = []
    }
    const sessionRes = await fetch('/_api/_session')
    if (sessionRes.ok) {
      session = await sessionRes.json()
    }
    loggedInDbName = session.userId ? session.env + '__' + session.appName : ''

    let couchInfo
    if (loggedInDbName) {
      couchInfo = await (await fetch('/_api/_couch/' + loggedInDbName)).json()
      logedInData = { couchInfo, session }
    }

    const { quota, usage, usageDetails } = await navigator.storage.estimate()

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

  init()

  let userData
  function loginUser ({ sessionId, email, org }) {
    userData = { sessionId, email, org }
  }
</script>

<style>
	.app {
		text-align: center;
    height: 100%;
	}
  .storage-footer {
    bottom: 0;
    position: absolute;
    margin-bottom: 16px;
    font-size: 13px;
    margin-right: 21px;
    color: #ffffff91;
    right: 0;
    text-align: right;
  }
</style>

<div class="app antialiased font-sans bg-gray-100" transition:fade="{{ duration: 250}}">
  {#if $router.hash === '#/sessions' && logedInData}
    <Sessions {loggedInDbName} {session} />
  {:else}
    {#if userDbs && (userDbs?.length === 0 || userData || newUser)}
      <Login {userData} />
    {:else if userDbs}
      <UserSwitcher {userDbs} {logedInData} {loginUser} />
    {/if}
  {/if}

  {#if dataUsage}
    <div class="storage-footer">
      <h3>Local Storage</h3>
      {#if dataUsage.percent > 1}
        Available: {formatBytes(dataUsage.quota)}, Total Used: {formatBytes(dataUsage.usage)} ({dataUsage.percent} %)
      {/if}
      Files: {dataUsage.localFiles}, DBs: {dataUsage.localDocs}
    </div>
  {/if}
</div>