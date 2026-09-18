import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-7">
      <Helmet>
        <title>About — StudentReview</title>
      </Helmet>
      <h1 className="mb-3.5 text-2xl">About StudentReview</h1>
      <p className="mb-3.5 text-sm leading-relaxed text-sub">
        StudentReview exists so students can hear from students before choosing where to study. Every review is anonymous by
        default — "Verified Student" is the only identity signal we ever show publicly. See exactly{' '}
        <Link to="/trust" className="text-brand">
          how verification and anonymity work
        </Link>
        .
      </p>
      <p className="mb-3.5 text-sm leading-relaxed text-sub">
        Institutions can claim and manage their profile, respond publicly to reviews, and see how students actually experience
        their campus — but they can never pay to remove a legitimate negative review.
      </p>
      <h2 className="mb-2 mt-6 text-lg">How rankings work</h2>
      <p className="text-sm leading-relaxed text-sub">
        Our rankings are a Bayesian-adjusted, recency- and verification-weighted average with a minimum-review threshold, not a
        raw average — so one or two reviews can never place an institution at the top. The full formula is documented in{' '}
        <code>docs/ranking-algorithm.md</code>.
      </p>
    </div>
  );
}
