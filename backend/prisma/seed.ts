// Development seed. Creates ONLY essential system configuration (roles,
// institution categories) plus a single local test account. No demo
// colleges, reviews, questions, organizations, or jobs are created —
// the app is expected to start from an empty content database so real
// data can be entered through the normal API/UI flows.
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Indian Institutes of Technology', slug: 'iit' },
  { name: 'National Institutes of Technology', slug: 'nit' },
  { name: 'Private Universities', slug: 'private-university' },
  { name: 'State Universities', slug: 'state-university' },
  { name: 'Engineering Colleges', slug: 'engineering' },
  { name: 'Management Institutes', slug: 'management' },
  { name: 'Medical Colleges', slug: 'medical' },
  { name: 'Law Schools', slug: 'law' },
];

const TEST_ACCOUNT = {
  username: 'testuser',
  email: 'test@campustruth.local',
  password: 'ChangeMe123!',
};

async function main() {
  console.log('Seeding institution categories...');
  await Promise.all(CATEGORIES.map((c) => prisma.institutionCategory.upsert({ where: { slug: c.slug }, create: c, update: {} })));

  console.log('Seeding roles...');
  const roleNames = ['STUDENT', 'ORGANIZATION', 'MODERATOR', 'ADMIN'] as const;
  const roles = new Map(
    await Promise.all(
      roleNames.map(async (name) => [name, await prisma.role.upsert({ where: { name }, create: { name }, update: {} })] as const),
    ),
  );

  console.log('Seeding single local test account (STUDENT + ORGANIZATION + ADMIN roles)...');
  const passwordHash = await hashPassword(TEST_ACCOUNT.password);
  await prisma.user.upsert({
    where: { email: TEST_ACCOUNT.email },
    create: {
      username: TEST_ACCOUNT.username,
      email: TEST_ACCOUNT.email,
      passwordHash,
      emailVerifiedAt: new Date(),
      roles: {
        create: [{ roleId: roles.get('STUDENT')!.id }, { roleId: roles.get('ORGANIZATION')!.id }, { roleId: roles.get('ADMIN')!.id }],
      },
    },
    update: {},
  });

  console.log('\nSeed complete. No demo institutions/reviews/organizations were created.');
  console.log(`Local test account: ${TEST_ACCOUNT.email} (password set in prisma/seed.ts, local dev only)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
