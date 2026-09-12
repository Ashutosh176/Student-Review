import { Outlet, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { organizationApi, type OrgMembership } from '@/api/organization.api';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { ErrorState } from '@/components/LoadingSkeleton';

export function useOrgContext() {
  return useOutletContext<OrgMembership>();
}

export function OrgLayout() {
  const query = useQuery({ queryKey: ['organization', 'me'], queryFn: organizationApi.me });

  if (query.isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-surface text-sub">Loading organization…</div>;
  }
  if (query.isError || !query.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-6">
        <ErrorState message="You don't have access to an organization dashboard yet. Claim your institution's profile first." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <DashboardSidebar kind="org" brand={`${query.data.institution.name} · Org`} />
      <div className="flex-1 p-4 sm:p-6">
        <Outlet context={query.data} />
      </div>
    </div>
  );
}
