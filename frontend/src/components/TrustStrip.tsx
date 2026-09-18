import { useQuery } from '@tanstack/react-query';
import { institutionsApi } from '@/api/institutions.api';

export function TrustStrip() {
  const query = useQuery({ queryKey: ['institutions', 'stats'], queryFn: institutionsApi.stats, staleTime: 5 * 60 * 1000 });

  return (
    <div className="hidden items-center justify-between bg-brand-deep px-7 py-1.5 text-[11.5px] text-[#C9CDD0] sm:flex print:hidden">
      <div className="flex gap-5">
        <span className="flex items-center gap-1.5 before:content-['✓'] before:text-[10px] before:font-extrabold before:text-[#7C8CE0]">
          {query.data ? `${query.data.verifiedReviewCount.toLocaleString('en-IN')} verified reviews` : 'Verified reviews'}
        </span>
        <span className="flex items-center gap-1.5 before:content-['✓'] before:text-[10px] before:font-extrabold before:text-[#7C8CE0]">
          {query.data ? `${query.data.institutionCount.toLocaleString('en-IN')} colleges` : 'Colleges'}
        </span>
        <span className="flex items-center gap-1.5 before:content-['✓'] before:text-[10px] before:font-extrabold before:text-[#7C8CE0]">100% anonymous</span>
      </div>
      <div className="flex gap-4.5">
        <a href="/contact">Help</a>
        <a href="/about">For Colleges</a>
      </div>
    </div>
  );
}
