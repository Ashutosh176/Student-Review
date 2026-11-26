-- Reviews written before the author verified as a student are held until they verify.
ALTER TABLE "reviews" ADD COLUMN "awaitingVerification" BOOLEAN NOT NULL DEFAULT false;
