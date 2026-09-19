import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usersApi } from '@/api/users.api';
import { institutionsApi } from '@/api/institutions.api';
import { verificationApi } from '@/api/verification.api';
import { authApi } from '@/api/auth.api';
import { apiErrorMessage } from '@/api/client';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Toggle } from '@/components/Toggle';
import { Badge, type BadgeKind } from '@/components/Badge';
import { VerificationGate } from '@/components/VerificationGate';
import { useAuthStore } from '@/store/authStore';
import type { InstitutionSummary } from '@/types';

const SECTIONS = ['Account', 'Privacy', 'Security', 'Notifications', 'Verification', 'Danger Zone'] as const;

function PrivacySection({ publicProfileOptIn }: { publicProfileOptIn: boolean }) {
  const [value, setValue] = useState(publicProfileOptIn);
  const mutation = useMutation({ mutationFn: (next: boolean) => usersApi.updateSettings({ publicProfileOptIn: next }) });

  return (
    <div>
      <h4 className="mb-1 text-sm">Privacy</h4>
      <p className="mb-3 text-xs text-sub">Control what's visible about you. Your reviews are always anonymous by design, regardless of this setting.</p>
      <Toggle
        label="Public profile"
        description="Shows a 'Public profile' badge on your profile page instead of 'Private profile'. Your username is still never attached to any review."
        checked={value}
        onChange={(next) => {
          setValue(next);
          mutation.mutate(next);
        }}
      />
      {mutation.isError && <p className="mt-2 text-xs text-danger">{apiErrorMessage(mutation.error)}</p>}
    </div>
  );
}

const NOTIFICATION_TOGGLES = [
  {
    key: 'notifyReviewActivity' as const,
    label: 'Review activity',
    description: 'When one of your reviews is approved, rejected, or reported.',
  },
  {
    key: 'notifyCommunityActivity' as const,
    label: 'Community activity',
    description: 'When a college responds to your review, or someone answers your question or upvotes your answer.',
  },
  {
    key: 'notifySubmissionUpdates' as const,
    label: 'Submissions & claims',
    description: 'When admin decides on a college you submitted, or an organization claim you filed.',
  },
  {
    key: 'notifySystem' as const,
    label: 'System announcements',
    description: 'Platform-wide announcements from the StudentReview team.',
  },
];

function NotificationsSection({
  prefs,
}: {
  prefs: { notifyReviewActivity: boolean; notifyCommunityActivity: boolean; notifySubmissionUpdates: boolean; notifySystem: boolean };
}) {
  const [values, setValues] = useState(prefs);
  const mutation = useMutation({ mutationFn: (input: Partial<typeof prefs>) => usersApi.updateSettings(input) });

  return (
    <div>
      <h4 className="mb-1 text-sm">Notifications</h4>
      <p className="mb-3 text-xs text-sub">Turning one of these off stops those notifications from being sent to you at all — not just from being shown.</p>
      <div className="divide-y divide-line">
        {NOTIFICATION_TOGGLES.map((t) => (
          <Toggle
            key={t.key}
            label={t.label}
            description={t.description}
            checked={values[t.key]}
            onChange={(next) => {
              setValues((v) => ({ ...v, [t.key]: next }));
              mutation.mutate({ [t.key]: next });
            }}
          />
        ))}
      </div>
      {mutation.isError && <p className="mt-2 text-xs text-danger">{apiErrorMessage(mutation.error)}</p>}
    </div>
  );
}

function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mismatch, setMismatch] = useState(false);

  const mutation = useMutation({ mutationFn: () => usersApi.changePassword({ currentPassword, newPassword }) });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    mutation.mutate(undefined, {
      onSuccess: () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      },
    });
  }

  return (
    <form onSubmit={submit}>
      <h4 className="mb-3 text-sm">Change password</h4>
      <div className="field">
        <label>Current password</label>
        <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      </div>
      <div className="field">
        <label>New password</label>
        <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </div>
      <div className="field">
        <label>Confirm new password</label>
        <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </div>
      {mismatch && <p className="mb-3 text-xs text-danger">New passwords don't match.</p>}
      {mutation.isError && <p className="mb-3 text-xs text-danger">{apiErrorMessage(mutation.error)}</p>}
      {mutation.isSuccess && <p className="mb-3 text-xs text-brand">{mutation.data.message}</p>}
      <button type="submit" className="btn btn-primary btn-sm" disabled={mutation.isPending}>
        {mutation.isPending ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}

const STATUS_BADGE: Record<string, BadgeKind> = {
  VERIFIED: 'verified',
  PENDING: 'pending',
  REJECTED: 'flagged',
  EXPIRED: 'flagged',
  REVOKED: 'flagged',
};

function VerificationSection() {
  const [institution, setInstitution] = useState<InstitutionSummary | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<InstitutionSummary[]>([]);
  const [searching, setSearching] = useState(false);

  const historyQuery = useQuery({ queryKey: ['verifications', 'mine'], queryFn: verificationApi.mine });

  async function runSearch(q: string) {
    setQuery(q);
    setInstitution(null);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      setResults(await institutionsApi.search(q));
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <h4 className="mb-1 text-sm">University verification</h4>
      <p className="mb-4 text-xs text-sub">
        Verify your official university email (or upload an ID/document) to write a review for that college. This doesn't reveal your
        identity publicly — reviews always stay anonymous.
      </p>

      {institution ? (
        <>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold">{institution.name}</span>
            <button type="button" className="text-[12px] text-brand hover:underline" onClick={() => setInstitution(null)}>
              Choose a different college
            </button>
          </div>
          <VerificationGate institutionId={institution.id} institutionName={institution.name} />
        </>
      ) : (
        <div className="field">
          <label>Institution</label>
          <input value={query} onChange={(e) => runSearch(e.target.value)} placeholder="Search for your college…" />
          {query.length >= 2 && (
            <div className="mt-1 rounded-md border border-line bg-white text-[12.5px] shadow-sm">
              {searching && <div className="px-3 py-2 text-sub">Searching…</div>}
              {!searching && results.length === 0 && <div className="px-3 py-2 text-sub">No matches</div>}
              {!searching &&
                results.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => {
                      setInstitution(r);
                      setResults([]);
                      setQuery('');
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-surface"
                  >
                    {r.name}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {historyQuery.data && historyQuery.data.length > 0 && (
        <div className="mt-6">
          <h5 className="mb-2 text-xs font-semibold text-sub">Your verification history</h5>
          <div className="divide-y divide-line">
            {historyQuery.data.map((v) => (
              <div key={v.id} className="flex items-center justify-between py-2 text-[12.5px]">
                <div>
                  <span className="font-semibold">{v.institution.name}</span>
                  <span className="ml-2 text-sub">{v.method === 'EMAIL_OTP' ? 'University email' : 'Document upload'}</span>
                  {v.status === 'REJECTED' && v.rejectionReason && <p className="text-sub">Reason: {v.rejectionReason}</p>}
                </div>
                <Badge kind={STATUS_BADGE[v.status] ?? 'pending'}>{v.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DangerZoneSection() {
  const navigate = useNavigate();
  const clear = useAuthStore((s) => s.clear);
  const [password, setPassword] = useState('');
  const [confirming, setConfirming] = useState(false);

  const mutation = useMutation({
    mutationFn: () => usersApi.deactivate(password),
    onSuccess: async () => {
      await authApi.logout().catch(() => {});
      // Navigate off the protected route before clearing auth state — clearing
      // first leaves this ProtectedRoute-wrapped page mounted with a null user
      // for a tick, so its own redirect (to /login) wins the race instead of this one.
      navigate('/', { replace: true });
      clear();
    },
  });

  return (
    <div>
      <h4 className="mb-1 text-sm text-danger">Deactivate account</h4>
      <p className="mb-4 text-xs text-sub">
        Your reviews stay up (they're anonymous by design), but you'll be signed out everywhere and won't be able to log back in.
        Contact support to reactivate.
      </p>
      {!confirming ? (
        <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirming(true)}>
          Deactivate my account
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="field max-w-xs">
            <label>Confirm your password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {mutation.isError && <p className="mb-3 text-xs text-danger">{apiErrorMessage(mutation.error)}</p>}
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger btn-sm" disabled={mutation.isPending}>
              {mutation.isPending ? 'Deactivating…' : 'Yes, deactivate'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function DeleteAccountSection() {
  const navigate = useNavigate();
  const clear = useAuthStore((s) => s.clear);
  const [password, setPassword] = useState('');
  const [confirming, setConfirming] = useState(false);

  const mutation = useMutation({
    mutationFn: () => usersApi.deleteAccount(password),
    onSuccess: async () => {
      await authApi.logout().catch(() => {});
      navigate('/', { replace: true });
      clear();
    },
  });

  return (
    <div className="mt-8 border-t border-line pt-6">
      <h4 className="mb-1 text-sm text-danger">Delete my data</h4>
      <p className="mb-4 text-xs text-sub">
        Permanently erases your email, username, verification documents, saved colleges and notifications. Your reviews stay up because they were
        anonymous, but nothing links them to you any more. This can't be undone.
      </p>
      {!confirming ? (
        <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirming(true)}>
          Delete my data
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="field max-w-xs">
            <label>Confirm your password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {mutation.isError && <p className="mb-3 text-xs text-danger">{apiErrorMessage(mutation.error)}</p>}
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger btn-sm" disabled={mutation.isPending}>
              {mutation.isPending ? 'Erasing…' : 'Yes, erase everything'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [section, setSection] = useState<(typeof SECTIONS)[number]>('Account');

  return (
    <div>
      <Helmet>
        <title>Settings — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Account" title="Settings" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[180px_1fr]">
        <div className="flex flex-row gap-3 overflow-x-auto text-[12.5px] text-sub md:flex-col md:gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={s === section ? 'whitespace-nowrap text-left font-semibold text-brand' : s === 'Danger Zone' ? 'whitespace-nowrap text-left text-danger' : 'whitespace-nowrap text-left'}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="card">
          {section === 'Account' && (
            <>
              <div className="field">
                <label>Username</label>
                <input value={user?.username ?? ''} disabled />
              </div>
              <div className="field">
                <label>Email</label>
                <input value={user?.email ?? ''} disabled />
              </div>
              <p className="text-xs text-sub">Profile visibility and notification preferences have moved to their own tabs on the left.</p>
            </>
          )}
          {section === 'Privacy' && <PrivacySection publicProfileOptIn={user?.publicProfileOptIn ?? false} />}
          {section === 'Security' && <SecuritySection />}
          {section === 'Notifications' && (
            <NotificationsSection
              prefs={{
                notifyReviewActivity: user?.notifyReviewActivity ?? true,
                notifyCommunityActivity: user?.notifyCommunityActivity ?? true,
                notifySubmissionUpdates: user?.notifySubmissionUpdates ?? true,
                notifySystem: user?.notifySystem ?? true,
              }}
            />
          )}
          {section === 'Verification' && <VerificationSection />}
          {section === 'Danger Zone' && (
            <>
              <DangerZoneSection />
              <DeleteAccountSection />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
