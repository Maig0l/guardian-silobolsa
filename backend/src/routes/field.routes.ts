import { Router, IRouter } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/field.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import sensorRoutes from './sensor.routes.js';
import silobagRoutes from './silobag.routes.js';

const router: IRouter = Router();

router.use(authenticate);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

// Nested routes: /fields/:fieldId/sensors  y  /fields/:fieldId/silobolsas
router.use('/:fieldId/sensors', sensorRoutes);
router.use('/:fieldId/silobolsas', silobagRoutes);

export default router;
