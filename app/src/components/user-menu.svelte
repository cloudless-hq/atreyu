<script>
  import Menu from '/_ayu/src/components/menu.svelte'
  import trans from '/_ayu/src/class-transition.js'

  const currentLocation = location.pathname + location.search + location.hash
  const currentContinue = currentLocation === '/' ? '' : `?continue=${currentLocation}`

  export let glass = true
  console.log(glass)
  export let hide = []
  function logout () {
    fetch('/_api/_logout')
  }
</script>

<style lang="postcss">
   div[role="menu"] [role="menuitem"]:hover {
    @apply bg-gray-100;
  }

  .glass {
    backdrop-filter: saturate(180%) blur(5px);
    background: hsla(0, 0%, 100%, 0.8);
  }

  div[role="menu"] [role="menuitem"]:active {
    @apply bg-gray-200;
    cursor: pointer;
  }

  :global(.menu-in) {
    @apply ease-out duration-200 opacity-100 scale-100;
  }

  :global(.menu-out) {
    @apply ease-in duration-75 opacity-0 scale-95;
  }
</style>

<div class="fixed top-3 right-3">
  <Menu let:open>
    <button slot="menu-button" type="button" active={open} class="max-w-xs bg-white flex items-center text-sm rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary-500" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
      <span class="inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-100">
        <svg class="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </span>
    </button>

    <div
      slot="menu"
      in:trans="{{ duration: 200, addClasses: 'menu-in', removeClasses: 'menu-out' }}"
      out:trans="{{ duration: 75, addClasses: 'menu-out', removeClasses: 'menu-in' }}"

      class:glass
      class="origin-top-right bg-white mt-2 absolute z-50 right-3 w-48 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus-visible:outline-none transition ease-out transform duration-200 opacity-0 scale-95"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="user-menu-button"
      tabindex="-1"
    >
      {#if !hide.includes('accounts')}
        <a href="/_ayu/accounts/{currentContinue}" rel="external" class="active:bg-gray-100 cursor-pointer block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="user-menu-item-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline-block mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 -mt-[3px]">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>

          My Accounts
        </a>
      {/if}

      {#if !hide.includes('sessions')}
        <a href="/_ayu/accounts/{currentContinue}#/sessions" rel="external" class="active:bg-gray-100 cursor-pointer block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="user-menu-item-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline-block mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 -mt-[3px]">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>

          Sessions
        </a>
      {/if}

      {#if !hide.includes('sessions')}
        <a href="/_ayu/accounts/{currentContinue}#/sessions" rel="external" class="active:bg-gray-100 cursor-pointer block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="user-menu-item-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="19" height="17" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline-block mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 -mt-[3px]">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>

          Users
        </a>
      {/if}

      {#if !hide.includes('settings')}
        <a href="#/settings" rel="external" class="active:bg-gray-100 cursor-pointer block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="user-menu-item-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="17"  fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline-block mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500 -mt-[3px]">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>

          Settings
        </a>
      {/if}

      {#if !hide.includes('logout')}
        <div on:mousedown={logout} class="active:bg-gray-100 cursor-pointer block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="user-menu-item-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" class="inline-block mr-2 -mt-[3px] h-5 w-5 text-gray-400 group-hover:text-gray-500" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>

          Log out
        </div>
      {/if}
    </div>
  </Menu>
</div>
