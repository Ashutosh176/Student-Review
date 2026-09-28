import { Link } from 'react-router-dom';
import { Badge } from './Badge';
import { Stars } from './Stars';
import { CollegeLogo } from './CollegeLogo';
import type { InstitutionSummary } from '@/types';

export function CollegeCard({ institution, trending = false }: { institution: InstitutionSummary; trending?: boolean }) {
  const overall = institution.summary.ratings.find((r) => r.category === 'OVERALL');
  const location = institution.locations[0];

  return (
    <Link to={`/college/${institution.slug}`} className="college-card block rounded-card border border-line bg-white p-4 transition-shadow hover:shadow-card">
      <div className="flex items-start gap-2.5">
        <CollegeLogo name={institution.name} logoUrl={institution.logoUrl} className="h-10 w-10 rounded-[9px] text-[13px]" />
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold">{institution.name}</h4>
          {location && <div className="text-xs text-sub">{location.city}</div>}
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {institution.verified && <Badge kind="verified">Verified</Badge>}
        {trending && <Badge kind="trending">Trending</Badge>}
      </div>
      {institution.summary.reviewCount > 0 ? (
        <div className="mt-2.5 flex items-center gap-1.5 text-sm">
          <Stars value={overall?.average ?? 0} />
          <span>{(overall?.average ?? 0).toFixed(1)}</span>
          <span className="text-xs text-sub">
            · {institution.summary.reviewCount.toLocaleString('en-IN')} {institution.summary.reviewCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      ) : (
        <div className="mt-2.5 text-xs text-sub">No reviews yet · be the first</div>
      )}
    </Link>
  );
}
