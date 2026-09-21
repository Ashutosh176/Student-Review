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

// "smail.iitm.ac.in" -> ["smail.iitm.ac.in", "iitm.ac.in", "ac.in"]. Public
// suffixes are harmless in the list: nothing registers "ac.in" as an institution domain.
export function parentDomains(domain: string): string[] {
  const parts = domain.split('.');
  return parts.map((_, i) => parts.slice(i).join('.')).filter((d) => d.includes('.'));
}

export function extractEmailDomain(email: string): string {
  return email.toLowerCase().split('@')[1] ?? '';
}
