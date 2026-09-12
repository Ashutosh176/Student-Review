import { Link } from 'react-router-dom';
import { Badge } from './Badge';
import { Stars } from './Stars';
import type { InstitutionSummary } from '@/types';

function initials(name: string): string {
  return name
    .split(' ')
    .filter((w) => w.length > 2 || /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
}

export function CollegeCard({ institution, trending = false }: { institution: InstitutionSummary; trending?: boolean }) {
  const overall = institution.summary.ratings.find((r) => r.category === 'OVERALL');
  const location = institution.locations[0];

  return (
    <Link to={`/college/${institution.slug}`} className="college-card block rounded-card border border-line bg-white p-4 transition-shadow hover:shadow-card">
      <div className="flex items-start gap-2.5">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[9px] bg-brand-light font-heading text-[13px] font-extrabold text-brand">
          {institution.logoUrl ? <img src={institution.logoUrl} alt="" className="h-full w-full rounded-[9px] object-cover" /> : initials(institution.name)}
        </div>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold">{institution.name}</h4>
          {location && <div className="text-xs text-sub">{location.city}</div>}
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {institution.verified && <Badge kind="verified">Verified</Badge>}
        {trending && <Badge kind="trending">Trending</Badge>}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 text-sm">
        <Stars value={overall?.average ?? 0} />
        <span>{(overall?.average ?? 0).toFixed(1)}</span>
        <span className="text-xs text-sub">· {institution.summary.reviewCount.toLocaleString('en-IN')} reviews</span>
      </div>
    </Link>
  );
}
