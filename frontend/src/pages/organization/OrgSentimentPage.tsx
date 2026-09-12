import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { organizationApi } from '@/api/organization.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { EmptyState } from '@/components/LoadingSkeleton';

export function OrgSentimentPage() {
  const query = useQuery({ queryKey: ['organization', 'sentiment'], queryFn: organizationApi.sentiment });

  return (
    <div>
      <Helmet>
        <title>Sentiment — Organization — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Organization" title="Sentiment by topic" />
      <p className="mb-4 max-w-xl text-[13px] text-sub">
        Reviews are automatically tagged by topic (Placement, Faculty, Hostel, Fees, Infrastructure, Administration, Campus
        Life) based on their text, then classified positive/neutral/negative. Topics with no mentions yet aren't shown.
      </p>
      {query.data && query.data.length === 0 && (
        <EmptyState icon="😊" title="Not enough topic-specific feedback yet" description="This fills in as more reviews mention specific topics." />
      )}
      {query.data && query.data.length > 0 && (
        <div className="flex flex-col gap-3">
          {query.data.map((t) => (
            <div key={t.topic} className="card">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold">{t.topic}</h4>
                <span className="text-xs text-sub">{t.mentionCount} mentions</span>
              </div>
              <div className="mb-1.5 flex h-2.5 overflow-hidden rounded-full">
                <div className="bg-success" style={{ width: `${t.positive}%` }} />
                <div className="bg-line" style={{ width: `${t.neutral}%` }} />
                <div className="bg-danger" style={{ width: `${t.negative}%` }} />
              </div>
              <div className="text-xs text-sub">
                Positive {t.positive}% · Neutral {t.neutral}% · Negative {t.negative}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
