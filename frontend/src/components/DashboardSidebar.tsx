import { Link, NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { Logo } from './Logo';
import { useAuthStore } from '@/store/authStore';

export type DashboardKind = 'student' | 'org' | 'admin';

const ITEMS: Record<DashboardKind, { icon: string; label: string; to: string }[]> = {
  student: [
    { icon: '📊', label: 'Dashboard', to: '/dashboard' },
    { icon: '👤', label: 'Profile', to: '/profile' },
    { icon: '💬', label: 'My Reviews', to: '/my-reviews' },
    { icon: '❓', label: 'My Questions', to: '/my-questions' },
    { icon: '🔖', label: 'Saved Colleges', to: '/saved-colleges' },
    { icon: '🔔', label: 'Notifications', to: '/notifications' },
    { icon: '⚙️', label: 'Settings', to: '/settings' },
  ],
  org: [
    { icon: '📊', label: 'Dashboard', to: '/organization/dashboard' },
    { icon: '🏛', label: 'Profile', to: '/organization/profile' },
    { icon: '💬', label: 'Reviews', to: '/organization/reviews' },
    { icon: '❓', label: 'Questions', to: '/organization/questions' },
    { icon: '📈', label: 'Analytics', to: '/organization/analytics' },
    { icon: '😊', label: 'Sentiment', to: '/organization/sentiment' },
    { icon: '💼', label: 'Jobs', to: '/organization/jobs' },
    { icon: '👥', label: 'Team', to: '/organization/team' },
    { icon: '⚙️', label: 'Settings', to: '/organization/settings' },
  ],
  admin: [
    { icon: '📊', label: 'Dashboard', to: '/admin' },
    { icon: '👤', label: 'Users', to: '/admin/users' },
    { icon: '🏛', label: 'Colleges', to: '/admin/colleges' },
    { icon: '💬', label: 'Reviews', to: '/admin/reviews' },
    { icon: '🚩', label: 'Reports', to: '/admin/reports' },
    { icon: '🏢', label: 'Organizations', to: '/admin/organizations' },
    { icon: '✅', label: 'Verifications', to: '/admin/verifications' },
    { icon: '💼', label: 'Jobs', to: '/admin/jobs' },
    { icon: '💳', label: 'Payments', to: '/admin/payments' },
    { icon: '📈', label: 'Analytics', to: '/admin/analytics' },
    { icon: '⚙️', label: 'Settings', to: '/admin/settings' },
  ],
};

export function DashboardSidebar({ kind, brand }: { kind: DashboardKind; brand?: string }) {
  const user = useAuthStore((s) => s.user);
  const name = brand ?? user?.username ?? (kind === 'admin' ? 'Admin' : kind === 'org' ? 'Organization' : 'My Account');

  return (
    <div className="hidden w-[220px] flex-none flex-col overflow-y-auto bg-brand-light p-3 text-ink md:sticky md:top-0 md:flex md:h-screen md:self-start">
      <div className="px-2 pb-4">
        <Logo className="h-11 w-auto" linkTo="/" />
        <div className="mt-2.5 truncate text-[13px] font-semibold text-ink">{name}</div>
      </div>
      <nav className="flex flex-col gap-0.5">
        {ITEMS[kind].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard' || item.to === '/admin' || item.to.endsWith('/dashboard')}
            className={({ isActive }) =>
              clsx('flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.8px] font-medium text-sub', isActive && 'bg-white text-brand')
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      {/* Present in every role's dashboard — the only way back to the
          public site from inside admin/org. Pinned to the bottom of the panel. */}
      <div className="mt-auto border-t border-line pt-2">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.8px] font-medium text-sub hover:bg-white hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>
    </div>
  );
}
