# StudentReview

An anonymous, structured college/university review and reputation platform for students in India — think Glassdoor + Reddit + Google Reviews, purpose-built for higher education.

> Product name: the official logo (`frontend/src/assets/logo.svg`) reads "StudentReview." The project was originally scoped under the working title "CampusTruth" — that name survives only in `docs/figma-reference.html`, the original design reference.

## What's here

- **Anonymous reviews, verified-only writing.** Anyone can read; only a user who proves affiliation with a specific institution can write a review for it. Verification is either an official university email + OTP (instant, automatic) or an ID/document upload (admin-reviewed) — see `backend/src/services/verification.service.ts`. Publicly, verified reviewers still only ever show as "Anonymous Student" / "✓ Verified Student" — no email, phone, IP, or verification evidence is ever exposed via the API. A verification is scoped to exactly one institution; it can never be reused to claim affiliation with another (`StudentVerification` has no cross-institution fallback — a documented bug in the original design was fixed here).
- **Rule-based moderation** — profanity, PII, spam-link, duplicate, rapid-submission, and unsupported-allegation detection. Legitimate negative reviews are never auto-rejected; see `backend/src/modules/moderation/moderation.service.ts`. Thresholds (auto-flag report count, rapid-submission window/count, ranking minimum-review floor) are runtime-editable by an admin (Admin → Settings → Moderation), backed by the single-row `PlatformSettings` table — not hardcoded constants.
- **Lexicon-based sentiment + topic tagging** — free/open-source (`sentiment` npm package), no paid AI API dependency. Swappable later — see `backend/src/modules/moderation/sentiment.service.ts`.
- **A documented, anti-gaming ranking algorithm** — Bayesian-adjusted, recency- and verification-weighted, with an admin-configurable minimum-review threshold (default 5). Full writeup: `docs/ranking-algorithm.md`.
- **Student-submitted colleges, admin-approved.** A student can add a college that isn't listed yet; it stays invisible everywhere public (and unreviewable) until an admin approves it from Admin → Colleges.
- **College claim → organization dashboard** flow, with official review responses (orgs can respond, never delete). Org team invites work for people without an account yet too — an email invite link lets them register/log in and join directly.
- **A real FAQ page** (`/faq`), content-managed from Admin → Settings → Content & FAQs.
- **No pay-to-delete-reviews mechanic anywhere in the codebase.** Monetization tiers (Free/Pro/Business) only unlock profile management, analytics, and job listings.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Zustand, Axios |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT (short-lived access token in memory + httpOnly refresh cookie, rotated on use), Argon2id password hashing |
| Docs | Swagger UI at `/api/docs` |

## Project structure

```
studentreview/ (this directory)
  backend/
    prisma/            schema.prisma, seed.ts
    src/
      config/          env, logger, prisma client, swagger spec
      controllers/      thin HTTP layer
      services/         business logic (auth, reviews, institutions, org, admin, ...)
      modules/
        moderation/      moderation.service.ts, sentiment.service.ts
        ranking/         ranking.service.ts
      middlewares/       auth, validation, rate limiting, error handling
      validators/        zod schemas
      routes/            Express routers
      jobs/              recomputeRankings.job.ts (standalone script)
  frontend/
    src/
      api/               one file per backend domain, typed
      components/        design-system components (Badge, ReviewCard, CollegeCard, ...)
      layouts/           PublicLayout, DashboardLayout, AuthLayout
      pages/             one folder per route group (college/, student/, organization/, admin/, legal/, auth/)
      store/             zustand auth store
  docs/
    figma-reference.html   the original visual reference (archived, not shipped)
    ranking-algorithm.md
```

## Local setup

Prerequisites: Node.js 20+, PostgreSQL 14+ (a free-tier hosted instance — Neon, Supabase, Railway — works too).

```bash
# 1. Backend
cd backend
cp .env.example .env          # fill in DATABASE_URL and JWT secrets
npm install
npx prisma migrate dev        # creates the schema
npm run prisma:seed           # seeds roles, categories, and one local test account (no demo colleges/reviews)
npm run dev                   # http://localhost:4000, docs at /api/docs

# 2. Frontend (separate terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173, proxies /api to :4000
```

### Local test account (local dev only — never used in production)

The database starts with **no colleges, reviews, questions, jobs, or organizations** — add your own through the app. The seed creates exactly one login, holding all three roles (STUDENT + ORGANIZATION + ADMIN) so every dashboard is reachable from a single account:

| Email | Password |
|---|---|
| `test@campustruth.local` | `ChangeMe123!` |

The organization dashboard only becomes usable once this account claims an institution you've created and the claim is approved (via `/admin/organizations`) — that's the normal claim flow, not a bug.

Likewise, writing a review requires the account to be verified for that specific institution first (Settings → Verification, or the gate built into the "Write a review" flow). Verification codes are **never** logged or exposed via any API response, by design — so without a working `RESEND_API_KEY`, the easiest way to test the write-a-review flow locally is the **document-upload path** instead of the email+OTP path: submit any small PDF/PNG/JPEG on the verification screen, then approve it yourself from `/admin/verifications` (same account, ADMIN role). To exercise the email+OTP path locally, set a real `RESEND_API_KEY` so the code actually arrives in an inbox.

### Recomputing rankings

Rankings are cached in `institution_ranking_scores` and are **not** recomputed on every request. Run manually, or wire into a cron/queue in production:

```bash
cd backend
npm run jobs:rankings
```

(The seed script also runs this once at the end, and the admin analytics page has a "Recompute rankings" button that hits `POST /api/admin/rankings/recompute`.)

## Testing

```bash
cd backend && npm test    # moderation/sentiment logic, password hashing, zod validators
cd frontend && npm test   # (component tests — see src/**/*.test.tsx as they're added)
```

Tests that need a live database are not included by default — the current suite covers pure logic (validators, moderation heuristics, sentiment/topic extraction, password hashing) so it runs with zero setup. As the codebase grows, add integration tests against a `TEST_DATABASE_URL` per Prisma's testing guide.

## Deployment notes

- **Frontend**: any static host (Vercel/Netlify). Set `VITE_API_BASE_URL` to the backend's public URL if it's a different domain.
- **Backend**: any Node host (Render/Railway/Fly.io). Set all vars from `backend/.env.example`, especially `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`/`COOKIE_SECRET` to strong random values — never reuse the dev defaults.
- **Database**: managed Postgres. Run `npx prisma migrate deploy` (not `migrate dev`) in CI/CD.
- **Sitemap**: `GET /sitemap.xml` on the backend is dynamic (queries all institutions). In production, proxy `yourdomain.com/sitemap.xml` and `/robots.txt` to the API origin so search engines see them on the public domain.
- **File uploads**: claim-form documents and student-verification ID/documents are both wired end-to-end the same way (multer, local disk under `UPLOAD_DIR`, authenticated admin-only download routes). Swap the storage backend for an S3-compatible bucket before production — `middlewares/upload.ts` is the only place that knows about disk paths.
- **Payments**: Razorpay is wired in test mode (`RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`/`RAZORPAY_WEBHOOK_SECRET`) — order creation, checkout, signature verification, and a webhook reconciliation path all work against real Razorpay test infrastructure. The webhook needs a public HTTPS URL to receive events (not reachable from plain localhost); the client-side `/verify` call is what activates a plan in local dev.
- **Email**: Resend is wired (`EMAIL_PROVIDER=resend` + `RESEND_API_KEY`) for account-verify-email, password reset, the contact form, and student university-verification OTPs. Falls back to console-logging *that an email would have been sent* (never the OTP/token content itself) if the key isn't set, rather than failing the request outright.

## Known gaps / explicit TODOs

Per the "don't fake functionality" rule, these are called out rather than stubbed silently:

- Elasticsearch/OpenSearch: search currently runs on PostgreSQL `ILIKE`/full-text; the service layer (`institution.service.ts`) is isolated so a search backend swap doesn't touch controllers.
- Admin Settings → Security tab shows real current config values (password policy, token lifetimes, rate limits) but is intentionally read-only — changing these requires an env var / code change, not a runtime toggle.
- Ranking recompute is not on an automatic schedule by default — it's a manual admin button / `npm run jobs:rankings` script; wire it into a real cron/queue in production (see "Recomputing rankings" below).
- `StudentVerification` rows older than the OTP's 10-minute window don't auto-transition to `EXPIRED` — the status exists and is reachable (a user can explicitly cancel a pending attempt), but there's no background sweep for abandoned-and-forgotten `PENDING` rows. Harmless (resend still works, and a stale `PENDING` row doesn't block anything except a second attempt), but worth a cleanup job before production.

## Business rules enforced in code (not just docs)

- **No review deletion for pay.** There is no code path anywhere that lets an `OrganizationMember` delete, hide, or edit another user's review — `review.service.ts` restricts edit/delete to the authoring `userId`, and `respondToReview` only ever creates a `ReviewResponse` row alongside the review, never modifying it.
- **Anonymity boundary.** All public review/answer serialization goes through `backend/src/utils/serializers.ts`, which is the only place allowed to decide what "Anonymous Student" vs. "Verified Student" means. Controllers are expected to always serialize through it rather than returning raw Prisma rows.
- **Ranking floor.** `PlatformSettings.minReviewsForRanking` (default 5, admin-editable) — an institution below this threshold cannot appear in any ranked list, however good its average is.
- **Verification is institution-specific and backend-enforced.** `POST /api/reviews` checks `StudentVerification.status === 'VERIFIED'` for the exact `(userId, institutionId)` pair before creating anything — a verification for one college can never be used to review another, and there is no client-side-only gate to bypass.
