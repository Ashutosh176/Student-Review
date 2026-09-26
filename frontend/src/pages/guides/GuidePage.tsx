import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { guidesApi, type GuideBlock } from '@/api/guides.api';
import { ErrorState } from '@/components/LoadingSkeleton';
import { guideSeo, guideStructuredData } from '@/lib/seo/siteSeo';

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case 'h2':
      return <h2>{block.text}</h2>;
    case 'p':
      return <p>{block.text}</p>;
    case 'ul':
      return (
        <ul className="list-disc pl-5">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="list-decimal pl-5">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
  }
}

export function GuidePage() {
  const { slug } = useParams();
  const query = useQuery({ queryKey: ['guide', slug], queryFn: () => guidesApi.get(slug!), enabled: Boolean(slug), staleTime: 60 * 60 * 1000 });
  const others = useQuery({ queryKey: ['guides'], queryFn: guidesApi.list, staleTime: 60 * 60 * 1000 });
  const origin = window.location.origin;

  if (query.isLoading) return <div className="mx-auto max-w-2xl animate-pulse px-4 py-10 sm:px-7">Loading guide…</div>;
  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-7">
        <ErrorState message="We couldn't find that guide." />
      </div>
    );
  }

  const guide = query.data;
  const seo = guideSeo(guide);
  const updated = new Date(guide.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <article className="mx-auto max-w-2xl px-4 py-10 sm:px-7">
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={`${origin}/guides/${guide.slug}`} />
        <meta property="og:title" content={guide.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={`${origin}/guides/${guide.slug}`} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(guideStructuredData(guide, origin))}</script>
      </Helmet>

      <div className="mb-2.5 text-xs text-sub">
        <Link to="/guides">Guides</Link>
      </div>
      <h1 className="mb-2 text-2xl leading-tight">{guide.title}</h1>
      <p className="mb-8 text-xs text-sub">By the StudentReview team · Updated {updated}</p>

      <div className="flex flex-col gap-4 text-[14.5px] leading-relaxed text-[#3A3F4C] [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink [&_li]:mb-1.5">
        {guide.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>

      {guide.relatedColleges.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-base font-bold">Read what students say</h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {guide.relatedColleges.map((c) => (
              <Link key={c.slug} to={`/college/${c.slug}`} className="rounded-card border border-line bg-white px-3.5 py-3 text-[13px] hover:shadow-card">
                <span className="font-semibold text-ink">{c.name}</span>
                {c.city && <span className="block text-xs text-sub">{c.city}</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="card mt-10 border-brand/30 bg-brand-light">
        <h2 className="mb-1 text-base font-bold">Studied somewhere?</h2>
        <p className="mb-3 text-[13px] text-sub">
          An honest, anonymous review of your college helps the next batch make this decision with better information.
        </p>
        <Link to="/write-review" className="btn btn-primary btn-sm">
          Write a review
        </Link>
      </section>

      {others.data && others.data.filter((g) => g.slug !== guide.slug).length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-base font-bold">More guides</h2>
          <ul className="flex flex-col gap-2 text-[13.5px]">
            {others.data
              .filter((g) => g.slug !== guide.slug)
              .map((g) => (
                <li key={g.slug}>
                  <Link to={`/guides/${g.slug}`} className="font-semibold text-brand">
                    {g.title}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      )}
    </article>
  );
}
