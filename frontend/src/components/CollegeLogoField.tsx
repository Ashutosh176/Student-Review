import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import { apiErrorMessage } from '@/api/client';
import { CollegeLogo } from './CollegeLogo';

const MAX_BYTES = 1024 * 1024;

// Uploads/removes a college's logo immediately (separately from the rest of
// the edit form's Save), since it's a file rather than a form value.
export function CollegeLogoField({ institutionId, name, initialLogoUrl }: { institutionId: string; name: string; initialLogoUrl?: string | null }) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl ?? null);
  const [localError, setLocalError] = useState<string | null>(null);

  const onDone = (res: { logoUrl: string | null }) => {
    setLogoUrl(res.logoUrl);
    qc.invalidateQueries({ queryKey: ['admin', 'institutions'] });
  };
  const upload = useMutation({ mutationFn: (file: File) => adminApi.uploadLogo(institutionId, file), onSuccess: onDone });
  const remove = useMutation({ mutationFn: () => adminApi.removeLogo(institutionId), onSuccess: onDone });
  const busy = upload.isPending || remove.isPending;
  const error = localError ?? (upload.error ? apiErrorMessage(upload.error) : remove.error ? apiErrorMessage(remove.error) : null);

  function onPick(file: File | undefined) {
    if (!file) return;
    setLocalError(null);
    upload.reset();
    remove.reset();
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return setLocalError('Use a PNG, JPEG, or WebP image.');
    if (file.size > MAX_BYTES) return setLocalError('Image must be 1 MB or smaller.');
    upload.mutate(file);
  }

  return (
    <div className="field">
      <label>Logo</label>
      <div className="flex items-center gap-3">
        <CollegeLogo key={logoUrl ?? 'none'} name={name} logoUrl={logoUrl} className="h-14 w-14 rounded-[13px] text-lg" />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            {upload.isPending ? 'Uploading…' : logoUrl ? 'Replace' : 'Upload logo'}
          </button>
          {logoUrl && (
            <button type="button" className="btn btn-sm btn-ghost text-danger" disabled={busy} onClick={() => remove.mutate()}>
              {remove.isPending ? 'Removing…' : 'Remove'}
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            onPick(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      <p className="mt-1 text-[11px] text-sub">Square PNG with a transparent or white background works best. Max 1 MB. Saves immediately.</p>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
