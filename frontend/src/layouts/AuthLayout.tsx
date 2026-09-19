import { Outlet } from 'react-router-dom';
import { Logo } from '@/components/Logo';

// Same graduation photo as the home hero: softly blurred and scaled up so the
// blur never shows a hard edge, under a light brand tint. The top bar mirrors
// SiteHeader's geometry (padding, border, h-14 logo) so the logo sits in the
// exact same spot as on every other page.
export function AuthLayout() {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-brand">
      <img
        src="/hero.jpg"
        alt=""
        aria-hidden
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover object-[center_35%] blur-[3px]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-dark/55 via-brand/35 to-brand-deep/60" />

      <header className="border-b border-line bg-white">
        <div className="flex items-center gap-6 px-4 py-2.5 sm:px-7">
          <Logo className="h-14 w-auto flex-none" />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <Outlet />
      </main>
    </div>
  );
}

export function AuthCard({ children, width = 380 }: { children: React.ReactNode; width?: number }) {
  return (
    <div className="w-full rounded-2xl border border-line bg-white p-8 shadow-2xl" style={{ maxWidth: width }}>
      {children}
    </div>
  );
}
