import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// Share a college page, or invite its students to review it. The invite link
// goes straight to the review form for this college (login/verification
// happens on the way), and the QR code is meant for posters, WhatsApp groups
// and class announcements.
export function ShareCollegeModal({
  open,
  onClose,
  slug,
  name,
}: {
  open: boolean;
  onClose: () => void;
  slug: string;
  name: string;
}) {
  const origin = window.location.origin;
  const pageUrl = `${origin}/college/${slug}`;
  const inviteUrl = `${origin}/write-review?college=${encodeURIComponent(slug)}`;
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState<'page' | 'invite' | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    QRCode.toDataURL(inviteUrl, { width: 480, margin: 1 })
      .then((url) => !cancelled && setQr(url))
      .catch(() => !cancelled && setQr(null));
    return () => {
      cancelled = true;
    };
  }, [open, inviteUrl]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function copy(which: 'page' | 'invite') {
    try {
      await navigator.clipboard.writeText(which === 'page' ? pageUrl : inviteUrl);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard can be blocked (insecure context / permissions) — the link
      // is visible in the input for manual copying.
    }
  }

  const inviteText = `Studied at ${name}? Share an honest, anonymous review to help the next batch of students: ${inviteUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(inviteText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-[440px] overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Share {name}</h2>
            <p className="text-xs text-sub">Send the page, or invite students to review it.</p>
          </div>
          <button type="button" onClick={onClose} className="text-xl leading-none text-sub" aria-label="Close">
            ×
          </button>
        </div>

        <label className="mb-1 block text-[12px] font-semibold">College page</label>
        <div className="mb-4 flex gap-2">
          <input readOnly value={pageUrl} className="min-w-0 flex-1 rounded-md border border-line px-2 py-1.5 text-[12.5px]" onFocus={(e) => e.target.select()} />
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy('page')}>
            {copied === 'page' ? 'Copied ✓' : 'Copy'}
          </button>
        </div>

        <label className="mb-1 block text-[12px] font-semibold">Review invite link</label>
        <p className="mb-1.5 text-[11.5px] text-sub">Opens the review form for this college. Students verify with their college email before posting.</p>
        <div className="mb-3 flex gap-2">
          <input readOnly value={inviteUrl} className="min-w-0 flex-1 rounded-md border border-line px-2 py-1.5 text-[12.5px]" onFocus={(e) => e.target.select()} />
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy('invite')}>
            {copied === 'invite' ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm mb-4 w-full justify-center">
          Share invite on WhatsApp
        </a>

        {qr && (
          <div className="flex flex-col items-center rounded-card border border-line p-4">
            <img src={qr} alt={`QR code linking to the review form for ${name}`} className="h-44 w-44" />
            <p className="mt-2 text-center text-[11.5px] text-sub">Scan to review {name}. Print it on a poster or drop it in a class group.</p>
            <a href={qr} download={`review-${slug}-qr.png`} className="btn btn-ghost btn-sm mt-2">
              Download QR code
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
