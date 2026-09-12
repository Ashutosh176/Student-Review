-- CreateEnum
CREATE TYPE "StudentVerificationMethod" AS ENUM ('EMAIL_OTP', 'DOCUMENT_UPLOAD');

-- CreateEnum
CREATE TYPE "StudentVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED', 'REVOKED');

-- AlterEnum
ALTER TYPE "AdminActionType" ADD VALUE 'REVOKE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'VERIFICATION_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'VERIFICATION_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'VERIFICATION_REVOKED';

-- DropForeignKey
ALTER TABLE "verification_requests" DROP CONSTRAINT "verification_requests_userId_fkey";

-- DropTable
DROP TABLE "verification_requests";

-- DropEnum
DROP TYPE "VerificationMethod";

-- DropEnum
DROP TYPE "VerificationStatus";

-- DropEnum
DROP TYPE "VerificationType";

-- CreateTable
CREATE TABLE "institution_email_domains" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institution_email_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "relationship" "RelationshipType" NOT NULL,
    "method" "StudentVerificationMethod" NOT NULL,
    "status" "StudentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "universityEmail" TEXT,
    "domain" TEXT,
    "documentUrl" TEXT,
    "documentNote" TEXT,
    "reviewedByAdminId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_otps" (
    "id" TEXT NOT NULL,
    "studentVerificationId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institution_email_domains_domain_key" ON "institution_email_domains"("domain");

-- CreateIndex
CREATE INDEX "institution_email_domains_institutionId_idx" ON "institution_email_domains"("institutionId");

-- CreateIndex
CREATE INDEX "student_verifications_userId_institutionId_idx" ON "student_verifications"("userId", "institutionId");

-- CreateIndex
CREATE INDEX "student_verifications_status_idx" ON "student_verifications"("status");

-- CreateIndex
CREATE INDEX "verification_otps_studentVerificationId_idx" ON "verification_otps"("studentVerificationId");

-- AddForeignKey
ALTER TABLE "institution_email_domains" ADD CONSTRAINT "institution_email_domains_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_verifications" ADD CONSTRAINT "student_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_verifications" ADD CONSTRAINT "student_verifications_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_otps" ADD CONSTRAINT "verification_otps_studentVerificationId_fkey" FOREIGN KEY ("studentVerificationId") REFERENCES "student_verifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

