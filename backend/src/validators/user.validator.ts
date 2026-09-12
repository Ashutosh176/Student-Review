import { z } from 'zod';

export const saveInstitutionSchema = z.object({ institutionId: z.string().uuid() });

export const updateSettingsSchema = z.object({
  publicProfileOptIn: z.boolean().optional(),
  notifyReviewActivity: z.boolean().optional(),
  notifyCommunityActivity: z.boolean().optional(),
  notifySubmissionUpdates: z.boolean().optional(),
  notifySystem: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password needs a lowercase letter')
    .regex(/[A-Z]/, 'Password needs an uppercase letter')
    .regex(/\d/, 'Password needs a number'),
});

export const deactivateAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});
