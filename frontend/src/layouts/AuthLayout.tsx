import { Link, Outlet } from 'react-router-dom';
import logoLightUrl from '@/assets/logo-light.svg';

// Same graduation photo as the home hero: softly blurred and scaled up so the
// blur never shows a hard edge, under a light brand tint. The logo sits
// directly on the photo (no bar, no badge) at the same spot and size as in
// SiteHeader — left edge px-4 / sm:px-7, top py-2.5, h-14 (56px) +20% = 67px — using the light
// (reversed) logo so the wordmark stays readable on the image.
export function AuthLayout() {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-brand p-4">
      <img
        src="/hero.jpg"
        alt=""
        aria-hidden
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover object-[center_35%] blur-[3px]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-dark/55 via-brand/35 to-brand-deep/60" />

      <Link to="/" aria-label="StudentReview home" className="absolute left-4 top-2.5 z-10 inline-flex items-center sm:left-7">
        <img src={logoLightUrl} alt="StudentReview" className="h-[67px] w-auto flex-none drop-shadow-[0_2px_10px_rgba(10,16,40,0.55)]" />
      </Link>

      <Outlet />
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
