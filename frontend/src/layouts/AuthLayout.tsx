import { Outlet } from 'react-router-dom';

// Same graduation photo as the home hero: softly blurred and scaled up so the
// blur never shows a hard edge, under a light brand tint. The white card on
// top carries all the text, so the photo can stay bright.
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
