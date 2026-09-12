import { useQuery } from '@tanstack/react-query';
import { institutionsApi } from '@/api/institutions.api';
import { EmptyState, ErrorState } from '@/components/LoadingSkeleton';
import { useCollegeContext } from './CollegeLayout';

export function CollegeJobsPage() {
  const inst = useCollegeContext();
  const query = useQuery({ queryKey: ['institution-jobs', inst.slug], queryFn: () => institutionsApi.jobs(inst.slug) });

  return (
    <div>
      {query.isError && <ErrorState />}
      {query.data && query.data.length === 0 && (
        <EmptyState icon="💼" title="No open listings" description="This institution hasn't published any jobs or internships yet." />
      )}
      {query.data && query.data.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {query.data.map((job) => (
            <div key={job.id} className="card flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h4 className="text-sm">{job.title}</h4>
                <div className="mt-1 text-xs text-sub">
                  {job.type === 'INTERNSHIP' ? 'Internship' : 'Job'} · {job.locationType.replace('_', ' ')}
                  {job.location ? ` · ${job.location}` : ''}
                  {job.deadline ? ` · Closes ${new Date(job.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}` : ''}
                </div>
              </div>
              {job.applicationUrl && (
                <a href={job.applicationUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                  Apply
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
