import { z } from 'zod';

export const createClaimSchema = z.object({
  institutionId: z.string().uuid(),
  organizationName: z.string().min(2).max(200),
  officialEmail: z.string().email(),
  website: z.string().url().optional(),
  designation: z.string().max(120).optional(),
  documentUrl: z.string().url().optional(),
});

export const claimDecisionSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().max(500).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'EDITOR']).default('EDITOR'),
});

export const updateOrgProfileSchema = z.object({
  description: z.string().max(3000).optional(),
  contactEmail: z.string().email().optional(),
  website: z.string().url().optional(),
});

export const checkoutSchema = z.object({
  plan: z.enum(['PRO', 'BUSINESS']),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
});

export const createJobSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().min(20).max(5000),
  type: z.enum(['JOB', 'INTERNSHIP']),
  locationType: z.enum(['ONSITE', 'REMOTE', 'HYBRID']),
  location: z.string().max(150).optional(),
  compensation: z.string().max(150).optional(),
  skills: z.array(z.string().max(40)).max(20).default([]),
  eligibility: z.string().max(1000).optional(),
  applicationUrl: z.string().url().optional(),
  deadline: z.coerce.date().optional(),
});
