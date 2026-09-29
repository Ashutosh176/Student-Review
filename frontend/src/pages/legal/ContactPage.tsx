import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/api/client';
import { apiErrorMessage } from '@/api/client';

const SUBJECTS = ['General question', 'Report a problem', 'Institution inquiry'] as const;

export function ContactPage() {
  // ?subject=institution preselects "Institution inquiry" (used in college outreach emails).
  const [params] = useSearchParams();
  const initialSubject = params.get('subject') === 'institution' ? 'Institution inquiry' : 'General question';
  const [form, setForm] = useState({ name: '', email: '', subject: initialSubject, message: '' });
  const mutation = useMutation({ mutationFn: () => api.post('/contact', form) });

  if (mutation.isSuccess) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-7">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success">✓</div>
        <h2 className="mb-2 text-lg">Message sent</h2>
        <p className="text-sm text-sub">Thanks for reaching out — we'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-7">
      <Helmet>
        <title>Contact — StudentReview</title>
      </Helmet>
      <h1 className="mb-2 text-2xl">Contact us</h1>
      <p className="mb-4.5 text-[13px] leading-relaxed text-sub">
        StudentReview (studentreview.in) is operated by Ashutosh Sharma, India.
        <br />
        Send us a message below and we'll reply to the email you give, usually within 3 business days.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <div className="field">
          <label>Name</label>
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
        </div>
        <div className="field">
          <label>Subject</label>
          <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Message</label>
          <textarea required minLength={10} className="min-h-[100px]" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
        </div>
        {mutation.isError && <p className="mb-3 text-xs text-danger">{apiErrorMessage(mutation.error)}</p>}
        <button type="submit" disabled={mutation.isPending} className="btn btn-primary w-full justify-center">
          {mutation.isPending ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </div>
  );
}
