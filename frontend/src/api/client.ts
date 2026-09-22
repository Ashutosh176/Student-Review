import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true, // send the httpOnly refresh cookie
  // The backend runs on Render's free tier and spins down after idle
  // periods — a cold start can take 30-50s to respond. 25s gives it a fair
  // shot per attempt while still surfacing a retryable error instead of
  // hanging forever if the network genuinely drops.
  timeout: 25_000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
    const token = res.data?.data?.accessToken as string | undefined;
    if (token) {
      useAuthStore.getState().setAccessToken(token, res.data.data.user);
      return token;
    }
    return null;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      useAuthStore.getState().clear();
    }
    return Promise.reject(error);
  },
);

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: { total?: number; page?: number; pageSize?: number };
}

export interface ApiFailure {
  success: false;
  message: string;
  details?: unknown;
}

export function unwrap<T>(promise: Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  return promise.then((res) => res.data.data);
}

export function apiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiFailure | undefined;
    // Validation failures carry the specific reasons ("Password needs an
    // uppercase letter") in details.fieldErrors — show those, not just the
    // generic "Validation failed", so people know what to fix.
    const fieldErrors = (data?.details as { fieldErrors?: Record<string, string[] | undefined> } | undefined)?.fieldErrors;
    const reasons = fieldErrors ? Object.values(fieldErrors).flatMap((v) => v ?? []) : [];
    if (reasons.length > 0) return reasons.join('. ');
    return data?.message ?? 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}
