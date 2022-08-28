<script>
  export let user
  let open

  const accountRemoveHandler = () => {
    alert('your local data is removed from this device (but not really')
  }
  export let loginUser

</script>

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
  /* .user:hover{
    background: rgba(255, 255, 255, 1);
  } */
  /* .user:hover .name{
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
  }
  .name {
    cursor: pointer;
    width: fit-content;
    font-weight: 200;
    margin: auto;
    padding-top: 35px;
    color: white;
    transition: all ease-in-out .2s;
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
</style>

<div class="user" class:open>
  <div class="details">
    <div class="picture" on:click={() => loginUser(user.id)} rel="no-preload">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256c70.7 0 128-57.31 128-128s-57.3-128-128-128C153.3 0 96 57.31 96 128S153.3 256 224 256zM274.7 304H173.3C77.61 304 0 381.6 0 477.3c0 19.14 15.52 34.67 34.66 34.67h378.7C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304z"/></svg>
    </div>

    <h2 class="name" class:open on:click={() => { open = true; console.log(open) }}>{user.username}</h2>

    {#if open}
      <div class="data">
        <div class="notifications">
          <i class="fas fa-globe"></i>

          {user.notifications} new
        </div>
      </div>
      <div class="unsynced">
        <p>
          <i class="fas fa-exclamation-triangle"></i>
          unsynced data: {user.unsynced} items<br/>since: 2019/09/1
        </p>
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

<!-- {const pw = new PasswordCredential({
  id: 'jan2',
  data: 'sdfsdf',
  password: 'pas sdfsdfsdf sd fsdf sdf sdfwe r23422 3 3dfwefsdf +sword',
  name: '#Ksdflsdfwe12, Cloudant: jan',
  iconURL: "https://cloud.ibm.com/cache/8c7-1137334920/api/v6/img/favicon.png"
})} -->