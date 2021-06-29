<script>
	import DevTool from './DevTool.svelte'
	import router from '../src/stores/router.js'
	import data from '../src/stores/data.js'
	import { fade } from '/snowpack/svelte/transition.js'
</script>

<style>
	:global(body) {
		margin: 0;
		font-family: Arial, Helvetica, sans-serif;
	}
	.App {
		text-align: center;
	}
</style>

<div class="App" transition:fade="{{ duration: 250}}">
	{$data.test$}

	<DevTool/>
</div>