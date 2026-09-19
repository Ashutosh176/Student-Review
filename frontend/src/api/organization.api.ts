import { api, unwrap } from './client';
import type { ApiSuccess } from './client';
import type { InstitutionDetail, JobListing } from '@/types';

interface OrgMembership {
  role: 'OWNER' | 'ADMIN' | 'EDITOR';
  organization: { id: string; plan: string; contactEmail?: string | null };
  institution: InstitutionDetail;
}

interface OrgAnalytics {
  totalReviews: number;
  verifiedReviews: number;
  responseRate: number;
  unansweredCount: number;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  ratingTrend: { month: string; average: number }[];
}

interface TopicSentiment {
  topic: string;
  mentionCount: number;
  positive: number;
  neutral: number;
  negative: number;
}

interface BillingPayment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  provider: string;
  createdAt: string;
}

interface BillingInfo {
  subscription: { id: string; plan: 'FREE' | 'PRO' | 'BUSINESS'; status: string; currentPeriodEnd: string | null } | null;
  payments: BillingPayment[];
  razorpayEnabled: boolean;
}

interface CheckoutOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  plan: 'PRO' | 'BUSINESS';
}

export const organizationApi = {
  me: () => unwrap<OrgMembership>(api.get('/organization/me')),
  updateProfile: (input: { description?: string; contactEmail?: string; website?: string }) =>
    unwrap(api.patch('/organization/profile', input)),
  members: async () => {
    const res = await api.get<
      ApiSuccess<{ id: string; role: string; status: string; invitedEmail: string | null; user: { username: string; email: string } | null }[]>
    >('/organization/members');
    return res.data.data;
  },
  invite: (email: string, role: 'ADMIN' | 'EDITOR') => unwrap(api.post('/organization/members', { email, role })),
  removeMember: (memberId: string) => unwrap(api.delete(`/organization/members/${memberId}`)),
  getInvite: (token: string) =>
    unwrap<{ institutionName: string; institutionSlug: string; role: 'ADMIN' | 'EDITOR'; email: string }>(
      api.get(`/organization/invites/${token}`),
    ),
  acceptInvite: (token: string) => unwrap(api.post(`/organization/invites/${token}/accept`)),
  analytics: () => unwrap<OrgAnalytics>(api.get('/organization/analytics')),
  sentiment: async () => {
    const res = await api.get<ApiSuccess<TopicSentiment[]>>('/organization/sentiment');
    return res.data.data;
  },
  jobs: async () => {
    const res = await api.get<ApiSuccess<JobListing[]>>('/organization/jobs');
    return res.data.data;
  },
  createJob: (input: Record<string, unknown>) => unwrap<JobListing>(api.post('/organization/jobs', input)),
  publishJob: (jobId: string) => unwrap<JobListing>(api.post(`/organization/jobs/${jobId}/publish`)),
  publicPlanPrices: () => unwrap<{ pro: number; business: number }>(api.get('/organization/public-plan-prices')),
  planPrices: () => unwrap<{ pro: number; business: number }>(api.get('/organization/plan-prices')),
  billing: () => unwrap<BillingInfo>(api.get('/organization/billing')),
  checkout: (plan: 'PRO' | 'BUSINESS') => unwrap<CheckoutOrder>(api.post('/organization/billing/checkout', { plan })),
  verifyPayment: (input: { orderId: string; paymentId: string; signature: string }) =>
    unwrap(api.post('/organization/billing/verify', input)),
};

export type { OrgMembership, OrgAnalytics, TopicSentiment, BillingInfo, BillingPayment, CheckoutOrder };
