<script>
  import MenuToggleBtn from './menu-toggle-btn.svelte'

  export let right = false
  // Represents the width of the sidebar when adjacent. If not set (null) it defaults to the sidebar's content width
  // .with-sidebar > :global(*) > :global(*) {flex-basis: sideWidth}
  export let sideWidth = 'auto'
  // A CSS percentage value. The minimum width of the content element in the horizontal configuration
  // .with-sidebar > :global(*) > :global(:last-child) {min-width: calc(contentMin - var(--space))}
  export let contentMin = 50
  export let height = '100vh'
  export let top = '0'

  let sidebarClosed = false
  let node

  // function handleKeydown (e) {
  //   if (tag.length > 0 && (e.key === 'Enter' || e.key === 'Tab')) {
  //     e.preventDefault()
  //     taglist = [...taglist, tag]
  //     tag = ''
  //   }
  // }

  function resizeSideHandler (event) {
    sideWidth = event.detail.width + 'px'
    // if (sideWidth < 180) {
    //   sidebarClosed = true
    // }
  }
</script>

<style>
  /* TODO: only evaluate on sidebar and content classes */

  .with-sidebar {
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    height: var(--height);
    padding-top: var(--top);
  }

  .with-sidebar.right{
    flex-direction: row-reverse;
  }

  .with-sidebar > :global(*) {
    flex-grow: 1;
    flex-basis: var(--side-width);
    height: 100%;
    overflow: auto;
  }

  .with-sidebar.closed > :global(*) {
    width: 0;
    flex-basis: auto;
    flex-grow: 0;
    margin: 0;
    transition: all .2s ease-in;
  }

  .with-sidebar.closed > :global(:first-child) {
    display: none;
  }

  :global(.with-sidebar.closed > .sidebar) {
    min-width: 0!important;
  }

  .with-sidebar > :global(:last-child) {
    flex-basis: 0;
    flex-grow: 999;
    /* TODO: find less hacky workaound */
    /* min-width: calc(1% * var(--content-min));  */
  }

  /* .with-sidebar > :global(:first-child)::after {  TODO: this creates an unclickable deadzone on the button, fix needed
    /* content:"";
    width: 10px;
    height: 100vh;
    position: absolute;
    left:15rem;
    top:0;
  }

   .with-sidebar.closed > :global(:first-child)::after {
    left:0;
  } */

  .with-sidebar > :global(:first-child:hover) :global(.menu-toggle-button){
    transition-delay: .1s;
    opacity: .9;
  }

</style>

<div bind:this={node} class="with-sidebar" class:closed={sidebarClosed} class:right style="--height: {height}; --top: {top}; --side-width: {sideWidth}; --content-min: {contentMin};">
  <slot name="sidebar"></slot>

  <MenuToggleBtn
    parentNode={node}
    {sidebarClosed}
    on:sidebarToggle={() => { sidebarClosed = !sidebarClosed }}
    on:sidebarResize={resizeSideHandler}
    {sideWidth}
  />

  <slot name="main"></slot>
</div>
