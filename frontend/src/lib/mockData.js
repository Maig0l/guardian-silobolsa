// mockData.js — datos de prueba con contexto agro argentino

function generateReadings(baseTemp, baseHum, baseCO2, hours = 24) {
  const now = Date.now()
  return Array.from({ length: hours }, (_, i) => {
    const t = now - (hours - 1 - i) * 3600000
    const jitter = (v, range) => +(v + (Math.random() - 0.5) * range).toFixed(1)
    return {
      timestamp: t,
      temperature: jitter(baseTemp + Math.sin(i / 6) * 1.5, 0.8),
      humidity:    jitter(baseHum  + Math.cos(i / 8) * 2, 1.2),
      co2:         jitter(baseCO2  + Math.sin(i / 4) * 80 + i * 2, 30),
    }
  })
}

export const mockUser = {
  id: 'u1',
  nombre: 'Carlos',
  apellido: 'Giménez',
  email: 'carlos@losombues.com.ar',
}

export const mockSensores = [
  { id: 's1', modelo: 'LoRa-T100', mac: 'A4:C3:F0:12:7B:01', campoId: 'c1', silobolsaId: 'sb1', estado: 'activo',   lecturas: generateReadings(22, 14, 420) },
  { id: 's2', modelo: 'LoRa-T100', mac: 'A4:C3:F0:12:7B:02', campoId: 'c1', silobolsaId: 'sb2', estado: 'alerta',   lecturas: generateReadings(28, 19, 850) },
  { id: 's3', modelo: 'LoRa-T200', mac: 'B2:D4:E1:33:8A:03', campoId: 'c1', silobolsaId: null,  estado: 'activo',   lecturas: generateReadings(20, 12, 380) },
  { id: 's4', modelo: 'LoRa-T200', mac: 'B2:D4:E1:33:8A:04', campoId: 'c1', silobolsaId: 'sb3', estado: 'activo',   lecturas: generateReadings(21, 13, 400) },
  { id: 's5', modelo: 'LoRa-T100', mac: 'C1:F0:A3:55:2D:05', campoId: 'c2', silobolsaId: 'sb4', estado: 'inactivo', lecturas: generateReadings(19, 11, 360) },
  { id: 's6', modelo: 'LoRa-T300', mac: 'D3:B1:C4:77:1E:06', campoId: 'c2', silobolsaId: null,  estado: 'activo',   lecturas: generateReadings(23, 15, 440) },
]

export const mockSilobolsas = [
  { id: 'sb1', campoId: 'c1', capacidad: 200, ubicacion: 'Lote Norte — parcela A', marca: 'Ipesa', grano: 'Soja', observaciones: 'Instalado en marzo 2024. Buen estado general.', sensorId: 's1' },
  { id: 'sb2', campoId: 'c1', capacidad: 180, ubicacion: 'Lote Norte — parcela B', marca: 'Richiger', grano: 'Maíz', observaciones: 'Zona baja, mayor riesgo de humedad. Monitoreo intensivo.',   sensorId: 's2' },
  { id: 'sb3', campoId: 'c1', capacidad: 220, ubicacion: 'Lote Sur', marca: 'Ipesa', grano: 'Trigo', observaciones: 'Cosecha 2024. Estado óptimo.', sensorId: 's4' },
  { id: 'sb4', campoId: 'c2', capacidad: 150, ubicacion: 'Lote Este', marca: 'Akron', grano: 'Girasol', observaciones: '', sensorId: 's5' },
]

export const mockCampos = [
  {
    id: 'c1',
    nombre: 'Los Ombúes',
    ubicacion: 'San Lorenzo, Santa Fe',
    silobolsas: ['sb1', 'sb2', 'sb3'],
    sensores: ['s1', 's2', 's3', 's4'],
  },
  {
    id: 'c2',
    nombre: 'La Esperanza',
    ubicacion: 'Armstrong, Santa Fe',
    silobolsas: ['sb4'],
    sensores: ['s5', 's6'],
  },
]

export const mockAlertas = [
  { id: 'a1', tipo: 'humedad',     nivel: 'critica',  mensaje: 'Humedad crítica (19.2%) en Silo #2 — Maíz', campoId: 'c1', silobolsaId: 'sb2', timestamp: Date.now() - 1800000 },
  { id: 'a2', tipo: 'co2',         nivel: 'advertencia', mensaje: 'CO₂ en ascenso en Silo #2 — Maíz (850 ppm)',   campoId: 'c1', silobolsaId: 'sb2', timestamp: Date.now() - 3600000 },
  { id: 'a3', tipo: 'temperatura', nivel: 'advertencia', mensaje: 'Temperatura elevada en Silo #2 — Maíz (28.3°C)', campoId: 'c1', silobolsaId: 'sb2', timestamp: Date.now() - 5400000 },
]

// Helpers
export function getCampo(id)      { return mockCampos.find(c => c.id === id) }
export function getSilobolsa(id)  { return mockSilobolsas.find(s => s.id === id) }
export function getSensor(id)     { return mockSensores.find(s => s.id === id) }

export function getSilobolsasDeCampo(campoId) {
  return mockSilobolsas.filter(s => s.campoId === campoId)
}
export function getSensoresDeCampo(campoId) {
  return mockSensores.filter(s => s.campoId === campoId)
}
export function getSensoresLibres(campoId) {
  return mockSensores.filter(s => s.campoId === campoId && !s.silobolsaId)
}
export function getSensorDeSilobolsa(silobolsaId) {
  return mockSensores.find(s => s.silobolsaId === silobolsaId) || null
}

export function getAlertasDeCampo(campoId) {
  return mockAlertas.filter(a => a.campoId === campoId)
}

export function ultimaLectura(sensor) {
  if (!sensor?.lecturas?.length) return null
  return sensor.lecturas[sensor.lecturas.length - 1]
}

export function estadoSilobolsa(silobolsaId) {
  const sensor = getSensorDeSilobolsa(silobolsaId)
  if (!sensor) return 'sin-sensor'
  return sensor.estado
}

export function formatTimestamp(ts) {
  const d = new Date(ts)
  return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs} h`
  return `hace ${Math.floor(hrs / 24)} días`
}
