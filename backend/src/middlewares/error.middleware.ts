import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Errores de validacion Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      message: 'Datos inválidos',
      errors: err.flatten().fieldErrors,
    });
  }

  // Errores genéricos
  if (err instanceof Error) {
    console.error('❌ ', err.message);
    return res.status(500).json({ ok: false, message: err.message });
  }

  return res.status(500).json({ ok: false, message: 'Error desconocido' });
}

export function notFoundHandler(_req: Request, res: Response) {
  return res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
}
