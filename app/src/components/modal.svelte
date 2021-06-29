<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
</script>

<style>
	.modal-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.7);
    	z-index: 9;
	}
	.modal {
		position: absolute;
		left: 50%;
		top: 50%;
		width: calc(100vw - 4em);
		max-width: 32em;
		max-height: calc(100vh - 4em);
		overflow: auto;
		transform: translate(-50%,-50%);
		padding: 1em;
		border-radius: 0.2em;
		background: white;
    	z-index: 99;
	}
	.btn {
		display: block;
	}
</style>

<div class='modal-background' on:click='{() => dispatch("close")}'></div>

<div class='modal'>
	<slot name='header'></slot>
	<hr>
  <div>
    <slot name="content"></slot>
  </div>
	<hr/>
	<button class="btn" on:click='{() => dispatch("close")}'><slot name="btnText"></slot></button>
</div>
