import { Link, Outlet, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { institutionsApi } from '@/api/institutions.api';
import { usersApi } from '@/api/users.api';
import { verificationApi } from '@/api/verification.api';
import { Badge } from '@/components/Badge';
import { RatingBar } from '@/components/RatingBar';
import { CollegeTabs } from '@/components/CollegeTabs';
import { ErrorState } from '@/components/LoadingSkeleton';
import { useAuthStore } from '@/store/authStore';
import { collegeSeoMeta, collegeStructuredData } from '@/lib/seo/collegeSeo';
import type { InstitutionDetail } from '@/types';

export function useCollegeContext() {
  return useOutletContext<InstitutionDetail>();
}

export function CollegeLayout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => Boolean(s.accessToken));
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['institution', slug],
    queryFn: () => institutionsApi.getBySlug(slug!),
    enabled: Boolean(slug),
  });

  const savedQuery = useQuery({ queryKey: ['saved-institutions'], queryFn: usersApi.savedInstitutions, enabled: isLoggedIn });
  const isSaved = savedQuery.data?.some((s) => s.institution.id === query.data?.id) ?? false;

  const saveMutation = useMutation({
    mutationFn: () => (isSaved ? usersApi.unsave(query.data!.id) : usersApi.save(query.data!.id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-institutions'] }),
  });

  const verificationsQuery = useQuery({ queryKey: ['verifications', 'mine'], queryFn: verificationApi.mine, enabled: isLoggedIn });
  const isVerifiedHere = verificationsQuery.data?.some((v) => v.institutionId === query.data?.id && v.status === 'VERIFIED') ?? false;
  const writeReviewLabel = !isLoggedIn ? 'Sign in to write a review' : isVerifiedHere ? 'Write a review' : 'Verify your student identity to write a review';

  async function share() {
    await navigator.clipboard.writeText(window.location.origin + `/college/${slug}`);
    alert('Link copied to clipboard');
  }

  if (query.isLoading) {
    return <div className="animate-pulse px-4 py-6 sm:px-7">Loading college profile…</div>;
  }
  if (query.isError || !query.data) {
    return (
      <div className="px-4 py-6 sm:px-7">
        <ErrorState message="We couldn't find that college." />
      </div>
    );
  }

  const inst = query.data;
  const overall = inst.summary.ratings.find((r) => r.category === 'OVERALL');
  const location = inst.locations[0];
  const origin = window.location.origin;
  const canonicalUrl = `${origin}/college/${inst.slug}`;
  const seo = collegeSeoMeta(inst, 'overview');
  const structuredData = collegeStructuredData(inst, origin);

  return (
    <div className="px-4 pb-8 pt-4 sm:px-7">
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${inst.name} — Student Reviews & Ratings`} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="mb-2.5 text-xs text-sub">
        <Link to="/colleges">Colleges</Link> {location && `/ ${location.state}`} / {inst.name}
      </div>

      <div className="card mb-4 flex flex-col justify-between gap-4 sm:flex-row">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-[13px] bg-brand-light font-heading text-lg font-extrabold text-brand">
            {inst.name.slice(0, 3).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-[22px]">{inst.name}</h1>
              {inst.verified && <Badge kind="verified">✓ Verified</Badge>}
              {!inst.claimed && <Badge kind="pending">Unclaimed</Badge>}
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-[13px] text-sub">
              {location && <span>📍 {location.city}, {location.state}</span>}
              {inst.website && (
                <a href={inst.website} target="_blank" rel="noreferrer" className="hover:text-brand">
                  🌐 {inst.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {inst.establishedYear && <span>🏛 Est. {inst.establishedYear}</span>}
            </div>
            {!inst.claimed && (
              <p className="mt-1.5 text-[11.5px] text-sub">This college profile has not been claimed by the institution yet.</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={!isLoggedIn || saveMutation.isPending}
              className="btn btn-ghost btn-sm"
              title={!isLoggedIn ? 'Log in to save colleges' : undefined}
            >
              {isSaved ? '★ Saved' : '☆ Save'}
            </button>
            <button type="button" onClick={share} className="btn btn-ghost btn-sm">
              Share
            </button>
          </div>
          <button type="button" onClick={() => navigate(`/write-review?college=${inst.slug}`)} className="btn btn-primary btn-sm">
            {writeReviewLabel}
          </button>
        </div>
      </div>

      <div className="card mb-4 flex flex-col gap-6 sm:flex-row">
        <div>
          <div className="font-heading text-[34px] font-extrabold">{(overall?.average ?? 0).toFixed(1)}</div>
          <div className="text-brand">{'★★★★★'.slice(0, Math.round(overall?.average ?? 0))}</div>
          <div className="mt-1 text-xs text-sub">
            {inst.summary.reviewCount.toLocaleString('en-IN')} reviews · {inst.summary.verifiedCount.toLocaleString('en-IN')} verified
          </div>
        </div>
        <div className="max-w-md flex-1">
          {inst.summary.ratings
            .filter((r) => ['PLACEMENT', 'FACULTY', 'INFRASTRUCTURE', 'ADMINISTRATION'].includes(r.category))
            .map((r) => (
              <RatingBar key={r.category} category={r.category} value={r.average} />
            ))}
        </div>
      </div>

      <CollegeTabs slug={inst.slug} />

      <div className="mt-4">
        <Outlet context={inst} />
      </div>
    </div>
  );
}
