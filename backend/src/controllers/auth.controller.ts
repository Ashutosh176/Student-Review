import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { serializeSelfUser } from '../utils/serializers.js';
import * as authService from '../services/auth.service.js';
import { env } from '../config/env.js';

const REFRESH_COOKIE = 'sr_refresh';

// "Remember me" controls cookie persistence, not the refresh token's own
// validity — the token itself is always issued with a 30-day expiry
// (refreshTtlToDate); unchecking it just makes the browser drop the cookie
// on close instead of keeping it around for the full 30 days.
function setRefreshCookie(res: Response, token: string, persistent = true) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    path: '/api/auth',
    ...(persistent ? { maxAge: 30 * 24 * 60 * 60 * 1000 } : {}),
  });
}

export const register = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user, roles } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  ok(res, { accessToken, user: serializeSelfUser({ ...user, roles: roles.map((name) => ({ role: { name } })) }) }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user, roles } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken, req.body.rememberMe ?? true);
  ok(res, { accessToken, user: serializeSelfUser({ ...user, roles: roles.map((name) => ({ role: { name } })) }) });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw AppError.unauthorized('No refresh token');
  const { accessToken, refreshToken, user, roles } = await authService.refresh(token);
  setRefreshCookie(res, refreshToken);
  ok(res, { accessToken, user: serializeSelfUser({ ...user, roles: roles.map((name) => ({ role: { name } })) }) });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  ok(res, { loggedOut: true });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  ok(res, { message: 'If that email is registered, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  ok(res, { message: 'Password updated. Please log in again.' });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.body.token);
  ok(res, { message: 'Email verified.' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getSelf(req.user!.id);
  ok(res, serializeSelfUser(user));
});
