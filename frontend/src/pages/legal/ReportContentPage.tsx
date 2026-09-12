import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { api, apiErrorMessage } from '@/api/client';

export function ReportContentPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const mutation = useMutation({
    mutationFn: () => api.post('/contact', { ...form, subject: 'Report a problem' }),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-7">
      <Helmet>
        <title>Report Content — StudentReview</title>
      </Helmet>
      <h1 className="mb-3 text-2xl">Report content</h1>
      <p className="mb-5 text-sm text-sub">
        For a specific review, question, or answer, use the <b>Report</b> button directly on that content — it reaches our
        moderation queue immediately with the exact item attached. Use this form only for something you can't report directly
        (e.g. an entire profile, or a pattern of abuse).
      </p>
      {mutation.isSuccess ? (
        <div className="card text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-xl text-success">✓</div>
          <p className="text-sm font-semibold">Report submitted</p>
          <p className="mt-1 text-xs text-sub">Our team will review this within 48 hours.</p>
        </div>
      ) : (
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="field">
            <label>Your name</label>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="field">
            <label>Your email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="field">
            <label>What's wrong, and where can we find it?</label>
            <textarea required minLength={10} className="min-h-[110px]" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
          </div>
          {mutation.isError && <p className="mb-3 text-xs text-danger">{apiErrorMessage(mutation.error)}</p>}
          <button type="submit" disabled={mutation.isPending} className="btn btn-primary">
            {mutation.isPending ? 'Submitting…' : 'Submit report'}
          </button>
        </form>
      )}
    </div>
  );
}
