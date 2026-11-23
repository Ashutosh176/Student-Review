-- "Colleges that listen to their students": claimed colleges are listed by
-- default; admins can hide one (e.g. a test organisation).
ALTER TABLE "institutions" ADD COLUMN "hideFromListening" BOOLEAN NOT NULL DEFAULT false;
UPDATE "institutions" SET "hideFromListening" = true WHERE "slug" = 'testorg';
