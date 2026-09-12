import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { institutionsApi } from '@/api/institutions.api';
import { ReviewCard } from '@/components/ReviewCard';
import { useCollegeContext } from './CollegeLayout';
import { useAuthStore } from '@/store/authStore';

export function CollegeOverviewPage() {
  const inst = useCollegeContext();
  const isOrg = useAuthStore((s) => s.hasRole('ORGANIZATION'));

  const reviewsQuery = useQuery({
    queryKey: ['institution-reviews', inst.slug, 'helpful', 1],
    queryFn: () => institutionsApi.reviews(inst.slug, { sort: 'helpful', page: 1, pageSize: 1 }),
  });

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="card mb-3">
          <h4 className="mb-2 text-sm">About</h4>
          <p className="text-[13.5px] leading-relaxed text-sub">{inst.description ?? 'No description has been added for this institution yet.'}</p>
        </div>
        {reviewsQuery.data && reviewsQuery.data.items.length > 0 && (
          <div className="card">
            <h4 className="mb-2.5 text-sm">Popular review</h4>
            <ReviewCard review={reviewsQuery.data.items[0]} institutionName={inst.name} />
          </div>
        )}
      </div>
      <div>
        {!inst.claimed && !isOrg && (
          <div className="card mb-3 bg-brand-deep text-white">
            <h4 className="mb-1.5 text-xs text-white/60">Is this your institution?</h4>
            <p className="mb-3 text-[12.5px] text-white/75">Claim this profile to respond to reviews.</p>
            <Link to={`/claim/${inst.slug}`} className="btn w-full justify-center bg-white text-ink">
              Claim your profile
            </Link>
          </div>
        )}
        <div className="card">
          <h4 className="mb-1 text-xs text-sub">Key information</h4>
          <div className="flex justify-between border-b border-line py-1.5 text-[12.5px]">
            <span>Type</span>
            <span>{inst.type.replace(/_/g, ' ')}</span>
          </div>
          {inst.establishedYear && (
            <div className="flex justify-between border-b border-line py-1.5 text-[12.5px]">
              <span>Established</span>
              <span>{inst.establishedYear}</span>
            </div>
          )}
          {inst.website && (
            <div className="flex justify-between py-1.5 text-[12.5px]">
              <span>Website</span>
              <a href={inst.website} target="_blank" rel="noreferrer" className="text-brand">
                {inst.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
