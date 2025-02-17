<script>
  import setAyuContext from '/_ayu/src/store/context.js'
  import UserMenu from '/_ayu/src/components/user-menu.svelte'
  import DataSource from '/_ayu/src/falcor/service-worker-source.js'
  const { router } = setAyuContext({ source: new DataSource() })
</script>

<style lang="postcss">
  :global(body) {
    @apply bg-gray-100;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }
  .logo {
    height: 35px;
  }
  .ayu-header {
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

<svelte:head>
  <title>{location.hostname.charAt(0).toUpperCase() + location.hostname.slice(1)}</title>
</svelte:head>

<div class="ayu-header flex items-center">
  <a href='/_dashboard/' class="px-4 sm:px-6 lg:px-8 left-0 absolute">
    <img class="logo float-left" src="/_dashboard/assets/icon64.png" alt="ayu logo" />
    <div class="inline-block float-left ml-3 mt-[6px]">kilp</div>
  </a>

  <a href="/__ayu_refresh" preload="none" rel="external" class="absolute right-20 rounded-md border border-transparent py-2 px-4 text-sm font-normal hover:bg-gray-200" >
    Open your Proxied Site
  </a>

  <UserMenu glass={false} class="px-4 sm:px-6 lg:px-8 right-0 absolute"></UserMenu>
</div>
<!-- fixed top-3 right-3 -->

<div class="py-10 pt-24">
  {#if $router._component}
    <svelte:component this={$router._component} />
  {:else if $router._error}
    <svelte:component this={$router._errorComponent} />
  {/if}
</div>

<!-- report-to: {"endpoints":[{"url":"https:\/\/a.nel.cloudflare.com\/report\/v3?s=JzFStZlsOl2MZ%2BkLy%2Bh%2FQF9tsIsqeoxG92TK%2Be6ZwvQUfGEBHVFLEKUVX35w5D5SHk6pWqYd%2BoOnVH1Skj62BFnifIVq3FU4KYHz5wujAqgvUjhmCBccJcSq"}],"group":"cf-nel","max_age":604800} -->
 