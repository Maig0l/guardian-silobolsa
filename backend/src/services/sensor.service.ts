import { getEM } from '../config/database.js';
import { Field, Sensor, SensorStatus } from '../entities/index.js';
import { generateApiKey } from '../utils/apiKey.js';

interface CreateSensorDTO {
  modelo: string;
  mac_address: string;
}

interface UpdateSensorDTO {
  modelo?: string;
  estado?: string;
}

/** Verifica que el campo pertenezca al usuario antes de operar */
async function assertFieldOwnership(fieldId: number, userId: number) {
  const em = getEM();
  return em.findOneOrFail(Field, { id: fieldId, usuario: userId });
}

export async function getSensorsByField(fieldId: number, userId: number) {
  await assertFieldOwnership(fieldId, userId);
  const em = getEM();
  return em.find(Sensor, { campo: fieldId });
}

export async function getSensorById(id: number, userId: number) {
  const em = getEM();
  const sensor = await em.findOneOrFail(
    Sensor,
    { id },
    { populate: ['campo'] }
  );
  // Verifica ownership a través del campo
  await assertFieldOwnership((sensor.campo as Field).id, userId);
  return sensor;
}

export async function createSensor(fieldId: number, userId: number, dto: CreateSensorDTO) {
  const field = await assertFieldOwnership(fieldId, userId);
  const em = getEM();

  // Chequea unicidad de mac_address
  const existing = await em.findOne(Sensor, { mac_address: dto.mac_address });
  if (existing) throw new Error('Ya existe un sensor con esa MAC address');

  const api_key = generateApiKey(dto.mac_address);

  const sensor = em.create(Sensor, {
    modelo: dto.modelo,
    mac_address: dto.mac_address,
    api_key,
    estado: SensorStatus.ACTIVO,
    campo: field,
  } as any);

  await em.persistAndFlush(sensor);
  return sensor;
}

export async function updateSensor(id: number, userId: number, dto: UpdateSensorDTO) {
  const em = getEM();
  const sensor = await em.findOneOrFail(Sensor, { id }, { populate: ['campo'] });
  await assertFieldOwnership((sensor.campo as Field).id, userId);

  if (dto.modelo !== undefined) sensor.modelo = dto.modelo;
  if (dto.estado !== undefined) sensor.estado = dto.estado;

  await em.flush();
  return sensor;
}

export async function deleteSensor(id: number, userId: number) {
  const em = getEM();
  const sensor = await em.findOneOrFail(Sensor, { id }, { populate: ['campo'] });
  await assertFieldOwnership((sensor.campo as Field).id, userId);
  await em.removeAndFlush(sensor);
}

/** Retorna todos los sensores disponibles (sin link activo) de un campo */
export async function getAvailableSensors(fieldId: number, userId: number) {
  await assertFieldOwnership(fieldId, userId);
  const em = getEM();

  // Sensores activos del campo que no tienen ningún link activo
  const allSensors = await em.find(
    Sensor,
    { campo: fieldId, estado: SensorStatus.ACTIVO },
    { populate: ['links'] }
  );

  return allSensors.filter((s) => {
    const links = s.links.getItems();
    return !links.some((l) => l.estado === 'ACTIVO');
  });
}
