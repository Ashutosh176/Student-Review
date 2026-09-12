import { useEffect, useRef, useState } from 'react';

// Reusable, performant viewport-visibility hook backed by IntersectionObserver
// — no scroll-event listeners, no per-pixel recalculation. `rootMargin` lets
// a caller offset the effective viewport (e.g. to account for a sticky
// header covering part of the real viewport).
export function useInView<T extends Element>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), options);
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.root, options?.rootMargin, options?.threshold]);

  return { ref, inView };
}
