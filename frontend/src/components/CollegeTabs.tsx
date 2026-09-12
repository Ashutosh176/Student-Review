import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

export function CollegeTabs({ slug }: { slug: string }) {
  const tabs = [
    { to: `/college/${slug}`, label: 'Overview', end: true },
    { to: `/college/${slug}/reviews`, label: 'Reviews' },
    { to: `/college/${slug}/questions`, label: 'Questions' },
    { to: `/college/${slug}/placements`, label: 'Placements' },
    { to: `/college/${slug}/courses`, label: 'Courses' },
    { to: `/college/${slug}/jobs`, label: 'Jobs' },
  ];
  return (
    <div className="flex gap-1 overflow-x-auto rounded-card border border-line bg-white p-1">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            clsx('flex-1 whitespace-nowrap rounded-md px-3 py-2 text-center text-[12.5px] font-semibold', isActive ? 'bg-brand text-white' : 'text-sub')
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}
