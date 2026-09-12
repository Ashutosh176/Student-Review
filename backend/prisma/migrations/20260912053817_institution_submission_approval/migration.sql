-- CreateEnum
CREATE TYPE "InstitutionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'INSTITUTION_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'INSTITUTION_REJECTED';

-- AlterTable
ALTER TABLE "institutions" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "InstitutionStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "submittedByUserId" TEXT;

-- CreateIndex
CREATE INDEX "institutions_status_idx" ON "institutions"("status");

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
