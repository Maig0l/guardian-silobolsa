import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service.js';
import { success, created } from '../utils/response.js';

const registerSchema = z.object({
  nombre: z.string().min(2).max(100),
  apellido: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  telefono: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = registerSchema.parse(req.body);
    const result = await authService.registerUser(dto);
    return created(res, result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = loginSchema.parse(req.body);
    const result = await authService.loginUser(dto);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function profile(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await authService.getProfile(req.user!.id);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}
