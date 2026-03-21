import express, { Application } from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import fieldRoutes from './routes/field.routes.js';
import readingRoutes from './routes/reading.routes.js';

const app: Application = express();

// ─── Middlewares globales ─────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'guardian-silobolsa-backend', timestamp: new Date() });
});

// ─── Rutas ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fields', fieldRoutes);   // /fields/:fieldId/sensors y /silobolsas ya van nested
app.use('/api/readings', readingRoutes);

// ─── Fallbacks ────────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
