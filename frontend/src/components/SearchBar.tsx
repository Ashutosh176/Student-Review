import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { institutionsApi } from '@/api/institutions.api';

// The one shared implementation behind every search entry point (hero,
// header, mobile menu) — same API call target, same submit/navigate logic,
// same validation. Only markup/sizing differs per `variant`, matching each
// spot's existing look exactly. Typing shows college suggestions (typeahead);
// picking one goes straight to that college, Enter otherwise runs a full search.
export type SearchBarVariant = 'hero' | 'header' | 'mobile' | 'page';

const VARIANT_STYLES: Record<SearchBarVariant, { form: string; input: string; button: string }> = {
  hero: {
    form: 'flex gap-2 rounded-2xl bg-white p-1.5 shadow-lg',
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

const WRAPPER_STYLES: Record<SearchBarVariant, string> = {
  hero: 'relative mx-auto max-w-[540px]',
  header: 'relative w-full',
  mobile: 'relative',
  page: 'relative',
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
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const styles = VARIANT_STYLES[variant];

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 200);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const suggestionsQuery = useQuery({
    queryKey: ['institution-suggest', debounced],
    queryFn: () => institutionsApi.search(debounced, 6),
    enabled: debounced.length >= 2,
    staleTime: 60_000,
  });
  const suggestions = debounced.length >= 2 ? (suggestionsQuery.data ?? []) : [];
  const showList = open && suggestions.length > 0;

  function go(path: string) {
    setOpen(false);
    setActive(-1);
    navigate(path);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (showList && active >= 0 && suggestions[active]) return go(`/college/${suggestions[active].slug}`);
    if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') return setOpen(false);
    if (!showList) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a <= 0 ? suggestions.length - 1 : a - 1));
    }
  }

  return (
    <div ref={wrapRef} className={WRAPPER_STYLES[variant]}>
      <form onSubmit={submit} className={className ? `${styles.form} ${className}` : styles.form}>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={PLACEHOLDERS[variant]}
          className={styles.input}
          role="combobox"
          aria-expanded={showList}
          aria-autocomplete="list"
          autoComplete="off"
        />
        <button type="submit" className={styles.button}>
          {variant === 'mobile' ? 'Go' : 'Search'}
        </button>
      </form>
      {showList && (
        <ul role="listbox" className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-auto rounded-xl border border-line bg-white py-1 text-left shadow-lg">
          {suggestions.map((s, i) => {
            const loc = s.locations[0];
            return (
              <li key={s.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(`/college/${s.slug}`)}
                  className={`block w-full px-3 py-2 text-left ${i === active ? 'bg-brand/10' : ''}`}
                >
                  <span className="block text-[13px] font-semibold text-ink">{s.name}</span>
                  {loc && <span className="block text-[11.5px] text-sub">{[loc.city, loc.state].filter(Boolean).join(', ')}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
