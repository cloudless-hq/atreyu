<script>
  import PouchDB from '/_ayu/build/deps/pouchdb.js'
  import { formatBytes, fromNow, formatTime } from '/_ayu/src/lib/helpers.js'
  import data from '/_ayu/src/store/data.js'
  PouchDB.prefix = '_ayu_'

  export let localDbName
  export let doLoginUser
  export let pouchInfo = null
  export let couchInfo = null

  let isLoggedIn = !!pouchInfo
  let open
  let user = {}

  // $data._session.userId$
  // $data._couch$
  // $: console.log($data._pouch$)
  // db_name: "dev_user(64)localhost__jan__closr__"
  // doc_count: 112
  // update_seq: 206
  // 'active', formatBytes(couchInfo.sizes.active)) // The size of live data inside the database, in bytes.
  // 'external', formatBytes(couchInfo.sizes.external)) The uncompressed size of database contents in bytes.
  // 'file', formatBytes(couchInfo.sizes.file)) // The size of the database file on disk in bytes. Views indexes are not included in the calculation.

  let sessionId = ''
  async function init () {
    // let pullDoc
    let pushDoc
    let sessionDoc
    if (!pouchInfo) {
      const pouch = new PouchDB(localDbName)
      sessionId = (await pouch.get('_local/ayu')).sessionId
      sessionDoc = await pouch.get(sessionId)
      // pullDoc = await pouch.get(sessionDoc.replications.pull)
      pushDoc = await pouch.get(sessionDoc.replications.push)
      pouchInfo = await pouch.info()
    } else {
      sessionId = await $data._session.sessionId.$promise
      sessionDoc = await $data._docs[sessionId].$promise
      // pullDoc = await $data._docs[sessionDoc.replications.pull].$promise
      pushDoc = await $data._docs[sessionDoc.replications.push].$promise
    }

    user = {
      username: sessionDoc.email,
      org: sessionDoc.org,
      notifications: 0,
      unsynced: pouchInfo.update_seq - pushDoc.last_seq,
      sessionCreated: sessionDoc.created,
      lastLogin: sessionDoc.lastLogin
    }
    open = isLoggedIn
  }
  init()

  const accountRemoveHandler = () => {
    alert('your local data is removed from this device (but not really')
  }
</script>

<div class="user" class:open>
  <div class="details">
    <div class="picture" on:click={() => { isLoggedIn ? window.navigation.navigate('/') : doLoginUser({ sessionId, email: user.username, org: user.org }) }} rel="no-preload">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256c70.7 0 128-57.31 128-128s-57.3-128-128-128C153.3 0 96 57.31 96 128S153.3 256 224 256zM274.7 304H173.3C77.61 304 0 381.6 0 477.3c0 19.14 15.52 34.67 34.66 34.67h378.7C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304z"/></svg>
    </div>

    <h2 class="name" class:open on:click={() => { open = true }}>{user.username}{user.org ? ` (${user.org})` : ''}</h2>

    {#if open}
      <div class="data">
        <div class="notifications">
          <i class="fas fa-globe"></i>
          local: {pouchInfo.doc_count} docs<br>
          {isLoggedIn && couchInfo?.sizes ? `remote: ${couchInfo.doc_count} docs, ${formatBytes(couchInfo.sizes.file)}` : ''}
        </div>
      </div>

      <div class="unsynced {user.unsynced ? 'has-unsynced' : ''}">
        <p>
          <i class="fas fa-exclamation-triangle"></i>
          {user.unsynced} unsynced local changes
        </p>
      </div>

      <div class="data">
        <div class="last-login">session startet:
          <div class="from-now">{fromNow(user.sessionCreated)}</div>
          <div class="time-format">{formatTime(user.sessionCreated)}</div>
        </div>

        <div class="last-login">last login:
          <div class="from-now">{fromNow(user.lastLogin)}</div>
          <div class="time-format">{formatTime(user.lastLogin)}</div>
        </div>
      </div>
    {/if}
  </div>

  <button class="btn-remove" on:click={accountRemoveHandler}>remove account from this device</button>
</div>

<!-- {const pw = new PasswordCredential({
  id: 'jan2',
  data: 'sdfsdf',
  password: 'pas sdfsdfsdf sd fsdf sdf sdfwe r23422 3 3dfwefsdf +sword',
  name: '#Ksdflsdfwe12, Cloudant: jan',
  iconURL: "https://cloud.ibm.com/cache/8c7-1137334920/api/v6/img/favicon.png"
})} -->

<style>
  .user {
    position: relative;
    border-radius: 5px;
    margin: 0 20px;
    padding-top: 5px;
    padding-bottom: 30px;
    max-width: 300px;
    color: #707070;
    transition: .2s all ease-in-out;
  }
  /* .user:hover {
    background: rgba(255, 255, 255, 1);
  }
  .user:hover .name {
    color:rgb(112, 112, 112);
  } */
  .user.open {
    background: rgba(255, 255, 255, 1);
  }
  .picture {
    cursor: pointer;
    height: 65px;
    width: 65px;
    border-radius: 100px;
    background: #f2fdff;
    position: absolute;
    top: -32.5px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 35px;
  }
  .data {
    margin: auto;
    padding: 0 30px;
    padding-top: 10px;
    width: max-content;
  }
  .unsynced {
    background-color: rgb(179, 179, 179);
  }
  .has-unsynced {
    background-color: rgb(197, 73, 73);
    color: white;
  }
  .unsynced > p {
    padding: 10px 0;
    width: max-content;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
  }
  .btn-remove {
    display: none;
    background-color: #dc3545;
    padding: 10px 20px;
    border: none;
    font-weight: 600;
    margin-bottom: -23px;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 50%);
    border-radius: 5px;
    box-shadow: 3px 3px 8px 3px rgba(0, 0, 0, 0.2);
  }
  .user.open:hover .btn-remove {
    display: block;
  }
  .name {
    cursor: pointer;
    width: fit-content;
    font-weight: 200;
    margin: auto;
    padding-top: 37px;
    transition: all ease-in-out .2s;
    font-size: 23px;
  }
  .name.open {
    color:rgb(112,112,112);
  }
  svg {
    width: 100%;
    height: 100%;
    fill: #858585;
    padding: 16px;
  }
  .last-login .from-now, .last-login:hover .time-format {
    display: inline-block;
  }
  .last-login:hover .from-now, .last-login .time-format {
    display: none;
  }
</style>