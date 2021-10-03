<script>
  import { onMount, tick } from 'svelte'
  // import { quintOut } from 'svelte/easing'
  // import { crossfade } from 'svelte/transition'
  // import { flip } from 'svelte/animate'

  export let items
  export let height = '100%'
  export let itemHeight = undefined
  export let perPage = 0
  export let scrollKey = 'all'
  // export let reverse = false
  export let start = 0
  export let end = perPage

  let height_map = []
  let rows
  let viewport
  let scrollTops = {}
  let contents
  let viewport_height = 0
  let visible
  let mounted

  let top = 0
  let bottom = 0
  let average_height

  // const [send, receive] = crossfade({
  // 	duration: d => Math.sqrt(d * 50),
  //
  // 	fallback (node, params, b) {
  // 		console.log(node, params, b)
  // 		const style = getComputedStyle(node)
  // 		const transform = style.transform === 'none' ? '' : style.transform
  //
  // 		return {
  // 			duration: 250,
  // 			easing: quintOut,
  // 			css: t => `
  // 				transform: ${transform} scale(${t})
  // 				opacity: ${t}
  // 			`
  // 		}
  // 	}
  // })

  // const loadingKeys = {}
  // const keys = {}

  $: visible = items.slice(start, end).map((data, i) => {
    const loading = data._id$._loading
    const globalIndex = i + start
    let id = ''

    if (loading) {
      id = globalIndex + '_' + Math.floor(Math.random() * 1000000000)
      // loadingKeys[globalIndex] = id
    } else {
      // if (keys[data._id$]) {
      //   id = keys[data._id$]
      // } else if (loadingKeys[globalIndex]) {
      //   id = loadingKeys[globalIndex]
      //   keys[data._id$] = id
      //   delete loadingKeys[globalIndex]
      // } else {
      id = data._id$
      // }
    }
    return {
      index: globalIndex,
      data,
      loading,
      key: id
    }
  })

  // whenever `items` changes, invalidate the current heightmap
  $: if (mounted) refresh(items, viewport_height, itemHeight)

  $: if (mounted) handleViewchange(scrollKey)

  function handleViewchange (scrollKey) {
    if (typeof scrollTops[scrollKey] === 'undefined') {
      scrollTops[scrollKey] = 0
      viewport.scrollTo(0, 0)
    } else {
      viewport.scrollTo(0, scrollTops[scrollKey])
    }
  }

  async function refresh(items, viewport_height, itemHeight) {
    const { scrollTop } = viewport

    await tick() // wait until the DOM is up to date

    let content_height = top - scrollTop

    let i = start

    while (content_height < viewport_height && i < items.length) {
      let row = rows[i - start]

      if (!row) {
        end = i + 1
        await tick() // render the newly visible row
        row = rows[i - start]
      }

      const row_height = (height_map[i] = itemHeight || row.offsetHeight)
      content_height += row_height

      i += 1
    }

    end = i

    const remaining = items.length - end
    average_height = (top + content_height) / end

    bottom = remaining * average_height
    height_map.length = items.length
  }

  async function handle_scroll () {
    const { scrollTop } = viewport

    const old_start = start

    for (let v = 0; v < rows.length; v += 1) {
      height_map[start + v] = itemHeight || rows[v].offsetHeight
    }

    let i = 0
    let processedHeight = 0

    // scrolltop 0 at top and max at scrolled down
    while (i < items.length) {
      const row_height = height_map[i] || average_height
      if (processedHeight + row_height + perPage * average_height > scrollTop) {
        start = i
        top = processedHeight

        break
      }

      processedHeight += row_height
      i += 1
    }

    while (i < items.length) {
      processedHeight += height_map[i] || average_height
      i += 1

      if (
        processedHeight - perPage * average_height >
        scrollTop + viewport_height
      )
        break
    }
    end = i

    const remaining = items.length - end
    average_height = processedHeight / end

    while (i < items.length) height_map[i++] = average_height
    bottom = remaining * average_height

    // prevent jumping if we scrolled up into unknown territory
    if (start < old_start) {
      await tick()

      let expected_height = 0
      let actual_height = 0

      for (let i = start; i < old_start; i += 1) {
        if (rows[i - start]) {
          expected_height += height_map[i]
          actual_height += itemHeight || rows[i - start].offsetHeight
        }
      }

      const d = actual_height - expected_height
      viewport.scrollTo(0, scrollTop + d)
    }

    scrollTops[scrollKey] = scrollTop

    // TODO if we overestimated the space these
    // rows would occupy we may need to add some
    // more. maybe we can just call handle_scroll again?
  }

  // trigger initial refresh
  onMount(() => {
    rows = contents.getElementsByTagName("svelte-virtual-list-row")
    mounted = true
  })
</script>

<style>
  svelte-virtual-list-viewport {
    position: relative;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    display: block;
  }

  svelte-virtual-list-contents,
  svelte-virtual-list-row {
    display: block;
    backface-visibility: hidden;
  }

  svelte-virtual-list-row {
    overflow: hidden;
  }
</style>

<svelte-virtual-list-viewport
  bind:this={viewport}
  bind:offsetHeight={viewport_height}
  style="height: {height};"
  on:scroll={handle_scroll}>
  <svelte-virtual-list-contents
    bind:this={contents}
    style="transform: translate3d(0, {top}px, 0); padding-bottom: {bottom}px;">
    <!-- in:receive="{{key: row.key, loading: row.loading, index: row.index}}" out:send="{{key: row.key, loading: row.loading, index: row.index}}" animate:flip -->

    {#each visible as row (row.key)}
      <svelte-virtual-list-row>
        <slot item={row.data} index={row.index} length={items.length}>
          Missing template
        </slot>
      </svelte-virtual-list-row>
    {/each}
  </svelte-virtual-list-contents>
</svelte-virtual-list-viewport>
