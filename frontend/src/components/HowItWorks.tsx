import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  institutionCount?: number;
}

const iconProps = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const SearchIcon = (
  <svg {...iconProps}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
const BookIcon = (
  <svg {...iconProps}>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" />
    <path d="M8 7h7M8 11h5" />
  </svg>
);
const PenIcon = (
  <svg {...iconProps}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
  </svg>
);

/** Animates 0 → target once `start` flips true. */
function useCountUp(target: number, start: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return value;
}

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${shown ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function HowItWorks({ institutionCount }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const count = useCountUp(institutionCount ?? 0, inView && !!institutionCount);

  // Parallax: write a single --p custom property (-1..1, section centre relative
  // to viewport centre); each layer scales it with its own multiplier in CSS.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      el.style.setProperty('--p', String(Math.max(-1.5, Math.min(1.5, p))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { threshold: 0.25 });
    io.observe(el);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const steps = [
    {
      icon: SearchIcon,
      title: 'Find your college',
      desc: institutionCount ? `Search ${count}+ Indian colleges and universities in seconds.` : 'Search Indian colleges and universities in seconds.',
    },
    { icon: BookIcon, title: 'Read real experiences', desc: 'Anonymous, verified reviews across placements, faculty, hostel life and more.' },
    { icon: PenIcon, title: 'Share your story', desc: 'Help the next batch of students by sharing your honest take — anonymously.' },
  ];

  return (
    <section
      ref={sectionRef}
      style={{ ['--p' as string]: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-brand-deep via-brand-dark to-brand px-4 py-20 text-white sm:px-7"
    >
      {/* parallax layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-info/30 blur-3xl will-change-transform"
          style={{ transform: 'translate3d(0, calc(var(--p) * -140px), 0)' }}
        />
        <div
          className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-trending/20 blur-3xl will-change-transform"
          style={{ transform: 'translate3d(0, calc(var(--p) * 180px), 0)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.07] will-change-transform"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            transform: 'translate3d(0, calc(var(--p) * -60px), 0)',
          }}
        />
        <div
          className="absolute right-[12%] top-16 h-16 w-16 rotate-12 rounded-2xl border border-white/20 will-change-transform"
          style={{ transform: 'translate3d(0, calc(var(--p) * -90px), 0) rotate(calc(var(--p) * 40deg))' }}
        />
        <div
          className="absolute bottom-20 left-[8%] h-10 w-10 rounded-full border border-white/20 will-change-transform"
          style={{ transform: 'translate3d(0, calc(var(--p) * 110px), 0)' }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <Reveal className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/85">
            Simple &amp; transparent
          </span>
          <h3 className="text-2xl sm:text-4xl">How StudentReview works</h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/70">Three steps from confusion to a confident college decision.</p>
        </Reveal>

        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* connector line (desktop) */}
          <div aria-hidden className="absolute left-[16%] right-[16%] top-10 hidden h-px border-t border-dashed border-white/30 md:block" />

          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 150}>
              <div className="group relative h-full rounded-2xl border border-white/15 bg-white/10 p-6 pt-12 text-center shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-white/40 hover:bg-white/15">
                <span className="absolute -top-1 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand shadow-lg ring-4 ring-brand-dark/60 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  {s.icon}
                </span>
                <span className="absolute right-4 top-3 font-heading text-4xl font-extrabold text-white/10">0{i + 1}</span>
                <h4 className="mb-2 text-base">{s.title}</h4>
                <p className="text-sm leading-relaxed text-white/75">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={450} className="mt-12 text-center">
          <Link
            to="/trust"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:gap-3 hover:bg-white hover:text-brand"
          >
            How we verify students &amp; keep reviews anonymous <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
