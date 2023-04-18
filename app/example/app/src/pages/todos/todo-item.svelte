<script>
  export let todo
  export let remove
  export let toggle

  export let updateText
</script>

{#if todo}
  <div class="todo m-6">
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