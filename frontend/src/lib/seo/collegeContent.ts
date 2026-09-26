import type { InstitutionDetail, PublicReview } from '../../types';
import { escapeHtml } from './renderBotHtml';
import { collegeShortName } from './collegeSeo';

// Plain semantic HTML for the #root shell served to non-JS crawlers (see
// middleware.ts) — real content, not just meta tags, so "<college> reviews"
// searches have actual review text to match against. React fully replaces
// this on the client (createRoot, not hydrateRoot), so it never needs to be
// visually polished — only true and readable.
// Labelled exactly as on the page: team-written, never presented as a review.
function editorialOverviewHtml(inst: InstitutionDetail): string {
  if (!inst.editorialOverview) return '';
  const paragraphs = inst.editorialOverview
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');
  return `<h2>Editor's overview</h2>${paragraphs}<p><em>Written by the StudentReview team from publicly available information. Not a student review.</em></p>`;
}

export function collegeContentHtml(inst: InstitutionDetail, reviews: PublicReview[]): string {
  const overall = inst.summary.ratings.find((r) => r.category === 'OVERALL');
  const location = inst.locations[0];

  const reviewsHtml = reviews
    .filter((r) => r.body)
    .map((r) => {
      const rating = r.ratings.find((x) => x.category === 'OVERALL')?.value;
      return `<article>
        <h3>${escapeHtml(r.title ?? `${r.relationship.replace('_', ' ').toLowerCase()} review`)}</h3>
        ${rating ? `<p>Rating: ${rating}/5</p>` : ''}
        <p>${escapeHtml(r.body ?? '')}</p>
      </article>`;
    })
    .join('\n');

  return `
    <h1>${escapeHtml(inst.name)}${collegeShortName(inst) ? ` (${escapeHtml(collegeShortName(inst) ?? '')})` : ''} — Student Reviews & Ratings</h1>
    ${location ? `<p>${escapeHtml(location.city)}, ${escapeHtml(location.state)}</p>` : ''}
    ${inst.description ? `<p>${escapeHtml(inst.description)}</p>` : ''}
    ${editorialOverviewHtml(inst)}
    <p>${overall ? `Rated ${overall.average.toFixed(1)}/5` : 'Not yet rated'} based on ${inst.summary.reviewCount.toLocaleString('en-IN')} student reviews (${inst.summary.verifiedCount.toLocaleString('en-IN')} verified).</p>
    <h2>Student Reviews</h2>
    ${reviewsHtml || '<p>No reviews yet — be the first to share your experience.</p>'}
  `;
}
