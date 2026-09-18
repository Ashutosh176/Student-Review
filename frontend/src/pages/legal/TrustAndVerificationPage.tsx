import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/Badge';

const PILLARS = [
  {
    icon: '🎓',
    title: 'Verified by college email',
    body: "To earn the Verified Student badge, you confirm a one-time code sent to your official college email address — not a personal Gmail or Yahoo account. If your inbox isn't reachable, our team reviews a document (like an ID card) by hand instead.",
  },
  {
    icon: '🕶️',
    title: '100% anonymous, always',
    body: 'Your name, email, and account are never attached to a review — not on the public page, not in your college\'s dashboard, not even in most of our own admin tools. The only thing anyone ever sees is a "Verified Student" or "Anonymous Student" label.',
  },
  {
    icon: '🛡️',
    title: 'Moderated, never bought',
    body: "Every review is automatically screened for spam, abuse, and leaked personal information, with anything borderline sent to a human moderator. Colleges can publicly respond to a review, but no one can pay to have a genuine review removed.",
  },
];

export function TrustAndVerificationPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-7">
      <Helmet>
        <title>Trust & Verification — StudentReview</title>
        <meta
          name="description"
          content="How StudentReview verifies students and keeps every review anonymous — so you can trust what you read."
        />
      </Helmet>
      <h1 className="mb-2 text-2xl">Trust & Verification</h1>
      <p className="mb-8 text-sm leading-relaxed text-sub">
        The whole point of StudentReview is that you can believe what you read here. That rests on two guarantees we take
        seriously: reviews come from real students, and no one — not the college, not the public, not even most of our own
        staff — can find out who wrote one.
      </p>

      <div className="mb-9 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {PILLARS.map((p) => (
          <div key={p.title} className="rounded-card border border-line p-4 text-center">
            <div className="mb-2 text-3xl">{p.icon}</div>
            <h4 className="mb-1.5 text-sm font-semibold">{p.title}</h4>
            <p className="text-xs leading-relaxed text-sub">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-sub [&_h2]:mb-1.5 [&_h2]:mt-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-ink">
        <div>
          <h2>What "Verified Student" actually means</h2>
          <p>
            When you see <Badge kind="verified">Verified Student</Badge> under a review, it means that person proved, at the
            time they verified, that they had access to that specific college's official email domain — or submitted a
            document (ID card, admit card, degree certificate) that an admin manually approved. We check the domain against a
            curated list per institution and reject generic personal providers outright, so a Gmail address can never pass as
            a college email.
          </p>
          <p>
            Reviews without this badge are labeled <strong>Anonymous Student</strong> instead — they're still real accounts
            and still moderated, they simply haven't completed (or attempted) that verification step. We never hide or
            downweight an unverified review; the badge is a trust signal for you, not a filter we apply for you.
          </p>
        </div>

        <div>
          <h2>How your identity stays hidden from your college</h2>
          <p>
            Under the hood, the moment a review is shown to anyone — a visitor, a logged-in student, or your college's own
            dashboard — it passes through a single conversion step that keeps only the star ratings, the written text, and
            that verified/anonymous label. Your username, email address, and account ID are stripped out before that
            response is ever built, not just hidden in the interface. Your college sees the exact same public review feed
            that a stranger browsing the site sees — there is no special "see who wrote this" view for institutions.
          </p>
        </div>

        <div>
          <h2>What happens if you report something, or something is reported</h2>
          <p>
            Every submission is automatically screened for spam, abusive language, and accidentally-included personal
            information (yours or someone else's), and anything borderline gets queued for a human moderator before it's
            either published, sent back, or rejected. A review is never rejected just for being negative — only for breaking
            the{' '}
            <a href="/review-guidelines" className="text-brand">
              review guidelines
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
