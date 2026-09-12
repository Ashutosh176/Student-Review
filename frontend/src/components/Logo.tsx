import logoUrl from '@/assets/logo.svg';
import { Link } from 'react-router-dom';

// Official production logo (studentreviews-logo.svg) — rendered unmodified
// per brand guidance. Never redraw, recolor, or replace with a text mark.
export function Logo({ className = 'h-9 w-auto', linkTo = '/' }: { className?: string; linkTo?: string | null }) {
  const img = <img src={logoUrl} alt="StudentReview" className={className} />;
  if (linkTo === null) return img;
  return (
    <Link to={linkTo} className="inline-flex items-center" aria-label="StudentReview home">
      {img}
    </Link>
  );
}
