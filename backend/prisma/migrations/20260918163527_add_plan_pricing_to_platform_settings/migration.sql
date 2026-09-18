-- AlterTable
ALTER TABLE "platform_settings" ADD COLUMN     "businessPlanPriceInr" INTEGER NOT NULL DEFAULT 12999,
ADD COLUMN     "proPlanPriceInr" INTEGER NOT NULL DEFAULT 4999;
