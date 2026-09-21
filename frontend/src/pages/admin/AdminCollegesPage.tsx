import { Fragment, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { Helmet } from 'react-helmet-async';
import { adminApi, type CreateAdmissionCutoffInput, type CreateCourseInput, type CreateInstitutionInput, type AdminInstitutionRow } from '@/api/admin.api';
import { apiErrorMessage } from '@/api/client';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge } from '@/components/Badge';
import { AddInstitutionModal } from '@/components/AddInstitutionModal';

const STATUS_TABS = [
  { value: undefined, label: 'All' },
  { value: 'PENDING' as const, label: 'Pending' },
  { value: 'APPROVED' as const, label: 'Approved' },
  { value: 'REJECTED' as const, label: 'Rejected' },
];

function EmailDomainsPanel({ institutionId }: { institutionId: string }) {
  const qc = useQueryClient();
  const [domain, setDomain] = useState('');
  const query = useQuery({ queryKey: ['admin', 'email-domains', institutionId], queryFn: () => adminApi.emailDomains(institutionId) });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'email-domains', institutionId] });

  const addMutation = useMutation({
    mutationFn: () => adminApi.addEmailDomain(institutionId, domain),
    onSuccess: () => {
      setDomain('');
      invalidate();
    },
  });

  const removeMutation = useMutation({
    mutationFn: (domainId: string) => adminApi.removeEmailDomain(institutionId, domainId),
    onSuccess: invalidate,
  });

  return (
    <div>
      <p className="mb-2 text-[11.5px] text-sub">
        Official email domains for this institution — only these can be used to verify a student/alumni review submission.
      </p>
      <div className="mb-2 flex flex-wrap gap-2">
        {query.data?.map((d) => (
          <span key={d.id} className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[12px]">
            {d.domain}
            <button onClick={() => removeMutation.mutate(d.id)} className="text-danger hover:underline">
              ✕
            </button>
          </span>
        ))}
        {query.data?.length === 0 && <span className="text-[12px] text-sub">No domains added yet.</span>}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (domain.trim()) addMutation.mutate();
        }}
      >
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="university.edu.in"
          className="flex-1 rounded-md border border-line px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={!domain.trim() || addMutation.isPending}>
          Add
        </button>
      </form>
      {addMutation.isError && <p className="mt-2 text-xs text-danger">{apiErrorMessage(addMutation.error)}</p>}
    </div>
  );
}

const COURSE_LEVELS = ['UG', 'PG', 'DOCTORATE', 'DIPLOMA'] as const;
const EMPTY_COURSE_FORM: CreateCourseInput = { name: '', level: 'UG', department: '', durationYears: undefined, feePerYearInr: undefined, totalFeeInr: undefined };
const EMPTY_CUTOFF_FORM = { courseId: '', examName: '', category: '', year: new Date().getFullYear(), openingRank: '', closingRank: '', percentile: '' };

function EntranceExamsEditor({ institutionId, examNames }: { institutionId: string; examNames: string[] }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState('');
  const mutation = useMutation({
    mutationFn: (next: string[]) => adminApi.setEntranceExams(institutionId, next),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'institutions'] }),
  });

  return (
    <div>
      <p className="mb-2 text-[11.5px] text-sub">Entrance exams this institution accepts — shown as a tag list on its public Admissions tab.</p>
      <div className="mb-2 flex flex-wrap gap-2">
        {examNames.map((exam) => (
          <span key={exam} className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[12px]">
            {exam}
            <button onClick={() => mutation.mutate(examNames.filter((e) => e !== exam))} className="text-danger hover:underline">
              ✕
            </button>
          </span>
        ))}
        {examNames.length === 0 && <span className="text-[12px] text-sub">No entrance exams added yet.</span>}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) {
            mutation.mutate([...examNames, draft.trim()]);
            setDraft('');
          }
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. JEE Main"
          className="flex-1 rounded-md border border-line px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={!draft.trim() || mutation.isPending}>
          Add
        </button>
      </form>
    </div>
  );
}

function CoursesAndFeesEditor({ institutionId }: { institutionId: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<CreateCourseInput>(EMPTY_COURSE_FORM);
  const query = useQuery({ queryKey: ['admin', 'courses', institutionId], queryFn: () => adminApi.courses(institutionId) });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'courses', institutionId] });
  const createMutation = useMutation({
    mutationFn: () => adminApi.createCourse(institutionId, form),
    onSuccess: () => {
      setForm(EMPTY_COURSE_FORM);
      invalidate();
    },
  });
  const deleteMutation = useMutation({ mutationFn: (courseId: string) => adminApi.deleteCourse(courseId), onSuccess: invalidate });

  return (
    <div>
      <p className="mb-2 text-[11.5px] text-sub">Courses offered, with optional fees — shown on the public Courses and Admissions tabs.</p>
      <div className="mb-2 flex flex-col gap-1.5">
        {query.data?.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-md bg-white px-2.5 py-1.5 text-[12px]">
            <span>
              {c.name} <span className="text-sub">({c.level})</span>
              {c.feePerYearInr ? ` · ₹${c.feePerYearInr.toLocaleString('en-IN')}/yr` : ''}
              {c.totalFeeInr ? ` · ₹${c.totalFeeInr.toLocaleString('en-IN')} total` : ''}
            </span>
            <button onClick={() => deleteMutation.mutate(c.id)} className="text-danger hover:underline">
              Remove
            </button>
          </div>
        ))}
        {query.data?.length === 0 && <span className="text-[12px] text-sub">No courses added yet.</span>}
      </div>
      <form
        className="grid grid-cols-2 gap-2 sm:grid-cols-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (form.name.trim()) createMutation.mutate();
        }}
      >
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Course name"
          className="col-span-2 rounded-md border border-line px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
        />
        <select
          value={form.level}
          onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as CreateCourseInput['level'] }))}
          className="rounded-md border border-line px-2 py-1.5 text-[12.5px]"
        >
          {COURSE_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          value={form.feePerYearInr ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, feePerYearInr: e.target.value ? Number(e.target.value) : undefined }))}
          placeholder="Fee / year (₹)"
          className="rounded-md border border-line px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
        />
        <input
          type="number"
          min={0}
          value={form.totalFeeInr ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, totalFeeInr: e.target.value ? Number(e.target.value) : undefined }))}
          placeholder="Total fee (₹)"
          className="rounded-md border border-line px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={!form.name.trim() || createMutation.isPending}>
          Add course
        </button>
      </form>
      {createMutation.isError && <p className="mt-2 text-xs text-danger">{apiErrorMessage(createMutation.error)}</p>}
    </div>
  );
}

function AdmissionCutoffsEditor({ institutionId }: { institutionId: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY_CUTOFF_FORM);
  const coursesQuery = useQuery({ queryKey: ['admin', 'courses', institutionId], queryFn: () => adminApi.courses(institutionId) });
  const cutoffsQuery = useQuery({ queryKey: ['admin', 'admission-cutoffs', institutionId], queryFn: () => adminApi.admissionCutoffs(institutionId) });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'admission-cutoffs', institutionId] });
  const createMutation = useMutation({
    mutationFn: () => {
      const input: CreateAdmissionCutoffInput = {
        courseId: form.courseId,
        examName: form.examName,
        category: form.category,
        year: form.year,
        openingRank: form.openingRank ? Number(form.openingRank) : undefined,
        closingRank: form.closingRank ? Number(form.closingRank) : undefined,
        percentile: form.percentile ? Number(form.percentile) : undefined,
      };
      return adminApi.createAdmissionCutoff(institutionId, input);
    },
    onSuccess: () => {
      setForm((f) => ({ ...EMPTY_CUTOFF_FORM, courseId: f.courseId, examName: f.examName, category: f.category, year: f.year }));
      invalidate();
    },
  });
  const deleteMutation = useMutation({ mutationFn: (id: string) => adminApi.deleteAdmissionCutoff(id), onSuccess: invalidate });

  const canSubmit = form.courseId && form.examName.trim() && form.category.trim() && (form.openingRank || form.closingRank || form.percentile);

  return (
    <div>
      <p className="mb-2 text-[11.5px] text-sub">Cutoff ranks/percentiles by course, exam, category and year — shown on the public Admissions tab.</p>
      <div className="mb-2 flex flex-col gap-1.5">
        {cutoffsQuery.data?.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-md bg-white px-2.5 py-1.5 text-[12px]">
            <span>
              {c.course.name} · {c.examName} · {c.category} · {c.year}
              {c.closingRank ? ` · Closing rank ${c.closingRank.toLocaleString('en-IN')}` : ''}
              {c.openingRank ? ` (opening ${c.openingRank.toLocaleString('en-IN')})` : ''}
              {c.percentile ? ` · ${c.percentile}%ile` : ''}
            </span>
            <button onClick={() => deleteMutation.mutate(c.id)} className="text-danger hover:underline">
              Remove
            </button>
          </div>
        ))}
        {cutoffsQuery.data?.length === 0 && <span className="text-[12px] text-sub">No cutoffs added yet.</span>}
      </div>
      {coursesQuery.data?.length === 0 ? (
        <p className="text-[12px] text-sub">Add a course above before recording a cutoff for it.</p>
      ) : (
        <form
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) createMutation.mutate();
          }}
        >
          <select
            value={form.courseId}
            onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
            className="col-span-2 rounded-md border border-line px-2 py-1.5 text-[12.5px] sm:col-span-1"
          >
            <option value="">Course…</option>
            {coursesQuery.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            value={form.examName}
            onChange={(e) => setForm((f) => ({ ...f, examName: e.target.value }))}
            placeholder="Exam (e.g. JEE Main)"
            className="rounded-md border border-line px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
          />
          <input
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="Category (e.g. General)"
            className="rounded-md border border-line px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
          />
          <input
            type="number"
            value={form.year}
            onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
            placeholder="Year"
            className="rounded-md border border-line px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
          />
          <input
            type="number"
            min={1}
            value={form.openingRank}
            onChange={(e) => setForm((f) => ({ ...f, openingRank: e.target.value }))}
            placeholder="Opening rank"
            className="rounded-md border border-line px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
          />
          <input
            type="number"
            min={1}
            value={form.closingRank}
            onChange={(e) => setForm((f) => ({ ...f, closingRank: e.target.value }))}
            placeholder="Closing rank"
            className="rounded-md border border-line px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
          />
          <input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={form.percentile}
            onChange={(e) => setForm((f) => ({ ...f, percentile: e.target.value }))}
            placeholder="Percentile"
            className="rounded-md border border-line px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={!canSubmit || createMutation.isPending}>
            Add cutoff
          </button>
        </form>
      )}
      {createMutation.isError && <p className="mt-2 text-xs text-danger">{apiErrorMessage(createMutation.error)}</p>}
    </div>
  );
}

function AdmissionsPanel({ institutionId, examNames }: { institutionId: string; examNames: string[] }) {
  return (
    <div className="flex flex-col gap-5">
      <EntranceExamsEditor institutionId={institutionId} examNames={examNames} />
      <hr className="border-line" />
      <CoursesAndFeesEditor institutionId={institutionId} />
      <hr className="border-line" />
      <AdmissionCutoffsEditor institutionId={institutionId} />
    </div>
  );
}

function AiSummaryPanel({ institutionId, aiSummary, aiSummaryUpdatedAt }: { institutionId: string; aiSummary?: string | null; aiSummaryUpdatedAt?: string | null }) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => adminApi.regenerateAiSummary(institutionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'institutions'] }),
  });

  return (
    <div>
      <p className="mb-2 text-[11.5px] text-sub">
        A short AI-generated digest of this college's recent approved reviews, shown on its public Overview tab as "Students
        say…" — costs a real API call each time it's regenerated, so it's manual, not automatic.
      </p>
      {aiSummary ? (
        <div className="mb-2 rounded-md bg-white px-3 py-2 text-[12.5px]">
          <p>{mutation.data?.aiSummary ?? aiSummary}</p>
          {aiSummaryUpdatedAt && <p className="mt-1.5 text-[11px] text-sub">Last generated {new Date(aiSummaryUpdatedAt).toLocaleString('en-IN')}</p>}
        </div>
      ) : (
        <p className="mb-2 text-[12px] text-sub">No summary generated yet.</p>
      )}
      <button type="button" onClick={() => mutation.mutate()} className="btn btn-primary btn-sm" disabled={mutation.isPending}>
        {mutation.isPending ? 'Generating…' : aiSummary ? 'Regenerate' : 'Generate summary'}
      </button>
      {mutation.isError && <p className="mt-2 text-xs text-danger">{apiErrorMessage(mutation.error)}</p>}
    </div>
  );
}

export function AdminCollegesPage() {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<AdminInstitutionRow | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [domainsOpenId, setDomainsOpenId] = useState<string | null>(null);
  const [admissionsOpenId, setAdmissionsOpenId] = useState<string | null>(null);
  const [aiSummaryOpenId, setAiSummaryOpenId] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') as 'PENDING' | 'APPROVED' | 'REJECTED' | null) ?? undefined;

  const query = useQuery({
    queryKey: ['admin', 'institutions', status],
    queryFn: () => adminApi.institutions({ pageSize: 30, status }),
  });
  const featureMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) => adminApi.setFeatured(id, featured),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'institutions'] }),
  });
  const createMutation = useMutation({
    mutationFn: (input: CreateInstitutionInput) => adminApi.createInstitution(input),
    onSuccess: () => {
      setAddOpen(false);
      qc.invalidateQueries({ queryKey: ['admin', 'institutions'] });
    },
  });
  const updateMutation = useMutation({
    mutationFn: (input: CreateInstitutionInput) => adminApi.updateInstitution(editing!.id, input),
    onSuccess: () => {
      setEditing(null);
      qc.invalidateQueries({ queryKey: ['admin', 'institutions'] });
      qc.invalidateQueries({ queryKey: ['institutions'] });
    },
  });
  const decideMutation = useMutation({
    mutationFn: ({ id, decision, reason }: { id: string; decision: 'APPROVED' | 'REJECTED'; reason?: string }) =>
      adminApi.decideInstitution(id, decision, reason),
    onSuccess: () => {
      setRejectingId(null);
      setRejectReason('');
      qc.invalidateQueries({ queryKey: ['admin', 'institutions'] });
    },
  });

  return (
    <div>
      <Helmet>
        <title>Colleges — Admin — StudentReview</title>
      </Helmet>
      <DashboardTopbar
        crumb="Admin"
        title="Colleges"
        right={
          <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}>
            + Add institution
          </button>
        }
      />

      <div className="mb-3 flex gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t.label}
            onClick={() => setParams(t.value ? { status: t.value } : {})}
            className={clsx('btn btn-sm', status === t.value ? 'btn-primary' : 'btn-ghost')}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {decideMutation.isError && <p className="mb-3 text-xs text-danger">{apiErrorMessage(decideMutation.error)}</p>}

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-line text-left text-[11.5px] text-sub">
              <th className="px-3 py-2.5">College</th>
              <th className="px-3 py-2.5">Location</th>
              <th className="px-3 py-2.5">Submitted by</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Reviews</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {query.data && query.data.items.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-sub" colSpan={6}>
                  No colleges here yet.
                </td>
              </tr>
            )}
            {query.data?.items.map((inst) => (
              <Fragment key={inst.id}>
                <tr className="border-b border-line last:border-0">
                  <td className="px-3 py-2.5">
                    {inst.status === 'APPROVED' ? (
                      <Link to={`/college/${inst.slug}`} className="hover:text-brand">
                        {inst.name}
                      </Link>
                    ) : (
                      inst.name
                    )}
                  </td>
                  <td className="px-3 py-2.5">{inst.locations[0] ? `${inst.locations[0].city}` : '—'}</td>
                  <td className="px-3 py-2.5">{inst.submittedBy ? inst.submittedBy.username : <span className="text-sub">Admin</span>}</td>
                  <td className="px-3 py-2.5">
                    <Badge kind={inst.status === 'APPROVED' ? 'verified' : inst.status === 'REJECTED' ? 'flagged' : 'pending'}>
                      {inst.status === 'APPROVED' ? (inst.verified ? 'Verified' : 'Approved') : inst.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">{inst._count.reviews}</td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => setEditing(inst)} className="text-brand hover:underline">
                      Edit
                    </button>{' '}
                    {inst.status === 'PENDING' ? (
                      rejectingId === inst.id ? (
                        <span className="text-sub">Add a reason below</span>
                      ) : (
                        <>
                          <button onClick={() => decideMutation.mutate({ id: inst.id, decision: 'APPROVED' })} className="text-brand hover:underline">
                            Approve
                          </button>{' '}
                          <button onClick={() => setRejectingId(inst.id)} className="text-danger hover:underline">
                            Reject
                          </button>
                        </>
                      )
                    ) : (
                      <>
                        <button onClick={() => featureMutation.mutate({ id: inst.id, featured: !inst.featured })} className="text-brand hover:underline">
                          {inst.featured ? 'Unfeature' : 'Feature'}
                        </button>{' '}
                        <button
                          onClick={() => setDomainsOpenId(domainsOpenId === inst.id ? null : inst.id)}
                          className="text-brand hover:underline"
                        >
                          {domainsOpenId === inst.id ? 'Hide domains' : 'Email domains'}
                        </button>{' '}
                        <button
                          onClick={() => setAdmissionsOpenId(admissionsOpenId === inst.id ? null : inst.id)}
                          className="text-brand hover:underline"
                        >
                          {admissionsOpenId === inst.id ? 'Hide admissions' : 'Admissions'}
                        </button>{' '}
                        <button
                          onClick={() => setAiSummaryOpenId(aiSummaryOpenId === inst.id ? null : inst.id)}
                          className="text-brand hover:underline"
                        >
                          {aiSummaryOpenId === inst.id ? 'Hide AI summary' : 'AI summary'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
                {domainsOpenId === inst.id && (
                  <tr className="border-b border-line bg-surface last:border-0">
                    <td className="px-3 py-3" colSpan={6}>
                      <EmailDomainsPanel institutionId={inst.id} />
                    </td>
                  </tr>
                )}
                {admissionsOpenId === inst.id && (
                  <tr className="border-b border-line bg-surface last:border-0">
                    <td className="px-3 py-3" colSpan={6}>
                      <AdmissionsPanel institutionId={inst.id} examNames={inst.entranceExams} />
                    </td>
                  </tr>
                )}
                {aiSummaryOpenId === inst.id && (
                  <tr className="border-b border-line bg-surface last:border-0">
                    <td className="px-3 py-3" colSpan={6}>
                      <AiSummaryPanel institutionId={inst.id} aiSummary={inst.aiSummary} aiSummaryUpdatedAt={inst.aiSummaryUpdatedAt} />
                    </td>
                  </tr>
                )}
                {rejectingId === inst.id && (
                  <tr className="border-b border-line bg-surface last:border-0">
                    <td className="px-3 py-2.5" colSpan={6}>
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason for rejecting (optional)"
                          className="flex-1 rounded-md border border-line px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
                        />
                        <button
                          onClick={() => decideMutation.mutate({ id: inst.id, decision: 'REJECTED', reason: rejectReason || undefined })}
                          className="btn btn-primary btn-sm"
                          disabled={decideMutation.isPending}
                        >
                          Confirm reject
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason('');
                          }}
                          className="btn btn-ghost btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <AddInstitutionModal
        key={editing?.id ?? 'edit'}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSubmit={(input) => updateMutation.mutate(input)}
        submitting={updateMutation.isPending}
        error={updateMutation.error}
        heading="Edit institution"
        helperText="Updates the public college page. The page URL stays the same even if you rename it."
        submitLabel="Save changes"
        submittingLabel="Saving…"
        showAdmissionProcess
        initialValues={
          editing
            ? {
                name: editing.name,
                type: editing.type as CreateInstitutionInput['type'],
                city: editing.locations[0]?.city ?? '',
                state: editing.locations[0]?.state ?? '',
                establishedYear: editing.establishedYear ?? undefined,
                website: editing.website ?? '',
                description: editing.description ?? '',
                admissionProcess: editing.admissionProcess ?? '',
                categoryId: editing.categoryId ?? undefined,
              }
            : undefined
        }
      />

      <AddInstitutionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={(input) => createMutation.mutate(input)}
        submitting={createMutation.isPending}
        error={createMutation.error}
      />
    </div>
  );
}
