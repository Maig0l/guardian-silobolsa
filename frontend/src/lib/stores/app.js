import { writable, derived } from 'svelte/store'
import { api, setToken, getToken, normalizeField, normalizeSensor, normalizeSilobag, normalizeAlert } from '../api.js'

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const currentUser     = writable(null)
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
export async function login(email, password) {
  const { token, user } = await api.login(email, password)
  setToken(token)
  currentUser.set(user)
  await loadInitialData()
}

export async function register(dto) {
  const { token, user } = await api.register(dto)
  setToken(token)
  currentUser.set(user)
  await loadInitialData()
}

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

// ─── Carga de datos ───────────────────────────────────────────────────────────
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

export async function loadCampoDetalle(campoId) {
  const [rawSensores, rawSilobolsas] = await Promise.all([
    api.getSensors(campoId),
    api.getSilobolsas(campoId),
  ])
  const normSensores   = rawSensores.map(s => normalizeSensor(s))
  const normSilobolsas = rawSilobolsas.map(s => normalizeSilobag(s, campoId))

  silobolsas.update(ss => [...ss.filter(s => s.campoId !== campoId), ...normSilobolsas])
  sensores.update(ss => [...ss.filter(s => s.campoId !== campoId), ...normSensores])

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
    marca:         datos.marca,
    capacidad_max: Number(datos.capacidad),
    ubicacion:     datos.ubicacion,
    grano:         datos.grano?.toUpperCase(),
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
  const payload = { modelo: datos.modelo, mac_address: datos.mac }
  const raw  = await api.createSensor(campoId, payload)
  const norm = normalizeSensor(raw)
  sensores.update(ss => [...ss, norm])
  campos.update(cs => cs.map(c =>
    c.id === campoId ? { ...c, sensores: [...c.sensores, norm.id] } : c
  ))
  return norm.id
}

// ─── Eliminar entidades ───────────────────────────────────────────────────────
export async function eliminarCampo(campoId) {
  await api.deleteField(campoId)
  campos.update(cs => cs.filter(c => c.id !== campoId))
  silobolsas.update(ss => ss.filter(s => s.campoId !== campoId))
  sensores.update(ss => ss.filter(s => s.campoId !== campoId))
}

export async function eliminarSilobolsa(campoId, silobagId) {
  await api.deleteSilobolsa(campoId, silobagId)
  silobolsas.update(ss => ss.filter(s => s.id !== silobagId))
  sensores.update(ss => ss.map(s => s.silobolsaId === silobagId ? { ...s, silobolsaId: null } : s))
  campos.update(cs => cs.map(c =>
    c.id === campoId ? { ...c, silobolsas: c.silobolsas.filter(id => id !== silobagId) } : c
  ))
}

export async function eliminarSensor(campoId, sensorId) {
  await api.deleteSensor(campoId, sensorId)
  sensores.update(ss => ss.filter(s => s.id !== sensorId))
  campos.update(cs => cs.map(c =>
    c.id === campoId ? { ...c, sensores: c.sensores.filter(id => id !== sensorId) } : c
  ))
}

// ─── Vinculación ──────────────────────────────────────────────────────────────
export async function vincularSensor(campoId, silobolsaId, sensorId) {
  await api.linkSensor(campoId, silobolsaId, sensorId)
  sensores.update(ss => ss.map(s => {
    if (s.silobolsaId === silobolsaId) return { ...s, silobolsaId: null }
    if (s.id === sensorId) return { ...s, silobolsaId }
    return s
  }))
  silobolsas.update(ss => ss.map(s => s.id === silobolsaId ? { ...s, sensorId } : s))
}

export async function desvincularSensor(campoId, silobolsaId) {
  await api.unlinkSensor(campoId, silobolsaId)
  silobolsas.update(ss => ss.map(s => s.id === silobolsaId ? { ...s, sensorId: null } : s))
  sensores.update(ss => ss.map(s => s.silobolsaId === silobolsaId ? { ...s, silobolsaId: null } : s))
}

// ─── Alertas: dismiss → llama al backend para marcar como vista ───────────────
export async function dismissAlerta(alertaId) {
  // Actualiza UI inmediatamente
  alertas.update(as => as.filter(a => a.id !== alertaId))
  // Persiste en backend (fuego y olvido — si falla la UI ya está actualizada)
  api.markAlertSeen(alertaId).catch(console.error)
}

export async function dismissTodasAlertas() {
  alertas.set([])
  api.markAllAlertsSeen().catch(console.error)
}
