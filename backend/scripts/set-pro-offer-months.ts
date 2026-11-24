// Sets the free-Pro offer to 6 months for the 35 colleges emailed on
// 2026-11-24 (Echelon is added separately once its profile exists), so
// organization.service decideClaim → grantOfferedPro activates 6 months of Pro
// when their claim is approved. Skips colleges that are already claimed.
// Run: npx tsx scripts/set-pro-offer-months.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MONTHS = 6;

const NAMES = [
  'Quantum University',
  'Chandigarh University',
  'Chandigarh Group of Colleges',
  'ABES Engineering College (ABESEC), Ghaziabad',
  'ABES Institute of Technology (ABESIT), Ghaziabad',
  'COER University',
  'Uttaranchal University',
  'Graphic Era (Deemed to be University)',
  'Graphic Era Hill University',
  'Graphic Era Hill University, Bhimtal',
  'BSA College of Engineering and Technology',
  'Institute of Management Technology Ghaziabad',
  'Amity University',
  'Lovely Professional University',
  'Thapar Institute of Engineering and Technology',
  'Management Development Institute Gurgaon',
  'Shiv Nadar University',
  'Ashoka University',
  'Kalinga Institute of Industrial Technology',
  'SRM Institute of Science and Technology',
  'Vellore Institute of Technology',
  'Manipal Academy of Higher Education',
  'Amrita Vishwa Vidyapeetham',
  'SASTRA Deemed University',
  'Christ University',
  'Symbiosis International University',
  'Symbiosis Law School, Pune',
  "SVKM's Narsee Monjee Institute of Management Studies",
  'Great Lakes Institute of Management',
  'PSG College of Technology',
  'Birla Institute of Technology, Mesra',
  'Birla Institute of Technology and Science, Pilani',
  'XLRI Xavier School of Management',
  'Punjab Engineering College',
  'Guru Gobind Singh Indraprastha University',
];

async function main() {
  const { count } = await prisma.institution.updateMany({
    where: { name: { in: NAMES }, status: 'APPROVED', claimed: false },
    data: { proOfferMonths: MONTHS },
  });
  console.log(`Set a ${MONTHS}-month Pro offer on ${count} of ${NAMES.length} colleges.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
