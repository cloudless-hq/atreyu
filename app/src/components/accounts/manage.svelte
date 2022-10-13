<script>
  import data from '/_ayu/src/store/data.js'
  import PouchDB from '/_ayu/build/deps/pouchdb.js'
  import { formatBytes, fromNow, formatTime } from '/_ayu/src/lib/helpers.js'
  PouchDB.prefix = '_ayu_'

  export let localDbNames = []
  export let doLoginUser
  // FIXME: handle changing session ids and sync ids
  // {const pw = new PasswordCredential({
  //   id: 'jan2',
  //   data: 'sdfsdf',
  //   password: 'pas sdfsdfsdf sd fsdf sdf sdfwe r23422 3 3dfwefsdf +sword',
  //   name: '#Ksdflsdfwe12, Cloudant: jan',
  //   iconURL: "https://cloud.ibm.com/cache/8c7-1137334920/api/v6/img/favicon.png"
  // })}
  // 'active', formatBytes(couchInfo.sizes.active)) // The size of live data inside the database, in bytes.
  // 'external', formatBytes(couchInfo.sizes.external)) The uncompressed size of database contents in bytes.
  // 'file', formatBytes(couchInfo.sizes.file)) // The size of the database file on disk in bytes. Views indexes are not included in the calculation.

  let timestamp
  setInterval(() => {
    timestamp = Date.now()
  }, 10000)

  let accounts = []

  localDbNames.forEach(async localDbName => {
    const pouchName = await $data._pouch.db_name.$promise.catch(err =>{})

    let sessionId, sessionDoc, pushDoc, pouchInfo, couchInfo, isLoggedIn
    if (localDbName === pouchName) {
      isLoggedIn = true
      couchInfo = await $data._couch.$promise
      pouchInfo = await $data._pouch.$promise
      sessionId = await $data._session.sessionId.$promise
      sessionDoc = await $data._docs[sessionId].$promise
      pushDoc = await $data._docs[sessionDoc.replications.push].$promise
    } else {
      try {
        const pouch = new PouchDB(localDbName)
        sessionId = (await pouch.get('_local/ayu')).sessionId
        sessionDoc = await pouch.get(sessionId)
        pushDoc = await pouch.get(sessionDoc.replications.push)
        pouchInfo = await pouch.info()
        pouch.close()
      } catch (err) {
        console.log(err)
      }
    }
    const account = {
      isLoggedIn,
      sessionId,
      username: sessionDoc.email,
      pouchInfo,
      couchInfo,
      org: sessionDoc.org,
      notifications: 0,
      unsynced: pouchInfo.update_seq - pushDoc.last_seq,
      sessionCreated: sessionDoc.created,
      lastLogin: sessionDoc.lastLogin
    }

    if (isLoggedIn) {
      accounts = [account, ...accounts]
    } else {
      accounts = [...accounts, account]
    }
  })

</script>

<style>
  .userswitcher {
    display: flex;
    flex-wrap: wrap;
    position: absolute;
  }
  /* .usercontainer{
    flex: 1 1 306px;
  } */
  .unsynced-badge {
    background-color: #e42f3b;
    border-radius: 24px;
    color: #fff;
    cursor: default;
    font-size: 12px;
    font-weight: 600;
    height: 24px;
    line-height: 23px;
    position: absolute;
    text-align: center;
    user-select: none;
    width: 24px;
    right: -4px;
    top: -4px;
  }
</style>

<div class="userswitcher p-24">
  <ul class="grid grid-cols-1 gap-30 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    {#each accounts as account}
      <li class="group relative col-span-1 flex flex-col transition-shadow rounded-lg bg-white text-center shadow hover:shadow-lg" style="min-width: 240px;">
        <button title="Remove account from this device" class="absolute invisible group-hover:visible m-1 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Remove">
          <span class="sr-only">Remove</span>
          <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
        </button>

        <!-- <span class="absolute mt-2 ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">logged in</span> -->

        <div class="flex flex-1 flex-col p-8">
          <!-- <img class="mx-auto h-32 w-32 flex-shrink-0 rounded-full" src="" alt=""> -->
          <div on:click={() => { account.isLoggedIn ? window.location.href = '/' : doLoginUser({ sessionId: account.sessionId, email: account.username, org: account.org }) }} class="relative cursor-pointer mx-auto h-32 w-32 flex-shrink-0 rounded-full" style="height: 65px; width: 65px; background: #e5e5e5; fill: #858585; padding: 16px;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256c70.7 0 128-57.31 128-128s-57.3-128-128-128C153.3 0 96 57.31 96 128S153.3 256 224 256zM274.7 304H173.3C77.61 304 0 381.6 0 477.3c0 19.14 15.52 34.67 34.66 34.67h378.7C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304z"/></svg>

            {#if account.isLoggedIn}
              <span title="Logged in" class="top-0 right-1 absolute w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
            {/if}
          </div>

          <h3 class="mt-6 text-sm font-medium text-gray-900">{account.username}{account.org ? ` (${account.org})` : ''}</h3>

          <dl class="mt-1 flex flex-grow flex-col justify-between">
            <dt class="sr-only">Storage Info</dt>
            <dd title={account.couchInfo?.sizes ? `Taking up ${formatBytes(account.couchInfo.sizes.file)} on remote db server` : ''} class="text-sm text-gray-500 whitespace-nowrap">
              local: {account.pouchInfo.doc_count}{account.couchInfo?.doc_count ? ' of ' + account.couchInfo.doc_count : ''} docs<br>
            </dd>

            <dt class="sr-only">Time Audit</dt>
            <dd class="mt-3 text-sm text-gray-500 whitespace-nowrap">
              <div title="{formatTime(account.lastLogin)}">last login: {fromNow(account.lastLogin, timestamp)}<br></div>
              <div title="{formatTime(account.sessionCreated)}">added: {fromNow(account.sessionCreated, timestamp)}</div>
          </dl>
        </div>

        {#if account.unsynced}
          <div class="unsynced-badge" title="Unsynced local changes">{account.unsynced}</div>
        {/if}
      </li>
    {/each}

    <li class="group relative col-span-1 flex flex-col text-center" style="min-width: 240px;">
      <div class="flex flex-1 flex-col pb-8 justify-center">
        <div class="relative cursor-pointer mx-auto h-32 w-32 flex-shrink-0 rounded-full" style="height: 65px; width: 65px; background: #e5e5e5; fill: #858585; padding: 16px;">
          <a href="#new" rel="no-preload" class="-mt-1" style="fill: #858585;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 20 448 512"><path d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"/></svg>
          </a>
        </div>

        <!-- <h3 class="mt-6 text-sm font-medium text-gray-900 whitespace-nowrap">Add New</h3> -->
      </div>
    </li>
  </ul>
</div>
