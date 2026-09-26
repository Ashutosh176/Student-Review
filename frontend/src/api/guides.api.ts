import { api } from './client';
import type { ApiSuccess } from './client';

export type GuideBlock =
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] };

export interface GuideSummary {
  slug: string;
  title: string;
  description: string;
  updatedAt: string;
}

export interface Guide extends GuideSummary {
  blocks: GuideBlock[];
  relatedColleges: { slug: string; name: string; city: string | null }[];
}

export const guidesApi = {
  list: async () => (await api.get<ApiSuccess<GuideSummary[]>>('/guides')).data.data,
  get: async (slug: string) => (await api.get<ApiSuccess<Guide>>(`/guides/${slug}`)).data.data,
};
