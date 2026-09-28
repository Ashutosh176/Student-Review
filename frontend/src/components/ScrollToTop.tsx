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
// #hash links are left to the browser's anchor jump. Keyed on location.key so
// a link to the page you're already on (e.g. the logo on the homepage) also
// scrolls back up — smoothly, since it's the same page.
export function ScrollToTop() {
  const { pathname, search, hash, key } = useLocation();
  const navType = useNavigationType();
  const prev = useRef({ pathname, search });

  useEffect(() => {
    const from = prev.current;
    prev.current = { pathname, search };
    if (navType === 'POP' || hash) return;
    if (from.pathname === pathname) {
      // Same page: only an identical re-click scrolls up. A changed query
      // string is a filter/sort/page change on listing pages — stay put.
      if (from.search === search) window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (section(from.pathname) === section(pathname)) return;
    window.scrollTo(0, 0);
  }, [key, pathname, search, hash, navType]);

  return null;
}
