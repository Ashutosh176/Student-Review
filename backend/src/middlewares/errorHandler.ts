import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { MulterError } from 'multer';
import { AppError } from '../utils/AppError.js';
import { fail } from '../utils/apiResponse.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export function notFoundHandler(req: Request, res: Response) {
  fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return fail(res, 'Validation failed', 422, err.flatten());
  }

  if (err instanceof MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? `File is too large (max ${env.upload.maxMb}MB)` : err.message;
    return fail(res, message, 400);
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) logger.error({ err }, err.message);
    return fail(res, err.message, err.statusCode, err.details);
  }

  logger.error({ err }, 'Unhandled error');
  // Never leak stack traces or internals in production responses (spec §44).
  return fail(res, env.isProd ? 'Something went wrong' : (err as Error)?.message ?? 'Something went wrong', 500);
}
