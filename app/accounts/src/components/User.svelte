<style>
  .user {
    position: relative;
    border-radius: 5px;
    margin: 0 20px;
    margin-bottom: 80px;
    padding-top: 5px;
    padding-bottom: 30px;
    max-width: 300px;
    color: #707070;
    transition: .2s all ease-in-out;
  }
  .user:hover{
    background: rgba(255, 255, 255, 1);
  }
  .user:hover .name{
    color:rgb(112, 112, 112);
  }
  .user.open{
    background: rgba(255, 255, 255, 1);
  }
  .picture{
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
  .picture > .far {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .data {
    margin: auto;
    padding: 0 30px;
    padding-top: 10px;
    width: max-content;
  }

  .unsynced{
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
  .btn-remove{
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
  }
  .name {
    width: fit-content;
    font-weight: 200;
    margin: auto;
    padding-top: 35px;
    color: white;
    transition: all ease-in-out .2s;
  }
  .name.open{
    color:rgb(112,112,112);
  }

</style>

<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css" integrity="sha256-+N4/V/SbAFiW1MPBCXnfnP9QSN3+Keu+NlB+0ev/YKQ=" crossorigin="anonymous" />
</svelte:head>

<div class="user" class:open on:click={detailsToggler}>
  <div class="details">
    <div class="picture"><i class="far fa-user"></i></div>
    <h2 class="name" class:open>{username}</h2>

    {#if open}
      <div class="data">
        <div class="notifications"><i class="fas fa-globe"></i> {notifications} new</div>
      </div>
      <div class="unsynced">
        <p><i class="fas fa-exclamation-triangle"></i> unsynced data: {unsynced} items<br/>since: 2019/09/1</p>
      </div>
      <div class="data">
        <div class="last-login">last login: 2019/10/11</div>
        <div class="local-space">local space used: 2mb/23mb</div>
      </div>
    {/if}
    </div>

    {#if open}
      <button class="btn-remove" on:click={accountRemoveHandler}>remove account from this device</button>
    {/if}
</div>


<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let open
  export let username
  export let unsynced
  export let notifications

  const detailsToggler = () => {
    dispatch('open')
  }

  const accountRemoveHandler = () => {
    alert('your local data is removed from this device (but not really')
  }

</script>

{pw = new PasswordCredential({
  id: 'jan2',
  data: 'sdfsdf',
  password: 'pas sdfsdfsdf sd fsdf sdf sdfwe r23422 3 3dfwefsdf +sword',
  name: '#Ksdflsdfwe12, Cloudant: jan',
  iconURL: "https://cloud.ibm.com/cache/8c7-1137334920/api/v6/img/favicon.png"
})}