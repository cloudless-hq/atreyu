<script>
  import setAyuContext from '/_ayu/src/store/context.js'
  const { data, router } = setAyuContext()

  window.ayu = { data }
  $: window.ayu.router = $router
</script>

{#if $router._component}
  <svelte:component this={$router._component} />
{:else if $router._error}
  <svelte:component this={$router._errorComponent} />
{/if}
