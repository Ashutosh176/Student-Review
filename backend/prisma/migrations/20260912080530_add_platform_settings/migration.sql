-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "reportAutoFlagThreshold" INTEGER NOT NULL DEFAULT 3,
    "rapidSubmissionWindowMinutes" INTEGER NOT NULL DEFAULT 10,
    "rapidSubmissionCount" INTEGER NOT NULL DEFAULT 3,
    "minReviewsForRanking" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);
