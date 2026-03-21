<script>
  import Router from 'svelte-spa-router'
  import { wrap } from 'svelte-spa-router/wrap'
  import { isAuthenticated } from './lib/stores/app.js'
  import Navbar from './lib/components/Navbar.svelte'
  import Toast from './lib/components/Toast.svelte'
  import Login from './routes/Login.svelte'
  import Register from './routes/Register.svelte'
  import Dashboard from './routes/Dashboard.svelte'
  import Campo from './routes/Campo.svelte'
  import Silobolsa from './routes/Silobolsa.svelte'
  import Sensor from './routes/Sensor.svelte'
  import { get } from 'svelte/store'
  import { push } from 'svelte-spa-router'

  function authGuard(detail) {
    return get(isAuthenticated)
  }

  const routes = {
    '/':           Login,
    '/register':   Register,
    '/dashboard':  wrap({ component: Dashboard, conditions: [authGuard] }),
    '/campo/:id':  wrap({ component: Campo,     conditions: [authGuard] }),
    '/silobolsa/:id': wrap({ component: Silobolsa, conditions: [authGuard] }),
    '/sensor/:id': wrap({ component: Sensor,    conditions: [authGuard] }),
  }

  function handleConditionsFailed() { push('/') }

  $: showNav = $isAuthenticated
</script>

{#if showNav}
  <Navbar />
{/if}

<Router {routes} on:conditionsFailed={handleConditionsFailed} />

<Toast />

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) { margin: 0; }
</style>
