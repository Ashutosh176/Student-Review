import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { prisma } from '../config/prisma.js';
import { getPlatformSettings } from './settings.service.js';

// "Students say..." — a short, clearly-labeled AI-generated digest of an
// institution's recent reviews (spec: reading aid, never counted as a
// review itself, never shown without attribution). Reuses the same
// minReviewsForRanking gate as institution rankings — "enough data to say
// something meaningful" is the same bar either way.

let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic({ apiKey: env.anthropicApiKey });
  return client;
}

const SYSTEM_PROMPT =
  "You summarize student reviews of a college for prospective students comparing where to apply. Write 2-4 plain-prose sentences covering the common themes — both strengths and weaknesses — using only what the reviews actually say. Never invent facts, statistics, or claims the reviews don't contain, and never refer to individual reviewers or quote them directly. No markdown, no bullet points, no headings — just the sentences.";

export async function generateInstitutionSummary(institutionId: string): Promise<string | null> {
  if (!env.anthropicApiKey) {
    logger.warn({ institutionId }, 'ANTHROPIC_API_KEY not set — skipping AI summary generation');
    return null;
  }

  const settings = await getPlatformSettings();
  const [institution, reviews] = await Promise.all([
    prisma.institution.findUnique({ where: { id: institutionId }, select: { name: true } }),
    prisma.review.findMany({
      where: { institutionId, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 40,
      select: { body: true, recommend: true },
    }),
  ]);
  if (!institution) return null;
  if (reviews.length < settings.minReviewsForRanking) return null;

  const reviewText = reviews.map((r, i) => `${i + 1}. [${r.recommend ? 'Recommends' : 'Does not recommend'}] ${r.body}`).join('\n\n');

  const response = await getClient().messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Reviews of ${institution.name}:\n\n${reviewText}` }],
  });

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
  const summary = textBlock?.text.trim();
  if (!summary) return null;

  await prisma.institution.update({ where: { id: institutionId }, data: { aiSummary: summary, aiSummaryUpdatedAt: new Date() } });
  return summary;
}

// For the periodic batch job (npm run jobs:ai-summaries) — not exposed as a
// single "regenerate everything" admin button, since unlike ranking
// recompute (a free SQL aggregation) each institution here is a real,
// billed API call; an admin fat-fingering a full-catalog regen would cost
// real money. Per-institution regeneration is what the admin UI offers.
export async function regenerateAllInstitutionSummaries() {
  const settings = await getPlatformSettings();
  const grouped = await prisma.review.groupBy({ by: ['institutionId'], where: { status: 'APPROVED' }, _count: { _all: true } });
  const eligible = grouped.filter((g) => g._count._all >= settings.minReviewsForRanking);

  let generated = 0;
  for (const g of eligible) {
    try {
      const summary = await generateInstitutionSummary(g.institutionId);
      if (summary) generated++;
    } catch (err) {
      logger.error({ err, institutionId: g.institutionId }, 'Failed to generate AI summary for institution');
    }
  }
  return { eligible: eligible.length, generated };
}
