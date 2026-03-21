import { Router, IRouter } from 'express';
import {
  getByField,
  getById,
  create,
  update,
  remove,
  linkSensor,
  unlinkSensor,
} from '../controllers/silobag.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router: IRouter = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', getByField);
router.get('/:id', getById);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

// Vinculación con sensor
router.post('/:id/link', linkSensor);
router.delete('/:id/link', unlinkSensor);

export default router;
