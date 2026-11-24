import axios from 'axios';
import { Link } from 'react-router-dom';

// True when the API refused a request because the organization's plan is too
// low (backend plan.service requirePlan → 403 with details.code PLAN_REQUIRED).
export function isPlanRequiredError(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false;
  const details = (err.response?.data as { details?: { code?: string } } | undefined)?.details;
  return err.response?.status === 403 && details?.code === 'PLAN_REQUIRED';
}

export function UpgradePrompt({ plan, title, features }: { plan: 'Pro' | 'Business'; title: string; features: string[] }) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-3 text-3xl" aria-hidden>
        🔒
      </div>
      <span className="mb-2 rounded-full bg-brand-light px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand">{plan} plan</span>
      <p className="mb-2 font-semibold text-ink">{title}</p>
      <ul className="mb-5 max-w-sm text-left text-sm text-sub">
        {features.map((f) => (
          <li key={f} className="mt-1">
            ✓ {f}
          </li>
        ))}
      </ul>
      <Link to="/organization/settings" className="btn btn-primary btn-sm">
        Upgrade to {plan}
      </Link>
    </div>
  );
}

export const PRO_FEATURES = [
  'Response rate and verified-review share',
  'Overall rating trend, month by month',
  'Sentiment of your reviews, and by topic (placements, faculty, hostel and more)',
];

export const BUSINESS_FEATURES = ['Post job and internship listings on your college profile', 'Listed first in the default college listing'];
