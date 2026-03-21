import { writable, derived } from 'svelte/store'
import { api, setToken, getToken, normalizeField, normalizeSensor, normalizeSilobag, normalizeAlert } from '../api.js'

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const currentUser  = writable(null)
export const isAuthenticated = derived(currentUser, $u => !!$u)

// ─── Data stores ──────────────────────────────────────────────────────────────
export const campos     = writable([])
export const silobolsas = writable([])
export const sensores   = writable([])
export const alertas    = writable([])

// ─── UI ───────────────────────────────────────────────────────────────────────
export const toasts = writable([])

export function addToast(message, type = 'success', duration = 3500) {
  const id = Date.now()
  toasts.update(t => [...t, { id, message, type }])
  setTimeout(() => toasts.update(t => t.filter(x => x.id !== id)), duration)
}

// ─── Auth actions ─────────────────────────────────────────────────────────────

/** Login: guarda token + user y carga datos iniciales */
export async function login(email, password) {
  const { token, user } = await api.login(email, password)
  setToken(token)
  currentUser.set(user)
  await loadInitialData()
}

/** Register: idem */
export async function register(dto) {
  const { token, user } = await api.register(dto)
  setToken(token)
  currentUser.set(user)
  await loadInitialData()
}

/** Restaurar sesión desde sessionStorage al recargar la página */
export async function restoreSession() {
  const token = getToken()
  if (!token) return false
  try {
    const user = await api.profile()
    currentUser.set(user)
    await loadInitialData()
    return true
  } catch {
    setToken(null)
    return false
  }
}

export function logout() {
  setToken(null)
  currentUser.set(null)
  campos.set([])
  silobolsas.set([])
  sensores.set([])
  alertas.set([])
}

// ─── Carga inicial ────────────────────────────────────────────────────────────

/** Carga campos + alertas (lo que necesita el Dashboard) */
export async function loadInitialData() {
  await Promise.all([loadCampos(), loadAlertas()])
}

export async function loadCampos() {
  const raw = await api.getFields()
  campos.set(raw.map(normalizeField))
}

export async function loadAlertas() {
  try {
    const raw = await api.getAlerts()
    alertas.set(raw.map(normalizeAlert))
  } catch {
    alertas.set([])
  }
}

// ─── Carga de detalle de campo ────────────────────────────────────────────────

/**
 * Carga un campo con todos sus sensores y silobolsas.
 * Actualiza los stores globales para que Sensor.svelte y Silobolsa.svelte
 * puedan acceder a los datos sin hacer requests adicionales.
 */
export async function loadCampoDetalle(campoId) {
  const [rawSensores, rawSilobolsas] = await Promise.all([
    api.getSensors(campoId),
    api.getSilobolsas(campoId),
  ])

  const normSensores   = rawSensores.map(s => normalizeSensor(s))
  const normSilobolsas = rawSilobolsas.map(s => normalizeSilobag(s, campoId))

  // Actualiza silobolsas: reemplaza las de este campo, preserva las de otros
  silobolsas.update(ss => [
    ...ss.filter(s => s.campoId !== campoId),
    ...normSilobolsas,
  ])

  // Actualiza sensores: reemplaza los de este campo, preserva los de otros
  sensores.update(ss => [
    ...ss.filter(s => s.campoId !== campoId),
    ...normSensores,
  ])

  return { sensores: normSensores, silobolsas: normSilobolsas }
}

// ─── CRUD campos ──────────────────────────────────────────────────────────────

export async function crearCampo(nombre, ubicacion) {
  const raw = await api.createField({ nombre, ubicacion })
  const nuevo = normalizeField(raw)
  campos.update(cs => [...cs, nuevo])
  return nuevo.id
}

// ─── CRUD silobolsas ──────────────────────────────────────────────────────────

export async function crearSilobolsa(campoId, datos) {
  const payload = {
    marca:        datos.marca,
    capacidad_max: Number(datos.capacidad),
    ubicacion:    datos.ubicacion,
    grano:        datos.grano?.toUpperCase(),   // "Soja" → "SOJA"
    observaciones: datos.observaciones ?? '',
  }
  const raw  = await api.createSilobolsa(campoId, payload)
  const norm = normalizeSilobag(raw, campoId)

  silobolsas.update(ss => [...ss, norm])
  campos.update(cs => cs.map(c =>
    c.id === campoId ? { ...c, silobolsas: [...c.silobolsas, norm.id] } : c
  ))
  return norm.id
}

// ─── CRUD sensores ────────────────────────────────────────────────────────────

export async function crearSensor(campoId, datos) {
  const payload = {
    modelo:      datos.modelo,
    mac_address: datos.mac,
  }
  const raw  = await api.createSensor(campoId, payload)
  const norm = normalizeSensor(raw)

  sensores.update(ss => [...ss, norm])
  campos.update(cs => cs.map(c =>
    c.id === campoId ? { ...c, sensores: [...c.sensores, norm.id] } : c
  ))
  return norm.id
}

// ─── Vinculación sensor ↔ silobolsa ──────────────────────────────────────────

export async function vincularSensor(campoId, silobolsaId, sensorId) {
  await api.linkSensor(campoId, silobolsaId, sensorId)

  // Actualiza el store localmente para respuesta inmediata
  sensores.update(ss => ss.map(s => {
    if (s.silobolsaId === silobolsaId) return { ...s, silobolsaId: null }
    if (s.id === sensorId) return { ...s, silobolsaId }
    return s
  }))
  silobolsas.update(ss => ss.map(s =>
    s.id === silobolsaId ? { ...s, sensorId } : s
  ))
}

export async function desvincularSensor(campoId, silobolsaId) {
  await api.unlinkSensor(campoId, silobolsaId)

  silobolsas.update(ss => ss.map(s =>
    s.id === silobolsaId ? { ...s, sensorId: null } : s
  ))
  sensores.update(ss => ss.map(s =>
    s.silobolsaId === silobolsaId ? { ...s, silobolsaId: null } : s
  ))
}
