import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as userService from '../services/user.service.js';
import { success, noContent, forbidden } from '../utils/response.js';

const updateSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  apellido: z.string().min(2).max(100).optional(),
  telefono: z.string().optional(),
  password: z.string().min(8).optional(),
});

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.getAllUsers();
    return success(res, users);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    // Un usuario solo puede ver su propio perfil, salvo que sea ADMIN
    if (req.user!.id !== id && req.user!.role !== 'ADMIN') {
      return forbidden(res);
    }
    const user = await userService.getUserById(id);
    return success(res, user);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    if (req.user!.id !== id && req.user!.role !== 'ADMIN') {
      return forbidden(res);
    }
    const dto = updateSchema.parse(req.body);
    const user = await userService.updateUser(id, dto);
    return success(res, user);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    if (req.user!.id !== id && req.user!.role !== 'ADMIN') {
      return forbidden(res);
    }
    await userService.deleteUser(id);
    return noContent(res);
  } catch (err) {
    next(err);
  }
}
