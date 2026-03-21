import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { getEM } from '../config/database.js';
import { User, UserRole } from '../entities/index.js';
import { env } from '../config/env.js';

interface RegisterDTO {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

function signToken(user: User): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    options
  );
}

export async function registerUser(dto: RegisterDTO) {
  const em = getEM();

  const existing = await em.findOne(User, { email: dto.email });
  if (existing) throw new Error('El email ya está registrado');

  const hashed = await bcrypt.hash(dto.password, 12);

  const user = em.create(User, {
    nombre: dto.nombre,
    apellido: dto.apellido,
    email: dto.email,
    password: hashed,
    telefono: dto.telefono,
    role: UserRole.USER,
  } as any);

  await em.persistAndFlush(user);

  const token = signToken(user);
  const { password: _, ...userData } = user;
  return { token, user: userData };
}

export async function loginUser(dto: LoginDTO): Promise<{ token: string; user: Record<string, unknown> }> {
  const em = getEM();

  const user = await em.findOne(User, { email: dto.email });
  if (!user) throw new Error('Credenciales inválidas');

  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) throw new Error('Credenciales inválidas');

  const token = signToken(user);
  const { password: _, ...userData } = user as any;
  return { token, user: userData };
}

export async function getProfile(userId: number): Promise<Record<string, unknown>> {
  const em = getEM();
  const user = await em.findOneOrFail(User, { id: userId });
  const { password: _, ...userData } = user as any;
  return userData;
}