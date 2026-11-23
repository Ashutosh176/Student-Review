import { CollegeCard } from './CollegeCard';
import type { ListeningInstitution } from '@/types';

// A college on "Colleges that listen to their students": the usual card, plus
// how it engages with its students' reviews.
export function ListeningCollegeCard({ institution }: { institution: ListeningInstitution }) {
  const { responseCount, claimedAt } = institution.listening;
  const since = new Date(claimedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  return (
    <div className="flex flex-col gap-1.5">
      <CollegeCard institution={institution} />
      <p className="px-1 text-xs text-sub">
        {responseCount > 0
          ? `Replied to ${responseCount.toLocaleString('en-IN')} student ${responseCount === 1 ? 'review' : 'reviews'}`
          : 'Official profile · replies to student reviews'}{' '}
        · since {since}
      </p>
    </div>
  );
}
