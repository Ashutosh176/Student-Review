import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { organizationApi } from '@/api/organization.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge } from '@/components/Badge';
import { useOrgContext } from './OrgLayout';

export function OrgProfilePage() {
  const org = useOrgContext();
  const [description, setDescription] = useState(org.institution.description ?? '');
  const [contactEmail, setContactEmail] = useState(org.organization.contactEmail ?? '');
  const [website, setWebsite] = useState(org.institution.website ?? '');

  const mutation = useMutation({
    mutationFn: () => organizationApi.updateProfile({ description, contactEmail: contactEmail || undefined, website: website || undefined }),
  });

  return (
    <div>
      <Helmet>
        <title>Profile — Organization — StudentReview</title>
      </Helmet>
      <DashboardTopbar
        crumb="Organization"
        title="Profile"
        right={
          <button className="btn btn-primary btn-sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : mutation.isSuccess ? 'Saved ✓' : 'Save changes'}
          </button>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <h4 className="mb-3 text-[13px]">Edit information</h4>
          <div className="field">
            <label>
              Description <span className="font-normal text-sub">— Public</span>
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[90px]" />
          </div>
          <div className="field">
            <label>
              Contact email <span className="font-normal text-sub">— Private</span>
            </label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>
              Website <span className="font-normal text-sub">— Public</span>
            </label>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
        </div>
        <div className="card">
          <h4 className="mb-3 text-[13px]">Public preview</h4>
          <div className="mb-2.5 flex items-center gap-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-[11px] bg-brand-light font-heading font-bold text-brand">
              {org.institution.name.slice(0, 3).toUpperCase()}
            </div>
            <div>
              <h4 className="text-[15px]">{org.institution.name}</h4>
              <Badge kind="verified">✓ Verified</Badge>
            </div>
          </div>
          <p className="text-[12.5px] text-sub">{description || 'No description yet.'}</p>
        </div>
      </div>
    </div>
  );
}
