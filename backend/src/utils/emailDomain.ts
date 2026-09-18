// Shared by anything that needs to assert "this is an official institution
// email, not a personal inbox" — student college-email verification and
// organization profile claims both gate on it.
export const GENERIC_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'yahoo.co.in',
  'outlook.com',
  'hotmail.com',
  'protonmail.com',
  'proton.me',
  'icloud.com',
  'aol.com',
  'live.com',
  'msn.com',
  'rediffmail.com',
  'zoho.com',
  'mail.com',
  'gmx.com',
]);

export function extractEmailDomain(email: string): string {
  return email.toLowerCase().split('@')[1] ?? '';
}
