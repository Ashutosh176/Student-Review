import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { institutionsApi } from '@/api/institutions.api';
import { apiErrorMessage } from '@/api/client';
import { AuthCard } from '@/layouts/AuthLayout';
import { Badge } from '@/components/Badge';
import { FileDropzone } from '@/components/FileDropzone';

export function ClaimProfilePage() {
  const { slug } = useParams();
  const [organizationName, setOrganizationName] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [designation, setDesignation] = useState('');
  const [document, setDocument] = useState<File | null>(null);

  const institutionQuery = useQuery({ queryKey: ['institution', slug], queryFn: () => institutionsApi.getBySlug(slug!), enabled: Boolean(slug) });

  const mutation = useMutation({
    mutationFn: () =>
      institutionsApi.claim(institutionQuery.data!.id, {
        organizationName,
        officialEmail,
        website: website || undefined,
        designation: designation || undefined,
        document,
      }),
  });

  useEffect(() => {
    if (institutionQuery.data && !organizationName) {
      setOrganizationName(institutionQuery.data.name);
    }
  }, [institutionQuery.data, organizationName]);

  if (mutation.isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <AuthCard>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning-bg text-2xl text-warning">⏳</div>
            <h2 className="mb-2 text-lg">Verification submitted</h2>
            <p className="mb-4.5 text-[13px] text-sub">
              We typically respond within 3–5 business days. The public profile is unchanged until verification completes.
              {mutation.data?.hasDocument && ' Your supporting document was received.'}
            </p>
            <Badge kind="pending">Pending Verification</Badge>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Helmet>
        <title>Claim Profile — StudentReview</title>
      </Helmet>
      <AuthCard width={440}>
        <h2 className="mb-1 text-lg">Claim this profile</h2>
        <p className="mb-4.5 text-[12.5px] text-sub">
          Verify your affiliation with {institutionQuery.data?.name ?? 'this institution'} to manage its official presence.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="field">
            <label>Organization name</label>
            <input required value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
          </div>
          <div className="field">
            <label>Official email</label>
            <input type="email" required value={officialEmail} onChange={(e) => setOfficialEmail(e.target.value)} placeholder="you@institution.ac.in" />
            <span className="text-[11.5px] text-sub">Must be your institution's own domain — personal providers (Gmail, Yahoo, etc.) aren't accepted.</span>
          </div>
          <div className="field">
            <label>Website</label>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder={institutionQuery.data?.website ?? ''} />
          </div>
          <div className="field">
            <label>Your designation</label>
            <input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Dean of Student Affairs" />
          </div>
          <FileDropzone
            file={document}
            onChange={setDocument}
            label="Official authorization letter"
            required
            hint="A signed letter on institutional letterhead confirming your name, designation, and the official email address above — this is how we verify the email really belongs to the institution."
          />
          {mutation.isError && <p className="mb-3 text-xs text-danger">{apiErrorMessage(mutation.error)}</p>}
          <button type="submit" disabled={mutation.isPending || !document} className="btn btn-primary mt-1.5 w-full justify-center">
            {mutation.isPending ? 'Submitting…' : 'Submit claim'}
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
