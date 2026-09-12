import { z } from 'zod';

const relationshipEnum = z.enum(['CURRENT_STUDENT', 'ALUMNI', 'FORMER_STUDENT']);

export const startEmailVerificationSchema = z.object({
  institutionId: z.string().uuid(),
  relationship: relationshipEnum,
  universityEmail: z.string().email(),
});

export const verifyOtpSchema = z.object({
  institutionId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export const resendOtpSchema = z.object({
  institutionId: z.string().uuid(),
});

export const cancelVerificationSchema = z.object({
  institutionId: z.string().uuid(),
});

export const startDocumentVerificationSchema = z.object({
  institutionId: z.string().uuid(),
  relationship: relationshipEnum,
  note: z.string().max(500).optional(),
});

export const addEmailDomainSchema = z.object({
  domain: z
    .string()
    .min(3)
    .max(255)
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, 'Enter a valid domain, e.g. university.edu.in'),
});
