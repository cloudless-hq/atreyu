<script>
  import Login from './login.svelte.js'
  // import Confirmation from './confirmation.svelte.js'
  import UserSwitcher from './user-switcher.svelte.js'
	import makeRouterStore from '/_ayu/src/store/router.js'
  // import schema from '../schema.js'

  const router = makeRouterStore() // schema

	// import data from '../src/stores/data.js'
	import { fade } from '/svelte/transition'

  $: newUser = ($router.hash === '#new')

  let userDbs
  indexedDB.databases().then(dbs => {
    userDbs = dbs.filter(({ name }) => name?.startsWith('_pouch_') && !name?.includes('-mrview')).map(({name}) => name?.replace('_pouch_', ''))
  }).catch(err => { console.error(err); userDbs = []; })

  let userId
  function loginUser (id) {
    userId = id
  }
</script>

<style>
	:global(body) {
		margin: 0;
		font-family: Arial, Helvetica, sans-serif;
	}
	.app {
		text-align: center;
	}
</style>

<div class="app" transition:fade="{{ duration: 250}}">
  {#if userDbs && (userDbs?.length === 0 || userId || newUser)}
    <Login {userId} />
  {:else if userDbs}
    <UserSwitcher {userDbs} {loginUser} />
  {/if}
</div>