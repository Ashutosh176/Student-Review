import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Outlet />
    </div>
  );
}

export function AuthCard({ children, width = 380 }: { children: React.ReactNode; width?: number }) {
  return (
    <div className="w-full rounded-2xl border border-line bg-white p-8 shadow-card" style={{ maxWidth: width }}>
      {children}
    </div>
  );
}
