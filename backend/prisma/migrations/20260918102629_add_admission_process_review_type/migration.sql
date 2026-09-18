-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('EXPERIENCE', 'ADMISSION_PROCESS');

-- CreateEnum
CREATE TYPE "AdmissionOutcome" AS ENUM ('ADMITTED', 'REJECTED', 'WAITLISTED', 'WITHDREW');

-- AlterEnum
ALTER TYPE "RelationshipType" ADD VALUE 'APPLICANT';

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "admissionOutcome" "AdmissionOutcome",
ADD COLUMN     "type" "ReviewType" NOT NULL DEFAULT 'EXPERIENCE';

-- CreateIndex
CREATE INDEX "reviews_institutionId_type_status_idx" ON "reviews"("institutionId", "type", "status");
