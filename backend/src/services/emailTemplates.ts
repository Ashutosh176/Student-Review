// Shared HTML shell + the 3 branded templates requested for SMTP delivery
// (verify account, reset password, college OTP). Table-based layout with
// every style inline — the only markup pattern that renders consistently
// across Gmail, Outlook, and other common clients. No external assets/fonts.
const BRAND = '#2A2F7C';
const BRAND_LIGHT = '#EEF0FB';
const TEXT = '#1F2330';
const SUB = '#6B7080';

function shell(opts: { previewText: string; heading: string; bodyHtml: string; ctaLabel?: string; ctaUrl?: string; footerNote: string }): string {
  const cta = opts.ctaUrl
    ? `
    <tr>
      <td align="center" style="padding: 28px 0 4px;">
        <a href="${opts.ctaUrl}" style="background:${BRAND};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;display:inline-block;">${opts.ctaLabel}</a>
      </td>
    </tr>
    <tr>
      <td style="padding: 10px 0 0; font-size:12px;color:${SUB};word-break:break-all;">
        Or paste this link into your browser:<br />
        <a href="${opts.ctaUrl}" style="color:${BRAND};">${opts.ctaUrl}</a>
      </td>
    </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>StudentReview</title>
</head>
<body style="margin:0;padding:0;background:#F4F5F8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(opts.previewText)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F5F8;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E4E6EC;">
          <tr>
            <td style="background:${BRAND};padding:20px 32px;">
              <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.2px;">StudentReview</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;">
              <h1 style="margin:0 0 12px;font-size:19px;color:${TEXT};">${opts.heading}</h1>
              <div style="font-size:14px;line-height:1.6;color:${TEXT};">${opts.bodyHtml}</div>
            </td>
          </tr>
          ${cta}
          <tr>
            <td style="padding:28px 32px 24px;">
              <hr style="border:none;border-top:1px solid #E4E6EC;margin:0 0 16px;" />
              <p style="margin:0;font-size:12px;color:${SUB};line-height:1.6;">${opts.footerNote}</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:11px;color:${SUB};">StudentReview — Honest Campus Insights</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function verifyAccountEmail(input: { username: string; link: string }): { html: string; text: string } {
  const html = shell({
    previewText: 'Verify your StudentReview account',
    heading: 'Verify your account',
    bodyHtml: `
      <p style="margin:0 0 12px;">Hi ${input.username},</p>
      <p style="margin:0 0 12px;">Thanks for signing up for StudentReview. Please confirm this is your email address to activate your account.</p>
      <p style="margin:0;color:${SUB};font-size:13px;">This link expires in 24 hours.</p>
    `,
    ctaLabel: 'Verify Account',
    ctaUrl: input.link,
    footerNote: "If you didn't create a StudentReview account, you can safely ignore this email — no further action is needed.",
  });
  const text = `Hi ${input.username},\n\nVerify your StudentReview account: ${input.link}\n\nThis link expires in 24 hours.\n\nIf you didn't create this account, you can ignore this email.`;
  return { html, text };
}

export function resetPasswordEmail(input: { username: string; link: string }): { html: string; text: string } {
  const html = shell({
    previewText: 'Reset your StudentReview password',
    heading: 'Reset your password',
    bodyHtml: `
      <p style="margin:0 0 12px;">Hi ${input.username},</p>
      <p style="margin:0 0 12px;">We received a request to reset the password for your StudentReview account. Click below to choose a new one.</p>
      <p style="margin:0;color:${SUB};font-size:13px;">This link expires in 1 hour.</p>
    `,
    ctaLabel: 'Reset Password',
    ctaUrl: input.link,
    footerNote: "If you didn't request a password reset, you can safely ignore this email — your password won't be changed.",
  });
  const text = `Hi ${input.username},\n\nReset your StudentReview password: ${input.link}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, you can ignore this email.`;
  return { html, text };
}

export function collegeOtpEmail(input: { code: string }): { html: string; text: string } {
  const html = shell({
    previewText: `Your verification code is ${input.code}`,
    heading: 'College verification code',
    bodyHtml: `
      <p style="margin:0 0 16px;">Your StudentReview college verification code is:</p>
      <p style="margin:0 0 16px;text-align:center;">
        <span style="display:inline-block;background:${BRAND_LIGHT};color:${BRAND};font-size:28px;font-weight:700;letter-spacing:6px;padding:14px 22px;border-radius:8px;">${input.code}</span>
      </p>
      <p style="margin:0;color:${SUB};font-size:13px;">This code expires in 10 minutes. Use it to confirm you can submit a review for this institution.</p>
    `,
    footerNote: "Do not share this code with anyone. StudentReview staff will never ask you for it.",
  });
  const text = `Your StudentReview college verification code is:\n\n${input.code}\n\nThis code expires in 10 minutes. Do not share this code with anyone.`;
  return { html, text };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Generic status-update email (review approved, verification approved,
// college approved, clarification requested, ...). Paragraphs are plain
// text and escaped here — callers may pass admin-written reasons.
export function noticeEmail(input: {
  heading: string;
  paragraphs: string[];
  ctaLabel?: string;
  ctaUrl?: string;
}): { html: string; text: string } {
  const html = shell({
    previewText: input.heading,
    heading: escapeHtml(input.heading),
    bodyHtml: input.paragraphs.map((p) => `<p style="margin:0 0 12px;white-space:pre-line;">${escapeHtml(p)}</p>`).join(''),
    ctaLabel: input.ctaLabel,
    ctaUrl: input.ctaUrl,
    footerNote: "You're getting this because of activity on your StudentReview account. You can turn these emails off anytime in Settings → Notifications.",
  });
  const text = [input.heading, ...input.paragraphs, input.ctaUrl ? `${input.ctaLabel ?? 'Open'}: ${input.ctaUrl}` : '']
    .filter(Boolean)
    .join('\n\n');
  return { html, text };
}

// ───────────── First-review outreach to a college ─────────────
// Mirrors the hand-written Quantum University / ABES emails. Built from facts
// only: who wrote the first review (never its text, never who they are) and
// whether they recommend the college. Pure, so it's unit-tested directly.

export interface OutreachEmailInput {
  institution: { name: string; slug: string; type: string; website: string | null; verified: boolean };
  firstReview: { type: 'EXPERIENCE' | 'ADMISSION_PROCESS'; relationship: string; verifiedStudent: boolean; recommend: boolean };
  siteOrigin: string;
  proOfferMonths: number;
  proPriceInr: number;
  contact: { phone?: string | null; email?: string | null };
}

type Block = string | { h: string } | { link: string } | { list: string[] };

function institutionNoun(type: string): 'university' | 'institute' | 'college' {
  if (type.endsWith('UNIVERSITY')) return 'university';
  if (['IIT', 'NIT', 'IIIT', 'MANAGEMENT_INSTITUTE'].includes(type)) return 'institute';
  return 'college';
}

function reviewerPhrase(r: OutreachEmailInput['firstReview'], noun: string): string {
  if (r.type === 'ADMISSION_PROCESS') {
    return `an applicant who went through your admission process${r.recommend ? ' and recommends applying' : ''}`;
  }
  const who = r.relationship === 'CURRENT_STUDENT' ? 'current student' : r.relationship === 'ALUMNI' ? 'graduate' : 'former student';
  const article = r.verifiedStudent ? 'a verified' : /^[aeiou]/.test(who) ? 'an' : 'a';
  return `${article} ${who}${r.recommend ? ` who recommends the ${noun}` : ''}`;
}

function emailDomain(website: string | null): string | null {
  if (!website) return null;
  try {
    return new URL(website).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function firstReviewOutreachEmail(input: OutreachEmailInput): { subject: string; text: string; html: string } {
  const { institution: inst, siteOrigin } = input;
  const noun = institutionNoun(inst.type);
  const plural = noun === 'university' ? 'universities' : `${noun}s`;
  const pageUrl = `${siteOrigin}/college/${inst.slug}`;
  const reviewUrl = `${siteOrigin}/write-review?college=${inst.slug}`;
  const posterUrl = `${siteOrigin}/poster/${inst.slug}`;
  const claimUrl = `${siteOrigin}/claim/${inst.slug}`;
  const domain = emailDomain(inst.website);
  const months = input.proOfferMonths;
  const hasOffer = months > 0;
  const offer = months === 12 ? 'one year' : `${months} months`;
  const price = `₹${input.proPriceInr.toLocaleString('en-IN')}`;

  const subject = hasOffer
    ? `${inst.name} on StudentReview.in: ${offer} of Pro free, and a QR poster for your students`
    : `${inst.name} on StudentReview.in: a QR poster for your students`;

  const contactLines = [
    input.contact.phone ? `Phone / WhatsApp: ${input.contact.phone}` : null,
    input.contact.email ? `Email: ${input.contact.email}` : null,
  ].filter((l): l is string => Boolean(l));

  // One list of blocks renders both the plain-text and HTML versions, so the
  // two can never drift apart.
  const blocks: Block[] = [
    'Dear Sir/Madam,',
    "I'm Ashutosh Sharma, founder of StudentReview.in, an independent platform where students review Indian colleges anonymously so that applicants and parents can choose with first-hand information.",
    `${inst.name} already has a profile on the platform:`,
    { link: pageUrl },
    `It has just received its first review, from ${reviewerPhrase(input.firstReview, noun)}. We'd like to invite the ${noun} to help more of its students share their experience, and to claim its official profile ${hasOffer ? `with our Pro plan free for the first ${months === 12 ? 'year' : `${months} months`}` : 'at no cost'}.`,
    { h: '1. Share the review link with your students' },
    `Here is a ready-to-print A4 poster with a QR code that opens ${inst.name}'s review form directly (open it and choose "Download PDF"). It works well on notice boards, in hostels and libraries, in student WhatsApp groups, or in an email to the student body:`,
    { link: posterUrl },
    'The direct review link is:',
    { link: reviewUrl },
    `Students sign in, confirm they study at ${inst.name} (with their official college email, or a college ID we check by hand), and write their review in about five minutes. Their name is never shown, and it is never shared with the ${noun}.`,
    'One request: please invite all students and ask for honest reviews, whether positive or negative. Applicants give far more weight to a page where the reviews are clearly genuine, and the platform does not allow rewards for positive reviews.',
    { h: hasOffer ? `2. Claim your official profile, with ${offer} of Pro free` : '2. Claim your official profile for free' },
    ...(hasOffer
      ? [
          `Claiming the profile is always free. As one of the first ${plural} to receive a review, we'd also like to give ${inst.name} our Pro plan (normally ${price} a month) free for ${months} months from the date your claim is approved. There's no payment, card or commitment involved, and afterwards you can simply continue on the Free plan.`,
        ]
      : []),
    `With a claimed profile, the ${noun} can:`,
    {
      list: [
        'Publish official public responses to reviews',
        'Answer questions that applicants post on your page',
        "Keep your profile's description, website and contact details up to date",
        'Add team members to manage the profile',
      ],
    },
    ...(hasOffer
      ? (['Pro adds:', { list: ['Advanced analytics on your page and its reviews', 'Sentiment analysis of what students are saying, by topic'] }] as Block[])
      : []),
    inst.verified
      ? `Your page already carries our "Verified" badge as the official ${inst.name} profile. Claiming it gives your team control of it.`
      : 'Once your claim is approved, your page shows a "Verified" badge.',
    `To claim, open ${claimUrl} and use an official ${domain ? `@${domain} ` : ''}email address, along with a signed authorisation letter on ${noun} letterhead that names the person claiming the profile. We review claims by hand, usually within a few working days.`,
    { h: `How this helps ${inst.name}` },
    {
      list: [
        'Many applicants now look for first-hand student opinions before applying, and a page with many genuine reviews builds more trust than brochures or advertising.',
        `Official responses let you answer concerns publicly and show how the ${noun} acts on feedback.`,
        "Honest, anonymous reviews show what your students value and where they'd like improvements, feedback that's hard to get any other way.",
      ],
    },
    'To keep the platform trustworthy for everyone: reviews cannot be edited or removed by colleges, reviewer identities are never shared, and no one can pay to hide a genuine review.',
    contactLines.length
      ? `If you're interested, or have any questions, I'd be happy to help or arrange a short call. You can reply to this email, or contact me directly at:\n${contactLines.join('\n')}`
      : "If you're interested, or have any questions, I'd be happy to help or arrange a short call. Just reply to this email.",
    'Thank you for your time.',
    `Warm regards,\nAshutosh Sharma\nFounder, StudentReview.in\n${siteOrigin}`,
  ];

  const text = blocks
    .map((b) => (typeof b === 'string' ? b : 'h' in b ? b.h : 'link' in b ? b.link : b.list.map((l) => `- ${l}`).join('\n')))
    .join('\n\n');

  const html = shell({
    previewText: `${inst.name} has its first student review on StudentReview.in`,
    heading: escapeHtml(`${inst.name} has its first review`),
    bodyHtml: blocks
      .map((b) => {
        if (typeof b === 'string') return `<p style="margin:0 0 12px;white-space:pre-line;">${escapeHtml(b)}</p>`;
        if ('h' in b) return `<p style="margin:18px 0 8px;font-weight:700;">${escapeHtml(b.h)}</p>`;
        if ('link' in b) return `<p style="margin:0 0 12px;"><a href="${escapeHtml(b.link)}" style="color:${BRAND};word-break:break-all;">${escapeHtml(b.link)}</a></p>`;
        return `<ul style="margin:0 0 12px;padding-left:20px;">${b.list.map((l) => `<li style="margin:0 0 4px;">${escapeHtml(l)}</li>`).join('')}</ul>`;
      })
      .join(''),
    ctaLabel: 'Open your QR poster',
    ctaUrl: posterUrl,
    footerNote: `You're receiving this because ${escapeHtml(inst.name)} has a public profile on StudentReview.in and has just received its first student review. This is a one-time email.`,
  });

  return { subject, text, html };
}
