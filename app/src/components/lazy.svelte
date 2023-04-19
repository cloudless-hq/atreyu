<script context="module">
  const elements = new Map()
  const toShow = new Set()
  const toHide = new Set()

  let ongoing

  let _batchSize = 10

  // TODO: reset on window resize
  const bottom = window.innerHeight
  const left = window.innerWidth
  const top = window.innerHeight
  const right = window.innerWidth

  const observer = new IntersectionObserver(entries => {
    entries.forEach((arg) => {
      const { target, isIntersecting } = arg
      const elem = elements.get(target)
      // fixedMinHeight.value = targetEl.value.clientHeight TODO: add elem height from observer callback?
      if (isIntersecting) {
        toShow.add(elem.show)
        toHide.delete(elem)
      } else {
        toHide.add(elem.hide)
        toShow.delete(elem)
      }

      if (toShow.size > _batchSize || toHide.size > _batchSize || elem.listEnd) {
        if (ongoing) {
          clearTimeout(ongoing)
          ongoing = null
        }

        ongoing = setTimeout(() => {
            ongoing = null
            toShow.forEach(entry => { entry(); toShow.delete(entry) })
            toHide.forEach(entry => { entry(); toHide.delete(entry) })
          }, 3)
      } else {
        if (!ongoing) {
          ongoing = setTimeout(() => {
            ongoing = null
            toShow.forEach(entry => { entry(); toShow.delete(entry) })
            toHide.forEach(entry => { entry(); toHide.delete(entry) })
          }, 400)
        }
      }
    })
  }, {
    // root: document.querySelector("#scrollArea")
    rootMargin: `${bottom}px ${left}px ${top}px ${right}px`,
    threshold: 0.5 // [0, 1]
  })

  // requestIdleCallback(() => {
  //   console.log('idle')
  //   // TODO: prerender more pages ?
  // })
</script>

<script>
  import { getContext } from 'svelte'
  const { router } = getContext('ayu')
  import { onMount } from 'svelte'
  export let preload = true
  export let style = ''
  // export let kind = ''
  export let batchSize = 10
  export let id = ''
  export let listEnd = false

	let shouldRender = false
	let container
  let noPointer

  _batchSize = batchSize
  // TODO: override with actual size before unrender fixedMinHeight.value = targetEl.value.clientHeight;

  const preloading = $router._preloading

  // FIXME: should be on whole parent?
  let pointerWating = false
  $: {
    if (!shouldRender) {
      noPointer = true
      pointerWating && clearTimeout(pointerWating)
    } else if (noPointer === true && !pointerWating) {
      pointerWating = setTimeout(() => { noPointer = false; pointerWating = false }, 50)
    }
  }

  onMount(() => {
    elements.set(container, {
      id,
      listEnd,
      show: () => { shouldRender = true },
      hide: () => { shouldRender = false }
    })
    observer.observe(container)

    // console.log(elements)
    return () => {
      elements.delete(container)
      observer.unobserve(container)
    }
	})
</script>

<style>
  .noPointer {
    pointer-events: none;
  }
  div {
    contain: style paint;
  }
</style>

<div bind:this={container} {style} class={$$props.class} class:noPointer>
  {#if shouldRender || (preloading && preload)}
	  <slot></slot>
  {/if}
</div>
