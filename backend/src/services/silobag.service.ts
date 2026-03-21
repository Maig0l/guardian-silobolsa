import { getEM } from '../config/database.js';
import {
  Field,
  LinkStatus,
  Sensor,
  SensorStatus,
  Silobag,
  SilobagSensorLink,
  SilobagStatus,
} from '../entities/index.js';

interface CreateSilobagDTO {
  marca: string;
  capacidad_max: number;
  ubicacion: string;
  grano?: string;
  observaciones?: string;
}

interface UpdateSilobagDTO {
  marca?: string;
  capacidad_max?: number;
  ubicacion?: string;
  grano?: string;
  observaciones?: string;
  estado?: string;
}

async function assertFieldOwnership(fieldId: number, userId: number) {
  const em = getEM();
  return em.findOneOrFail(Field, { id: fieldId, usuario: userId });
}

export async function getSilobagsByField(fieldId: number, userId: number) {
  await assertFieldOwnership(fieldId, userId);
  const em = getEM();
  return em.find(Silobag, { campo: fieldId }, { populate: ['links', 'links.sensor'] });
}

export async function getSilobagById(id: number, userId: number) {
  const em = getEM();
  const silo = await em.findOneOrFail(
    Silobag,
    { id },
    { populate: ['campo', 'links', 'links.sensor'] }
  );
  await assertFieldOwnership((silo.campo as Field).id, userId);
  return silo;
}

export async function createSilobag(fieldId: number, userId: number, dto: CreateSilobagDTO) {
  const field = await assertFieldOwnership(fieldId, userId);
  const em = getEM();

  const silo = em.create(Silobag, {
    ...dto,
    estado: SilobagStatus.VACIO,
    campo: field,
  } as any);

  await em.persistAndFlush(silo);
  return silo;
}

export async function updateSilobag(id: number, userId: number, dto: UpdateSilobagDTO) {
  const em = getEM();
  const silo = await em.findOneOrFail(Silobag, { id }, { populate: ['campo'] });
  await assertFieldOwnership((silo.campo as Field).id, userId);

  if (dto.marca !== undefined) silo.marca = dto.marca;
  if (dto.capacidad_max !== undefined) silo.capacidad_max = dto.capacidad_max;
  if (dto.ubicacion !== undefined) silo.ubicacion = dto.ubicacion;
  if (dto.grano !== undefined) silo.grano = dto.grano;
  if (dto.observaciones !== undefined) silo.observaciones = dto.observaciones;
  if (dto.estado !== undefined) silo.estado = dto.estado;

  await em.flush();
  return silo;
}

export async function deleteSilobag(id: number, userId: number) {
  const em = getEM();
  const silo = await em.findOneOrFail(Silobag, { id }, { populate: ['campo'] });
  await assertFieldOwnership((silo.campo as Field).id, userId);
  await em.removeAndFlush(silo);
}

// ─── Vinculación silobolsa ↔ sensor ─────────────────────────────────────────

export async function linkSensorToSilobag(silobagId: number, sensorId: number, userId: number) {
  const em = getEM();

  const silo = await em.findOneOrFail(Silobag, { id: silobagId }, { populate: ['campo'] });
  await assertFieldOwnership((silo.campo as Field).id, userId);

  const sensor = await em.findOneOrFail(
    Sensor,
    { id: sensorId },
    { populate: ['campo', 'links'] }
  );

  // El sensor debe pertenecer al mismo campo que el silobolsa
  if ((sensor.campo as Field).id !== (silo.campo as Field).id) {
    throw new Error('El sensor no pertenece al mismo campo que el silobolsa');
  }

  // El sensor no debe tener un link activo
  const activeLink = sensor.links.getItems().find((l) => l.estado === LinkStatus.ACTIVO);
  if (activeLink) throw new Error('El sensor ya está vinculado a otro silobolsa');

  // El silobolsa no debe tener un link activo
  await silo.links.init();
  const activeSiloLink = silo.links.getItems().find((l) => l.estado === LinkStatus.ACTIVO);
  if (activeSiloLink) throw new Error('El silobolsa ya tiene un sensor vinculado');

  const link = em.create(SilobagSensorLink, {
    silobolsa: silo,
    sensor,
    estado: LinkStatus.ACTIVO,
    fecha_instalacion: new Date(),
  });

  await em.persistAndFlush(link);
  return link;
}

export async function unlinkSensorFromSilobag(silobagId: number, userId: number) {
  const em = getEM();

  const silo = await em.findOneOrFail(
    Silobag,
    { id: silobagId },
    { populate: ['campo', 'links'] }
  );
  await assertFieldOwnership((silo.campo as Field).id, userId);

  const activeLink = silo.links.getItems().find((l) => l.estado === LinkStatus.ACTIVO);
  if (!activeLink) throw new Error('El silobolsa no tiene un sensor vinculado actualmente');

  activeLink.estado = LinkStatus.INACTIVO;
  await em.flush();
  return { message: 'Sensor desvinculado correctamente' };
}
