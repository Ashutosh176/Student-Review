import Sentiment from 'sentiment';

// Lightweight, free/open-source sentiment scoring (AFINN lexicon via the
// `sentiment` package) per spec §19. Deliberately dependency-light so it runs
// synchronously at review-submission time with no external API cost. The
// interface is narrow enough to swap for a hosted AI API later without
// touching callers — see `classifySentiment`'s return shape.
const analyzer = new Sentiment();

export type SentimentLabel = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export function classifySentiment(text: string): SentimentLabel {
  const result = analyzer.analyze(text);
  const words = text.trim().split(/\s+/).length || 1;
  const normalized = result.score / Math.sqrt(words);
  if (normalized > 0.3) return 'POSITIVE';
  if (normalized < -0.3) return 'NEGATIVE';
  return 'NEUTRAL';
}

// Keyword-based topic tagging aligned with the rating categories so org
// analytics can say "placement sentiment" rather than generic sentiment.
const TOPIC_KEYWORDS: Record<string, string[]> = {
  Placement: ['placement', 'placements', 'recruiter', 'package', 'job offer', 'internship', 'campus hiring'],
  Faculty: ['faculty', 'professor', 'teacher', 'lecturer', 'teaching'],
  Hostel: ['hostel', 'dormitory', 'mess food', 'warden', 'room'],
  Fees: ['fee', 'fees', 'tuition', 'scholarship', 'expensive', 'affordable'],
  Infrastructure: ['infrastructure', 'lab', 'library', 'wifi', 'classroom', 'campus building'],
  Administration: ['administration', 'admin office', 'paperwork', 'bureaucracy', 'registrar'],
  'Campus Life': ['campus life', 'clubs', 'fest', 'sports', 'extracurricular', 'social life'],
};

export function extractTopics(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) found.push(topic);
  }
  return found;
}
