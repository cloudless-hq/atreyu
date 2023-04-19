<script>
  import Lazy from '/_ayu/src/components/lazy.svelte'
  import Header from '/_ayu/src/components/header.svelte'
  import { getContext } from 'svelte'
  const { data, router } = getContext('ayu')

  import TodoItem from './todo-item.svelte'

  import { flip } from 'svelte/animate'
  import { quintOut } from 'svelte/easing'
	import { crossfade } from 'svelte/transition'

  const [ send, receive ] = crossfade({
		duration: d => Math.sqrt(d * 200),

    fallback (node, params) {
			const style = getComputedStyle(node)
			const transform = style.transform === 'none' ? '' : style.transform
			return {
				duration: 300,
				easing: quintOut,
				css: t => `transform: ${transform} scale(${t}); opacity: ${t};`
			}
		}
	})

  $: view = $router.todos.view || 'all'
  $: sortBy = $router.todos.sortBy || 'date'
  $: todos = $data.todos[view][sortBy]

  // $: completed = $data.todos.completed.date
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
      date: Date.now() // TODO: move to system created date, changes etc.
    })

    target.reset()
  }
</script>

<style>
  a {
    color: rgb(0,100,200);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  a:visited {
    color: rgb(0,80,160);
  }

  .active {
    font-weight: 700;
  }

  label {
    display: inline-block;
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: bold;
  }

  input, button, select {
    font-family: inherit;
    font-size: inherit;
    padding: 0.4em;
    margin: 0 0 0.5em 0;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 2px;
  }

  input:disabled {
    color: #ccc;
  }

  button {
    background-color: #f4f4f4;
    outline: none;
  }

  button:active {
    background-color: #ddd;
  }

  button:focus {
    border-color: #666;
  }

  ul {
    list-style: none;
    padding: 0;
  }
  button {
    margin-left: 0.75em;
  }
</style>

<Header hide={['settings']}>
  <img slot="logo" class="logo sm:px-6 lg:px-8 left-0 absolute h-[35px]" src="/assets/favicon.png" alt="today logo" />
</Header>

<div class="p-10 pt-24">
  {#if todos.length$loading}
    <h1>
      Loading…
    </h1>
  {:else}
    <h1>
      Showing
      { todos.length } of
      { $data.todos.all[sortBy].length } todos
    </h1>
  {/if}

  <div class="m-6">
    <label for="view">Filter:</label>

    <ul class="flex">
      <li class="m-2" class:active={ view === 'all' } >
        <a href={ $router.todos._link({ view: 'all', sortBy }) }>Show all</a>
      </li>

      <li class="m-2" class:active={ view === 'completed' }>
        <a href={ $router.todos._link({ view: 'completed', sortBy: 'date' }) }>Show completed</a>
      </li>

      <li class="m-2" class:active={ view === 'active' }>
        <a href={ $router.todos._link({ view: 'active', sortBy: 'date' }) }>Show active</a>
      </li>
    </ul>
  </div>

  <div class="m-6">
    <label for="sortBy">Sort:</label>

    <select class="rounded" name="sortBy" value={sortBy} on:change={changeView}>
      <option value='date'>Time</option>

      {#if view === 'all' }
        <option value='completed'>Completed</option>
      {/if}
    </select>
  </div>

  <form class="m-6 mt-20" on:submit|preventDefault={add}>
    <input id="newText" name="newText" type="text" class="rounded w-[440px]">
    <button class="p-2 rounded" type="submit">+ Add new task</button>
  </form>

  <div class="py-10">
    {#each todos as todo, i (todo.$refKey)}
      <div style="transform: translateZ(0); backface-visibility: hidden; perspective: 1000;" class="realtive p-3" animate:flip="{{ duration: 200 }}" in:receive="{{ key: todo.$refKey }}" out:send="{{ key: todo.$refKey }}" >
        <Lazy style="min-height: 42px;" preload={i < 20} batchSize={20} listEnd={i === 0 || i + 1 === todos.length}>
          <TodoItem todo={$data._loadRef(todo.$ref)} {remove} {toggle} {updateText} />
        </Lazy>
      </div>
    {/each}
  </div>

  <!-- fixme: loading broken animate flip, in out crossfade
    {#if view === 'active'}
      <h2>Completed:</h2>
      <div class="py-10">
        {#each completed as todo, i (todo.$key)}
          <div style="position: relative;" class:hidden={todo._id$not} animate:flip="{{duration: 200}}" in:receive="{{ key: todo.$key }}" out:send="{{ key: todo.$key }}">
            <TodoItem {todo} {remove} {toggle} {updateText} />
          </div>
        {/each}
      </div>
    {/if} -->
</div>
