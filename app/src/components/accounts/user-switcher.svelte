<script>
  import User from './user.svelte.js'
  import data from '/_ayu/src/store/data.js'
  export let localDbNames = []
  export let doLoginUser
  // FIXME: handle changing session ids and sync ids
</script>

<style>
  .userswitcher {
    display: flex;
    flex-wrap: wrap;
    width: 80%;
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translateX(-50%) translateY(-30%);
  }
  .usercontainer{
    margin-bottom: 87px;
    flex: 1 1 306px;
  }
  .user {
    position: relative;
    border-radius: 5px;
    /* background: rgba(255, 255, 255, 1); */
    margin: 0 20px;
    padding-top: 5px;
    padding-bottom: 30px;
    max-width: 300px;
    color: white;
  }
  .picture {
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
  /* .picture > .fas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  } */
  /* .unsynced {
    background-color: rgb(108, 108, 108);
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
    background-color: #dc3545;
    padding: 10px 20px;
    border: none;
    color: white;
    font-weight: 600;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 50%);
    border-radius: 5px;
    box-shadow: 3px 3px 8px 3px rgba(0, 0, 0, 0.2);
  } */
  .picture svg {
    width: 100%;
    height: 100%;
    fill: #858585;
    padding: 16px;
  }
</style>

<div class="userswitcher pt-24">
  {#each localDbNames as localDbName}
    <div class="usercontainer">
      {#if localDbName === $data._pouch.db_name$}
        <User {localDbName} {doLoginUser} pouchInfo={$data._pouch$} couchInfo={$data._couch$} />
      {:else}
        <User {localDbName} {doLoginUser} />
      {/if}
    </div>
  {/each}

  <div class="usercontainer new">
    <div class="user">
       <a class="picture" href="#new" rel="no-preload">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"/></svg>
      </a>
    </div>
  </div>
</div>
