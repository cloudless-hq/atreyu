<style>
  .userswitcher{
    display: flex;
    flex-wrap: wrap;
    /* border: solid 1px rgba(0, 0, 0, .1); */
    width: 80%;
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translateX(-50%) translateY(-30%);
  }
  .usercontainer{
    margin-bottom: 10px;
    flex: 1 0 21%;
  }
</style>


<div class="userswitcher">
  {#each users as user}
    {#if openUser === user.id }
      <div class="usercontainer"><User {...user} on:open={() => openUserHandler(user.id)} open={true}/></div>
    {:else}
      <div class="usercontainer"><User {...user} on:open={() => openUserHandler(user.id)}/></div>
    {/if}
  {/each}
  <div class="usercontainer"><AddUser/></div>
</div>


<script>
  import User from './User.svelte'
  import AddUser from './AddUser.svelte'
  let openUser;

  const openUserHandler = (id) => {
    openUser = id
  }


  let users = [
    {
      id: 0,
      username: 'Joe Steel',
      notifications: 0,
      unsynced: 2,
      lastSyncDate: '20190102',
      lastLogin: '20191012'
    },
    {
      id: 1,
      username: 'Winston Kirchill',
      notifications: 1,
      unsynced: 4,
      lastSyncDate: '20190102',
      lastLogin: '20191012'
    },
    {
      id: 2,
      username: 'Charlie The Gaul',
      notifications: 0,
      unsynced: 2,
      lastSyncDate: '20190102',
      lastLogin: '20191012'
    },
    {
      id: 3,
      username: 'Gary',
      notifications: 0,
      unsynced: 2,
      lastSyncDate: '20190102',
      lastLogin: '20191012'
    },
    {
      id: 4,
      username: 'Frank Rosa',
      notifications: 0,
      unsynced: 2,
      lastSyncDate: '20190102',
      lastLogin: '20191012'
    },
    {
      id: 5,
      username: 'Harry S.',
      notifications: 0,
      unsynced: 2,
      lastSyncDate: '20190102',
      lastLogin: '20191012'
    },
  ]
  // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/verify
</script>
