import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// The one shared implementation behind every search entry point (hero,
// header, mobile menu) — same API call target, same submit/navigate logic,
// same validation. Only markup/sizing differs per `variant`, matching each
// spot's existing look exactly.
export type SearchBarVariant = 'hero' | 'header' | 'mobile' | 'page';

const VARIANT_STYLES: Record<SearchBarVariant, { form: string; input: string; button: string }> = {
  hero: {
    form: 'mx-auto flex max-w-[540px] gap-2 rounded-2xl bg-white p-1.5 shadow-lg',
    input: 'flex-1 rounded-xl border-none px-3 py-2.5 text-sm text-ink outline-none',
    button: 'btn btn-primary',
  },
  header: {
    form: 'flex w-full',
    input: 'flex-1 rounded-l-md border border-r-0 border-line px-3 py-2 text-[12.5px] outline-none focus:border-brand',
    button: 'rounded-r-md bg-brand px-4 text-[12.5px] font-semibold text-white',
  },
  mobile: {
    form: 'mb-3 flex',
    input: 'flex-1 rounded-l-md border border-r-0 border-line px-3 py-2 text-sm outline-none',
    button: 'rounded-r-md bg-brand px-4 text-sm font-semibold text-white',
  },
  page: {
    form: 'flex gap-2.5 rounded-card border border-line bg-white p-2.5',
    input: 'flex-1 border-none text-sm outline-none',
    button: 'btn btn-primary btn-sm',
  },
};

const PLACEHOLDERS: Record<SearchBarVariant, string> = {
  hero: 'Search for a college or university...',
  header: 'Search for a college or university...',
  mobile: 'Search for a college...',
  page: 'Search colleges, cities, courses...',
};

export function SearchBar({ variant, className, initialValue = '' }: { variant: SearchBarVariant; className?: string; initialValue?: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState(initialValue);
  const styles = VARIANT_STYLES[variant];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form onSubmit={submit} className={className ? `${styles.form} ${className}` : styles.form}>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={PLACEHOLDERS[variant]} className={styles.input} />
      <button type="submit" className={styles.button}>
        {variant === 'mobile' ? 'Go' : 'Search'}
      </button>
    </form>
  );
}
