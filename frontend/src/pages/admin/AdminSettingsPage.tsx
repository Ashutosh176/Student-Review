import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { adminApi, type AdminFaqRow, type PlatformSettings } from '@/api/admin.api';
import { apiErrorMessage } from '@/api/client';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { EmptyState } from '@/components/LoadingSkeleton';
import { Toggle } from '@/components/Toggle';

const ROLE_OPTIONS = ['STUDENT', 'ORGANIZATION', 'MODERATOR', 'ADMIN'] as const;

const SECTIONS = ['Moderation', 'Pricing', 'Categories', 'Rankings', 'Content & FAQs', 'Roles & Permissions', 'Security'] as const;

const THRESHOLD_FIELDS: { key: keyof PlatformSettings; label: string; suffix: string; min: number; max: number }[] = [
  { key: 'reportAutoFlagThreshold', label: 'Auto-flag after N reports', suffix: 'reports', min: 1, max: 50 },
  { key: 'rapidSubmissionWindowMinutes', label: 'Rapid-submission window', suffix: 'minutes', min: 1, max: 1440 },
  { key: 'rapidSubmissionCount', label: 'Rapid-submission review count', suffix: 'reviews', min: 1, max: 50 },
  { key: 'minReviewsForRanking', label: 'Minimum reviews to appear in rankings', suffix: 'reviews', min: 1, max: 100 },
];

const PRICING_FIELDS: { key: keyof PlatformSettings; label: string }[] = [
  { key: 'proPlanPriceInr', label: 'Pro plan (₹ / month)' },
  { key: 'businessPlanPriceInr', label: 'Business plan (₹ / month)' },
];

function ModerationSection() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin', 'settings'], queryFn: adminApi.platformSettings });
  const [form, setForm] = useState<PlatformSettings | null>(null);

  const values = form ?? query.data;

  const mutation = useMutation({
    mutationFn: (input: Partial<PlatformSettings>) => adminApi.updatePlatformSettings(input),
    onSuccess: (updated) => {
      setForm(updated);
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });

  if (!values) return null;

  return (
    <>
      <h4 className="mb-1 text-[13px]">Moderation thresholds</h4>
      <p className="mb-3 text-[11.5px] text-sub">
        These take effect immediately for new reviews and reports — no restart required.
      </p>
      {THRESHOLD_FIELDS.map((f) => (
        <div key={f.key} className="flex items-center justify-between border-b border-line py-2 text-[12.5px] last:border-0">
          <span>{f.label}</span>
          <span className="flex items-center gap-2">
            <input
              type="number"
              min={f.min}
              max={f.max}
              value={values[f.key]}
              onChange={(e) => setForm({ ...values, [f.key]: Number(e.target.value) })}
              className="w-20 rounded-md border border-line px-2 py-1 text-right text-[12.5px]"
            />
            <span className="text-sub">{f.suffix}</span>
          </span>
        </div>
      ))}
      {mutation.isError && <p className="mt-3 text-xs text-danger">{apiErrorMessage(mutation.error)}</p>}
      <button
        className="btn btn-primary btn-sm mt-4"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate(values)}
      >
        {mutation.isPending ? 'Saving…' : mutation.isSuccess ? 'Saved ✓' : 'Save changes'}
      </button>
      <p className="mt-3 text-[11.5px] text-sub">
        Configured in <code>backend/src/services/settings.service.ts</code>; enforced in{' '}
        <code>moderation.service.ts</code>, <code>review.service.ts</code>, and <code>ranking.service.ts</code>.
      </p>
    </>
  );
}

function PricingSection() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin', 'settings'], queryFn: adminApi.platformSettings });
  const [form, setForm] = useState<PlatformSettings | null>(null);

  const values = form ?? query.data;

  const mutation = useMutation({
    mutationFn: (input: Partial<PlatformSettings>) => adminApi.updatePlatformSettings(input),
    onSuccess: (updated) => {
      setForm(updated);
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });

  if (!values) return null;

  return (
    <>
      <h4 className="mb-1 text-[13px]">Organization subscription pricing</h4>
      <p className="mb-3 text-[11.5px] text-sub">
        Shown on an organization's Settings → Billing page and charged via Razorpay at checkout — both read this same value,
        so there's never a mismatch between the displayed price and what gets charged. Takes effect immediately for new
        checkouts; it never changes what an already-active subscription already paid.
      </p>
      {PRICING_FIELDS.map((f) => (
        <div key={f.key} className="flex items-center justify-between border-b border-line py-2 text-[12.5px] last:border-0">
          <span>{f.label}</span>
          <span className="flex items-center gap-2">
            <span className="text-sub">₹</span>
            <input
              type="number"
              min={0}
              max={1000000}
              value={values[f.key]}
              onChange={(e) => setForm({ ...values, [f.key]: Number(e.target.value) })}
              className="w-24 rounded-md border border-line px-2 py-1 text-right text-[12.5px]"
            />
          </span>
        </div>
      ))}
      {mutation.isError && <p className="mt-3 text-xs text-danger">{apiErrorMessage(mutation.error)}</p>}
      <button
        className="btn btn-primary btn-sm mt-4"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate({ proPlanPriceInr: values.proPlanPriceInr, businessPlanPriceInr: values.businessPlanPriceInr })}
      >
        {mutation.isPending ? 'Saving…' : mutation.isSuccess ? 'Saved ✓' : 'Save changes'}
      </button>
    </>
  );
}

function CategoriesSection() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const query = useQuery({ queryKey: ['admin', 'categories'], queryFn: adminApi.categories });
  const createMutation = useMutation({
    mutationFn: () => adminApi.createCategory(name),
    onSuccess: () => {
      setName('');
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });

  return (
    <>
      <h4 className="mb-3 text-[13px]">Institution categories</h4>
      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) createMutation.mutate();
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Polytechnic" className="flex-1" />
        <button type="submit" className="btn btn-primary btn-sm" disabled={!name.trim() || createMutation.isPending}>
          {createMutation.isPending ? 'Adding…' : 'Add category'}
        </button>
      </form>
      {createMutation.isError && <p className="mb-3 text-xs text-danger">{apiErrorMessage(createMutation.error)}</p>}

      {query.data && query.data.length === 0 && <EmptyState icon="🏷" title="No categories yet" />}
      {query.data && query.data.length > 0 && (
        <div className="divide-y divide-line">
          {query.data.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2 text-[12.5px]">
              <span>{c.name}</span>
              <span className="text-sub">{c._count.institutions} institutions</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function RankingsSection() {
  const mutation = useMutation({ mutationFn: adminApi.recomputeRankings });

  return (
    <>
      <h4 className="mb-1 text-[13px]">Ranking recompute</h4>
      <p className="mb-4 text-[11.5px] text-sub">
        Recalculates every ranking metric (Overall, Placement, Faculty, Infrastructure, Campus Life, Value for Money, Most
        Reviewed, Trending) from current approved reviews. This runs automatically on a schedule via{' '}
        <code>jobs/recomputeRankings.job.ts</code> — use this to trigger it on demand.
      </p>
      <button className="btn btn-primary btn-sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        {mutation.isPending ? 'Recomputing…' : 'Recompute now'}
      </button>
      {mutation.isError && <p className="mt-3 text-xs text-danger">{apiErrorMessage(mutation.error)}</p>}
      {mutation.isSuccess && (
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12.5px] sm:grid-cols-4">
          {Object.entries(mutation.data).map(([metric, count]) => (
            <div key={metric} className="flex justify-between border-b border-line py-1.5">
              <span className="text-sub">{metric.replace(/_/g, ' ')}</span>
              <b>{count}</b>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const EMPTY_FAQ = { question: '', answer: '', order: 0 };

function ContentFaqsSection() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FAQ);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FAQ);

  const query = useQuery({ queryKey: ['admin', 'faqs'], queryFn: adminApi.faqs });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'faqs'] });

  const createMutation = useMutation({
    mutationFn: () => adminApi.createFaq(form),
    onSuccess: () => {
      setForm(EMPTY_FAQ);
      setAdding(false);
      invalidate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AdminFaqRow> }) => adminApi.updateFaq(id, input),
    onSuccess: () => {
      setEditingId(null);
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteFaq(id),
    onSuccess: invalidate,
  });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-[13px]">Content &amp; FAQs</h4>
        <button className="btn btn-primary btn-sm" onClick={() => setAdding((v) => !v)}>
          {adding ? 'Cancel' : '+ Add FAQ'}
        </button>
      </div>

      {adding && (
        <form
          className="card mb-4 bg-surface"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <div className="field">
            <label>Question</label>
            <input required value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} />
          </div>
          <div className="field">
            <label>Answer</label>
            <textarea required rows={3} value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} />
          </div>
          <div className="field max-w-[120px]">
            <label>Order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
            />
          </div>
          {createMutation.isError && <p className="mb-2 text-xs text-danger">{apiErrorMessage(createMutation.error)}</p>}
          <button type="submit" className="btn btn-primary btn-sm" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Adding…' : 'Add FAQ'}
          </button>
        </form>
      )}

      {query.data && query.data.length === 0 && <EmptyState icon="❓" title="No FAQs yet" description="Add one so students see it on the public FAQ page." />}

      <div className="flex flex-col gap-2">
        {query.data?.map((faq) =>
          editingId === faq.id ? (
            <form
              key={faq.id}
              className="card bg-surface"
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate({ id: faq.id, input: editForm });
              }}
            >
              <div className="field">
                <label>Question</label>
                <input required value={editForm.question} onChange={(e) => setEditForm((f) => ({ ...f, question: e.target.value }))} />
              </div>
              <div className="field">
                <label>Answer</label>
                <textarea required rows={3} value={editForm.answer} onChange={(e) => setEditForm((f) => ({ ...f, answer: e.target.value }))} />
              </div>
              <div className="field max-w-[120px]">
                <label>Order</label>
                <input type="number" value={editForm.order} onChange={(e) => setEditForm((f) => ({ ...f, order: Number(e.target.value) }))} />
              </div>
              {updateMutation.isError && <p className="mb-2 text-xs text-danger">{apiErrorMessage(updateMutation.error)}</p>}
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={updateMutation.isPending}>
                  Save
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div key={faq.id} className="card">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold">{faq.question}</p>
                  <p className="mt-1 text-[12.5px] text-sub">{faq.answer}</p>
                </div>
                <Toggle
                  label=""
                  checked={faq.published}
                  onChange={(next) => updateMutation.mutate({ id: faq.id, input: { published: next } })}
                />
              </div>
              <div className="flex gap-3 text-[12px]">
                <button
                  className="text-brand hover:underline"
                  onClick={() => {
                    setEditingId(faq.id);
                    setEditForm({ question: faq.question, answer: faq.answer, order: faq.order });
                  }}
                >
                  Edit
                </button>
                <button className="text-danger hover:underline" onClick={() => deleteMutation.mutate(faq.id)}>
                  Delete
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function RolesPermissionsSection() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const query = useQuery({ queryKey: ['admin', 'users', 'role-search', q], queryFn: () => adminApi.users({ q, pageSize: 10 }), enabled: q.trim().length > 1 });

  const roleMutation = useMutation({
    mutationFn: ({ id, role, grant }: { id: string; role: (typeof ROLE_OPTIONS)[number]; grant: boolean }) => adminApi.setUserRole(id, role, grant),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users', 'role-search', q] }),
  });

  return (
    <div>
      <h4 className="mb-1 text-[13px]">Roles &amp; Permissions</h4>
      <p className="mb-4 text-[11.5px] text-sub">
        Search for a user to grant or revoke platform roles. You can't remove your own ADMIN role.
      </p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by username or email…"
        className="mb-4 w-full max-w-sm rounded-md border border-line px-3 py-2 text-[12.5px]"
      />
      {roleMutation.isError && <p className="mb-3 text-xs text-danger">{apiErrorMessage(roleMutation.error)}</p>}
      {q.trim().length > 1 && query.data?.items.length === 0 && <EmptyState icon="🔍" title="No matching users" />}
      <div className="flex flex-col gap-3">
        {query.data?.items.map((u) => {
          const activeRoles = new Set(u.roles.map((r) => r.role.name));
          return (
            <div key={u.id} className="card">
              <p className="mb-2 text-[13px] font-semibold">
                {u.username} <span className="font-normal text-sub">· {u.email}</span>
              </p>
              <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-4">
                {ROLE_OPTIONS.map((role) => (
                  <Toggle
                    key={role}
                    label={role}
                    checked={activeRoles.has(role)}
                    onChange={(next) => roleMutation.mutate({ id: u.id, role, grant: next })}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SecuritySection() {
  return (
    <>
      <h4 className="mb-3 text-[13px]">Security configuration (current values)</h4>
      <div className="flex justify-between border-b border-line py-2 text-[12.5px]">
        <span>Password hashing</span>
        <b>Argon2id</b>
      </div>
      <div className="flex justify-between border-b border-line py-2 text-[12.5px]">
        <span>Password policy</span>
        <b>8+ chars, upper + lower + digit</b>
      </div>
      <div className="flex justify-between border-b border-line py-2 text-[12.5px]">
        <span>Access token lifetime</span>
        <b>15 minutes</b>
      </div>
      <div className="flex justify-between border-b border-line py-2 text-[12.5px]">
        <span>Refresh token lifetime</span>
        <b>30 days (httpOnly cookie, rotated on use)</b>
      </div>
      <div className="flex justify-between border-b border-line py-2 text-[12.5px]">
        <span>Login/registration rate limit</span>
        <b>10 attempts / 15 min / IP</b>
      </div>
      <div className="flex justify-between py-2 text-[12.5px]">
        <span>General API rate limit</span>
        <b>300 requests / 15 min / IP</b>
      </div>
      <p className="mt-3 text-[11.5px] text-sub">
        These are configured in <code>backend/src/config/env.ts</code> and <code>backend/src/middlewares/rateLimiters.ts</code>.
        A settings UI to change them at runtime is not implemented in this release.
      </p>
    </>
  );
}

export function AdminSettingsPage() {
  const [section, setSection] = useState<(typeof SECTIONS)[number]>('Moderation');

  return (
    <div>
      <Helmet>
        <title>Platform Settings — Admin — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Admin" title="Platform Settings" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[180px_1fr]">
        <div className="flex flex-row gap-3 overflow-x-auto text-[12.5px] text-sub md:flex-col md:gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={s === section ? 'whitespace-nowrap text-left font-semibold text-brand' : 'whitespace-nowrap text-left'}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="card">
          {section === 'Moderation' && <ModerationSection />}
          {section === 'Pricing' && <PricingSection />}
          {section === 'Categories' && <CategoriesSection />}
          {section === 'Rankings' && <RankingsSection />}
          {section === 'Content & FAQs' && <ContentFaqsSection />}
          {section === 'Roles & Permissions' && <RolesPermissionsSection />}
          {section === 'Security' && <SecuritySection />}
        </div>
      </div>
    </div>
  );
}
