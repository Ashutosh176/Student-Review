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
        {inst.aiSummary && (
          <div className="card mb-3 border-brand/20 bg-brand-light">
            <h4 className="mb-1.5 flex items-center gap-1.5 text-sm">✨ Students say</h4>
            <p className="text-[13.5px] leading-relaxed text-ink">{inst.aiSummary}</p>
            <p className="mt-2 text-[11px] text-sub">
              AI-summarized from recent verified reviews — not a review itself.{' '}
              <Link to={`/college/${inst.slug}/reviews`} className="text-brand">
                Read the full reviews
              </Link>
            </p>
          </div>
        )}
        {inst.summary.reviewCount === 0 && (
          <div className="card mb-3 border-brand/30 bg-brand-light">
            <h4 className="mb-1 text-sm">Be the first to review {inst.name}</h4>
            <p className="mb-3 text-[12.5px] text-sub">
              No student has reviewed this college yet. If you study or studied here, your anonymous review helps the next batch decide.
            </p>
            <Link to={`/write-review?college=${inst.slug}`} className="btn btn-primary btn-sm">
              Write the first review
            </Link>
          </div>
        )}
        <div className="card mb-3">
          <h4 className="mb-2 text-sm">About</h4>
          <p className="text-[13.5px] leading-relaxed text-sub">{inst.description ?? 'No description has been added for this institution yet.'}</p>
        </div>
        {inst.editorialOverview && (
          <div className="card mb-3">
            <h4 className="mb-2 text-sm">Editor's overview</h4>
            {inst.editorialOverview.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="mb-2 text-[13.5px] leading-relaxed text-sub last:mb-0">
                {para}
              </p>
            ))}
            <p className="mt-2.5 border-t border-line pt-2 text-[11px] text-sub">
              Written by the StudentReview team from publicly available information. This is not a student review and doesn't
              affect this college's rating or ranking.{' '}
              <Link to={`/college/${inst.slug}/reviews`} className="text-brand">
                Read student reviews
              </Link>
            </p>
          </div>
        )}
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
