import { Link, NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { Logo } from './Logo';

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
  return (
    <div className="hidden w-[220px] flex-none flex-col bg-brand-deep p-3 text-white md:flex">
      <div className="flex items-center gap-2 px-2 pb-4">
        {kind === 'student' ? (
          <div className="rounded-md bg-white px-2 py-1">
            <Logo className="h-6 w-auto" linkTo="/" />
          </div>
        ) : (
          <span className="font-heading text-sm font-extrabold">{brand ?? (kind === 'admin' ? 'Admin' : 'Organization')}</span>
        )}
      </div>
      {/* Present in every role's dashboard — the only way back to the
          public site from inside admin/org, which previously had none. */}
      <Link
        to="/"
        className="mb-2 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.8px] font-medium text-white/60 hover:bg-white/10 hover:text-white"
      >
        <span>🏠</span>
        Back to site
      </Link>
      <div className="mb-2 border-t border-white/10" />
      <nav className="flex flex-col gap-0.5">
        {ITEMS[kind].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard' || item.to === '/admin' || item.to.endsWith('/dashboard')}
            className={({ isActive }) =>
              clsx('flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.8px] font-medium text-white/60', isActive && 'bg-white/10 text-white')
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
