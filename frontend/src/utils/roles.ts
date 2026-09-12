import type { RoleName } from '@/types';

// Priority order matters: a user can hold multiple roles (e.g. a claimed
// org owner is still STUDENT + ORGANIZATION) — admin tooling takes
// precedence, then the org dashboard, falling back to the student account.
export function defaultDashboardPath(roles: RoleName[]): string {
  if (roles.includes('ADMIN') || roles.includes('MODERATOR')) return '/admin';
  if (roles.includes('ORGANIZATION')) return '/organization/dashboard';
  return '/dashboard';
}
