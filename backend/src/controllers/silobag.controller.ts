import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as silobagService from '../services/silobag.service.js';
import { success, created, noContent } from '../utils/response.js';
import { GrainType, SilobagStatus } from '../entities/index.js';

const createSchema = z.object({
  marca: z.string().min(2).max(100),
  capacidad_max: z.number().positive(),
  ubicacion: z.string().min(2).max(200),
  grano: z.nativeEnum(GrainType).optional(),
  observaciones: z.string().optional(),
});

const updateSchema = z.object({
  marca: z.string().min(2).max(100).optional(),
  capacidad_max: z.number().positive().optional(),
  ubicacion: z.string().min(2).max(200).optional(),
  grano: z.nativeEnum(GrainType).optional(),
  observaciones: z.string().optional(),
  estado: z.nativeEnum(SilobagStatus).optional(),
});

const linkSchema = z.object({
  sensor_id: z.number().int().positive(),
});

export async function getByField(req: Request, res: Response, next: NextFunction) {
  try {
    const fieldId = parseInt(req.params.fieldId);
    const silobolsas = await silobagService.getSilobagsByField(fieldId, req.user!.id);
    return success(res, silobolsas);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const silo = await silobagService.getSilobagById(id, req.user!.id);
    return success(res, silo);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const fieldId = parseInt(req.params.fieldId);
    const dto = createSchema.parse(req.body);
    const silo = await silobagService.createSilobag(fieldId, req.user!.id, dto);
    return created(res, silo);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const dto = updateSchema.parse(req.body);
    const silo = await silobagService.updateSilobag(id, req.user!.id, dto);
    return success(res, silo);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    await silobagService.deleteSilobag(id, req.user!.id);
    return noContent(res);
  } catch (err) {
    next(err);
  }
}

export async function linkSensor(req: Request, res: Response, next: NextFunction) {
  try {
    const silobagId = parseInt(req.params.id);
    const { sensor_id } = linkSchema.parse(req.body);
    const link = await silobagService.linkSensorToSilobag(silobagId, sensor_id, req.user!.id);
    return created(res, link);
  } catch (err) {
    next(err);
  }
}

export async function unlinkSensor(req: Request, res: Response, next: NextFunction) {
  try {
    const silobagId = parseInt(req.params.id);
    const result = await silobagService.unlinkSensorFromSilobag(silobagId, req.user!.id);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}
