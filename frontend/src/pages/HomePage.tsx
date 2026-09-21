import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { institutionsApi } from '@/api/institutions.api';
import { reviewsApi } from '@/api/reviews.api';
import { CollegeCard } from '@/components/CollegeCard';
import { ReviewCard } from '@/components/ReviewCard';
import { HowItWorks } from '@/components/HowItWorks';
import { SearchBar } from '@/components/SearchBar';
import { CardSkeletonGrid, EmptyState } from '@/components/LoadingSkeleton';
import { useScrollOutProgress } from '@/hooks/useScrollOutProgress';
import { useHeroVisibilityStore } from '@/store/heroVisibilityStore';
import { HEADER_HEIGHT_PX } from '@/components/SiteHeader';
import { homeSeo, homeStructuredData } from '@/lib/seo/siteSeo';

export function HomePage() {
  const statsQuery = useQuery({ queryKey: ['institutions', 'stats'], queryFn: institutionsApi.stats, staleTime: 5 * 60 * 1000 });

  const trendingQuery = useQuery({
    queryKey: ['institutions', 'trending'],
    queryFn: () => institutionsApi.list({ sort: 'reviews', pageSize: 4 }),
  });
  const topRatedQuery = useQuery({
    queryKey: ['institutions', 'top-rated'],
    queryFn: () => institutionsApi.list({ sort: 'rating', pageSize: 4 }),
  });
  const latestReviewsQuery = useQuery({ queryKey: ['reviews', 'latest'], queryFn: () => reviewsApi.latest(3) });

  // The header's nav/search transition tracks this continuously (0 = hero
  // fully visible, 1 = hero fully scrolled out from under the sticky
  // header) rather than a boolean — see SiteHeader. The `-HEADER_HEIGHT_PXpx`
  // top margin shrinks the observed region so progress tracks what's
  // actually visible beneath the sticky header, not the raw viewport.
  const { ref: heroRef, progress: heroProgress } = useScrollOutProgress<HTMLElement>(`-${HEADER_HEIGHT_PX}px 0px 0px 0px`);
  const setHeroProgress = useHeroVisibilityStore((s) => s.setHeroProgress);
  const clearHero = useHeroVisibilityStore((s) => s.clearHero);

  useEffect(() => {
    setHeroProgress(heroProgress);
  }, [heroProgress, setHeroProgress]);

  useEffect(() => clearHero, [clearHero]);

  const origin = 'https://studentreview.in';
  const structuredData = homeStructuredData(origin);

  return (
    <>
      <Helmet>
        <title>{homeSeo.title}</title>
        <meta name="description" content={homeSeo.description} />
        <link rel="canonical" href={`${origin}/`} />
        <meta property="og:title" content={homeSeo.title} />
        <meta property="og:description" content={homeSeo.description} />
        <meta property="og:url" content={`${origin}/`} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <section ref={heroRef} className="relative isolate bg-brand px-4 py-14 text-center text-white sm:px-6 sm:py-16">
        {/* Background photo: softly blurred (scaled up so the blur never shows a hard edge) under a brand tint that keeps the white text legible. */}
        {/* Clipping lives on this wrapper (not the section) so the search suggestions can overflow the hero. */}
        <div aria-hidden className="absolute inset-0 -z-20 overflow-hidden">
          <img
            src="/hero.jpg"
            alt=""
            fetchPriority="high"
            className="h-full w-full scale-110 object-cover object-[center_35%] blur-[3px]"
          />
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-dark/55 via-brand/35 to-brand-deep/60" />
        <h1 className="mx-auto mb-3 max-w-2xl text-3xl leading-tight [text-shadow:0_2px_14px_rgba(10,16,40,0.55)] sm:text-[38px]">Know what students really think.</h1>
        <p className="mx-auto mb-6 max-w-lg text-[15px] text-white/95 [text-shadow:0_1px_10px_rgba(10,16,40,0.6)]">
          Explore honest student experiences, ratings and reviews of colleges and universities across India.
        </p>
        <SearchBar variant="hero" />
      </section>

      <section className="px-4 py-9 sm:px-7">
        <h3 className="mb-4 text-lg">Trending this week</h3>
        {trendingQuery.isLoading && <CardSkeletonGrid />}
        {trendingQuery.data && trendingQuery.data.items.length === 0 && (
          <EmptyState title="No trending colleges yet" description="Check back once more reviews come in." />
        )}
        {trendingQuery.data && trendingQuery.data.items.length > 0 && (
          <div className="mb-9 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {trendingQuery.data.items.map((inst) => (
              <CollegeCard key={inst.id} institution={inst} trending />
            ))}
          </div>
        )}

        <h3 className="mb-4 text-lg">Top rated colleges</h3>
        {topRatedQuery.isLoading && <CardSkeletonGrid />}
        {topRatedQuery.data && topRatedQuery.data.items.length === 0 && (
          <EmptyState title="No colleges available yet" description="Check back once colleges and reviews are added." />
        )}
        {topRatedQuery.data && topRatedQuery.data.items.length > 0 && (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {topRatedQuery.data.items.map((inst) => (
              <CollegeCard key={inst.id} institution={inst} />
            ))}
          </div>
        )}

        {latestReviewsQuery.data && latestReviewsQuery.data.length > 0 && (
          <>
            <h3 className="mb-4 mt-9 text-lg">Latest student reviews</h3>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {latestReviewsQuery.data.map((r) => (
                <ReviewCard key={r.id} review={r} institutionName={r.institution.name} />
              ))}
            </div>
          </>
        )}
      </section>

      <HowItWorks institutionCount={statsQuery.data?.institutionCount} />

      <section className="px-4 py-12 text-center sm:px-7">
        <h3 className="mb-2 text-lg">For Colleges</h3>
        <p className="mx-auto mb-5 max-w-md text-sm text-sub">Claim your official profile to respond to reviews and access reputation analytics.</p>
        <Link to="/colleges" className="btn btn-primary">
          Claim Your Profile
        </Link>
      </section>
    </>
  );
}
