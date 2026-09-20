import { Helmet } from 'react-helmet-async';
import { RatingBar } from '@/components/RatingBar';
import { useCollegeContext } from './CollegeLayout';

export function CollegePlacementsPage() {
  const inst = useCollegeContext();
  const placement = inst.summary.ratings.find((r) => r.category === 'PLACEMENT');

  return (
    <div className="flex flex-col gap-3">
      <Helmet>
        <title>{inst.name} Placements — Student Reviews & Ratings — StudentReview</title>
        <meta
          name="description"
          content={`How students rate placements at ${inst.name}${placement ? ` — ${placement.average.toFixed(1)}/5 based on ${placement.count} reviews` : ''}. Read real placement experiences before you apply.`}
        />
        <link rel="canonical" href={`${window.location.origin}/college/${inst.slug}/placements`} />
      </Helmet>
      <div className="card">
        <h4 className="mb-2.5 text-sm">Placement sentiment</h4>
        <RatingBar category="PLACEMENT" value={placement?.average ?? 0} />
        <p className="mt-2.5 text-[13px] text-sub">
          Based on {placement?.count ?? 0} verified reviews mentioning placements.
        </p>
      </div>
      <div className="card py-10 text-center text-[13px] text-sub">
        📊 Detailed placement statistics (recruiters, salary ranges, branch-wise data) aren't available yet — they'll appear here
        once submitted and verified.
      </div>
    </div>
  );
}
