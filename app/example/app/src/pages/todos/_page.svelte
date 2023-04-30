<script>
  import Lazy from '/_ayu/src/components/lazy.svelte'
  import Header from '/_ayu/src/components/header.svelte'
  import { getContext } from 'svelte'
  const { data, router } = getContext('ayu')

  import TodoItem from './todo-item.svelte'

  // import { flip, send, receive } from './anim.js'

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

  input:disabled {
    color: #ccc;
  }

  button {
    background-color: #f4f4f4;
    outline: none;
    margin-left: 0.75em;
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
      Showing { todos.length } of { $data.todos.all[sortBy].length } todos
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
      {#if view === 'all'}
        <option value='completed'>Completed</option>
      {/if}
    </select>
  </div>

  <form class="m-6 mt-20" on:submit|preventDefault={add}>
    <input id="newText" name="newText" type="text" class="rounded w-[440px]">
    <button class="p-2 rounded" type="submit">+ Add new task</button>
  </form>

  <div class="py-10">
    {#each todos as todo, i}
      <div class="realtive p-3">
        <Lazy style="min-height: 42px;" preload={i < 20} batchSize={20} batchEnd={i === 0 || i + 1 === todos.length}>
          <TodoItem todo={$data._loadRef(todo.$ref)} {remove} {toggle} {updateText} />
        </Lazy>
      </div>
    {/each}

    <hr class="m-6 mt-10" />
    <div class="relative p-3" style="height: 50vh;"></div>
  </div>

  <!--
    {@const key = todo.$refKey}
    {@const disabled = $router._preloading}

    (todo.$refKey)

    animate:flip="{{ duration: 200, disabled }}" in:receive="{{ key, disabled }}" out:send="{{ key, disabled }}"

    {#if view === 'active'}
      <h2>Completed:</h2>

      <div class="py-10" style="height: 50vh; overflow: scroll;">
        {#each completed as todo, i (todo.$refKey)}
          <div class="relative p-3" animate:flip="{{duration: 200}}" in:receive="{{ key: todo.$refKey }}" out:send="{{ key: todo.$refKey }}" >
            <Lazy style="min-height: 42px;" preload={i < 10} batchSize={20} listEnd={i === 0 || i + 1 === todos.length}>
              <TodoItem todo={$data._loadRef(todo.$ref)} {remove} {toggle} {updateText} />
            </Lazy>
          </div>
        {/each}

        <hr class="m-6 mt-10" />

        <div class="relative p-3" style="height: 50vh;"></div>
      </div>
    {/if}

    .slice(0, Math.min(2, todos.length)
    FIXME: loading broken animate flip, in out crossfade
   .slice(0, 1) style="transform: translateZ(0); backface-visibility: hidden; perspective: 1000;"
  -->
</div>
