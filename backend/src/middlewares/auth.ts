import type { NextFunction, Request, Response } from 'express';
import type { RoleName } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export interface AuthUser {
  id: string;
  username: string;
  roles: RoleName[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next(AppError.unauthorized('Authentication required'));
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, username: payload.username, roles: payload.roles };
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired token'));
  }
}

// Populates req.user when a valid token is present but does not require one.
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, username: payload.username, roles: payload.roles };
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

export function authorize(...allowed: RoleName[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(AppError.unauthorized());
    const hasRole = req.user.roles.some((r) => allowed.includes(r));
    if (!hasRole) return next(AppError.forbidden('Insufficient permissions'));
    next();
  };
}
