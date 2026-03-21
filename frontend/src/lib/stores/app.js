import { writable, derived } from 'svelte/store'
import { mockAlertas, mockCampos, mockSensores, mockSilobolsas } from '../mockData.js'

// Auth
export const currentUser = writable(null)
export const isAuthenticated = derived(currentUser, $u => !!$u)

// Data stores (mutables para simular CRUD)
export const campos     = writable([...mockCampos])
export const silobolsas = writable([...mockSilobolsas])
export const sensores   = writable([...mockSensores])
export const alertas    = writable([...mockAlertas])

// Toast notifications
export const toasts = writable([])

export function addToast(message, type = 'success', duration = 3500) {
  const id = Date.now()
  toasts.update(t => [...t, { id, message, type }])
  setTimeout(() => {
    toasts.update(t => t.filter(x => x.id !== id))
  }, duration)
}

// CRUD helpers
export function crearCampo(nombre, ubicacion) {
  const id = 'c' + Date.now()
  campos.update(cs => [...cs, { id, nombre, ubicacion, silobolsas: [], sensores: [] }])
  return id
}

export function crearSilobolsa(campoId, datos) {
  const id = 'sb' + Date.now()
  const nuevo = { id, campoId, sensorId: null, ...datos }
  silobolsas.update(ss => [...ss, nuevo])
  campos.update(cs => cs.map(c => c.id === campoId ? { ...c, silobolsas: [...c.silobolsas, id] } : c))
  return id
}

export function crearSensor(campoId, datos) {
  const id = 's' + Date.now()
  const nuevo = { id, campoId, silobolsaId: null, estado: 'activo', lecturas: [], ...datos }
  sensores.update(ss => [...ss, nuevo])
  campos.update(cs => cs.map(c => c.id === campoId ? { ...c, sensores: [...c.sensores, id] } : c))
  return id
}

export function vincularSensor(silobolsaId, sensorId) {
  sensores.update(ss => ss.map(s => {
    if (s.silobolsaId === silobolsaId) return { ...s, silobolsaId: null }
    if (s.id === sensorId) return { ...s, silobolsaId }
    return s
  }))
  silobolsas.update(ss => ss.map(s => s.id === silobolsaId ? { ...s, sensorId } : s))
}
