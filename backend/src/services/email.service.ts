import { Resend } from 'resend';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// Abstracted so a real provider (SES, Postmark, Resend, ...) can be dropped
// in later by adding a case here — nothing else in the codebase should ever
// touch an email SDK directly (spec §39).
interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

let resendClient: Resend | null = null;
function getResendClient(): Resend {
  resendClient ??= new Resend(env.email.resendApiKey);
  return resendClient;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (env.email.provider === 'console') {
    logger.info({ to: input.to, subject: input.subject }, 'Email (console provider) — not actually sent');
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
