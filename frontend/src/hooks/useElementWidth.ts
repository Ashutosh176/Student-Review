import { useEffect, useRef, useState } from 'react';

// Tracks an element's real rendered width via ResizeObserver — used so the
// header transition's start/end positions come from actual layout
// measurements (nav's natural width, the space available for it) rather
// than guessed pixel values, and stay correct across viewport widths.
export function useElementWidth<T extends Element>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    setWidth(node.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
