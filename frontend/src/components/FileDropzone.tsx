import { useRef, useState } from 'react';
import clsx from 'clsx';

const ACCEPT = '.pdf,.png,.jpg,.jpeg';
const ACCEPT_MIME = new Set(['application/pdf', 'image/png', 'image/jpeg']);
const MAX_SIZE_MB = 5;

export function FileDropzone({
  file,
  onChange,
  error,
  label = 'Supporting document',
  required = false,
  hint,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string | null;
  label?: string;
  required?: boolean;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function validateAndSet(candidate: File | undefined | null) {
    if (!candidate) return;
    if (!ACCEPT_MIME.has(candidate.type)) {
      setLocalError('Only PDF, PNG, or JPEG files are allowed.');
      return;
    }
    if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
      setLocalError(`File is too large (max ${MAX_SIZE_MB}MB).`);
      return;
    }
    setLocalError(null);
    onChange(candidate);
  }

  return (
    <div className="field">
      <label>
        {label} {required ? <span className="font-normal text-danger">(required)</span> : <span className="font-normal text-sub">(optional)</span>}
      </label>
      {hint && <p className="mb-1.5 text-[11.5px] text-sub">{hint}</p>}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          validateAndSet(e.dataTransfer.files?.[0]);
        }}
        className={clsx(
          'cursor-pointer rounded-lg border-[1.5px] border-dashed px-4 py-4 text-center text-[12.5px] transition-colors',
          dragActive ? 'border-brand bg-brand-light text-brand' : 'border-line text-sub hover:border-brand/50',
        )}
      >
        {file ? (
          <span className="font-medium text-ink">
            📄 {file.name}{' '}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="ml-1 text-danger underline"
            >
              Remove
            </button>
          </span>
        ) : (
          <span>⬆ Drag a file or click to upload (PDF, PNG, JPEG — max {MAX_SIZE_MB}MB)</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => validateAndSet(e.target.files?.[0])}
      />
      {(localError || error) && <span className="text-[11.5px] text-danger">{localError ?? error}</span>}
    </div>
  );
}
