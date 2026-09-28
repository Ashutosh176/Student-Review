// "Request clarification" keeps a review PENDING and stores the moderator's
// question in moderationNotes behind this marker, so the queue can show it
// as awaiting the author and the author sees the question on My Reviews —
// without a schema change for what is just a flavour of PENDING.
export const CLARIFICATION_PREFIX = 'Clarification requested: ';

export function clarificationRequestOf(review: { status: string; moderationNotes: string | null }): string | null {
  if (review.status !== 'PENDING' || !review.moderationNotes?.startsWith(CLARIFICATION_PREFIX)) return null;
  return review.moderationNotes.slice(CLARIFICATION_PREFIX.length);
}
