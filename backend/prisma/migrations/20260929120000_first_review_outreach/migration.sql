-- First-review outreach emails to colleges.
ALTER TABLE "institutions" ADD COLUMN "outreachEmail" TEXT;
ALTER TABLE "institutions" ADD COLUMN "firstReviewOutreachStatus" TEXT;
ALTER TABLE "institutions" ADD COLUMN "firstReviewOutreachAt" TIMESTAMP(3);
ALTER TABLE "institutions" ADD COLUMN "proOfferMonths" INTEGER;

ALTER TABLE "platform_settings" ADD COLUMN "outreachEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "platform_settings" ADD COLUMN "outreachContactPhone" TEXT;
ALTER TABLE "platform_settings" ADD COLUMN "outreachContactEmail" TEXT;
ALTER TABLE "platform_settings" ADD COLUMN "outreachProOfferMonths" INTEGER NOT NULL DEFAULT 12;

-- Only a college's FIRST review should trigger the email. Colleges that
-- already have an approved review (or are already claimed) when this ships
-- are past that point, so they're marked SKIPPED instead of being emailed
-- about a "first" review that may be weeks old.
UPDATE "institutions" SET "firstReviewOutreachStatus" = 'SKIPPED'
WHERE "claimed" = true
   OR EXISTS (SELECT 1 FROM "reviews" r WHERE r."institutionId" = "institutions"."id" AND r."status" = 'APPROVED');
