import { getEM } from '../config/database.js';
import { Field, FieldStatus, User } from '../entities/index.js';

interface CreateFieldDTO {
  nombre: string;
  ubicacion: string;
}

interface UpdateFieldDTO {
  nombre?: string;
  ubicacion?: string;
  estado?: string;
}

export async function getFieldsByUser(userId: number) {
  const em = getEM();
  return em.find(
    Field,
    { usuario: userId },
    { populate: ['sensores', 'silobolsas'] }
  );
}

export async function getFieldById(id: number, userId: number) {
  const em = getEM();
  const field = await em.findOneOrFail(
    Field,
    { id, usuario: userId },
    { populate: ['sensores', 'silobolsas'] }
  );
  return field;
}

export async function createField(userId: number, dto: CreateFieldDTO) {
  const em = getEM();
  const usuario = await em.findOneOrFail(User, { id: userId });

  const field = em.create(Field, {
    nombre: dto.nombre,
    ubicacion: dto.ubicacion,
    estado: FieldStatus.ACTIVO,
    usuario,
  } as any);

  await em.persistAndFlush(field);
  return field;
}

export async function updateField(id: number, userId: number, dto: UpdateFieldDTO) {
  const em = getEM();
  const field = await em.findOneOrFail(Field, { id, usuario: userId });

  if (dto.nombre !== undefined) field.nombre = dto.nombre;
  if (dto.ubicacion !== undefined) field.ubicacion = dto.ubicacion;
  if (dto.estado !== undefined) field.estado = dto.estado;

  await em.flush();
  return field;
}

export async function deleteField(id: number, userId: number) {
  const em = getEM();
  const field = await em.findOneOrFail(Field, { id, usuario: userId });
  await em.removeAndFlush(field);
}
