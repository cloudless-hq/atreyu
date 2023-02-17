<script>
  import { createEventDispatcher } from 'svelte'

  export let parentNode
  export let sidebarClosed
  export let sideWidth = '240px'
  let tempWidth = sideWidth

  $: if (sidebarClosed) {
    tempWidth = sideWidth
    sideWidth = 0
  }

  $: if (!sidebarClosed) {
    sideWidth = tempWidth
  }

  let isMoving = false
  let isMouseDown = false
  let isToggling = false
  const dispatch = createEventDispatcher()

  let lastOffset = 0
  function mousedownHandler (e) {
    lastOffset = parentNode?.getBoundingClientRect?.()?.left || 0
    isMouseDown = true
    isToggling = true
  }

  function mousemoveHandler (event) {
    isMoving = true
    if (isMouseDown === true && !sidebarClosed) {
      dispatch('sidebarResize', {
        width: event.clientX - lastOffset
      })
      return true
    }

    isMoving = false
  }

  function mouseupHandler (e) {
    if (!isMoving && isToggling) {
      dispatch('sidebarToggle')
    }
    isMouseDown = false
    isMoving = false
    isToggling = false
  }
</script>

<style>
  .menu-toggle-button {
    position: absolute;
    width: 15px;
    height: 70px;
    top:45%;
    transition: opacity .2s ease;
    transition-delay: .3s;
    cursor: col-resize;
    opacity: 0;
    margin: 7px;
  }
  .menu-devider {
    cursor: col-resize;
    position: absolute;
    padding-left: 4px;
    padding-right: 20px;
    height: 100%;
    width: 2px;
    overflow: visible;
    border-left: 1px solid transparent;
  }
  /* .menu-devider:hover {
    border-color: #e0e0e0;
  } */
  .menu-toggle-button:hover, .menu-devider:hover .menu-toggle-button {
    opacity: 1;
  }
  .menu-toggle-button::after {
    position:absolute;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    content: "";
    background-color: #c3c3c3;
    border-radius: 25px;
    width: 8px;
    height: 70px;
  }
</style>

<svelte:window on:mouseup={mouseupHandler} on:mousemove={mousemoveHandler}/>

<div class="menu-devider" style="left: {sideWidth};" on:mousedown={mousedownHandler}>
  <div class="menu-toggle-button" on:mousedown={mousedownHandler}></div>
</div>