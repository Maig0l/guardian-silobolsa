<script>
  import { onMount } from 'svelte'
  import { isAuthenticated, restoreSession } from './lib/stores/app.js'
  import { initRouter } from './lib/router.js'
  import RouterComponent from './lib/components/Router.svelte'
  import Toast from './lib/components/Toast.svelte'
  import Navbar from './lib/components/Navbar.svelte'

  import Login     from './routes/Login.svelte'
  import Register  from './routes/Register.svelte'
  import Dashboard from './routes/Dashboard.svelte'
  import Campo     from './routes/Campo.svelte'
  import Sensor    from './routes/Sensor.svelte'
  import Silobolsa from './routes/Silobolsa.svelte'

  const Prot = (component) => Object.assign(component, { protected: true })

  const routes = {
    '/':              Login,
    '/register':      Register,
    '/dashboard':     Prot(Dashboard),
    '/campo/:id':     Prot(Campo),
    '/sensor/:id':    Prot(Sensor),
    '/silobolsa/:id': Prot(Silobolsa),
    '*':              Login,
  }

  let sessionRestored = $state(false)

  onMount(() => {
    const cleanup = initRouter()
    restoreSession().finally(() => { sessionRestored = true })
    return cleanup
  })
</script>

{#if !sessionRestored}
  <div class="splash">Cargando...</div>
{:else}
  {#if $isAuthenticated}
    <Navbar />
  {/if}
  <main class="main-content" class:with-nav={$isAuthenticated}>
    <RouterComponent {routes} isAuthenticated={$isAuthenticated} />
  </main>
  <Toast />
{/if}

<style>
  .splash { min-height: 100vh; display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--gray-400); }
  .main-content { min-height: 100vh; }
  .main-content.with-nav { padding-top: 56px; }
</style>
