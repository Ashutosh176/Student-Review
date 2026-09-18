-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "feePerYearInr" INTEGER,
ADD COLUMN     "totalFeeInr" INTEGER;

-- AlterTable
ALTER TABLE "institutions" ADD COLUMN     "entranceExams" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "admission_cutoffs" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "examName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "openingRank" INTEGER,
    "closingRank" INTEGER,
    "percentile" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_cutoffs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admission_cutoffs_institutionId_idx" ON "admission_cutoffs"("institutionId");

-- CreateIndex
CREATE INDEX "admission_cutoffs_courseId_idx" ON "admission_cutoffs"("courseId");

-- AddForeignKey
ALTER TABLE "admission_cutoffs" ADD CONSTRAINT "admission_cutoffs_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_cutoffs" ADD CONSTRAINT "admission_cutoffs_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
