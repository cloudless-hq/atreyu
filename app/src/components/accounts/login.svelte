<script>
  import SidebarLayout from '../sidebar-layout/components/sidebar-layout.svelte.js'
  import { onMount } from 'svelte'

  export let userId

  onMount(() => {
    if (userId) {
      document.loginForm.submit()
    }
  })

  let sideWidth = '440'
  let contentMin
  let sidebarClosed = false

  let saveToDevice = true

  let sessionName = `${navigator.userAgentData.brands[navigator.userAgentData.brands.length - 1].brand} on ${navigator.userAgentData.platform}`

  let searchTxt = location.href.split('?')[1]
  let formTarget = `/_api/_session?dev_login${searchTxt ? '&' + searchTxt : ''}`
</script>

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
    height: 35px;
    width: 35px;
  }
  .btn {
    background: #3898ec;
    border: solid 1px #3898ec;
    border-radius: 5px;
    color: white;
    display: block;
    width: 100%;
    padding: 5px;
    cursor: pointer;
  }
  .title {
    color: #707070;
    font-weight: 200;
  }
  .label{
    color: #707070;
    font-size: 10px;
  }
  .hidden {
    visibility: hidden;
  }
</style>

<SidebarLayout top="0px" sideWidth="{sideWidth}px" contentMin="{contentMin}" closed={sidebarClosed}  >
  <div class="login" class:hidden={!!userId}>
    <form class="login-form" action={formTarget} method="post" name="loginForm">
      <h1 class="title">Login</h1>

      <div class="login-input">
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256c70.7 0 128-57.31 128-128s-57.3-128-128-128C153.3 0 96 57.31 96 128S153.3 256 224 256zM274.7 304H173.3C77.61 304 0 381.6 0 477.3c0 19.14 15.52 34.67 34.66 34.67h378.7C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304z"/></svg>
        </div>

        <input name="email" type="email" class="input" placeholder="Email" required value="dev_user@localhost" />
      </div>

      <div class="login-input">
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M623.5 164C638.1 172.6 644.6 192.1 635.1 207.5C627.4 222.1 607.9 228.6 592.5 219.1L319.1 68.61L47.54 219.1C32.09 228.6 12.61 222.1 4.025 207.5C-4.558 192.1 1.008 172.6 16.46 164L304.5 4.027C314.1-1.342 325.9-1.342 335.5 4.027L623.5 164zM279.1 200C279.1 177.9 297.9 160 319.1 160C342.1 160 359.1 177.9 359.1 200C359.1 222.1 342.1 240 319.1 240C297.9 240 279.1 222.1 279.1 200zM103.1 296C103.1 273.9 121.9 256 143.1 256C166.1 256 183.1 273.9 183.1 296C183.1 318.1 166.1 336 143.1 336C121.9 336 103.1 318.1 103.1 296V296zM535.1 296C535.1 318.1 518.1 336 495.1 336C473.9 336 455.1 318.1 455.1 296C455.1 273.9 473.9 256 495.1 256C518.1 256 535.1 273.9 535.1 296zM226.9 491.4L199.1 441.5V480C199.1 497.7 185.7 512 167.1 512H119.1C102.3 512 87.1 497.7 87.1 480V441.5L61.13 491.4C54.84 503 40.29 507.4 28.62 501.1C16.95 494.8 12.58 480.3 18.87 468.6L56.74 398.3C72.09 369.8 101.9 352 134.2 352H153.8C170.1 352 185.7 356.5 199.2 364.6L232.7 302.3C248.1 273.8 277.9 255.1 310.2 255.1H329.8C362.1 255.1 391.9 273.8 407.3 302.3L440.8 364.6C454.3 356.5 469.9 352 486.2 352H505.8C538.1 352 567.9 369.8 583.3 398.3L621.1 468.6C627.4 480.3 623 494.8 611.4 501.1C599.7 507.4 585.2 503 578.9 491.4L551.1 441.5V480C551.1 497.7 537.7 512 519.1 512H471.1C454.3 512 439.1 497.7 439.1 480V441.5L413.1 491.4C406.8 503 392.3 507.4 380.6 501.1C368.1 494.8 364.6 480.3 370.9 468.6L407.2 401.1C405.5 399.5 404 397.6 402.9 395.4L375.1 345.5V400C375.1 417.7 361.7 432 343.1 432H295.1C278.3 432 263.1 417.7 263.1 400V345.5L237.1 395.4C235.1 397.6 234.5 399.5 232.8 401.1L269.1 468.6C275.4 480.3 271 494.8 259.4 501.1C247.7 507.4 233.2 503 226.9 491.4H226.9z"/></svg>
        </div>

        <input id="org" name="org"  class="input" placeholder="Organization">
      </div>

      <label class="label"><input type="checkbox" name="saveToDevice" bind:checked={saveToDevice}>Save my data on this device</label>

      <div class="login-input">
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M218.3 8.486C230.6-2.829 249.4-2.829 261.7 8.486L469.7 200.5C476.4 206.7 480 215.2 480 224H336C316.9 224 299.7 232.4 288 245.7V208C288 199.2 280.8 192 272 192H208C199.2 192 192 199.2 192 208V272C192 280.8 199.2 288 208 288H271.1V416H112C85.49 416 64 394.5 64 368V256H32C18.83 256 6.996 247.9 2.198 235.7C-2.6 223.4 .6145 209.4 10.3 200.5L218.3 8.486zM336 256H560C577.7 256 592 270.3 592 288V448H624C632.8 448 640 455.2 640 464C640 490.5 618.5 512 592 512H303.1C277.5 512 255.1 490.5 255.1 464C255.1 455.2 263.2 448 271.1 448H303.1V288C303.1 270.3 318.3 256 336 256zM352 304V448H544V304H352z"/></svg>
        </div>

        <input type="text" class="input" placeholder="Session Name" name="sessionName" required disabled={!saveToDevice} value={sessionName}/>
      </div>

      <button class="btn" type="submit">Login</button>
    </form>
  </div>

  <div></div>
</SidebarLayout>