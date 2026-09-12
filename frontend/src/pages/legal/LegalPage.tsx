import { Helmet } from 'react-helmet-async';

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-7">
      <Helmet>
        <title>{title} — StudentReview</title>
      </Helmet>
      <h1 className="mb-5 text-2xl">{title}</h1>
      <div className="flex flex-col gap-3.5 text-sm leading-relaxed text-sub [&_h2]:mt-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-ink">
        {children}
      </div>
    </div>
  );
}
