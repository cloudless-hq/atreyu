<script>
  import data from '/_ayu/src/store/data.js'
  import { fromNow, formatTime } from '/_ayu/src/lib/helpers.js'

  let timestamp
  setInterval(() => {
    timestamp = Date.now()
  }, 10000)

  $: users = $data._users$
</script>

<style>
  .userswitcher {
    display: flex;
    flex-wrap: wrap;
    position: absolute;
  }
</style>

{#if users.length}
  <div class="userswitcher p-24">
    <h1 class="text-3xl mb-4 font-bold leading-tight tracking-tight text-gray-900 text-left">All users in this organization</h1>

    <ul class="grid mt-2 grid-cols-1 gap-30 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {#each users as account}
        <li class="w-max group relative col-span-1 flex flex-col transition-shadow rounded-lg bg-white text-center shadow hover:shadow-lg">
          {#if $data._session.email$ === account.email}
            <span class="absolute top-2 right-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">current user</span>
          {/if}

          <button title="Remove account from this device" class="absolute invisible group-hover:visible m-1 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Remove">
            <span class="sr-only">Remove</span>
            <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          </button>

          <!-- <span class="absolute mt-2 ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">logged in</span> -->

          <div class="flex flex-1 flex-col p-8">
            <div class="relative cursor-pointer mx-auto h-32 w-32 flex-shrink-0 rounded-full" style="height: 65px; width: 65px; background: #e5e5e5; fill: #858585; padding: 16px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256c70.7 0 128-57.31 128-128s-57.3-128-128-128C153.3 0 96 57.31 96 128S153.3 256 224 256zM274.7 304H173.3C77.61 304 0 381.6 0 477.3c0 19.14 15.52 34.67 34.66 34.67h378.7C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304z"/></svg>

              {#if account.isLoggedIn}
                <span title="Logged in" class="top-0 right-1 absolute w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
              {/if}
            </div>

            <h3 class="mt-6 text-sm font-medium text-gray-900">{account.email}{account.org ? ` (${account.org})` : ''}</h3>

            <dl class="mt-1 flex flex-grow flex-col justify-between">
              <dt class="sr-only">Number of Sessions</dt>
              <dd title="" class="text-sm text-gray-500 whitespace-nowrap">
                {account.numSessions} sessions<br>
              </dd>

              <dt class="sr-only">Time Audit</dt>
              <dd class="mt-3 text-sm text-gray-500 whitespace-nowrap">
                <div title="{formatTime(account.lastLogin)}">last login: {fromNow(account.lastLogin, timestamp)}<br></div>
                <div title="{formatTime(account.created)}">added: {fromNow(account.created, timestamp)}</div>
            </dl>
          </div>
        </li>
      {/each}

      <li class="group relative col-span-1 flex flex-col text-center" style="min-width: 240px;">
        <div class="flex flex-1 flex-col pb-8 justify-center">
          <div class="relative cursor-pointer mx-auto h-32 w-32 flex-shrink-0 rounded-full" style="height: 65px; width: 65px; background: #e5e5e5; fill: #858585; padding: 16px;">
            <a href="#new" rel="no-preload" class="-mt-1" style="fill: #858585;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 20 448 512"><path d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"/></svg>
            </a>
          </div>
        </div>
      </li>
    </ul>
  </div>
{/if}
