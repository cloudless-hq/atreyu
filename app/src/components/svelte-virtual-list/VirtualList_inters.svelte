<script>
	import { onMount, tick } from 'svelte';

	// props
	export let items;
	export let height = '100%';
	export let itemHeight = undefined;
	export let perPage = 0
	// export let scrollKey = 'all'
	// export let reverse = false

	// read-only, but visible to consumers via bind:start
	export let start = 0;
	export let end = perPage;

	// local state
	let height_map = [];
	let rows;
	let starter;
	let ender;
	let viewport;
	let contents;
	let viewport_height = 0;
	let visible;
	let mounted;
	let observer;

	let top = 0;
	let bottom = 0;
	let average_height;

	// $: visible = items.slice(start, end).map((data, i) => {
	// 	return { index: i + start, data };
	// });

	$: {
		// TODO: implement slice()
		const nextVisible = []
		for (let i = start; i < Math.min(end, items.length); i++) {
			const item = items[i]
			nextVisible.push({ index: i + start, data: item, key: item._id$._loading ? (i + start) + '_' + Math.floor(Math.random() * 1000000000) : item._id$ })
		}
		visible = nextVisible
	}

	// whenever `items` changes, invalidate the current heightmap
	$: if (mounted) refresh(items, viewport_height, itemHeight);

	// $: if (starter) observer.observe(starter)
	$: if (ender) observer.observe(ender)

	async function refresh(items, viewport_height, itemHeight) {
		const { scrollTop } = viewport;
		// console.log('refreshing')
		await tick(); // wait until the DOM is up to date

		let content_height = top - scrollTop;

		let i = start;

		while (content_height < viewport_height && i < items.length) {
			let row = rows[i - start];

			if (!row) {
				end = i + 1
				await tick(); // render the newly visible row
				row = rows[i - start]
			}

			const row_height = height_map[i] = itemHeight || row.offsetHeight;
			content_height += row_height;

		 	i += 1
		}

		end = i;

		const remaining = items.length - end;
		average_height = (top + content_height) / end;

		bottom = remaining * average_height;
		height_map.length = items.length;

	}

	// async function handle_scroll () {
	// 	// TODO: requestIdleCallback()
	//
	// 	const { scrollTop } = viewport;
	//
	// 	const old_start = start;
	//
	// 	for (let v = 0; v < rows.length; v += 1) {
	// 		height_map[start + v] = itemHeight || rows[v].offsetHeight;
	// 	}
	//
	// 	let i = 0;
	// 	let y = 0;
	//
	// 	while (i < items.length) {
	// 		const row_height = height_map[i] || average_height;
	// 		if (y + row_height > scrollTop) {
	// 			start = i;
	// 			top = y;
	//
	// 			break;
	// 		}
	//
	// 		y += row_height;
	// 		i += 1;
	// 	}
	//
	// 	while (i < items.length) {
	// 		y += height_map[i] || average_height;
	// 		i += 1;
	//
	// 		if (y > (scrollTop + viewport_height + (perPage * average_height))) break;
	// 	}
	// 	// console.log({start, end}) - + (perPage * average_height) + (perPage * average_height)
	// 	console.log(i)
	// 	end = i;
	//
	// 	const remaining = items.length - end;
	// 	average_height = y / end;
	//
	// 	while (i < items.length) height_map[i++] = average_height;
	// 	bottom = remaining * average_height;
	//
	// 	// prevent jumping if we scrolled up into unknown territory
	//
	// 	if (start < old_start) {
	// 		await tick();
	//
	// 		let expected_height = 0;
	// 		let actual_height = 0;
	//
	// 		for (let i = start; i < old_start; i +=1) {
	// 			if (rows[i - start]) {
	// 				expected_height += height_map[i];
	// 				actual_height += itemHeight || rows[i - start].offsetHeight;
	// 			}
	// 		}
	//
	// 		const d = actual_height - expected_height;
	// 		viewport.scrollTo(0, scrollTop + d);
	// 	}
	//
	// 	// TODO if we overestimated the space these
	// 	// rows would occupy we may need to add some
	// 	// more. maybe we can just call handle_scroll again?
	// }

	async function update () {
		await tick()
		for (let v = 0; v < rows.length; v += 1) {
			height_map[start + v] = itemHeight || rows[v].offsetHeight;
		}
		const remaining = items.length - end;
		average_height = height_map.reduce((total, num) => total + num, 0) / end;
		bottom = remaining * average_height;
	}

	async function endHandler () {
		end = Math.min(items.length, end + perPage)
		await update()
	}

	let lock = false
	// trigger initial refresh
	onMount(() => {
		observer = new IntersectionObserver((a,b) => {
			if (a.filter(ent => ent.isIntersecting).length) {
				endHandler().then()
				console.log(a,b)
			}
		}, {
		  root: viewport,
		  rootMargin: '0px',
		  threshold: 0
		})

		rows = contents.getElementsByTagName('svelte-virtual-list-row')

		mounted = true
	});
</script>

<style>
	svelte-virtual-list-viewport {
		position: relative;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		display: block;
	}

	svelte-virtual-list-contents, svelte-virtual-list-row {
		display: block;
		backface-visibility: hidden;
	}

	svelte-virtual-list-row {
		overflow: hidden;
	}
	svelte-virtual-list-starter, svelte-virtual-list-ender {
		display: block;
		background-color: black;
		height: 1px;
		margin-top: -1px;
	}
</style>

<svelte-virtual-list-viewport
	bind:this={viewport}
	bind:offsetHeight={viewport_height}
	style="height: {height};"
>
	<svelte-virtual-list-contents
		bind:this={contents}
		style="transform: translate3d(0, {top}px, 0); padding-bottom: {bottom}px;"
	>
		{#each visible as row, num (row.key)}
			{#if num === 2}
				<svelte-virtual-list-starter bind:this={starter}></svelte-virtual-list-starter>
			{:else if num === visible.length - 2}
				<svelte-virtual-list-ender bind:this={ender}></svelte-virtual-list-ender>
			{/if}

			<svelte-virtual-list-row>
				<slot item={row.data}></slot>
			</svelte-virtual-list-row>
		{/each}

	</svelte-virtual-list-contents>
</svelte-virtual-list-viewport>
