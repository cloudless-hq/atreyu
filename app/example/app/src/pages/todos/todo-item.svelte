<script>
  export let todo
  export let remove
  export let toggle

  export let updateText
</script>

<style>
  .todo .is-complete {
    text-decoration: line-through;
    color: green;
    background: none;
    border: 1px solid #0000;
  }
  .todo input {
    width: 440px;
  }
  .todo button {
    border-radius: 50%;
    width: 2.25em;
    height: 2.25em;
    line-height: 1.3em;
    text-align: center;
    margin-left: 0.75em;
    padding: 0;
  }
</style>

{#if todo}
  <div class="todo">
    <input type="text" placeholder="  " class="rounded"
      class:animated-placeholder={todo._id$not}
      class:is-complete={todo.completed$}
      on:blur={e => updateText(todo, e.target.value)} value={todo.description$} >

    <button on:click={() => toggle(todo)}>
      {#if todo.completed$loading}
        &nbsp;
      {:else}
        {#if todo.completed$}♻️{:else}✔️{/if}
      {/if}
    </button>

    <button on:click={() => remove(todo)}>🗑️</button>
  </div>
{/if}