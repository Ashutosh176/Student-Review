import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { organizationApi } from '@/api/organization.api';
import { authApi } from '@/api/auth.api';
import { apiErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { AuthCard } from '@/layouts/AuthLayout';

export function AcceptInvitePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  const inviteQuery = useQuery({
    queryKey: ['organization', 'invite', token],
    queryFn: () => organizationApi.getInvite(token),
    enabled: Boolean(token),
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      await organizationApi.acceptInvite(token);
      // The access token's roles were baked in at login/register, before
      // ORGANIZATION was granted — refresh it so route guards see the new role.
      const refreshed = await authApi.refresh();
      setAccessToken(refreshed.accessToken, refreshed.user);
    },
    onSuccess: () => navigate('/organization/dashboard', { replace: true }),
  });

  if (!token) {
    return (
      <AuthCard>
        <p className="text-center text-sm text-danger">This invite link is missing a token.</p>
      </AuthCard>
    );
  }

  if (inviteQuery.isLoading) {
    return (
      <AuthCard>
        <p className="text-center text-sm text-sub">Loading invite…</p>
      </AuthCard>
    );
  }

  if (inviteQuery.isError || !inviteQuery.data) {
    return (
      <AuthCard>
        <p className="text-center text-sm text-danger">{apiErrorMessage(inviteQuery.error) || 'This invite link is invalid or has expired.'}</p>
      </AuthCard>
    );
  }

  const invite = inviteQuery.data;
  const roleLabel = invite.role === 'ADMIN' ? 'an Admin' : 'an Editor';

  return (
    <AuthCard>
      <Helmet>
        <title>Accept Invite — StudentReview</title>
      </Helmet>
      <h2 className="mb-2 text-lg">You've been invited</h2>
      <p className="mb-5 text-sm text-sub">
        Join <b>{invite.institutionName}</b>'s organization team on StudentReview as {roleLabel}.
      </p>

      {!user && (
        <>
          <p className="mb-4 text-[13px]">
            Log in or create an account with <b>{invite.email}</b> to accept — you'll land right back here afterward.
          </p>
          <div className="flex gap-2">
            <Link
              to="/login"
              state={{ from: { pathname: '/accept-invite', search: `?token=${token}` } }}
              className="btn btn-primary flex-1 justify-center"
            >
              Log in
            </Link>
            <Link to="/register" className="btn btn-ghost flex-1 justify-center">
              Sign up
            </Link>
          </div>
        </>
      )}

      {user && user.email.toLowerCase() !== invite.email.toLowerCase() && (
        <>
          <p className="mb-4 text-[13px] text-danger">
            You're logged in as <b>{user.email}</b>, but this invite was sent to <b>{invite.email}</b>. Log out and sign in with that email to
            accept it.
          </p>
          <button
            className="btn btn-primary w-full justify-center"
            onClick={async () => {
              try {
                await authApi.logout();
              } finally {
                clear();
                navigate('/login', { state: { from: { pathname: '/accept-invite', search: `?token=${token}` } } });
              }
            }}
          >
            Log out
          </button>
        </>
      )}

      {user && user.email.toLowerCase() === invite.email.toLowerCase() && (
        <>
          {acceptMutation.isError && <p className="mb-3 text-xs text-danger">{apiErrorMessage(acceptMutation.error)}</p>}
          <button
            className="btn btn-primary w-full justify-center"
            disabled={acceptMutation.isPending}
            onClick={() => acceptMutation.mutate()}
          >
            {acceptMutation.isPending ? 'Joining…' : `Accept & join as ${roleLabel}`}
          </button>
        </>
      )}
    </AuthCard>
  );
}
