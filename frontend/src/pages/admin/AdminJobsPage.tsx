import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { adminApi } from '@/api/admin.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/LoadingSkeleton';

export function AdminJobsPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin', 'jobs'], queryFn: () => adminApi.jobs({ pageSize: 30 }) });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'PUBLISHED' | 'CLOSED' }) => adminApi.setJobStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'jobs'] }),
  });

  return (
    <div>
      <Helmet>
        <title>Jobs — Admin — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Admin" title="Jobs & Internships" />
      {query.data && query.data.items.length === 0 && <EmptyState icon="💼" title="No listings have been posted yet" />}
      {query.data && query.data.items.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[11.5px] text-sub">
                <th className="px-3 py-2.5">Title</th>
                <th className="px-3 py-2.5">Institution</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data.items.map((job) => (
                <tr key={job.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2.5">{job.title}</td>
                  <td className="px-3 py-2.5">{job.institution.name}</td>
                  <td className="px-3 py-2.5">{job.type === 'INTERNSHIP' ? 'Internship' : 'Job'}</td>
                  <td className="px-3 py-2.5">
                    <Badge kind={job.status === 'PUBLISHED' ? 'verified' : job.status === 'CLOSED' ? 'flagged' : 'pending'}>
                      {job.status === 'PUBLISHED' ? 'Published' : job.status === 'CLOSED' ? 'Closed' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    {job.status === 'PUBLISHED' && (
                      <button onClick={() => statusMutation.mutate({ id: job.id, status: 'CLOSED' })} className="text-danger hover:underline">
                        Take down
                      </button>
                    )}
                    {job.status === 'CLOSED' && (
                      <button onClick={() => statusMutation.mutate({ id: job.id, status: 'PUBLISHED' })} className="text-brand hover:underline">
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
