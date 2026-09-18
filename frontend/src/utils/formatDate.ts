export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];
  for (const [secondsInUnit, label] of units) {
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export function relationshipLabel(rel: string): string {
  return { CURRENT_STUDENT: 'Current Student', ALUMNI: 'Alumni', FORMER_STUDENT: 'Former Student', APPLICANT: 'Applicant' }[rel] ?? rel;
}

export function admissionOutcomeLabel(outcome: string): string {
  return { ADMITTED: 'Admitted', REJECTED: 'Rejected', WAITLISTED: 'Waitlisted', WITHDREW: 'Withdrew' }[outcome] ?? outcome;
}
