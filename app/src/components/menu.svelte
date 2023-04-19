<script>
  let open
  let buttonNode
  let menuNode
  // let originalClick = false

  function toggle (e) {
    open = !open
  }

  let longCLick
  function mouseUp (e) {
    longCLick && longCLick !== true && clearTimeout(longCLick)

    const path = e.composedPath()
    if (path.includes(menuNode)) {
      // if (!originalClick) {
        e.target.dispatchEvent(new MouseEvent('mousedown', {
          bubbles: true,
          button: 0,
          cancelable: true
        }))
      // }

      open = false
    } else if (!path.includes(buttonNode)) {
      open = false
    } else {
      if (longCLick === true) {
        open = false
      }
    }
    // originalClick = false
  }

  function mouseDown (e) {
    longCLick = setTimeout(() => {
      longCLick = true
    }, 600)

    const path = e.composedPath()
    if (open) {
      if (path.includes(menuNode)) {
        // originalClick = true
        open = false
      } else if (!path.includes(buttonNode)) {
        open = false
      }
    }
  }
</script>

<svelte:body on:mouseup|passive={mouseUp} on:mousedown|passive={mouseDown}  />

<div bind:this={buttonNode} on:mousedown={toggle}>
  <slot name="menu-button" {open}>
  </slot>
</div>

<div bind:this={menuNode} >
  {#if open}
    <slot name="menu" {open}>
    </slot>
  {/if}
</div>

<!-- <slot>
</slot> -->
