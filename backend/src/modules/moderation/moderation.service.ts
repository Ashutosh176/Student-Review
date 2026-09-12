import Filter from 'bad-words';
import { prisma } from '../../config/prisma.js';

const profanityFilter = new Filter();

// ── Pattern-based detectors ──────────────────────────────────────────────
// These are deliberately conservative: they exist to catch objective policy
// violations (PII, spam links, threats) that are safe to auto-reject without
// ever suppressing a legitimate negative opinion about an institution.

const URL_RE = /(https?:\/\/|www\.)[^\s]+/gi;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// Indian mobile numbers (10 digits, optionally +91/0 prefixed) written as a
// contiguous or lightly-separated run of digits.
const PHONE_RE = /(?:\+?91[-\s]?)?[6-9]\d{9}\b|\b\d{3}[-\s]\d{3}[-\s]\d{4}\b/g;
const AADHAAR_LIKE_RE = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
const THREAT_KEYWORDS = ['kill you', 'hunt you down', 'come to your house', 'i will hurt', 'burn down'];
const UNSUPPORTED_ALLEGATION_KEYWORDS = [
  'scam',
  'fraud',
  'should be arrested',
  'should be in jail',
  'criminal',
  'illegal activities',
  'bribe',
  'corrupt',
];

export type ModerationDecision = 'APPROVE' | 'FLAG' | 'REJECT';

export interface ModerationResult {
  decision: ModerationDecision;
  riskScore: number; // 0-100
  flags: string[];
  notes: string;
}

export interface ModerationInput {
  userId: string;
  institutionId: string;
  body: string;
}

function normalizeForComparison(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

// Cheap near-duplicate check: shared-token (Jaccard) similarity against the
// user's own recent reviews and other reviews on the same institution.
function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(normalizeForComparison(a).split(' '));
  const setB = new Set(normalizeForComparison(b).split(' '));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const tok of setA) if (setB.has(tok)) intersection++;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export interface ModerationThresholds {
  rapidSubmissionWindowMinutes?: number;
  rapidSubmissionCount?: number;
}

export async function moderateReview(input: ModerationInput, thresholds: ModerationThresholds = {}): Promise<ModerationResult> {
  const { userId, institutionId, body } = input;
  const rapidSubmissionWindowMinutes = thresholds.rapidSubmissionWindowMinutes ?? 10;
  const rapidSubmissionCount = thresholds.rapidSubmissionCount ?? 3;
  const flags = new Set<string>();
  let riskScore = 0;

  // 1. Minimum length — a "useful" review needs actual substance (spec §12 step 7).
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 25) {
    flags.add('Too short');
    riskScore += 15;
  }

  // 2. Personal information (PII) — hard reject.
  const hasEmail = EMAIL_RE.test(body);
  const hasPhone = PHONE_RE.test(body);
  const hasAadhaar = AADHAAR_LIKE_RE.test(body);
  if (hasEmail || hasPhone || hasAadhaar) {
    flags.add('Personal information');
    riskScore += 60;
  }

  // 3. URLs / spam links — 1 is tolerated as context, 2+ is spam-flooding.
  const urlMatches = body.match(URL_RE) ?? [];
  if (urlMatches.length >= 2) {
    flags.add('Spam pattern');
    riskScore += 40;
  } else if (urlMatches.length === 1) {
    flags.add('Contains link');
    riskScore += 10;
  }

  // 4. Threats — hard reject.
  const lowerBody = body.toLowerCase();
  const hasThreat = THREAT_KEYWORDS.some((kw) => lowerBody.includes(kw));
  if (hasThreat) {
    flags.add('Threat / harassment');
    riskScore += 80;
  }

  // 5. Abusive language.
  if (profanityFilter.isProfane(body)) {
    flags.add('Abusive language');
    riskScore += 30;
  }

  // 6. Unsupported allegations — flagged for human review, never auto-rejected.
  // Legitimate criticism ("the placement cell was disorganized") is fine;
  // this only catches accusatory language framed as established fact.
  const hasUnsupportedAllegation = UNSUPPORTED_ALLEGATION_KEYWORDS.some((kw) => lowerBody.includes(kw));
  if (hasUnsupportedAllegation) {
    flags.add('Unsupported allegation');
    riskScore += 25;
  }

  // 7. Shouting / low-effort spam signal.
  const letters = body.replace(/[^a-zA-Z]/g, '');
  const upper = body.replace(/[^A-Z]/g, '');
  if (letters.length > 20 && upper.length / letters.length > 0.6) {
    flags.add('Excessive capitalization');
    riskScore += 10;
  }

  // 8. Rapid submission — same user posting many reviews in a short window.
  const windowStart = new Date(Date.now() - rapidSubmissionWindowMinutes * 60 * 1000);
  const recentCount = await prisma.review.count({
    where: { userId, createdAt: { gte: windowStart } },
  });
  if (recentCount >= rapidSubmissionCount) {
    flags.add('Rapid submission');
    riskScore += 35;
  }

  // 9. Duplicate / near-duplicate content — compares against the user's last
  // few reviews and recent reviews on the same institution (review-bombing /
  // copy-paste pattern).
  const recentReviews = await prisma.review.findMany({
    where: {
      OR: [{ userId }, { institutionId }],
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    select: { body: true },
    take: 50,
    orderBy: { createdAt: 'desc' },
  });
  const isDuplicate = recentReviews.some((r) => jaccardSimilarity(r.body, body) > 0.85);
  if (isDuplicate) {
    flags.add('Duplicate content');
    riskScore += 45;
  }

  riskScore = Math.min(100, riskScore);

  let decision: ModerationDecision = 'APPROVE';
  if (hasEmail || hasPhone || hasAadhaar || hasThreat || urlMatches.length >= 2) {
    decision = 'REJECT';
  } else if (riskScore >= 30) {
    decision = 'FLAG';
  }

  const notes = flags.size
    ? `Automated checks: ${Array.from(flags).join(', ')}. Note: legitimate criticism is protected — flags reflect tone, PII, spam or unverifiable-claim patterns, not negative sentiment.`
    : 'No automated concerns detected.';

  return { decision, riskScore, flags: Array.from(flags), notes };
}
