import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usersApi } from '@/api/users.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { CollegeCard } from '@/components/CollegeCard';
import { EmptyState } from '@/components/LoadingSkeleton';

export function SavedCollegesPage() {
  const query = useQuery({ queryKey: ['saved-institutions'], queryFn: usersApi.savedInstitutions });
  const slugs = query.data?.map((s) => s.institution.slug).filter(Boolean) ?? [];

  return (
    <div>
      <Helmet>
        <title>Saved Colleges — StudentReview</title>
      </Helmet>
      <DashboardTopbar
        crumb="Account"
        title="Saved Colleges"
        right={
          slugs.length >= 2 && (
            <Link to={`/compare?slugs=${slugs.slice(0, 3).join(',')}`} className="btn btn-ghost btn-sm">
              Compare saved
            </Link>
          )
        }
      />
      {query.data && query.data.length === 0 && <EmptyState icon="🔖" title="No saved colleges yet" description="Save colleges from their profile page to see them here." />}
      {query.data && query.data.length > 0 && (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {query.data.map((s) => (
            <CollegeCard key={s.institution.id} institution={s.institution} />
          ))}
        </div>
      )}
    </div>
  );
}
