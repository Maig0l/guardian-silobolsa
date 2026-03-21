import { Router, IRouter } from 'express';
import { getAll, getById, update, remove } from '../controllers/user.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router: IRouter = Router();

// Todas protegidas
router.use(authenticate);

router.get('/', requireAdmin, getAll);          // Solo ADMIN ve todos
router.get('/:id', getById);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
