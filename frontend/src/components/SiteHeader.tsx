import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth.api';
import { defaultDashboardPath } from '@/utils/roles';
import { useHeroVisibilityStore } from '@/store/heroVisibilityStore';
import { useElementWidth } from '@/hooks/useElementWidth';

const NAV_LINKS = [
  { to: '/colleges', label: 'Colleges' },
  { to: '/rankings', label: 'Rankings' },
  { to: '/compare', label: 'Compare' },
];

// Matches the header's rendered height (py-2.5 padding + the h-14 logo) —
// HomePage uses this to offset its IntersectionObserver so scroll progress
// tracks what's visible beneath this sticky header, not the raw viewport.
// Keep in sync if the header's vertical padding/logo size changes.
export const HEADER_HEIGHT_PX = 76;

// Matches the search bar's final width everywhere else it's used inline
// (max-w-[420px] on the old always-visible header form) — the amount of
// space the header search grows into once fully revealed.
const SEARCH_TARGET_WIDTH_PX = 420;

// Short and linear/ease-out on purpose (spec: "not overly bouncy", "no
// excessive easing") — this only smooths between the many discrete
// progress values IntersectionObserver reports; the actual start/end
// values are driven by scroll progress, not by this transition's duration.
const INTERPOLATION_TRANSITION = 'transform 200ms ease-out, width 200ms ease-out, opacity 200ms ease-out';

function AccountControls({ onLogout }: { onLogout: () => void }) {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="ml-auto flex flex-none items-center gap-2.5">
      {user ? (
        <>
          <Link to="/notifications" className="hidden text-base sm:inline" title="Notifications">
            🔔
          </Link>
          <Link to="/saved-colleges" className="hidden text-base sm:inline" title="Saved colleges">
            ☆
          </Link>
          <Link
            to={defaultDashboardPath(user.roles)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-light font-heading text-xs font-bold text-brand"
            title={user.username}
          >
            {user.username.slice(0, 2).toUpperCase()}
          </Link>
          <button type="button" onClick={onLogout} className="hidden text-xs font-semibold text-sub hover:text-brand sm:inline">
            Log out
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">
            Log in
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm hidden sm:inline-flex">
            Sign up
          </Link>
        </>
      )}
    </div>
  );
}

// [nav + search] as ONE group whose CENTER stays fixed in the header's
// middle region — the group is never "on its way to the logo". Every page
// but the homepage renders this at a constant progress of 1 (search fully
// shown, nothing to animate) so the tabs+search sit centered exactly as on
// the homepage's fully-scrolled state; the homepage additionally animates
// `progress` from 0 to 1 as its hero scrolls out. As search grows from 0 to
// its target width, the group's total width grows with it, and centering
// that wider group within the same fixed midpoint naturally pushes its left
// edge (the tabs) left by exactly half the growth while its right edge (the
// search bar) extends right by the other half — one `progress` value, one
// formula, both edges always in sync.
function AnimatedNavSearch({ progress }: { progress: number }) {
  const { ref: middleRef, width: containerWidth } = useElementWidth<HTMLDivElement>();
  const { ref: navRef, width: navWidth } = useElementWidth<HTMLElement>();

  // Real measured layout, not guessed pixels: cap the search's growth so
  // the group can never exceed the middle region's actual width.
  const targetSearchWidth = Math.min(SEARCH_TARGET_WIDTH_PX, Math.max(0, containerWidth - navWidth));
  const searchWidth = targetSearchWidth * progress;
  const groupWidth = navWidth + searchWidth;
  // The group's left edge, such that (left edge + groupWidth/2) always
  // equals containerWidth/2 — i.e. the group's center never moves.
  const groupOffsetPx = Math.max(0, (containerWidth - groupWidth) / 2);

  return (
    <div ref={middleRef} className="hidden min-w-0 flex-1 items-center overflow-hidden md:flex">
      <div className="flex items-center gap-6" style={{ transform: `translateX(${groupOffsetPx}px)`, transition: INTERPOLATION_TRANSITION }}>
        <nav ref={navRef} className="flex flex-none gap-6 text-sm font-semibold text-[#33373A]">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-brand">
              {l.label}
            </Link>
          ))}
        </nav>
        <div
          className="flex-none overflow-hidden"
          style={{ width: `${searchWidth}px`, opacity: progress, transition: INTERPOLATION_TRANSITION }}
          aria-hidden={progress < 0.05}
        >
          {/* Fixed-width inner box holds the search bar at its real final
              size; the outer div above clips it via an animated width. This
              way SearchBar's own `w-full` class has no competing width
              utility to race against. */}
          <div style={{ width: SEARCH_TARGET_WIDTH_PX }} className="flex-none">
            <SearchBar variant="header" className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  // null = no hero registered (any page but the homepage) → static layout.
  // 0..1 = homepage's hero scroll-out progress → animated layout.
  const heroProgress = useHeroVisibilityStore((s) => s.heroProgress);

  async function handleLogout() {
    try {
      await authApi.logout();
    } finally {
      clear();
      navigate('/');
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white print:hidden">
      <div className="flex items-center gap-6 px-4 py-2.5 sm:px-7">
        <Logo className="h-14 w-auto flex-none" />

        <AnimatedNavSearch progress={heroProgress ?? 1} />

        <AccountControls onLogout={handleLogout} />

        <button
          type="button"
          className="ml-1 text-xl md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          ☰
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-line px-4 py-3 md:hidden">
          <SearchBar variant="mobile" />
          <nav className="flex flex-col gap-3 text-sm font-semibold">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}>
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to={defaultDashboardPath(user.roles)} onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <button type="button" className="text-left text-danger" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
