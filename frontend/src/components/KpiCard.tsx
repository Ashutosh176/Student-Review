import clsx from 'clsx';

export type TrendKind = 'up' | 'down' | 'warn';

const TREND_CLASS: Record<TrendKind, string> = {
  up: 'text-success',
  down: 'text-danger',
  warn: 'text-warning',
};

export function KpiCard({ label, value, trend, trendKind = 'up' }: { label: string; value: string | number; trend?: string; trendKind?: TrendKind }) {
  return (
    <div className="rounded-card border border-line bg-white px-4 py-3.5">
      <div className="mb-1.5 text-xs text-sub">{label}</div>
      <div className="mb-0.5 font-heading text-[23px] font-extrabold">{value}</div>
      {trend && <div className={clsx('text-[11.5px] font-semibold', TREND_CLASS[trendKind])}>{trend}</div>}
    </div>
  );
}
