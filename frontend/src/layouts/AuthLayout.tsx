import { Outlet } from 'react-router-dom';
import { Logo } from '@/components/Logo';

// Same graduation photo as the home hero: softly blurred and scaled up so the
// blur never shows a hard edge, under a light brand tint. The logo floats on
// the photo at the same spot (and size) as in SiteHeader — left edge px-4 /
// sm:px-7, top py-2.5, h-14 — inside a soft white badge so the brand's dark
// wordmark stays legible on the image (the logo itself is never recoloured).
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

      <div className="absolute left-4 top-2.5 z-10 sm:left-7">
        <div className="-mx-2.5 -my-1 rounded-xl bg-white/90 px-2.5 py-1 shadow-lg backdrop-blur-sm">
          <Logo className="h-14 w-auto flex-none" />
        </div>
      </div>

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
