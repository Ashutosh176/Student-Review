export function Stars({ value, size = 'text-sm' }: { value: number; size?: string }) {
  const full = Math.round(value);
  return (
    <span className={`text-brand tracking-wide ${size}`} aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {'★★★★★'.slice(0, full)}
      <span className="text-line">{'★★★★★'.slice(full)}</span>
    </span>
  );
}
