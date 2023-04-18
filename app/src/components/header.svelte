<script>
  import UserMenu from '/_ayu/src/components/user-menu.svelte'

  export let hide = []
</script>

<style>
  :global(.ayu-header) {
    position: fixed;
    z-index: 100000;
    height: 63px;
    width: 100vw;
    background: rgb(255 255 255 / 67%);
    backdrop-filter: saturate(180%) blur(5px);
    -webkit-backdrop-filter: saturate(180%) blur(5px);
    border-bottom: 1px solid #00000017;
    backface-visibility: hidden;
    transform: translateZ(0);
  }
</style>

<div class="ayu-header flex items-center">
  <slot name="logo">
    <img class="logo sm:px-6 lg:px-8 left-0 absolute h-[35px]" src="/_ayu/assets/logo_black.png" alt="ayu logo" />
  </slot>

  <UserMenu class="sm:px-6 lg:px-8 right-0 absolute" {hide}/>
</div>
