// ─── Cliente HTTP ─────────────────────────────────────────────────────────────
// Un token en memoria es suficiente para una SPA — no se pierde entre rutas,
// solo al recargar la página (en ese caso sessionStorage lo restaura).

const BASE = import.meta.env.VITE_API_BASE_URL || '/api'

let _token = sessionStorage.getItem('gs_token') || null

export function setToken(t) {
  _token = t
  if (t) sessionStorage.setItem('gs_token', t)
  else sessionStorage.removeItem('gs_token')
}

export function getToken() { return _token }

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  if (_token) headers['Authorization'] = `Bearer ${_token}`

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // 204 No Content no tiene body
  if (res.status === 204) return null

  const data = await res.json()
  if (!data.ok) throw new Error(data.message || `Error ${res.status}`)
  return data.data
}

// ─── Normalización backend → frontend ─────────────────────────────────────────

/** ACTIVO → activo, INACTIVO → inactivo, FALLA → alerta */
function normEstado(s) {
  const map = { ACTIVO: 'activo', INACTIVO: 'inactivo', FALLA: 'alerta', EN_USO: 'activo', DAÑADO: 'alerta' }
  return map[s] || 'inactivo'
}

/** "SOJA" → "Soja" */
function capitalizarGrano(g) {
  if (!g) return ''
  return g.charAt(0) + g.slice(1).toLowerCase()
}

export function normalizeSensor(s) {
  const activeLink = s.links?.find(l => l.estado === 'ACTIVO')
  return {
    id: s.id,
    modelo: s.modelo,
    mac: s.mac_address,
    api_key: s.api_key,
    campoId: typeof s.campo === 'object' ? s.campo?.id : s.campo,
    silobolsaId: activeLink?.silobolsa?.id ?? null,
    estado: normEstado(s.estado),
    lecturas: [],  // se cargan aparte con getReadingsBySensor
  }
}

export function normalizeSilobag(s, campoId) {
  const activeLink = s.links?.find(l => l.estado === 'ACTIVO')
  return {
    id: s.id,
    campoId: campoId ?? (typeof s.campo === 'object' ? s.campo?.id : s.campo),
    capacidad: s.capacidad_max,
    ubicacion: s.ubicacion,
    marca: s.marca,
    grano: capitalizarGrano(s.grano),
    observaciones: s.observaciones ?? '',
    sensorId: activeLink?.sensor?.id ?? null,
    estado: normEstado(s.estado),
  }
}

export function normalizeField(f) {
  return {
    id: f.id,
    nombre: f.nombre,
    ubicacion: f.ubicacion,
    estado: f.estado,
    // Cuando vienen populados, extraemos IDs; cuando son IDs directos, los usamos
    silobolsas: (f.silobolsas ?? []).map(s => (typeof s === 'object' ? s.id : s)),
    sensores:   (f.sensores ?? []).map(s => (typeof s === 'object' ? s.id : s)),
  }
}

export function normalizeReading(r) {
  return {
    id: r.id,
    timestamp:   new Date(r.timestamp).getTime(),
    temperature: r.temp,
    humidity:    r.hum,
    co2:         r.co2,
    alerta:      r.alerta,
  }
}

export function normalizeAlert(r) {
  const sensor = r.sensor ?? {}
  const campo  = sensor.campo ?? {}
  return {
    id:          r.id,
    campoId:     campo.id,
    silobolsaId: null,
    nivel:       'critica',
    mensaje:     `Alerta en sensor ${sensor.modelo ?? ''} (${(sensor.mac_address ?? '').slice(-8)}) — temp: ${r.temp}°C hum: ${r.hum}% CO₂: ${r.co2}ppm`,
    timestamp:   new Date(r.timestamp).getTime(),
    tipo:        'sensor',
  }
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const api = {
  // Auth
  login:    (email, password) => req('POST', '/auth/login', { email, password }),
  register: (dto) => req('POST', '/auth/register', dto),
  profile:  () => req('GET', '/auth/profile'),

  // Fields
  getFields:   () => req('GET', '/fields'),
  getField:    (id) => req('GET', `/fields/${id}`),
  createField: (dto) => req('POST', '/fields', dto),
  updateField: (id, dto) => req('PATCH', `/fields/${id}`, dto),
  deleteField: (id) => req('DELETE', `/fields/${id}`),

  // Sensors (nested bajo campo)
  getSensors:          (fieldId) => req('GET', `/fields/${fieldId}/sensors`),
  getAvailableSensors: (fieldId) => req('GET', `/fields/${fieldId}/sensors/available`),
  getSensor:           (fieldId, id) => req('GET', `/fields/${fieldId}/sensors/${id}`),
  createSensor:        (fieldId, dto) => req('POST', `/fields/${fieldId}/sensors`, dto),
  updateSensor:        (fieldId, id, dto) => req('PATCH', `/fields/${fieldId}/sensors/${id}`, dto),
  deleteSensor:        (fieldId, id) => req('DELETE', `/fields/${fieldId}/sensors/${id}`),

  // Silobolsas (nested bajo campo)
  getSilobolsas:   (fieldId) => req('GET', `/fields/${fieldId}/silobolsas`),
  getSilobolsa:    (fieldId, id) => req('GET', `/fields/${fieldId}/silobolsas/${id}`),
  createSilobolsa: (fieldId, dto) => req('POST', `/fields/${fieldId}/silobolsas`, dto),
  updateSilobolsa: (fieldId, id, dto) => req('PATCH', `/fields/${fieldId}/silobolsas/${id}`, dto),
  deleteSilobolsa: (fieldId, id) => req('DELETE', `/fields/${fieldId}/silobolsas/${id}`),
  linkSensor:      (fieldId, silobagId, sensorId) =>
    req('POST', `/fields/${fieldId}/silobolsas/${silobagId}/link`, { sensor_id: sensorId }),
  unlinkSensor:    (fieldId, silobagId) =>
    req('DELETE', `/fields/${fieldId}/silobolsas/${silobagId}/link`),

  // Readings
  getAlerts:             () => req('GET', '/readings/alerts'),
  getReadingsBySensor:   (sensorId, hours = 24) => req('GET', `/readings/sensor/${sensorId}?hours=${hours}`),
  getReadingsBySilobag:  (silobagId, hours = 24) => req('GET', `/readings/silobag/${silobagId}?hours=${hours}`),
}
