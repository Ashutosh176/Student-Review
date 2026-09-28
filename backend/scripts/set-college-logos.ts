// Points Institution.logoUrl at the self-hosted logos in
// frontend/public/college-logos/<slug>.png. Each file is the college's own
// mark, taken from its official website. Only fills colleges whose logoUrl is
// still empty, so a logo set by hand in admin is never overwritten.
//
// Deploy the frontend (so the files are live) before running this.
//   npx tsx scripts/set-college-logos.ts           # dry run
//   npx tsx scripts/set-college-logos.ts --apply
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { prisma } from '../src/config/prisma.js';

const LOGO_DIR = join(__dirname, '../../frontend/public/college-logos');

async function main() {
  const apply = process.argv.includes('--apply');
  const slugs = readdirSync(LOGO_DIR)
    .filter((f) => f.endsWith('.png'))
    .map((f) => f.slice(0, -'.png'.length));

  const targets = await prisma.institution.findMany({
    where: { slug: { in: slugs }, logoUrl: null },
    select: { id: true, slug: true },
  });
  const unmatched = slugs.filter((s) => !targets.some((t) => t.slug === s));

  console.log(`${slugs.length} logo files, ${targets.length} colleges to update${apply ? '' : ' (dry run)'}`);
  if (unmatched.length) console.log(`skipped (no such college, or logo already set): ${unmatched.join(', ')}`);

  if (apply) {
    await prisma.$transaction(
      targets.map((t) => prisma.institution.update({ where: { id: t.id }, data: { logoUrl: `/college-logos/${t.slug}.png` } })),
    );
    console.log('done');
  }
  await prisma.$disconnect();
}

main();
