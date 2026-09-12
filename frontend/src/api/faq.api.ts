import { api } from './client';
import type { ApiSuccess } from './client';

export interface PublicFaq {
  id: string;
  question: string;
  answer: string;
}

export const faqApi = {
  list: async () => {
    const res = await api.get<ApiSuccess<PublicFaq[]>>('/faqs');
    return res.data.data;
  },
};
