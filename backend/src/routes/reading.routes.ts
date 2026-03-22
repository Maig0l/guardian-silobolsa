import { Router, IRouter } from 'express';
import {
  getBySensor,
  getBySilobag,
  getAlerts,
  markSeen,
  markAllSeen,
} from '../controllers/reading.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router: IRouter = Router();

router.use(authenticate);

// GET  /readings/alerts                    → alertas no vistas del usuario
// PATCH /readings/alerts/seen-all          → marcar todas como vistas
// PATCH /readings/alerts/:id/seen          → marcar una como vista
// GET  /readings/sensor/:sensorId?hours=24 → lecturas por sensor
// GET  /readings/silobag/:silobagId?hours=24

router.get('/alerts',                getAlerts);
router.patch('/alerts/seen-all',     markAllSeen);
router.patch('/alerts/:id/seen',     markSeen);
router.get('/sensor/:sensorId',      getBySensor);
router.get('/silobag/:silobagId',    getBySilobag);

export default router;
