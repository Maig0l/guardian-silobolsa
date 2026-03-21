import { writable, get } from 'svelte/store'

// Store con la ruta actual: { path, params }
export const currentRoute = writable({ path: '/', params: {} })

// Navega a una ruta hash
export function navigate(path) {
  window.location.hash = '#' + path
}

// Extrae la ruta del hash actual
function getHashPath() {
  const hash = window.location.hash
  return hash.startsWith('#') ? hash.slice(1) || '/' : '/'
}

// Convierte patrón "/campo/:id" a regex y lista de param keys
function parsePattern(pattern) {
  const keys = []
  const re = new RegExp(
    '^' + pattern.replace(/:([^/]+)/g, (_, k) => { keys.push(k); return '([^/]+)' }) + '$'
  )
  return { re, keys }
}

// Matchea la ruta actual contra los patrones registrados
export function matchRoute(routes, path) {
  for (const [pattern, component] of Object.entries(routes)) {
    if (pattern === '*') continue
    const { re, keys } = parsePattern(pattern)
    const m = path.match(re)
    if (m) {
      const params = {}
      keys.forEach((k, i) => { params[k] = m[i + 1] })
      return { component, params }
    }
  }
  // Fallback
  if (routes['*']) return { component: routes['*'], params: {} }
  return null
}

// Inicializa el router — llamar una sola vez en App.svelte
export function initRouter() {
  function sync() {
    currentRoute.set({ path: getHashPath(), params: {} })
  }
  window.addEventListener('hashchange', sync)
  sync()
  return () => window.removeEventListener('hashchange', sync)
}
