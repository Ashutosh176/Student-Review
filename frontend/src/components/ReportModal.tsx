import { useState } from 'react';
import clsx from 'clsx';

const REASONS: { value: string; label: string }[] = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'FAKE_REVIEW', label: 'Fake review' },
  { value: 'PERSONAL_INFORMATION', label: 'Personal information' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'HATE_ABUSE', label: 'Hate / abuse' },
  { value: 'IRRELEVANT', label: 'Irrelevant' },
  { value: 'IMPERSONATION', label: 'Impersonation' },
  { value: 'OTHER', label: 'Other' },
];

export function ReportModal({
  open,
  onClose,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details?: string) => void;
  submitting?: boolean;
}) {
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-[420px] rounded-2xl border border-line bg-white p-8 shadow-xl">
        <h2 className="mb-1 text-lg font-bold">Report this content</h2>
        <p className="mb-4 text-xs text-sub">Help us understand what's wrong.</p>
        <div className="mb-4 flex flex-col gap-2">
          {REASONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setReason(r.value)}
              className={clsx(
                'flex items-center justify-between rounded-[10px] border-[1.5px] px-3.5 py-2.5 text-left text-sm font-semibold transition-colors',
                reason === r.value ? 'border-brand bg-brand-light text-brand' : 'border-line bg-white',
              )}
            >
              {r.label}
              <span className={clsx('h-[17px] w-[17px] flex-none rounded-full border-[1.5px]', reason === r.value ? 'border-brand bg-brand' : 'border-line')} />
            </button>
          ))}
        </div>
        {reason === 'OTHER' && (
          <textarea
            className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm"
            placeholder="Tell us more (optional)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        )}
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost flex-1 justify-center" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!reason || submitting}
            className="btn btn-primary flex-1 justify-center"
            onClick={() => reason && onSubmit(reason, details || undefined)}
          >
            {submitting ? 'Submitting…' : 'Submit report'}
          </button>
        </div>
      </div>
    </div>
  );
}
