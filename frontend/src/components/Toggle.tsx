import clsx from 'clsx';

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
  description?: string;
}) {
  return (
    <label className={clsx('flex items-start justify-between gap-4 py-2.5', disabled ? 'opacity-60' : 'cursor-pointer')}>
      <span>
        <span className="block text-[13px] font-semibold">{label}</span>
        {description && <span className="mt-0.5 block text-[12px] text-sub">{description}</span>}
      </span>
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-brand' : 'bg-line',
        )}
      >
        <span className={clsx('inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
      </span>
    </label>
  );
}
