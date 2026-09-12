-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notifyCommunityActivity" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyReviewActivity" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifySubmissionUpdates" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifySystem" BOOLEAN NOT NULL DEFAULT true;
