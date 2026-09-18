import { Resend } from 'resend';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// Abstracted so a real provider (SES, Postmark, Resend, MSG91, ...) can be
// dropped in later by adding a case here — nothing else in the codebase
// should ever touch an email SDK directly (spec §39).
//
// `template` is MSG91-only: MSG91's transactional Email API sends through a
// pre-approved template (identified by templateKey, mapped to a template ID
// in env.msg91.templates) with variables substituted server-side, not a
// caller-supplied HTML/text body. Other providers ignore it and just send
// `text`.
type Msg91TemplateKey = keyof typeof env.msg91.templates;

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  template?: {
    key: Msg91TemplateKey;
    variables: Record<string, string>;
  };
}

let resendClient: Resend | null = null;
function getResendClient(): Resend {
  resendClient ??= new Resend(env.email.resendApiKey);
  return resendClient;
}

async function sendViaMsg91(input: SendEmailInput): Promise<void> {
  if (!env.msg91.authKey || !env.msg91.domain || !env.msg91.fromEmail) {
    logger.warn({ to: input.to, subject: input.subject }, 'MSG91 not fully configured — email logged, not sent');
    return;
  }
  if (!input.template) {
    // Every call site in this codebase passes `template` when EMAIL_PROVIDER
    // could plausibly be "msg91" — this only fires if a new call site adds a
    // plain sendEmail() without wiring a template.
    throw new Error('sendEmail(): MSG91 requires a `template` (raw HTML/text sends are not supported by MSG91\'s transactional Email API)');
  }
  const templateId = env.msg91.templates[input.template.key];
  if (!templateId) {
    logger.warn({ to: input.to, templateKey: input.template.key }, `MSG91_TEMPLATE_${input.template.key.toUpperCase()} not set — email logged, not sent`);
    return;
  }

  const res = await fetch('https://control.msg91.com/api/v5/email/send', {
    method: 'POST',
    headers: { authkey: env.msg91.authKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipients: [{ to: [{ email: input.to }], variables: input.template.variables }],
      from: { email: env.msg91.fromEmail, name: env.msg91.fromName },
      domain: env.msg91.domain,
      template_id: templateId,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`MSG91 failed to send email (${res.status}): ${body}`);
  }
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (env.email.provider === 'console') {
    logger.info({ to: input.to, subject: input.subject }, 'Email (console provider) — not actually sent');
    return;
  }

  if (env.email.provider === 'msg91') {
    await sendViaMsg91(input);
    return;
  }

  if (env.email.provider === 'resend') {
    if (!env.email.resendApiKey) {
      // Don't let a missing key break registration/password-reset — degrade
      // to logging, the same as the "console" provider, until it's set.
      logger.warn({ to: input.to, subject: input.subject }, 'RESEND_API_KEY not set — email logged, not sent');
      return;
    }
    const { error } = await getResendClient().emails.send({
      from: `StudentReview <${env.email.from}>`,
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    if (error) throw new Error(`Resend failed to send email: ${error.message}`);
    return;
  }

  throw new Error(`Unsupported EMAIL_PROVIDER "${env.email.provider}"`);
}
