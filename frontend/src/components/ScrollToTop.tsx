import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Pages that are one view with tabs as sub-routes (/college/:slug/:tab,
// /rankings/:metric). Switching tabs shouldn't yank the reader back above the
// header, so a change within the same section keeps its scroll position.
function section(pathname: string): string {
  const m = /^\/(college\/[^/]+|rankings)(\/|$)/.exec(pathname);
  return m ? m[1] : pathname;
}

// React Router doesn't reset scroll on navigation, so a link clicked at the
// bottom of one page (e.g. the footer) opened the next page scrolled down.
// Back/forward (POP) is left to the browser's own scroll restoration, and
// #hash links are left to the browser's anchor jump.
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();
  const prev = useRef(pathname);

  useEffect(() => {
    const from = prev.current;
    prev.current = pathname;
    if (navType === 'POP' || hash || from === pathname || section(from) === section(pathname)) return;
    window.scrollTo(0, 0);
  }, [pathname, hash, navType]);

  return null;
}
