-- DropForeignKey
ALTER TABLE "organization_members" DROP CONSTRAINT "organization_members_userId_fkey";

-- AlterTable
ALTER TABLE "organization_members" ADD COLUMN     "inviteTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "inviteTokenHash" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_inviteTokenHash_key" ON "organization_members"("inviteTokenHash");

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

