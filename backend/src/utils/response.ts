import { Response } from 'express';

export function success<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json({ ok: true, data });
}

export function created<T>(res: Response, data: T) {
  return success(res, data, 201);
}

export function noContent(res: Response) {
  return res.status(204).send();
}

export function badRequest(res: Response, message: string) {
  return res.status(400).json({ ok: false, message });
}

export function unauthorized(res: Response, message = 'No autorizado') {
  return res.status(401).json({ ok: false, message });
}

export function forbidden(res: Response, message = 'Acceso denegado') {
  return res.status(403).json({ ok: false, message });
}

export function notFound(res: Response, message = 'Recurso no encontrado') {
  return res.status(404).json({ ok: false, message });
}

export function conflict(res: Response, message: string) {
  return res.status(409).json({ ok: false, message });
}

export function serverError(res: Response, message = 'Error interno del servidor') {
  return res.status(500).json({ ok: false, message });
}
