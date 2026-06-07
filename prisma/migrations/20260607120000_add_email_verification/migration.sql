ALTER TABLE "users"
ADD COLUMN "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "verification_code_hash" TEXT,
ADD COLUMN "verification_expires_at" TIMESTAMP(3);

UPDATE "users" SET "is_verified" = true;

CREATE INDEX "users_is_verified_idx" ON "users"("is_verified");
CREATE INDEX "users_verification_expires_at_idx" ON "users"("verification_expires_at");
