// Loads official public contact addresses (from each college's own website,
// researched 2026-10-31) into Institution.outreachEmail, so the hourly
// "be the first" invite job (services/outreach.service.ts) can reach them.
// Only fills colleges that have no address yet, aren't claimed and have no
// reviews. Run: npx tsx scripts/set-outreach-emails.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EMAILS: Record<string, string> = {
  'Amity University': 'admissions@amity.edu',
  'Uttaranchal University': 'university@uumail.in',
  'Graphic Era (Deemed to be University)': 'enquiry@geu.ac.in',
  'Graphic Era Hill University': 'enquiry@gehu.ac.in',
  'Graphic Era Hill University, Bhimtal': 'admissions_bhimtal@gehu.ac.in',
  'COER University': 'admission@coeruniversity.ac.in',
  'ABES Institute of Technology (ABESIT), Ghaziabad': 'info@abesit.in',
  'Lovely Professional University': 'info@lpu.co.in',
  'Thapar Institute of Engineering and Technology': 'registrar@thapar.edu',
  'Kalinga Institute of Industrial Technology': 'kiit@kiit.ac.in',
  'Institute of Management Technology Ghaziabad': 'diroffice@imt.edu',
  'BSA College of Engineering and Technology': 'info@bsacet.org',
  'SRM Institute of Science and Technology': 'infodesk@srmist.edu.in',
  'Christ University': 'mail@christuniversity.in',
  'Great Lakes Institute of Management': 'info@greatlakes.edu.in',
  'Vellore Institute of Technology': 'registrar@vit.ac.in',
  'Manipal Academy of Higher Education': 'dsa.mahe@manipal.edu',
  'Birla Institute of Technology and Science, Pilani': 'registrar@bits-pilani.ac.in',
  'Amrita Vishwa Vidyapeetham': 'univhq@amrita.edu',
  'SASTRA Deemed University': 'admissions@sastra.edu',
  'Birla Institute of Technology, Mesra': 'daac@bitmesra.ac.in',
  "SVKM's Narsee Monjee Institute of Management Studies": 'enquiry@nmims.edu',
  'Symbiosis International University': 'info@siu.edu.in',
  'Management Development Institute Gurgaon': 'admissions@mdi.ac.in',
  'S. P. Jain Institute of Management and Research': 'info@spjimr.org',
  'XLRI Xavier School of Management': 'info@xlri.ac.in',
  'PSG College of Technology': 'principal@psgtech.edu',
  'Ashoka University': 'info@ashoka.edu.in',
  'Punjab Engineering College': 'registrar@pec.edu.in',
  'Symbiosis Law School, Pune': 'info@symlaw.ac.in',
};

async function main() {
  let updated = 0;
  for (const [name, email] of Object.entries(EMAILS)) {
    const { count } = await prisma.institution.updateMany({
      where: { name, outreachEmail: null, claimed: false, reviews: { none: {} } },
      data: { outreachEmail: email },
    });
    if (count === 1) updated++;
    else console.log(`Skipped (${count} matches): ${name}`);
  }
  console.log(`Set outreach email on ${updated} of ${Object.keys(EMAILS).length} colleges.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
