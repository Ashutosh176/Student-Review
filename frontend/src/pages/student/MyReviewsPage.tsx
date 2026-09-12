import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { reviewsApi } from '@/api/reviews.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge, type BadgeKind } from '@/components/Badge';
import { Stars } from '@/components/Stars';
import { EmptyState } from '@/components/LoadingSkeleton';

const STATUS_BADGE: Record<string, { kind: BadgeKind; label: string }> = {
  APPROVED: { kind: 'verified', label: 'Approved' },
  PENDING: { kind: 'pending', label: 'Pending' },
  FLAGGED: { kind: 'flagged', label: 'Flagged' },
  REJECTED: { kind: 'flagged', label: 'Rejected' },
  REMOVED: { kind: 'flagged', label: 'Removed' },
};

export function MyReviewsPage() {
  const query = useQuery({ queryKey: ['reviews', 'mine'], queryFn: reviewsApi.mine });
  const qc = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', 'mine'] }),
  });

  return (
    <div>
      <Helmet>
        <title>My Reviews — StudentReview</title>
      </Helmet>
      <DashboardTopbar
        crumb="Account"
        title="My Reviews"
        right={
          <Link to="/write-review" className="btn btn-primary btn-sm">
            Write a review
          </Link>
        }
      />
      {query.data && query.data.length === 0 && <EmptyState icon="📝" title="You haven't written any reviews yet" />}
      {query.data && query.data.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[11.5px] text-sub">
                <th className="px-3 py-2.5">College</th>
                <th className="px-3 py-2.5">Rating</th>
                <th className="px-3 py-2.5">Submitted</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data.map((r) => {
                const overall = r.ratings.find((x) => x.category === 'OVERALL')?.value ?? 0;
                const statusInfo = STATUS_BADGE[r.status] ?? { kind: 'pending' as BadgeKind, label: r.status };
                return (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="px-3 py-2.5">
                      <Link to={`/college/${r.institution.slug}`} className="hover:text-brand">
                        {r.institution.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">
                      <Stars value={overall} />
                    </td>
                    <td className="px-3 py-2.5">{new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</td>
                    <td className="px-3 py-2.5">
                      <Badge kind={statusInfo.kind}>{statusInfo.label}</Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => confirm('Delete this review permanently?') && deleteMutation.mutate(r.id)}
                        className="text-danger hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
