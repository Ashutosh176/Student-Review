import { create } from 'zustand';
import type { SelfUser } from '@/types';

interface AuthState {
  accessToken: string | null;
  user: SelfUser | null;
  hydrated: boolean;
  setAccessToken: (token: string, user: SelfUser) => void;
  clear: () => void;
  setHydrated: () => void;
  hasRole: (...roles: SelfUser['roles']) => boolean;
}

// Access tokens live in memory only (never localStorage) — the refresh
// token is the only persisted credential, and it's an httpOnly cookie the
// frontend never touches directly (spec §25/§26).
export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  hydrated: false,
  setAccessToken: (token, user) => set({ accessToken: token, user }),
  clear: () => set({ accessToken: null, user: null }),
  setHydrated: () => set({ hydrated: true }),
  hasRole: (...roles) => {
    const user = get().user;
    if (!user) return false;
    return roles.some((r) => user.roles.includes(r));
  },
}));
