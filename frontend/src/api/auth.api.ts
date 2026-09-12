import { api, unwrap } from './client';
import type { SelfUser } from '@/types';

interface AuthResponse {
  accessToken: string;
  user: SelfUser;
}

export const authApi = {
  register: (input: { username: string; email: string; password: string; agreedToTerms: true }) =>
    unwrap<AuthResponse>(api.post('/auth/register', input)),
  login: (input: { email: string; password: string; rememberMe?: boolean }) => unwrap<AuthResponse>(api.post('/auth/login', input)),
  logout: () => unwrap<{ loggedOut: boolean }>(api.post('/auth/logout')),
  refresh: () => unwrap<AuthResponse>(api.post('/auth/refresh')),
  me: () => unwrap<SelfUser>(api.get('/auth/me')),
  forgotPassword: (email: string) => unwrap<{ message: string }>(api.post('/auth/forgot-password', { email })),
  resetPassword: (token: string, password: string) => unwrap<{ message: string }>(api.post('/auth/reset-password', { token, password })),
};
