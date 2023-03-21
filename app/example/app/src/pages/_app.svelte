<script>
  import setAyuContext from '/_ayu/src/store/context.js'
  const { data, router } = setAyuContext()

  // TODO: preloading support only on install
  data.falcor.preload(['_docs', '_design/todos']).then(() => {})

  window.ayu = { data }
  $: window.ayu.router = $router
</script>

{#if $router._component}
  <svelte:component this={$router._component} />
{:else if $router._error}
  <svelte:component this={$router._errorComponent} />
{/if}
