import { describe, expect, it } from 'vitest';
import { classifySentiment, extractTopics } from './sentiment.service.js';

describe('classifySentiment', () => {
  it('classifies clearly positive text as POSITIVE', () => {
    expect(classifySentiment('The faculty are excellent, supportive, and the campus is beautiful and well maintained.')).toBe('POSITIVE');
  });

  it('classifies clearly negative text as NEGATIVE', () => {
    expect(classifySentiment('Terrible administration, awful hostel food, and the placement cell was useless and unhelpful.')).toBe('NEGATIVE');
  });

  it('classifies neutral/factual text as NEUTRAL', () => {
    expect(classifySentiment('The course duration is four years and classes start at nine in the morning.')).toBe('NEUTRAL');
  });
});

describe('extractTopics', () => {
  it('detects placement and faculty topics', () => {
    const topics = extractTopics('Placement support was strong this year and the faculty mentorship helped a lot.');
    expect(topics).toContain('Placement');
    expect(topics).toContain('Faculty');
  });

  it('returns an empty array when no known topic is mentioned', () => {
    expect(extractTopics('It was a fine experience overall.')).toEqual([]);
  });
});
