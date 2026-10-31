-- "Be the first" invitation emails to colleges with no reviews yet.
ALTER TABLE "institutions" ADD COLUMN "inviteOutreachAt" TIMESTAMP(3);
ALTER TABLE "platform_settings" ADD COLUMN "outreachInviteEnabled" BOOLEAN NOT NULL DEFAULT false;
