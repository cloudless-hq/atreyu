<style>
  .menu-toggle-button {
    position: absolute;
    width: 15px;
    left: 240px;
    height: 50px;
    top:45%;
    transition: opacity .1s ease;
    transition-delay: 0.7s;
    cursor: col-resize;
    opacity: 0;
    margin: 12px;
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

<div class="menu-toggle-button" 
  style="left:{sideWidth};" 
  on:mousedown={mousedownHandler}></div>
<script>
  import { createEventDispatcher } from 'svelte'

  export let sidebarClosed
  export let sideWidth
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

  function mousedownHandler (event) {
    isMouseDown = true
    isToggling = true
  }

  function mousemoveHandler (e) {
    isMoving = true
    if (isMouseDown === true && !sidebarClosed) {
      dispatch('sidebarResize', {
        width: event.clientX
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
