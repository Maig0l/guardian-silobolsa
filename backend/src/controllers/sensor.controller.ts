import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as sensorService from '../services/sensor.service.js';
import { success, created, noContent } from '../utils/response.js';

const createSchema = z.object({
  modelo: z.string().min(2).max(100),
  mac_address: z
    .string()
    .regex(/^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/, 'MAC address inválida'),
});

const updateSchema = z.object({
  modelo: z.string().min(2).max(100).optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'FALLA']).optional(),
});

export async function getByField(req: Request, res: Response, next: NextFunction) {
  try {
    const fieldId = parseInt(req.params.fieldId);
    const sensors = await sensorService.getSensorsByField(fieldId, req.user!.id);
    return success(res, sensors);
  } catch (err) {
    next(err);
  }
}

export async function getAvailable(req: Request, res: Response, next: NextFunction) {
  try {
    const fieldId = parseInt(req.params.fieldId);
    const sensors = await sensorService.getAvailableSensors(fieldId, req.user!.id);
    return success(res, sensors);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const sensor = await sensorService.getSensorById(id, req.user!.id);
    return success(res, sensor);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const fieldId = parseInt(req.params.fieldId);
    const dto = createSchema.parse(req.body);
    const sensor = await sensorService.createSensor(fieldId, req.user!.id, dto);
    return created(res, sensor);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const dto = updateSchema.parse(req.body);
    const sensor = await sensorService.updateSensor(id, req.user!.id, dto);
    return success(res, sensor);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    await sensorService.deleteSensor(id, req.user!.id);
    return noContent(res);
  } catch (err) {
    next(err);
  }
}
