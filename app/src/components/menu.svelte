<script>
  let open
  let buttonNode
  let menuNode
  let originalClick = false

  function toggle (e) {
    open = !open
  }

  function mouseUp (e) {
    if (e.path.includes(menuNode)) {
      if (!originalClick) {
        e.target.dispatchEvent(new Event('mousedown', {
          bubbles: true,
          cancelable: true
        }))
      }

      open = false
    }
    originalClick = false
  }

  function mouseDown (e) {
    if (open) {
      if (e.path.includes(menuNode)) {
        originalClick = true
      } else if (!e.path.includes(buttonNode)) {
        open = false
      }
    }
    // todo on select item use mouseup not mousedown!
  }
</script>

<svelte:body on:mouseup|passive={mouseUp} on:mousedown|passive={mouseDown}  />

<div bind:this={buttonNode} on:mousedown={toggle}>
  <slot name="menu-button" {open}>
  </slot>
</div>

<!-- {#if open} -->
<div bind:this={menuNode} >
  <slot name="menu" {open}>
  </slot>
</div>
<!-- {/if} -->
