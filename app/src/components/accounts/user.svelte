<script>
  import PouchDB from '/_ayu/build/deps/pouchdb.js'
  import { formatBytes, fromNow, formatTime } from '/_ayu/src/lib/helpers.js'
  PouchDB.prefix = '_ayu_'

  export let userDb
  export let logedInData
  export let loginUser
  let open
  let user = {}

  // sizes.active (number) – The size of live data inside the database, in bytes.
  // sizes.external (number) – The uncompressed size of database contents in bytes.
  // sizes.file (number) – The size of the database file on disk in bytes. Views indexes are not included in the calculation.
  // console.log('active', formatBytes(couchInfo.sizes.active))
  // console.log('external', formatBytes(couchInfo.sizes.external))
  // console.log('file', formatBytes(couchInfo.sizes.file))

  let isLoggedIn = false
  let sessionId
  $: {
    // FIXME: changing session id
    // console.log(logedInData, sessionId)
    if (sessionId && logedInData?.session.sessionId === sessionId) {
      isLoggedIn = true
    }
  }

  async function init () {
    const pouch = new PouchDB(userDb)
    sessionId = (await pouch.get('_local/ayu')).sessionId
    const sessionDoc = await pouch.get(sessionId)
    const pullDoc = await pouch.get(sessionDoc.replications.pull)
    const pushDoc = await pouch.get(sessionDoc.replications.push)
    const pouchInfo = await pouch.info()

    console.log(pullDoc, sessionDoc)

    user = {
      id: pouch.name,
      username: sessionDoc.email,
      org: sessionDoc.org,
      notifications: 0,
      docs: {
        pouch: pouchInfo.doc_count
      },
      unsynced: pouchInfo.update_seq - pushDoc.last_seq,
      sessionCreated: sessionDoc.created,
      lastLogin: sessionDoc.lastLogin
    }
  }
  init()

  const accountRemoveHandler = () => {
    alert('your local data is removed from this device (but not really')
  }
</script>

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
    color: white;
  }
  .has-unsynced {
    background-color: rgb(197, 73, 73);
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
    color: white;
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
    color: white;
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

<div class="user" class:open>
  <div class="details">
    <div class="picture" on:click={() => { isLoggedIn ? window.navigation.navigate('/') : loginUser({ sessionId, email: user.username, org: user.org }) }} rel="no-preload">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256c70.7 0 128-57.31 128-128s-57.3-128-128-128C153.3 0 96 57.31 96 128S153.3 256 224 256zM274.7 304H173.3C77.61 304 0 381.6 0 477.3c0 19.14 15.52 34.67 34.66 34.67h378.7C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304z"/></svg>
    </div>

    <h2 class="name" class:open on:click={() => { open = true }}>{user.username}{user.org ? ` (${user.org})` : ''}</h2>

    {#if open}
      <div class="data">
        <div class="notifications">
          <i class="fas fa-globe"></i>
          local: {user.docs.pouch} docs<br>
          {isLoggedIn ? `remote: ${logedInData.couchInfo.doc_count} docs, ${formatBytes(logedInData.couchInfo.sizes.file)}` : ''}
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