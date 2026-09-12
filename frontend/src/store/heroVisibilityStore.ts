import { create } from 'zustand';

interface HeroVisibilityState {
  // null = no page currently has a hero registered (i.e. we're not on the
  // homepage) — the header renders its normal, final, always-visible-search
  // layout. 0..1 = the homepage's hero is mounted; 0 = fully visible (top of
  // page), 1 = fully scrolled out from under the sticky header. Continuous,
  // not boolean, so the header can interpolate rather than snap.
  heroProgress: number | null;
  setHeroProgress: (progress: number) => void;
  clearHero: () => void;
}

// Shared between HomePage (the only page that registers a hero) and
// SiteHeader (which reads it to drive the nav/search transition) — they
// aren't parent/child, so this is simpler than threading a ref or prop
// through the router's Outlet boundary.
export const useHeroVisibilityStore = create<HeroVisibilityState>((set) => ({
  heroProgress: null,
  setHeroProgress: (progress) => set({ heroProgress: progress }),
  clearHero: () => set({ heroProgress: null }),
}));
