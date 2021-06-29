<style>
	.dev-tool {
		position: fixed;
		bottom: 0;
		right: 0;
	}
	.version {
		cursor: pointer;
		font-size: 13px;
		color: rgba(0, 0, 0, .2);
		margin: 8px;
		z-index: 9;
		bottom: 0;
		right: 0;
	}
	.pane {
		padding: 20px;
		margin: 8px;
    background: #00000094;
    border-radius: 20px;
	}
</style>

<div class="dev-tool">
	{#if show}
		<div class="pane">
			Hi
		</div>
	{/if}

	<div class="version" on:click={() => show = !show}>{'release: ' + ipfsHash.slice(-6)}</div>
</div>

<script>
	import { onMount } from  'svelte/internal.js'
	let ipfsHash = ''
	let show = false
	
	onMount(async () => {
		ipfsHash = await (await fetch('/ipfsHash')).text()
	})
</script>