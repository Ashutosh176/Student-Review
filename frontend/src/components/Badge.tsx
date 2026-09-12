import clsx from 'clsx';

export type BadgeKind = 'verified' | 'org' | 'official' | 'pending' | 'flagged' | 'trending';

const CLASS_MAP: Record<BadgeKind, string> = {
  verified: 'badge-verified',
  org: 'badge-org',
  official: 'badge-official',
  pending: 'badge-pending',
  flagged: 'badge-flagged',
  trending: 'badge-trending',
};

export function Badge({ kind, children, className }: { kind: BadgeKind; children: React.ReactNode; className?: string }) {
  return <span className={clsx('badge', CLASS_MAP[kind], className)}>{children}</span>;
}
