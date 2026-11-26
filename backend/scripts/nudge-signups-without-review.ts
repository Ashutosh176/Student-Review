// One-off nudge (approved by the founder before sending): emails people who
// signed up but never wrote a review, now that they can write first and
// verify after. Sent from info@ via the normal email service.
// Dry run (default) lists recipients; pass --send to actually send.
// Run: npx tsx scripts/nudge-signups-without-review.ts [--send]
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../src/services/email.service.js';

const prisma = new PrismaClient();
const SEND = process.argv.includes('--send');
const ORIGIN = 'https://studentreview.in';
// The founder's own account and an obvious placeholder address.
const EXCLUDE = new Set(['ashutosh.srma21@gmail.com', 'you@gmail.com']);

function emailFor(collegeName: string | null, link: string) {
  const subject = collegeName
    ? `Your review of ${collegeName} is one step away`
    : 'Writing a college review on StudentReview.in is now much quicker';
  const paragraphs = [
    'Hi,',
    'Thank you for signing up on StudentReview.in.',
    collegeName
      ? `You're already verified as a student at ${collegeName}, so you can write your review straight away. It takes about 5 minutes.`
      : "We've made reviewing much quicker: you now write your review first, and confirm you study there at the end with your college email or ID. Your name is never shown with your review.",
    'Juniors choosing colleges this year read these reviews. An honest account of placements, faculty, hostel and campus life from you can really help them decide.',
    `Write your review: ${link}`,
    "If you're in a class or batch WhatsApp group, please share the link there too.",
    'Team StudentReview.in',
    "You're receiving this because you created an account on StudentReview.in. Reply \"stop\" and we won't email you about this again.",
  ];
  const text = paragraphs.join('\n\n');
  const html =
    '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.55;color:#161B33">' +
    paragraphs
      .map((p, i) =>
        p.startsWith('Write your review: ')
          ? `<p><a href="${link}" style="display:inline-block;background:#161B33;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Write your review</a></p>`
          : i === paragraphs.length - 1
            ? `<p style="color:#6b7080;font-size:12px">${p}</p>`
            : `<p>${p}</p>`,
      )
      .join('') +
    '</div>';
  return { subject, text, html };
}

async function main() {
  const users = await prisma.user.findMany({
    where: { reviews: { none: {} }, status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
    select: {
      email: true,
      studentVerifications: { where: { status: 'VERIFIED' }, select: { institution: { select: { name: true, slug: true } } }, take: 1 },
    },
  });
  const recipients = users.filter((u) => !EXCLUDE.has(u.email.toLowerCase()));
  console.log(`${recipients.length} recipient(s)${SEND ? '' : ' (dry run, add --send to send)'}`);
  for (const u of recipients) {
    const college = u.studentVerifications[0]?.institution ?? null;
    const link = college ? `${ORIGIN}/write-review?college=${encodeURIComponent(college.slug)}` : `${ORIGIN}/write-review`;
    const mail = emailFor(college?.name ?? null, link);
    if (!SEND) {
      console.log(`- ${u.email}: ${mail.subject}`);
      continue;
    }
    try {
      await sendEmail({ to: u.email, ...mail });
      console.log(`sent ${u.email}`);
    } catch (err) {
      console.log(`FAILED ${u.email}: ${(err as Error).message}`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
