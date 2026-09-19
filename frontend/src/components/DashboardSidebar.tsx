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
    <div className="hidden w-[220px] flex-none flex-col bg-brand-light p-3 text-ink md:flex">
      <div className="px-2 pb-4">
        <Logo className="h-11 w-auto" linkTo="/" />
        <div className="mt-2.5 truncate text-[13px] font-semibold text-ink">{name}</div>
      </div>
      {/* Present in every role's dashboard — the only way back to the
          public site from inside admin/org, which previously had none. */}
      <Link
        to="/"
        className="mb-2 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.8px] font-medium text-sub hover:bg-white hover:text-ink"
      >
        <span>🏠</span>
        Back to site
      </Link>
      <div className="mb-2 border-t border-line" />
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
    </div>
  );
}
