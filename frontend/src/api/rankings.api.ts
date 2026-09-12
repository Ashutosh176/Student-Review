import { api } from './client';
import type { ApiSuccess } from './client';
import type { RankingRow } from '@/types';

export type RankingMetric =
  | 'OVERALL'
  | 'PLACEMENT'
  | 'FACULTY'
  | 'INFRASTRUCTURE'
  | 'CAMPUS_LIFE'
  | 'VALUE_FOR_MONEY'
  | 'MOST_REVIEWED'
  | 'TRENDING';

export const rankingsApi = {
  get: async (metric: RankingMetric, limit = 20) => {
    const res = await api.get<ApiSuccess<RankingRow[]>>('/rankings', { params: { metric, limit } });
    return res.data.data;
  },
};
