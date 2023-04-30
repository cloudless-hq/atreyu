<script>
  import Updater from '/_ayu/src/components/updater.svelte'
  import DevMenu from '/_ayu/src/components/dev-menu.svelte'
  import setAyuContext from '/_ayu/src/store/context.js'
  import {onChange} from '../changes.js'

  // TODO: move to main.js?
  const { data, router } = setAyuContext({ onChange })

  window.ayu = { data, router }
  // $: window.ayu.router = $router
</script>

{#if $router._component}
  <svelte:component this={$router._component} />
{:else if $router._error}
  <svelte:component this={$router._errorComponent} />
{/if}

<Updater />

<DevMenu />
