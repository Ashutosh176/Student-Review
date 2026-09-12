export function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1 text-2xl">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={n <= value ? 'text-brand' : 'text-line'}
          aria-label={`Rate ${n} out of 5`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
