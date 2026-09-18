import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/LoadingSkeleton';
import { useCollegeContext } from './CollegeLayout';

function formatInr(amount?: number | null): string | null {
  if (!amount) return null;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function CollegeAdmissionsPage() {
  const inst = useCollegeContext();
  const coursesWithFees = inst.courses.filter((c) => c.feePerYearInr || c.totalFeeInr);
  const hasNothing = inst.entranceExams.length === 0 && coursesWithFees.length === 0 && inst.admissionCutoffs.length === 0;

  if (hasNothing) {
    return (
      <EmptyState
        icon="🎓"
        title="Admission details aren't available yet"
        description="Entrance exams, fees and cutoff ranks for this college will appear here once added."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {inst.entranceExams.length > 0 && (
        <div className="card">
          <h4 className="mb-2.5 text-sm">Entrance exams accepted</h4>
          <div className="flex flex-wrap gap-2">
            {inst.entranceExams.map((exam) => (
              <Badge key={exam} kind="org">
                {exam}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {coursesWithFees.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <h4 className="px-4 pt-3.5 text-sm">Course fees</h4>
          <table className="mt-2.5 w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[11.5px] text-sub">
                <th className="px-4 py-2">Course</th>
                <th className="px-4 py-2">Fee / year</th>
                <th className="px-4 py-2">Total fee</th>
              </tr>
            </thead>
            <tbody>
              {coursesWithFees.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2">
                    {c.name} <span className="text-sub">({c.level})</span>
                  </td>
                  <td className="px-4 py-2">{formatInr(c.feePerYearInr) ?? '—'}</td>
                  <td className="px-4 py-2">{formatInr(c.totalFeeInr) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {inst.admissionCutoffs.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <h4 className="px-4 pt-3.5 text-sm">Admission cutoffs</h4>
          <p className="px-4 pb-1 text-[11.5px] text-sub">Rank or percentile needed to secure admission in a past year.</p>
          <table className="mt-1.5 w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[11.5px] text-sub">
                <th className="px-4 py-2">Course</th>
                <th className="px-4 py-2">Exam</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Year</th>
                <th className="px-4 py-2">Closing rank</th>
                <th className="px-4 py-2">Percentile</th>
              </tr>
            </thead>
            <tbody>
              {inst.admissionCutoffs.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2">{c.course.name}</td>
                  <td className="px-4 py-2">{c.examName}</td>
                  <td className="px-4 py-2">{c.category}</td>
                  <td className="px-4 py-2">{c.year}</td>
                  <td className="px-4 py-2">{c.closingRank?.toLocaleString('en-IN') ?? '—'}</td>
                  <td className="px-4 py-2">{c.percentile ? `${c.percentile}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
