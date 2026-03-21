import { Router, IRouter } from 'express';
import { register, login, profile } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router: IRouter = Router();

// ── Públicas ─────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);

// ── Protegidas ────────────────────────────────────────
router.get('/profile', authenticate, profile);

export default router;
