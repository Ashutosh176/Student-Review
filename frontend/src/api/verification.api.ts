import { api, unwrap } from './client';
import type { ApiSuccess } from './client';

export type VerificationRelationship = 'CURRENT_STUDENT' | 'ALUMNI' | 'FORMER_STUDENT';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED' | 'REVOKED';
export type VerificationMethod = 'EMAIL_OTP' | 'DOCUMENT_UPLOAD';

export interface MyVerification {
  id: string;
  institutionId: string;
  institution: { name: string; slug: string };
  relationship: VerificationRelationship;
  method: VerificationMethod;
  status: VerificationStatus;
  universityEmail: string | null;
  documentNote: string | null;
  rejectionReason: string | null;
  hasDocument: boolean;
  verifiedAt: string | null;
  createdAt: string;
}

export const verificationApi = {
  mine: async () => {
    const res = await api.get<ApiSuccess<MyVerification[]>>('/verifications/mine');
    return res.data.data;
  },
  start: (input: { institutionId: string; relationship: VerificationRelationship; universityEmail: string }) =>
    unwrap<{ id: string; status: string }>(api.post('/verifications/start', input)),
  verifyOtp: (input: { institutionId: string; code: string }) =>
    unwrap<{ id: string; status: string }>(api.post('/verifications/verify-otp', input)),
  resendOtp: (institutionId: string) => unwrap<{ id: string; status: string }>(api.post('/verifications/resend-otp', { institutionId })),
  cancel: (institutionId: string) => unwrap<{ id: string; status: string }>(api.post('/verifications/cancel', { institutionId })),
  submitDocument: async (input: { institutionId: string; relationship: VerificationRelationship; note?: string; document: File }) => {
    const form = new FormData();
    form.append('institutionId', input.institutionId);
    form.append('relationship', input.relationship);
    if (input.note) form.append('note', input.note);
    form.append('document', input.document);
    const res = await api.post<ApiSuccess<{ id: string; status: string }>>('/verifications/document', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
};
