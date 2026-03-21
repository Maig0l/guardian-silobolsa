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

export async function saveReading(dto: IncomingReadingDTO): Promise<Reading> {
  const em = getEM();

  const sensor = await em.findOneOrFail(Sensor, { id: dto.sensor_id });
  const alerta = isAlert(dto.hum, dto.temp, dto.co2);

  const reading = em.create(Reading, {
    sensor,
    hum: dto.hum,
    temp: dto.temp,
    co2: dto.co2,
    timestamp: dto.timestamp ?? new Date(),
    alerta,
  });

  await em.persistAndFlush(reading);

  // Si supera umbrales, dispara notificaciones de forma asíncrona
  if (alerta) {
    sendAlertNotifications(sensor, dto.hum, dto.temp, dto.co2).catch(console.error);
  }

  return reading;
}

/** Lecturas de las últimas N horas de un sensor */
export async function getReadingsBySensor(
  sensorId: number,
  userId: number,
  hours = 24
) {
  const em = getEM();

  const sensor = await em.findOneOrFail(Sensor, { id: sensorId }, { populate: ['campo'] });
  // Verifica ownership
  await em.findOneOrFail(Field, { id: (sensor.campo as Field).id, usuario: userId });

  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  return em.find(
    Reading,
    { sensor: sensorId, timestamp: { $gte: since } },
    { orderBy: { timestamp: 'ASC' } }
  );
}

/** Lecturas de las últimas N horas del sensor actualmente vinculado a un silobolsa */
export async function getReadingsBySilobag(
  silobagId: number,
  userId: number,
  hours = 24
) {
  const em = getEM();

  const silo = await em.findOneOrFail(
    Silobag,
    { id: silobagId },
    { populate: ['campo', 'links', 'links.sensor'] }
  );
  await em.findOneOrFail(Field, {
    id: (silo.campo as Field).id,
    usuario: userId,
  });

  const activeLink = silo.links.getItems().find((l) => l.estado === 'ACTIVO');
  if (!activeLink) throw new Error('El silobolsa no tiene un sensor activo vinculado');

  const sensorId = (activeLink.sensor as Sensor).id;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  return em.find(
    Reading,
    { sensor: sensorId, timestamp: { $gte: since } },
    { orderBy: { timestamp: 'ASC' } }
  );
}

/** Alertas activas: lecturas con alerta=true de los campos del usuario */
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
    { sensor: { $in: sensorIds }, alerta: true },
    {
      populate: ['sensor', 'sensor.campo'],
      orderBy: { timestamp: 'DESC' },
      limit: 50,
    }
  );
}
