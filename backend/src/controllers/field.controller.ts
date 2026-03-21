import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as fieldService from '../services/field.service.js';
import { success, created, noContent } from '../utils/response.js';

const createSchema = z.object({
  nombre: z.string().min(2).max(150),
  ubicacion: z.string().min(2).max(255),
});

const updateSchema = z.object({
  nombre: z.string().min(2).max(150).optional(),
  ubicacion: z.string().min(2).max(255).optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional(),
});

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const fields = await fieldService.getFieldsByUser(req.user!.id);
    return success(res, fields);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const field = await fieldService.getFieldById(id, req.user!.id);
    return success(res, field);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = createSchema.parse(req.body);
    const field = await fieldService.createField(req.user!.id, dto);
    return created(res, field);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const dto = updateSchema.parse(req.body);
    const field = await fieldService.updateField(id, req.user!.id, dto);
    return success(res, field);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    await fieldService.deleteField(id, req.user!.id);
    return noContent(res);
  } catch (err) {
    next(err);
  }
}
