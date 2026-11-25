// "Chandigarh University, Mohali" (created 2026-09-19) is an empty duplicate
// of "Chandigarh University", which holds the reviews and courses. Marks it
// REJECTED so it drops off the site, listings and sitemap; nothing is deleted,
// so it can be restored from Admin → Colleges. Safe to re-run.
// Run: npx tsx scripts/hide-duplicate-chandigarh-university.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dup = await prisma.institution.findUnique({
    where: { slug: 'chandigarh-university-mohali' },
    select: { id: true, status: true, claimed: true, _count: { select: { reviews: true, questions: true } } },
  });
  if (!dup) return console.log('Duplicate not found; nothing to do.');
  if (dup.claimed || dup._count.reviews > 0 || dup._count.questions > 0) {
    return console.log('Not hiding: the duplicate now has a claim, reviews or questions. Check it in Admin first.');
  }
  await prisma.institution.update({
    where: { id: dup.id },
    data: { status: 'REJECTED', rejectionReason: 'Duplicate of Chandigarh University (/college/chandigarh-university)' },
  });
  console.log('Hidden "Chandigarh University, Mohali" (was ' + dup.status + ').');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
