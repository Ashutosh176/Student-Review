import clsx from 'clsx';

export function WizardShell({ step, total, label, children }: { step: number; total: number; label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-surface px-4 pb-14 pt-9">
      <div className="mb-1.5 h-1.5 w-full max-w-[480px] overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(step / total) * 100}%` }} />
      </div>
      <div className="mb-6 flex w-full max-w-[480px] justify-between text-xs text-sub">
        <span>
          Step {step} of {total}
        </span>
        <span>{label}</span>
      </div>
      <div className="w-full max-w-[480px]">{children}</div>
    </div>
  );
}

export function OptionCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'mb-2.5 flex w-full items-center justify-between rounded-[10px] border-[1.5px] px-4 py-3.5 text-left text-sm font-semibold transition-colors',
        selected ? 'border-brand bg-brand-light text-brand' : 'border-line bg-white text-ink',
      )}
    >
      {children}
      <span className={clsx('h-[17px] w-[17px] flex-none rounded-full border-[1.5px]', selected ? 'border-brand bg-brand' : 'border-line')} />
    </button>
  );
}
