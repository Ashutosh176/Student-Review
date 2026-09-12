import { Outlet } from 'react-router-dom';
import { TrustStrip } from '@/components/TrustStrip';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <TrustStrip />
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </div>
  );
}
