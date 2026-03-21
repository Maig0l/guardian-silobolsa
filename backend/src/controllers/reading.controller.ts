import { Request, Response, NextFunction } from 'express';
import * as readingService from '../services/reading.service.js';
import { success } from '../utils/response.js';

export async function getBySensor(req: Request, res: Response, next: NextFunction) {
  try {
    const sensorId = parseInt(req.params.sensorId);
    const hours = req.query.hours ? parseInt(req.query.hours as string) : 24;
    const readings = await readingService.getReadingsBySensor(sensorId, req.user!.id, hours);
    return success(res, readings);
  } catch (err) {
    next(err);
  }
}

export async function getBySilobag(req: Request, res: Response, next: NextFunction) {
  try {
    const silobagId = parseInt(req.params.silobagId);
    const hours = req.query.hours ? parseInt(req.query.hours as string) : 24;
    const readings = await readingService.getReadingsBySilobag(silobagId, req.user!.id, hours);
    return success(res, readings);
  } catch (err) {
    next(err);
  }
}

export async function getAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const alerts = await readingService.getAlertsByUser(req.user!.id);
    return success(res, alerts);
  } catch (err) {
    next(err);
  }
}
