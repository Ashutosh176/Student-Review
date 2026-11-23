import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { institutionsApi } from '@/api/institutions.api';
import { apiErrorMessage } from '@/api/client';
import { CardSkeletonGrid, EmptyState, ErrorState } from '@/components/LoadingSkeleton';
import { ListeningCollegeCard } from '@/components/ListeningCollegeCard';
import { collegesThatListenSeo } from '@/lib/seo/siteSeo';

export function CollegesThatListenPage() {
  const query = useQuery({ queryKey: ['institutions', 'listening'], queryFn: institutionsApi.listening, staleTime: 5 * 60 * 1000 });
  const origin = window.location.origin;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-7">
      <Helmet>
        <title>{collegesThatListenSeo.title}</title>
        <meta name="description" content={collegesThatListenSeo.description} />
        <link rel="canonical" href={`${origin}/colleges-that-listen`} />
      </Helmet>
      <h1 className="mb-2 text-2xl">Colleges that listen to their students</h1>
      <p className="mb-3 max-w-2xl text-sm leading-relaxed text-sub">
        These colleges have claimed their official profile on StudentReview, so they can hear directly from their students and respond to
        reviews in public.
      </p>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-sub">
        Claiming a profile never gives a college control over its reviews. Reviews are written independently by students and cannot be
        edited or removed by the college. The college can only reply, openly, where everyone can see it.
      </p>

      {query.isLoading && <CardSkeletonGrid />}
      {query.isError && <ErrorState message={apiErrorMessage(query.error)} onRetry={() => query.refetch()} />}
      {query.data && query.data.length === 0 && (
        <EmptyState
          icon="👂"
          title="No colleges here yet"
          description="Is your college ready to hear what its students really think? Claim its official profile and it will be featured here."
          action={
            <Link to="/colleges" className="btn btn-primary btn-sm">
              Find and claim your college
            </Link>
          }
        />
      )}
      {query.data && query.data.length > 0 && (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {query.data.map((inst) => (
            <ListeningCollegeCard key={inst.id} institution={inst} />
          ))}
        </div>
      )}

      <div className="card mt-10 text-center">
        <h2 className="mb-1 text-base">Represent a college?</h2>
        <p className="mx-auto mb-4 max-w-md text-sm text-sub">
          Claim your official profile for free to respond to reviews, answer applicants' questions and be featured on this page.
        </p>
        <Link to="/colleges" className="btn btn-primary btn-sm">
          Claim your profile
        </Link>
      </div>
    </div>
  );
}
