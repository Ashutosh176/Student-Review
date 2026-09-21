import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { faqApi } from '@/api/faq.api';
import { api, apiErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { DEFAULT_FAQ_GROUPS } from '@/utils/defaultFaqs';

function matches(text: string, term: string) {
  return text.toLowerCase().includes(term);
}

function AskQuestionForm({ prefill }: { prefill: string }) {
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({ name: user?.username ?? '', email: user?.email ?? '', message: prefill });
  // The account often finishes loading after this mounts — fill blanks then, never overwrite typing.
  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.username, email: f.email || user.email }));
  }, [user]);
  const mutation = useMutation({
    // Goes through the existing support inbox (/contact); the prefix lets the team spot FAQ-page questions.
    mutationFn: () => api.post('/contact', { name: form.name, email: form.email, subject: 'General question', message: `[Student question via FAQ] ${form.message}` }),
  });

  if (mutation.isSuccess) {
    return (
      <div className="card text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-xl text-success">✓</div>
        <h2 className="mb-1 text-base font-semibold">Question sent</h2>
        <p className="text-[13px] text-sub">Thanks — our team will reply to {form.email} soon.</p>
      </div>
    );
  }

  return (
    <form
      id="ask"
      className="card"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <h2 className="mb-1 text-base font-semibold">Still have a question?</h2>
      <p className="mb-4 text-[13px] text-sub">Ask our support team and we'll reply by email. For a question about one specific college, use the Questions tab on that college's page so current students can answer.</p>
      <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
        <div className="field">
          <label>Name</label>
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
        </div>
      </div>
      <div className="field">
        <label>Your question</label>
        <textarea
          required
          minLength={10}
          maxLength={1900}
          className="min-h-[100px]"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="e.g. How do I verify my student identity if my college has no official email?"
        />
      </div>
      {mutation.isError && <p className="mb-3 text-xs text-danger">{apiErrorMessage(mutation.error)}</p>}
      <button type="submit" disabled={mutation.isPending} className="btn btn-primary w-full justify-center">
        {mutation.isPending ? 'Sending…' : 'Send question'}
      </button>
    </form>
  );
}

export function FaqPage() {
  const query = useQuery({ queryKey: ['faqs'], queryFn: faqApi.list });
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();

  const groups = useMemo(() => {
    const all = [...DEFAULT_FAQ_GROUPS];
    if (query.data?.length) all.push({ title: 'More questions', faqs: query.data.map((f) => ({ question: f.question, answer: f.answer })) });
    if (!term) return all;
    return all.map((g) => ({ ...g, faqs: g.faqs.filter((f) => matches(f.question, term) || matches(f.answer, term)) })).filter((g) => g.faqs.length > 0);
  }, [query.data, term]);

  const allFaqs = useMemo(() => [...DEFAULT_FAQ_GROUPS.flatMap((g) => g.faqs), ...(query.data ?? [])], [query.data]);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-7">
      <Helmet>
        <title>Frequently Asked Questions — StudentReview</title>
        <meta
          name="description"
          content="Answers to common student questions about StudentReview: verifying your student identity, writing anonymous reviews, adding a missing college and getting support."
        />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <h1 className="mb-2 text-2xl">Frequently Asked Questions</h1>
      <p className="mb-5 text-[13.5px] text-sub">Quick answers about reviews, verification and using StudentReview. Can't find yours? Ask us below.</p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search questions, e.g. verify, anonymous, add college…"
        className="mb-6 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand"
        aria-label="Search FAQs"
      />

      {groups.length === 0 && (
        <div className="card mb-6 text-center">
          <p className="mb-2 text-sm font-semibold">No answers match "{search}"</p>
          <p className="text-[13px] text-sub">Send it to our support team using the form below.</p>
        </div>
      )}

      {groups.map((g) => (
        <section key={g.title} className="mb-7">
          <h2 className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-sub">{g.title}</h2>
          <div className="flex flex-col gap-2.5">
            {g.faqs.map((faq) => (
              <details key={faq.question} className="card group" open={Boolean(term)}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
                  {faq.question}
                  <span className="flex-none text-brand transition-transform group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-2 text-[13.5px] leading-relaxed text-sub">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <AskQuestionForm prefill={groups.length === 0 ? search : ''} />

      <p className="mt-4 text-center text-[12.5px] text-sub">
        Prefer to write directly? <Link to="/contact" className="font-semibold text-brand">Contact us</Link>
      </p>
    </div>
  );
}
