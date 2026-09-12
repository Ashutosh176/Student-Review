const CATEGORY_LABELS: Record<string, string> = {
  OVERALL: 'Overall',
  PLACEMENT: 'Placement',
  FACULTY: 'Faculty',
  INFRASTRUCTURE: 'Infrastructure',
  ADMINISTRATION: 'Administration',
  CAMPUS_LIFE: 'Campus Life',
  VALUE_FOR_MONEY: 'Value for Money',
  HOSTEL: 'Hostel',
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function RatingBar({ category, value }: { category: string; value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <div className="mb-2 flex items-center gap-2.5 text-xs">
      <span className="w-28 flex-none text-sub">{categoryLabel(category)}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-7 text-right font-semibold">{value ? value.toFixed(1) : '—'}</span>
    </div>
  );
}
