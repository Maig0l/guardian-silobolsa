import { Router, IRouter } from 'express';
import { getBySensor, getBySilobag, getAlerts } from '../controllers/reading.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router: IRouter = Router();

router.use(authenticate);

// GET /readings/alerts                              → alertas del usuario
// GET /readings/sensor/:sensorId?hours=24          → lecturas por sensor
// GET /readings/silobag/:silobagId?hours=24        → lecturas por silobolsa
router.get('/alerts', getAlerts);
router.get('/sensor/:sensorId', getBySensor);
router.get('/silobag/:silobagId', getBySilobag);

export default router;
