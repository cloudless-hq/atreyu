<svelte:options immutable/>
<!-- // maybe convert this to a use: effect -->
<script>
	import { afterUpdate } from 'svelte'
	import flash from './change-flash.js'

	export let todo
	// export let toggle

	let div

	afterUpdate(() => {
		flash(div)
	})
</script>

<style>
	div {
		cursor: pointer;
		line-height: 1.5;
	}
</style>

<div bind:this={div} on:click>
	<input type=checkbox bind:checked={todo.done}>  {todo.done$ ? '👍': ''} {todo.text$}
</div>
