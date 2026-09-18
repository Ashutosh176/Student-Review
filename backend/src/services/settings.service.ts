import { prisma } from '../config/prisma.js';

const SETTINGS_ID = 'singleton';

const DEFAULTS = {
  reportAutoFlagThreshold: 3,
  rapidSubmissionWindowMinutes: 10,
  rapidSubmissionCount: 3,
  minReviewsForRanking: 5,
  proPlanPriceInr: 4999,
  businessPlanPriceInr: 12999,
};

export type PlatformSettingsInput = Partial<typeof DEFAULTS>;

// Upsert-on-read: the row is created with defaults the first time anything
// asks for it, so there's no seed step and the table is always readable.
export async function getPlatformSettings() {
  return prisma.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...DEFAULTS },
    update: {},
  });
}

export async function updatePlatformSettings(input: PlatformSettingsInput) {
  return prisma.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...DEFAULTS, ...input },
    update: input,
  });
}
