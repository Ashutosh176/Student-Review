import { api, unwrap } from './client';
import type { ApiSuccess } from './client';
import { INSTITUTION_TYPES } from '@/utils/institutionTypes';

export { INSTITUTION_TYPES };

interface DashboardStats {
  totalUsers: number;
  totalReviews: number;
  pendingModeration: number;
  pendingInstitutions: number;
  reportsLast24h: number;
  topInstitutions: { name?: string; reviews: number }[];
}

export interface AdminUserRow {
  id: string;
  username: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DEACTIVATED';
  roles: { role: { name: string } }[];
  _count: { reviews: number };
}

export interface AdminModerationRow {
  id: string;
  body: string;
  status: string;
  riskScore: number;
  moderationNotes?: string | null;
  createdAt: string;
  institution: { name: string; slug: string };
  _count: { reports: number };
}

export interface AdminReportRow {
  id: string;
  reason: string;
  details?: string | null;
  status: string;
  createdAt: string;
  review: { id: string; body: string; institution: { name: string } };
}

export interface AdminQuestionReportRow {
  id: string;
  reason: string;
  details?: string | null;
  status: string;
  createdAt: string;
  question: { id: string; title: string; status: string; institution: { name: string } };
}

export interface AdminAnswerReportRow {
  id: string;
  reason: string;
  details?: string | null;
  status: string;
  createdAt: string;
  answer: { id: string; body: string; status: string; question: { title: string } };
}

export interface AdminClaimRow {
  id: string;
  organizationName: string;
  officialEmail: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  hasDocument: boolean;
  createdAt: string;
  institution: { name: string; slug: string };
  user: { username: string; email: string };
}

export interface AdminVerificationRow {
  id: string;
  relationship: 'CURRENT_STUDENT' | 'ALUMNI' | 'FORMER_STUDENT';
  method: 'EMAIL_OTP' | 'DOCUMENT_UPLOAD';
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED' | 'REVOKED';
  universityEmail: string | null;
  documentNote: string | null;
  rejectionReason: string | null;
  hasDocument: boolean;
  createdAt: string;
  user: { username: string; email: string };
  institution: { name: string; slug: string };
}

export interface AdminInstitutionEmailDomain {
  id: string;
  institutionId: string;
  domain: string;
  createdAt: string;
}

export interface AdminCourseRow {
  id: string;
  institutionId: string;
  name: string;
  level: string;
  department?: string | null;
  durationYears?: number | null;
  feePerYearInr?: number | null;
  totalFeeInr?: number | null;
}

export interface AdminAdmissionCutoffRow {
  id: string;
  institutionId: string;
  courseId: string;
  course: { name: string };
  examName: string;
  category: string;
  year: number;
  openingRank?: number | null;
  closingRank?: number | null;
  percentile?: number | null;
}

export interface CreateCourseInput {
  name: string;
  level: 'UG' | 'PG' | 'DOCTORATE' | 'DIPLOMA';
  department?: string;
  durationYears?: number;
  feePerYearInr?: number;
  totalFeeInr?: number;
}

export interface CreateAdmissionCutoffInput {
  courseId: string;
  examName: string;
  category: string;
  year: number;
  openingRank?: number;
  closingRank?: number;
  percentile?: number;
}

export interface AdminJobRow {
  id: string;
  title: string;
  type: 'JOB' | 'INTERNSHIP';
  locationType: 'ONSITE' | 'REMOTE' | 'HYBRID';
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  createdAt: string;
  institution: { name: string; slug: string };
}

export interface AdminPaymentRow {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  provider: string;
  createdAt: string;
  subscription: {
    plan: 'FREE' | 'PRO' | 'BUSINESS';
    organizationProfile: { institution: { name: string; slug: string } };
  };
}

export interface AdminInstitutionRow {
  id: string;
  name: string;
  slug: string;
  type: string;
  verified: boolean;
  featured: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  submittedBy?: { username: string; email: string } | null;
  locations: { city: string; state: string }[];
  _count: { reviews: number };
  entranceExams: string[];
  aiSummary?: string | null;
  aiSummaryUpdatedAt?: string | null;
}

export interface CreateInstitutionInput {
  name: string;
  type: (typeof INSTITUTION_TYPES)[number];
  city: string;
  state: string;
  establishedYear?: number;
  website?: string;
  description?: string;
  categoryId?: string;
}

export interface PlatformSettings {
  reportAutoFlagThreshold: number;
  rapidSubmissionWindowMinutes: number;
  rapidSubmissionCount: number;
  minReviewsForRanking: number;
}

export interface AdminFaqRow {
  id: string;
  question: string;
  answer: string;
  order: number;
  published: boolean;
}

export interface AdminCategoryRow {
  id: string;
  name: string;
  slug: string;
  _count: { institutions: number };
}

export const adminApi = {
  dashboard: () => unwrap<DashboardStats>(api.get('/admin/dashboard')),
  analytics: () => unwrap<{ dailyActiveUsers: number; newUsers7d: number; reviewsApproved7d: number; reviewsRejected7d: number }>(api.get('/admin/analytics')),

  users: async (params: { q?: string; page?: number; pageSize?: number }) => {
    const res = await api.get<ApiSuccess<AdminUserRow[]>>('/admin/users', { params });
    return { items: res.data.data, total: res.data.meta?.total ?? 0 };
  },
  setUserStatus: (id: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED', reason?: string) =>
    unwrap(api.patch(`/admin/users/${id}/status`, { status, reason })),
  setUserRole: (id: string, role: 'STUDENT' | 'ORGANIZATION' | 'MODERATOR' | 'ADMIN', grant: boolean) =>
    unwrap<{ id: string; username: string; email: string; roles: { role: { name: string } }[] }>(
      api.patch(`/admin/users/${id}/roles`, { role, grant }),
    ),

  moderationQueue: async (params: { page?: number; pageSize?: number }) => {
    const res = await api.get<ApiSuccess<AdminModerationRow[]>>('/admin/moderation/queue', { params });
    return { items: res.data.data, total: res.data.meta?.total ?? 0 };
  },
  moderateAction: (id: string, action: 'APPROVE' | 'HIDE' | 'REMOVE' | 'REQUEST_CLARIFICATION', reason?: string) =>
    unwrap(api.post(`/admin/moderation/${id}/action`, { action, reason })),

  reports: async (params: { status?: string; page?: number; pageSize?: number }) => {
    const res = await api.get<ApiSuccess<AdminReportRow[]>>('/admin/reports', { params });
    return { items: res.data.data, total: res.data.meta?.total ?? 0 };
  },
  dismissReport: (id: string) => unwrap(api.post(`/admin/reports/${id}/dismiss`)),

  questionReports: async (params: { status?: string; page?: number; pageSize?: number }) => {
    const res = await api.get<ApiSuccess<AdminQuestionReportRow[]>>('/admin/question-reports', { params });
    return { items: res.data.data, total: res.data.meta?.total ?? 0 };
  },
  dismissQuestionReport: (id: string) => unwrap(api.post(`/admin/question-reports/${id}/dismiss`)),
  moderateQuestion: (id: string, action: 'APPROVE' | 'REMOVE', reason?: string) => unwrap(api.post(`/admin/questions/${id}/moderate`, { action, reason })),

  answerReports: async (params: { status?: string; page?: number; pageSize?: number }) => {
    const res = await api.get<ApiSuccess<AdminAnswerReportRow[]>>('/admin/answer-reports', { params });
    return { items: res.data.data, total: res.data.meta?.total ?? 0 };
  },
  dismissAnswerReport: (id: string) => unwrap(api.post(`/admin/answer-reports/${id}/dismiss`)),
  moderateAnswer: (id: string, action: 'APPROVE' | 'REMOVE', reason?: string) => unwrap(api.post(`/admin/answers/${id}/moderate`, { action, reason })),

  claims: async (status?: string) => {
    const res = await api.get<ApiSuccess<AdminClaimRow[]>>('/admin/claims', { params: { status } });
    return res.data.data;
  },
  decideClaim: (id: string, decision: 'APPROVED' | 'REJECTED', reason?: string) =>
    unwrap(api.post(`/admin/claims/${id}/decision`, { decision, reason })),
  downloadClaimDocument: async (id: string) => {
    const res = await api.get(`/admin/claims/${id}/document`, { responseType: 'blob' });
    const disposition = res.headers['content-disposition'] as string | undefined;
    const filename = disposition?.match(/filename="?([^"]+)"?/)?.[1] ?? 'claim-document';
    const url = window.URL.createObjectURL(res.data as Blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  verifications: async (status?: string) => {
    const res = await api.get<ApiSuccess<AdminVerificationRow[]>>('/admin/verifications', { params: { status } });
    return res.data.data;
  },
  decideVerification: (id: string, decision: 'APPROVED' | 'REJECTED', reason?: string) =>
    unwrap(api.post(`/admin/verifications/${id}/decision`, { decision, reason })),
  revokeVerification: (id: string, reason?: string) => unwrap(api.post(`/admin/verifications/${id}/revoke`, { reason })),
  downloadVerificationDocument: async (id: string) => {
    const res = await api.get(`/admin/verifications/${id}/document`, { responseType: 'blob' });
    const disposition = res.headers['content-disposition'] as string | undefined;
    const filename = disposition?.match(/filename="?([^"]+)"?/)?.[1] ?? 'verification-document';
    const url = window.URL.createObjectURL(res.data as Blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  emailDomains: async (institutionId: string) => {
    const res = await api.get<ApiSuccess<AdminInstitutionEmailDomain[]>>(`/admin/institutions/${institutionId}/email-domains`);
    return res.data.data;
  },
  addEmailDomain: (institutionId: string, domain: string) =>
    unwrap<AdminInstitutionEmailDomain>(api.post(`/admin/institutions/${institutionId}/email-domains`, { domain })),
  removeEmailDomain: (institutionId: string, domainId: string) =>
    unwrap(api.delete(`/admin/institutions/${institutionId}/email-domains/${domainId}`)),

  courses: async (institutionId: string) => {
    const res = await api.get<ApiSuccess<AdminCourseRow[]>>(`/admin/institutions/${institutionId}/courses`);
    return res.data.data;
  },
  createCourse: (institutionId: string, input: CreateCourseInput) =>
    unwrap<AdminCourseRow>(api.post(`/admin/institutions/${institutionId}/courses`, input)),
  updateCourse: (courseId: string, input: Partial<CreateCourseInput>) => unwrap<AdminCourseRow>(api.patch(`/admin/courses/${courseId}`, input)),
  deleteCourse: (courseId: string) => unwrap(api.delete(`/admin/courses/${courseId}`)),

  setEntranceExams: (institutionId: string, examNames: string[]) =>
    unwrap(api.patch(`/admin/institutions/${institutionId}/entrance-exams`, { examNames })),

  admissionCutoffs: async (institutionId: string) => {
    const res = await api.get<ApiSuccess<AdminAdmissionCutoffRow[]>>(`/admin/institutions/${institutionId}/admission-cutoffs`);
    return res.data.data;
  },
  createAdmissionCutoff: (institutionId: string, input: CreateAdmissionCutoffInput) =>
    unwrap<AdminAdmissionCutoffRow>(api.post(`/admin/institutions/${institutionId}/admission-cutoffs`, input)),
  deleteAdmissionCutoff: (id: string) => unwrap(api.delete(`/admin/admission-cutoffs/${id}`)),

  regenerateAiSummary: (institutionId: string) =>
    unwrap<{ aiSummary: string }>(api.post(`/admin/institutions/${institutionId}/ai-summary/regenerate`)),

  institutions: async (params: { page?: number; pageSize?: number; status?: 'PENDING' | 'APPROVED' | 'REJECTED' }) => {
    const res = await api.get<ApiSuccess<AdminInstitutionRow[]>>('/admin/institutions', { params });
    return { items: res.data.data, total: res.data.meta?.total ?? 0 };
  },
  setFeatured: (id: string, featured: boolean) => unwrap(api.patch(`/admin/institutions/${id}/featured`, { featured })),
  createInstitution: (input: CreateInstitutionInput) => unwrap<AdminInstitutionRow>(api.post('/admin/institutions', input)),
  decideInstitution: (id: string, decision: 'APPROVED' | 'REJECTED', reason?: string) =>
    unwrap(api.post(`/admin/institutions/${id}/decision`, { decision, reason })),
  categories: async () => {
    const res = await api.get<ApiSuccess<AdminCategoryRow[]>>('/admin/categories');
    return res.data.data;
  },
  createCategory: (name: string) => unwrap<AdminCategoryRow>(api.post('/admin/categories', { name })),
  recomputeRankings: () => unwrap<Record<string, number>>(api.post('/admin/rankings/recompute')),

  payments: async (params: { page?: number; pageSize?: number }) => {
    const res = await api.get<ApiSuccess<AdminPaymentRow[]>>('/admin/payments', { params });
    return { items: res.data.data, total: res.data.meta?.total ?? 0 };
  },

  jobs: async (params: { page?: number; pageSize?: number }) => {
    const res = await api.get<ApiSuccess<AdminJobRow[]>>('/admin/jobs', { params });
    return { items: res.data.data, total: res.data.meta?.total ?? 0 };
  },
  setJobStatus: (id: string, status: 'PUBLISHED' | 'CLOSED') => unwrap(api.patch(`/admin/jobs/${id}/status`, { status })),

  faqs: async () => {
    const res = await api.get<ApiSuccess<AdminFaqRow[]>>('/admin/faqs');
    return res.data.data;
  },
  createFaq: (input: { question: string; answer: string; order?: number; published?: boolean }) =>
    unwrap<AdminFaqRow>(api.post('/admin/faqs', input)),
  updateFaq: (id: string, input: Partial<{ question: string; answer: string; order: number; published: boolean }>) =>
    unwrap<AdminFaqRow>(api.patch(`/admin/faqs/${id}`, input)),
  deleteFaq: (id: string) => unwrap(api.delete(`/admin/faqs/${id}`)),

  platformSettings: () => unwrap<PlatformSettings>(api.get('/admin/settings')),
  updatePlatformSettings: (input: Partial<PlatformSettings>) => unwrap<PlatformSettings>(api.patch('/admin/settings', input)),
};
