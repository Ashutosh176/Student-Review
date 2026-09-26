// Fills Institution.editorialOverview for the seeded colleges from
// prisma/data/editorialOverviews.ts. Only fills EMPTY overviews, so it never
// clobbers an admin's edits — safe to re-run. Pass --force to overwrite.
//   npm run seed:overviews            (uses DATABASE_URL)
import { PrismaClient } from '@prisma/client';
import { toSlug } from '../src/utils/slug.js';
import { EDITORIAL_OVERVIEWS } from './data/editorialOverviews.js';

const prisma = new PrismaClient();
const force = process.argv.includes('--force');

async function main() {
  let filled = 0;
  let skipped = 0;
  const missing: string[] = [];
  for (const [name, overview] of Object.entries(EDITORIAL_OVERVIEWS)) {
    const inst = await prisma.institution.findUnique({ where: { slug: toSlug(name) }, select: { id: true, editorialOverview: true } });
    if (!inst) {
      missing.push(name);
      continue;
    }
    if (inst.editorialOverview && !force) {
      skipped++;
      continue;
    }
    await prisma.institution.update({ where: { id: inst.id }, data: { editorialOverview: overview } });
    filled++;
  }
  console.log(`Editorial overviews: ${filled} filled, ${skipped} already set (kept), ${missing.length} not found.`);
  if (missing.length) console.log('Not found:', missing);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
