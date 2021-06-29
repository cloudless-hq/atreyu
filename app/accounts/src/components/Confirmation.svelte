<style>
  .btn {
    background: #3898ec;
    border: solid 1px #3898ec;
    border-radius: 5px;
    color: white;
    display: block;
    width: 100%;
    padding: 5px;
    margin-top: 20px;
  }
  .btn.inactive{
    background: #777777;
    border: solid 1px #777777;
    cursor: not-allowed;
  }

</style>
<Modal>
  {#if (userAgreement === true) && (signUp === true)}
    <div class="email">
      <p>
        Thank you for sigining up.<br>
        We've sent a confirmation email to jan@bruh.com (not the right email?)
      </p>
    </div>
  {:else}
    <div class="confirmation">
      <p>We did not find an account for jan@bruh.com, would you like to create an account?</p>
      <input type="checkbox" bind:checked={userAgreement}/> I agree to the <a src="#">Terms of Service</a> and <a src="#">Privacy Policy</a>.
      <button class="btn" class:inactive={!userAgreement} on:click={signUpBtnHandler}>{buttonText}</button>
    </div>
  {/if}
</Modal>

<script>
  import Modal from './Modal.svelte'
  let userAgreement = false
  let signUp = false
  let buttonText = ''
  $: userAgreement ? buttonText = "Sign Up" : buttonText = "Please agree to the terms of service"
  const signUpBtnHandler = () => {
    signUp = true
  }
</script>