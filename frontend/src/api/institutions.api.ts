import { api } from './client';
import type { InstitutionDetail, InstitutionSummary, JobListing, PublicReview, QuestionSummary, ReviewKind } from '@/types';
import type { ApiSuccess } from './client';
import type { CreateInstitutionInput } from './admin.api';

export interface ListInstitutionsParams {
  q?: string;
  state?: string;
  city?: string;
  course?: string;
  type?: string;
  categorySlug?: string;
  verifiedOnly?: boolean;
  sort?: 'relevant' | 'rating' | 'reviews' | 'trending' | 'name';
  page?: number;
  pageSize?: number;
}

export interface SearchFilterOptions {
  states: string[];
  cities: string[];
  categories: { id: string; name: string; slug: string }[];
}

export const institutionsApi = {
  stats: async () => {
    const res = await api.get<ApiSuccess<{ institutionCount: number; verifiedReviewCount: number }>>('/institutions/stats');
    return res.data.data;
  },
  filters: async (state?: string) => {
    const res = await api.get<ApiSuccess<SearchFilterOptions>>('/institutions/filters', { params: state ? { state } : undefined });
    return res.data.data;
  },
  list: async (params: ListInstitutionsParams) => {
    const res = await api.get<ApiSuccess<InstitutionSummary[]>>('/institutions', { params });
    return { items: res.data.data, total: res.data.meta?.total ?? 0 };
  },
  search: async (q: string, limit = 8) => {
    const res = await api.get<ApiSuccess<InstitutionSummary[]>>('/institutions/search', { params: { q, limit } });
    return res.data.data;
  },
  getBySlug: async (slug: string) => {
    const res = await api.get<ApiSuccess<InstitutionDetail>>(`/institutions/${slug}`);
    return res.data.data;
  },
  compare: async (slugs: string[]) => {
    const res = await api.get<ApiSuccess<InstitutionDetail[]>>('/institutions/compare', { params: { slugs: slugs.join(',') } });
    return res.data.data;
  },
  reviews: async (slug: string, params: { sort?: string; verifiedOnly?: boolean; type?: ReviewKind; page?: number; pageSize?: number }) => {
    const res = await api.get<ApiSuccess<PublicReview[]>>(`/institutions/${slug}/reviews`, { params });
    return { items: res.data.data, total: res.data.meta?.total ?? 0 };
  },
  jobs: async (slug: string) => {
    const res = await api.get<ApiSuccess<JobListing[]>>(`/institutions/${slug}/jobs`);
    return res.data.data;
  },
  questions: async (slug: string) => {
    const res = await api.get<ApiSuccess<QuestionSummary[]>>(`/institutions/${slug}/questions`);
    return res.data.data;
  },
  claim: async (
    institutionId: string,
    input: { organizationName: string; officialEmail: string; website?: string; designation?: string; document?: File | null },
  ) => {
    const form = new FormData();
    form.append('organizationName', input.organizationName);
    form.append('officialEmail', input.officialEmail);
    if (input.website) form.append('website', input.website);
    if (input.designation) form.append('designation', input.designation);
    if (input.document) form.append('document', input.document);

    const res = await api.post(`/institutions/${institutionId}/claim`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data as { id: string; status: string; hasDocument: boolean };
  },
  submit: async (input: CreateInstitutionInput) => {
    const res = await api.post<ApiSuccess<InstitutionSummary>>('/institutions', input);
    return res.data.data;
  },
};
