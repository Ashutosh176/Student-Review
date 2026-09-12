# Ranking algorithm

Implementation: `backend/src/modules/ranking/ranking.service.ts`. Cached results live in
`institution_ranking_scores` and are recomputed by `backend/src/jobs/recomputeRankings.job.ts`.

## Why not a raw average

A raw average of star ratings lets one or two reviews put an institution at #1, and gives no
way to reward verified, recent, or high-volume feedback over stale or thin data. Spec §21
requires the score to fold in: average rating, review count, verified-review share, review
freshness, suspicious-activity signals, and a minimum-review threshold.

## Per-category score (Overall / Placement / Faculty / Infrastructure / Campus Life / Value for Money)

For each approved rating in the category:

1. **Recency weight** — exponential decay with a 365-day half-life:
   `weight = 0.5 ^ (ageInDays / 365)`. A rating from a year ago counts half as much as a
   fresh one; nothing is ever weighted to zero, so old reviews still contribute.
2. **Verified-student bonus** — verified ratings get a `1.15x` weight multiplier.
3. **Weighted average** — `rawAvg = Σ(rating × weight) / Σ(weight)` per institution.
4. **Bayesian adjustment** (the anti-"one review at #1" mechanism) —
   `bayesian = (v / (v + m)) × rawAvg + (m / (v + m)) × globalMean`, where `v` is the
   institution's rating count for that category, `m = 15` (tunable), and `globalMean` is the
   platform-wide average for that category. Low-`v` institutions get pulled toward the global
   mean instead of being able to spike on a handful of 5-star ratings.
5. **Suspicious-activity dampener** — if more than 20% of an institution's reviews in the
   trailing 90 days were flagged, rejected, or removed, its score is multiplied by `0.9`. This
   is a soft deprioritization, not an accusation or removal — it only reduces ranking
   position while the underlying reports are investigated through normal moderation.
6. **Minimum-review gate** — institutions with fewer than `PlatformSettings.minReviewsForRanking`
   approved ratings in a category are excluded from that ranking list entirely (they still show
   their own average on their profile — they just aren't ranking-eligible yet). Default is
   **5**, but it's a single admin-editable value (Admin → Settings → Moderation), not a hardcoded
   constant — `recomputeAllRankings()` reads it fresh from the database on every run.
7. Final score is scaled to a 0–100 display value (`bayesian × penalty × 20`).

## Most Reviewed

Simple count of approved reviews, gated by the same admin-configurable minimum.

## Trending

Compares the last 30 days of approved reviews against the preceding 30–60 day window:
`score = recentCount + max(0, recentCount − previousCount) × 1.5`. This rewards both raw
recent activity and acceleration, with a floor of 2 recent reviews so a single new review
can't register as "trending."

## Recompute cadence

`recomputeAllRankings()` walks every metric and upserts `institution_ranking_scores`. For the
MVP this runs via the `npm run jobs:rankings` script (see `backend/src/jobs`); production
should move this to a scheduled job (cron/queue) rather than running it inline on request.
