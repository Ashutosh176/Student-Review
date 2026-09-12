import type { Response } from 'express';

// Consistent API envelope per spec §44.
export function ok<T>(res: Response, data: T, statusCode = 200, meta?: Record<string, unknown>) {
  return res.status(statusCode).json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function fail(res: Response, message: string, statusCode = 400, details?: unknown) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details !== undefined ? { details } : {}),
  });
}
