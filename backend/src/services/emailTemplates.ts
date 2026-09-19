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
  <span style="display:none;max-height:0;overflow:hidden;">${opts.previewText}</span>
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
