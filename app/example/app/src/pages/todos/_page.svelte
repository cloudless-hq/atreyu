<script>
  import {getContext} from 'svelte'
  import TodoItem from './todo-item.svelte'
  const { data, router } = getContext('ayu')

  let pageEnd = 10

  $: view = $router.todos.view || 'all'
  $: sortBy = $router.todos.sortBy || 'date'

  $: todos = $data.todos[view][sortBy]

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
    Showing { todos.length } of { $data.todos.all.date.length } todos
  </h1>
{/if}

<div class="m-6">
  <label for="view">Filter:</label>

  // todo preload example:
  <ul class="rounded" name="view" value={view}>
    <li value='all'>
      Show all
    </li>
    <li value='completed'>
      Show completed
    </li>
    <li value='active'>
      Show active
    </li>
  </ul>
</div>

<div class="m-6">
  <label for="sortBy">Sort:</label>

  <select class="rounded" name="sortBy" value={sortBy} on:change={changeView}>
    <option value='date'>Time</option>
    <option value='completed'>Completed</option>
  </select>
</div>

<form class="m-6 mt-20" on:submit|preventDefault={add}>
  <input id="newText" name="newText" type="text" class="rounded w-[440px]">
  <button class="p-2 rounded" type="submit">+ Add new task</button>
</form>

<ul class="py-10">
  {#each todos.slice(0, Math.min(pageEnd, todos.length)) as todo, i (i)}
    <TodoItem {todo} {remove} {toggle} {updateText} />
  {/each}
</ul>

{#if pageEnd < todos.length}
 <button class="p-3 m-14 rounded" on:click={() => { pageEnd += 10 }}>Load more...</button>
{/if}
