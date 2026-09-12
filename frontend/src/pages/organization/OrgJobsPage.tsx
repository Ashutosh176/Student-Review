import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { organizationApi } from '@/api/organization.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/LoadingSkeleton';

export function OrgJobsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'INTERNSHIP' as 'JOB' | 'INTERNSHIP', locationType: 'ONSITE' as 'ONSITE' | 'REMOTE' | 'HYBRID', location: '', applicationUrl: '' });

  const query = useQuery({ queryKey: ['organization', 'jobs'], queryFn: organizationApi.jobs });

  const createMutation = useMutation({
    mutationFn: () => organizationApi.createJob(form),
    onSuccess: () => {
      setShowForm(false);
      setForm({ title: '', description: '', type: 'INTERNSHIP', locationType: 'ONSITE', location: '', applicationUrl: '' });
      qc.invalidateQueries({ queryKey: ['organization', 'jobs'] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => organizationApi.publishJob(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organization', 'jobs'] }),
  });

  return (
    <div>
      <Helmet>
        <title>Jobs & Internships — Organization — StudentReview</title>
      </Helmet>
      <DashboardTopbar
        crumb="Organization"
        title="Jobs & Internships"
        right={
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
            + Post a job
          </button>
        }
      />

      {showForm && (
        <form
          className="card mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <div className="field">
            <label>Title</label>
            <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea required minLength={20} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div className="field mb-0">
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as never }))}>
                <option value="INTERNSHIP">Internship</option>
                <option value="JOB">Job</option>
              </select>
            </div>
            <div className="field mb-0">
              <label>Location type</label>
              <select value={form.locationType} onChange={(e) => setForm((f) => ({ ...f, locationType: e.target.value as never }))}>
                <option value="ONSITE">On-site</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Location</label>
            <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          </div>
          <div className="field">
            <label>Application URL</label>
            <input type="url" value={form.applicationUrl} onChange={(e) => setForm((f) => ({ ...f, applicationUrl: e.target.value }))} />
          </div>
          <button type="submit" disabled={createMutation.isPending} className="btn btn-primary btn-sm">
            {createMutation.isPending ? 'Saving…' : 'Save as draft'}
          </button>
        </form>
      )}

      {query.data && query.data.length === 0 && <EmptyState icon="💼" title="No listings yet" />}
      {query.data && query.data.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[11.5px] text-sub">
                <th className="px-3 py-2.5">Title</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5">Location</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data.map((job) => (
                <tr key={job.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2.5">{job.title}</td>
                  <td className="px-3 py-2.5">{job.type === 'INTERNSHIP' ? 'Internship' : 'Job'}</td>
                  <td className="px-3 py-2.5">{job.locationType.replace('_', ' ')}</td>
                  <td className="px-3 py-2.5">
                    <Badge kind={job.status === 'PUBLISHED' ? 'verified' : 'pending'}>{job.status === 'PUBLISHED' ? 'Published' : 'Draft'}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    {job.status === 'DRAFT' && (
                      <button onClick={() => publishMutation.mutate(job.id)} className="text-brand hover:underline">
                        Publish
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
