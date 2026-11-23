import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { institutionsApi } from '@/api/institutions.api';
import { ListeningCollegeCard } from './ListeningCollegeCard';

// Highlighted home-page band for "Colleges that listen to their students".
// Always shown: before any college has claimed, it invites colleges to be
// the first; afterwards it showcases up to four of them.
export function CollegesThatListenBand() {
  const query = useQuery({ queryKey: ['institutions', 'listening'], queryFn: institutionsApi.listening, staleTime: 5 * 60 * 1000 });
  const colleges = query.data ?? [];

  return (
    <section className="px-4 pt-9 sm:px-7">
      <div className="relative overflow-hidden rounded-card bg-brand-deep px-5 py-7 text-white shadow-card sm:px-8 sm:py-8">
        <div aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-[#F2B705]" />
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="mb-2 inline-block rounded-full bg-[#F2B705] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-deep">
              Colleges that listen
            </span>
            <h2 className="mb-1.5 text-xl text-white sm:text-2xl">Colleges that listen to their students</h2>
            <p className="text-sm leading-relaxed text-white/85">
              These colleges have claimed their official profile to hear directly from their students and reply to reviews in public. They
              can't edit or remove a single review, only respond openly.
            </p>
          </div>
          <Link to="/colleges-that-listen" className="shrink-0 text-sm font-semibold text-[#F2B705] hover:underline">
            {colleges.length > 0 ? 'See all colleges →' : 'How it works →'}
          </Link>
        </div>

        {colleges.length > 0 ? (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {colleges.slice(0, 4).map((inst) => (
              <ListeningCollegeCard key={inst.id} institution={inst} onDark />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 rounded-card border border-white/15 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/90">
              <span className="font-semibold text-white">Represent a college?</span> Claim your official profile for free and be among the
              first colleges featured here.
            </p>
            <Link to="/colleges" className="btn btn-sm shrink-0 justify-center bg-[#F2B705] font-semibold text-brand-deep hover:bg-[#ffc81f]">
              Get featured
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
