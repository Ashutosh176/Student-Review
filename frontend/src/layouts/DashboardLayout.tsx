import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardMobileBar, DashboardSidebar, type DashboardKind } from '@/components/DashboardSidebar';

export function DashboardLayout({ kind, brand }: { kind: DashboardKind; brand?: string }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <DashboardSidebar kind={kind} brand={brand} mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 p-4 sm:p-6">
        <DashboardMobileBar onOpen={() => setMobileNavOpen(true)} />
        <Outlet />
      </div>
    </div>
  );
}

export function DashboardTopbar({ crumb, title, right }: { crumb: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-4.5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="mb-0.5 text-xs text-sub">{crumb}</div>
        <h1 className="text-xl">{title}</h1>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}
