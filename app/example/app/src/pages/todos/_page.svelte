<script>
  import { getContext } from 'svelte'

  import { flip } from 'svelte/animate'
  // import { quintOut } from 'svelte/easing'
	// import { crossfade } from 'svelte/transition'

  // const [ send, receive ] = crossfade({
	// 	duration: d => Math.sqrt(d * 200),
	// 	fallback (node, params) {
	// 		const style = getComputedStyle(node)
	// 		const transform = style.transform === 'none' ? '' : style.transform
	// 		return {
	// 			duration: 300,
	// 			easing: quintOut,
	// 			css: t => `transform: ${transform} scale(${t}); opacity: ${t};`
	// 		}
	// 	}
	// })

  import TodoItem from './todo-item.svelte'
  const { data, router } = getContext('ayu')

  let pageEnd = 10

  $: view = $router.todos.view || 'all'
  $: sortBy = $router.todos.sortBy || 'date'

  $: todos = $data.todos[view][sortBy]

  $: completed = $data.todos.completed.date

  // $: syncTodos = todos.slice(0, pageEnd).map(todo => {
  //   return {
  //     $key: todo._id$,
  //     completed$: todo.completed$,
  //     description$: todo.description$,
  //     description$not: false,
  //     completed$loading: false,
  //     _id$not: false
  //   }
  // })

  // $: console.log(syncTodos)

  function changeView ({ target }) {
    $router.todos._navigate({ view, [target.name]: target.value })
  }

  function toggle (todo) {
    todo.completed = !todo.completed$
  }

  function updateText (todo, newText) {
    if (todo.description$ !== newText) {
      todo.description = newText
    }
  }

  function remove (todo) {
    todo.deleted = true
  }

  async function add ({ target }) {
    await $data._docs.create({
      description: (new FormData(target)).get('newText'),
      completed: false,
      type: 'todo',
      date: Date.now()
    })

    target.reset()
  }
</script>

{#if todos.length$loading}
  <h1>
    Loading…
  </h1>
{:else}
  <h1>
    Showing { todos.length } of { $data.todos.all[sortBy].length } todos
  </h1>
{/if}

<div class="m-6">
  <label for="view">Filter:</label>

  <ul class="flex">
    <li class="m-2" class:active={ $router.todos.view === 'all' } >
      <a href={ $router.todos._link({ view: 'all', sortBy }) }>Show all</a>
    </li>

    <li class="m-2" class:active={ $router.todos.view === 'completed' }>
      <a href={ $router.todos._link({ view: 'completed', sortBy: 'date' }) }>Show completed</a>
    </li>

    <li class="m-2" class:active={ $router.todos.view === 'active' }>
      <a href={ $router.todos._link({ view: 'active', sortBy: 'date' }) }>Show active</a>
    </li>
  </ul>
</div>

<div class="m-6">
  <label for="sortBy">Sort:</label>

  <select class="rounded" name="sortBy" value={sortBy} on:change={changeView}>
    <option value='date'>Time</option>

    {#if $router.todos.view === 'all' }
      <option value='completed'>Completed</option>
    {/if}
  </select>
</div>

<form class="m-6 mt-20" on:submit|preventDefault={add}>
  <input id="newText" name="newText" type="text" class="rounded w-[440px]">
  <button class="p-2 rounded" type="submit">+ Add new task</button>
</form>

<div class="py-10">
  {#each todos.slice(0, pageEnd) as todo, i (todo.$key)}
    <div style="position: relative;" class:hidden={todo._id$not} animate:flip="{{duration: 200}}" >
      <!-- fixme: loading broken in:receive="{{ key: todo.$key }}" out:send="{{ key: todo.$key }}" -->
      <TodoItem {todo} {remove} {toggle} {updateText} />
    </div>
  {/each}
</div>

<!-- {#if view === 'active'}
  <h2>Completed:</h2>
  <div class="py-10">
    {#each completed.slice(0, pageEnd) as todo, i (todo.$key)}
      <div style="position: relative;" class:hidden={todo._id$not} animate:flip="{{duration: 200}}" in:receive="{{ key: todo.$key }}" out:send="{{ key: todo.$key }}">
        <TodoItem {todo} {remove} {toggle} {updateText} />
      </div>
    {/each}
  </div>
{/if} -->

{#if pageEnd < todos.length}
  <button class="p-3 m-14 rounded" on:click={() => { pageEnd += 10 }}>Load more...</button>
{/if}
