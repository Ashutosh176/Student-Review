import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { EmptyState } from '@/components/LoadingSkeleton';
import { collegeSeoMeta } from '@/lib/seo/collegeSeo';
import { useCollegeContext } from './CollegeLayout';

export function CollegeCoursesPage() {
  const inst = useCollegeContext();
  const [q, setQ] = useState('');
  const courses = inst.courses.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  const seo = collegeSeoMeta(inst, 'courses');

  return (
    <div>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={`${window.location.origin}${seo.path}`} />
      </Helmet>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search courses..."
        className="mb-4 w-full rounded-md border border-line px-3 py-2.5 text-sm outline-none focus:border-brand"
      />
      {courses.length === 0 && <EmptyState icon="📚" title="No courses found" />}
      <div className="flex flex-col gap-2.5">
        {courses.map((c) => (
          <div key={c.id} className="card flex items-center justify-between">
            <div>
              <h4 className="text-sm">{c.name}</h4>
              <div className="mt-1 text-xs text-sub">
                {c.durationYears ? `${c.durationYears} years` : ''} {c.department ? `· ${c.department}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
