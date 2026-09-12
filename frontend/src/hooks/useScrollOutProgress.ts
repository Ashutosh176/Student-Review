import { useEffect, useRef, useState } from 'react';

// Continuous 0..1 "how far has this element scrolled out from under the
// fixed/sticky region described by `rootMargin`" — driven by
// IntersectionObserver's intersectionRatio, not a scroll listener. A dense
// threshold list makes the observer fire at many intermediate ratios (still
// far cheaper than a per-pixel scroll handler) so the value can drive a
// smooth, scroll-linked animation instead of a single boolean flip.
//
// 0   = element fully visible within the observed region
// 1   = element has completely left the observed region
export function useScrollOutProgress<T extends Element>(rootMargin: string) {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const threshold = Array.from({ length: 51 }, (_, i) => i / 50);
    const observer = new IntersectionObserver(
      ([entry]) => setProgress(Math.min(1, Math.max(0, 1 - entry.intersectionRatio))),
      { rootMargin, threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, progress };
}
