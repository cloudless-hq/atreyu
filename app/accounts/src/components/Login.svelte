<style>
  .login {
    background: white;
    
  }
  .login-form {
    max-width: 80%;
    margin: auto;
    position: relative;
    top: 35%;
    transform: translateY(-50%);
  }
  .login-input {
    border: solid 1px rgba(0, 0, 0, .1);
    border-radius: 5px;
    display: flex;
    margin-bottom: 15px;
  }
  .input {
    border: none;
    display: inline-block;
    padding: 10px;
    width: 100%;
  }
  .icon{
    padding: 10px;
  }
  .btn {
    background: #3898ec;
    border: solid 1px #3898ec;
    border-radius: 5px;
    color: white;
    display: block;
    width: 100%;
    padding: 5px;
  }
  .title {
    color: #707070;
    font-weight: 200;
  }
  .label{
    color: #707070;
    font-size: 10px;
  }
</style>

<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css" integrity="sha256-+N4/V/SbAFiW1MPBCXnfnP9QSN3+Keu+NlB+0ev/YKQ=" crossorigin="anonymous" />
</svelte:head>

<SidebarLayout top="36px" sideWidth="{sideWidth}px" contentMin="{contentMin}" closed={sidebarClosed}  >
  <div class="login">
    <form class="login-form">
      <h1 class="title">Login</h1>
      <div class="login-input">
        <span class="icon fas fa-user"></span>
        <input type="email" class="input" placeholder="email" required/>
      </div>
      <label class="label"><input type="checkbox" bind:checked={saveToDevice}>Save my data on this device (<a>?</a>)</label>
      <div class="login-input">
        <span class="icon fas fa-laptop"></span>
        <input type="text" class="input" placeholder="device name" required disabled={!saveToDevice}/>
      </div>
      <input type="submit" class="btn">
    </form>
  </div>

  <div>info</div>
</SidebarLayout>

<script>
  import { SidebarLayout } from 'sidebar-layout'
  
  let sideWidth = '240'
  let contentMin
  let sidebarClosed = false

  let saveToDevice = true
</script>