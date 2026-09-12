import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { RoleName } from '@/types';

export function ProtectedRoute({ roles }: { roles?: RoleName[] }) {
  const { accessToken, user, hydrated } = useAuthStore();
  const location = useLocation();

  if (!hydrated) return null; // avoid flashing a redirect before refresh-on-load resolves

  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (roles && !roles.some((r) => user.roles.includes(r))) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
