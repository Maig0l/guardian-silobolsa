import { getEM } from '../config/database.js';
import { Field, Reading, Sensor, Silobag } from '../entities/index.js';
import { env } from '../config/env.js';
import { sendAlertNotifications } from './notification.service.js';

interface IncomingReadingDTO {
  sensor_id: number;
  hum: number;
  temp: number;
  co2: number;
  timestamp?: Date;
}

function isAlert(hum: number, temp: number, co2: number): boolean {
  return (
    temp > env.ALERT_TEMP_MAX ||
    hum > env.ALERT_HUM_MAX ||
    co2 > env.ALERT_CO2_MAX
  );
}

/**
 * Verifica si ya se notificó para este sensor en los últimos 30 minutos.
 * Se llama ANTES de insertar la lectura para evitar la condición de carrera.
 */
async function wasRecentlyAlerted(sensorId: number): Promise<boolean> {
  const em = getEM();
  const cooldownMs = 10 * 1000; //  minutos
  const since = new Date(Date.now() - cooldownMs);

  const recent = await em.findOne(Reading, {
    sensor: sensorId,
    alerta: true,
    timestamp: { $gte: since },
  });

  return !!recent;
}

export async function saveReading(dto: IncomingReadingDTO): Promise<Reading> {
  const em = getEM();

  const sensor = await em.findOneOrFail(Sensor, { id: dto.sensor_id }, { populate: ['campo'] });
  const alerta = isAlert(dto.hum, dto.temp, dto.co2);

  // Verificar cooldown ANTES de insertar — evita la condición de carrera
  let debeNotificar = false;
  if (alerta) {
    const yaNotificado = await wasRecentlyAlerted(sensor.id);
    if (!yaNotificado) {
      debeNotificar = true;
    } else {
      console.log(`⏳  Alerta en sensor ${sensor.id} omitida (cooldown activo)`);
    }
  }

  const reading = em.create(Reading, {
    sensor,
    hum: dto.hum,
    temp: dto.temp,
    co2: dto.co2,
    timestamp: dto.timestamp ?? new Date(),
    alerta,
    visto: false,
  } as any);

  await em.persistAndFlush(reading);

  if (debeNotificar) {
    sendAlertNotifications(sensor, dto.hum, dto.temp, dto.co2).catch(console.error);
  }

  console.log(
    `📊  Lectura guardada — Sensor ${sensor.id} | ` +
    `hum: ${reading.hum}% temp: ${reading.temp}°C co2: ${reading.co2}ppm` +
    (reading.alerta ? ' ⚠️  ALERTA' : '')
  );

  return reading;
}

/** Lecturas de las últimas N horas de un sensor */
export async function getReadingsBySensor(sensorId: number, userId: number, hours = 24) {
  const em = getEM();
  const sensor = await em.findOneOrFail(Sensor, { id: sensorId }, { populate: ['campo'] });
  await em.findOneOrFail(Field, { id: (sensor.campo as Field).id, usuario: userId });
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return em.find(Reading, { sensor: sensorId, timestamp: { $gte: since } }, { orderBy: { timestamp: 'ASC' } });
}

/** Lecturas de las últimas N horas del sensor vinculado a un silobolsa */
export async function getReadingsBySilobag(silobagId: number, userId: number, hours = 24) {
  const em = getEM();
  const silo = await em.findOneOrFail(Silobag, { id: silobagId }, { populate: ['campo', 'links', 'links.sensor'] });
  await em.findOneOrFail(Field, { id: (silo.campo as Field).id, usuario: userId });
  const activeLink = silo.links.getItems().find((l) => l.estado === 'ACTIVO');
  if (!activeLink) throw new Error('El silobolsa no tiene un sensor activo vinculado');
  const sensorId = (activeLink.sensor as Sensor).id;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return em.find(Reading, { sensor: sensorId, timestamp: { $gte: since } }, { orderBy: { timestamp: 'ASC' } });
}

/** Alertas no vistas del usuario */
export async function getAlertsByUser(userId: number) {
  const em = getEM();
  const fields = await em.find(Field, { usuario: userId });
  const fieldIds = fields.map((f) => f.id);
  if (fieldIds.length === 0) return [];
  const sensors = await em.find(Sensor, { campo: { $in: fieldIds } });
  const sensorIds = sensors.map((s) => s.id);
  if (sensorIds.length === 0) return [];
  return em.find(
    Reading,
    { sensor: { $in: sensorIds }, alerta: true, visto: false },
    { populate: ['sensor', 'sensor.campo'], orderBy: { timestamp: 'DESC' }, limit: 100 }
  );
}

/** Marca una alerta como vista */
export async function markAlertSeen(readingId: number, userId: number): Promise<void> {
  const em = getEM();
  const reading = await em.findOneOrFail(Reading, { id: readingId }, { populate: ['sensor', 'sensor.campo'] });
  const campo = (reading.sensor as Sensor).campo as Field;
  await em.findOneOrFail(Field, { id: campo.id, usuario: userId });
  reading.visto = true;
  await em.flush();
}

/** Marca todas las alertas del usuario como vistas */
export async function markAllAlertsSeen(userId: number): Promise<void> {
  const em = getEM();
  const fields = await em.find(Field, { usuario: userId });
  const fieldIds = fields.map((f) => f.id);
  if (fieldIds.length === 0) return;
  const sensors = await em.find(Sensor, { campo: { $in: fieldIds } });
  const sensorIds = sensors.map((s) => s.id);
  if (sensorIds.length === 0) return;
  const unread = await em.find(Reading, { sensor: { $in: sensorIds }, alerta: true, visto: false });
  for (const r of unread) r.visto = true;
  await em.flush();
}