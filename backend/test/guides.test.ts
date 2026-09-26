import { describe, expect, it } from 'vitest';
import { GUIDES, findGuide } from '../src/data/guides.js';
import { EDITORIAL_OVERVIEWS } from '../prisma/data/editorialOverviews.js';
import { toSlug } from '../src/utils/slug.js';

const seededSlugs = new Set(Object.keys(EDITORIAL_OVERVIEWS).map(toSlug));

describe('guides content', () => {
  it('has unique, URL-safe slugs', () => {
    const slugs = GUIDES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('keeps meta descriptions short enough to show in search results', () => {
    for (const g of GUIDES) expect(g.description.length, g.slug).toBeLessThanOrEqual(160);
  });

  it('contains no raw HTML (all blocks are rendered as escaped text)', () => {
    for (const g of GUIDES) expect(JSON.stringify(g.blocks), g.slug).not.toMatch(/<[a-z/]/i);
  });

  it('only links colleges that exist in the seeded catalogue', () => {
    for (const g of GUIDES) for (const s of g.relatedColleges) expect(seededSlugs.has(s), `${g.slug} -> ${s}`).toBe(true);
  });

  it('finds guides by slug', () => {
    expect(findGuide(GUIDES[0].slug)?.title).toBe(GUIDES[0].title);
    expect(findGuide('nope')).toBeUndefined();
  });
});
