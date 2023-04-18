<script context="module">
  const elements = new Map()
  const toToggle = new Set()
  let ongoing

  const bottom = window.innerHeight / 2
  const left = window.innerWidth / 2
  const top = window.innerHeight / 2
  const right = window.innerWidth / 2

  const observer = new IntersectionObserver(entries => {
    entries.forEach((arg) => {
      // console.log(arg)
      const { isIntersecting, target } = arg
      if (isIntersecting) {
        toToggle.add(elements.get(target).show)
      } else {
        toToggle.add(elements.get(target).hide)
      }
      if (!ongoing) {
        ongoing = setTimeout(() => {
          ongoing = null
          toToggle.forEach(entry => { entry(); toToggle.delete(entry) })
        }, 50)
      }
    })
  }, {
    // root: document.querySelector("#scrollArea")
    rootMargin: `${bottom}px ${left}px ${top}px ${right}px`,
    threshold: 0
  })

  // requestIdleCallback(() => {
  //   console.log('idle')
  //   // TODO: prerender ?
  // })
</script>

<script>
  import { onMount } from 'svelte'
  export let preload = true
  const prealoading = false

  export let style = ''

	let shouldRender = false
	let container

  // TODO: override with actual size before unrender fixedMinHeight.value = targetEl.value.clientHeight;

  onMount(() => {
    elements.set(container, {
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

<!-- {#if preload}
  <slot></slot>
{/if} -->

<div bind:this={container} {style}>
  {#if shouldRender || (prealoading && preload)}
	  <slot></slot>
  {/if}
</div>
