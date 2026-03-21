<script>
  import { currentRoute, matchRoute, navigate } from '../router.js'

  let { routes, isAuthenticated } = $props()

  let matched = $derived.by(() => {
    const { path } = $currentRoute
    const result = matchRoute(routes, path)
    if (!result) return null

    // Rutas protegidas: redirige al login si no está autenticado
    if (result.component?.protected && !isAuthenticated) {
      navigate('/')
      return null
    }

    return result
  })
</script>

{#if matched}
  <svelte:component this={matched.component} params={matched.params} />
{/if}
