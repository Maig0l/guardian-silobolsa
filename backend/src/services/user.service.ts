import bcrypt from 'bcryptjs';
import { getEM } from '../config/database.js';
import { User } from '../entities/index.js';

interface UpdateUserDTO {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  password?: string;
}

export async function getAllUsers() {
  const em = getEM();
  return em.findAll(User, { fields: ['id', 'nombre', 'apellido', 'email', 'telefono', 'role', 'createdAt'] });
}

export async function getUserById(id: number): Promise<Record<string, unknown>> {
  const em = getEM();
  const user = await em.findOneOrFail(User, { id });
  const { password: _, ...data } = user as any;
  return data;
}

export async function updateUser(id: number, dto: UpdateUserDTO): Promise<Record<string, unknown>> {
  const em = getEM();
  const user = await em.findOneOrFail(User, { id });

  if (dto.nombre) user.nombre = dto.nombre;
  if (dto.apellido) user.apellido = dto.apellido;
  if (dto.telefono) user.telefono = dto.telefono;
  if (dto.password) user.password = await bcrypt.hash(dto.password, 12);

  await em.flush();
  const { password: _, ...data } = user as any;
  return data;
}

export async function deleteUser(id: number) {
  const em = getEM();
  const user = await em.findOneOrFail(User, { id });
  await em.removeAndFlush(user);
}
