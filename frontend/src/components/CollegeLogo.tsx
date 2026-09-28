import { useState } from 'react';
import clsx from 'clsx';

export function collegeInitials(name: string): string {
  return name
    .split(' ')
    .filter((w) => w.length > 2 || /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
}

// The college's own mark (self-hosted under /college-logos, taken from its
// official site) on a white tile, or its initials when there's no logo or
// the image fails to load. `contain`, not `cover`: many marks are wide
// wordmarks that cover would crop.
export function CollegeLogo({ name, logoUrl, className }: { name: string; logoUrl?: string | null; className: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(logoUrl) && !failed;
  return (
    <div
      className={clsx(
        'flex flex-none items-center justify-center overflow-hidden font-heading font-extrabold text-brand',
        showImage ? 'border border-line bg-white p-0.5' : 'bg-brand-light',
        className,
      )}
    >
      {showImage ? (
        <img src={logoUrl!} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-contain" />
      ) : (
        collegeInitials(name)
      )}
    </div>
  );
}
