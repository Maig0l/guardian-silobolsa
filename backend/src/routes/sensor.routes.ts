import { Router, IRouter } from 'express';
import {
  getByField,
  getAvailable,
  getById,
  create,
  update,
  remove,
} from '../controllers/sensor.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router: IRouter = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', getByField);
router.get('/available', getAvailable);    // sensores sin link activo
router.get('/:id', getById);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
