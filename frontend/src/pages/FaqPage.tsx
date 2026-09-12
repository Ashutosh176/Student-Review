import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { faqApi } from '@/api/faq.api';
import { EmptyState } from '@/components/LoadingSkeleton';

export function FaqPage() {
  const query = useQuery({ queryKey: ['faqs'], queryFn: faqApi.list });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-7">
      <Helmet>
        <title>Frequently Asked Questions — StudentReview</title>
      </Helmet>
      <h1 className="mb-5 text-2xl">Frequently Asked Questions</h1>

      {query.data && query.data.length === 0 && <EmptyState icon="❓" title="No FAQs yet" description="Check back soon." />}

      <div className="flex flex-col gap-4">
        {query.data?.map((faq) => (
          <div key={faq.id} className="card">
            <h2 className="mb-1.5 text-sm font-semibold">{faq.question}</h2>
            <p className="text-[13.5px] leading-relaxed text-sub">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
