-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'QUESTION_REPORTED';
ALTER TYPE "NotificationType" ADD VALUE 'ANSWER_REPORTED';

-- CreateTable
CREATE TABLE "question_reports" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "assignedAdminId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer_reports" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "assignedAdminId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answer_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_reports_status_idx" ON "question_reports"("status");

-- CreateIndex
CREATE INDEX "answer_reports_status_idx" ON "answer_reports"("status");

-- AddForeignKey
ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_reports" ADD CONSTRAINT "answer_reports_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_reports" ADD CONSTRAINT "answer_reports_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
