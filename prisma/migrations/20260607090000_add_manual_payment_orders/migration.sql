ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "current_plan" TEXT,
ADD COLUMN IF NOT EXISTS "remaining_quota" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "plan_expiry" TIMESTAMP(3);

ALTER TABLE "orders"
ADD COLUMN IF NOT EXISTS "user_email" TEXT,
ADD COLUMN IF NOT EXISTS "plan_price" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "plan_count" INTEGER,
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS "payment_method" TEXT,
ADD COLUMN IF NOT EXISTS "payment_time" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "payment_screenshot" TEXT,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "orders" AS o
SET "user_email" = u."email"
FROM "users" AS u
WHERE o."user_id" = u."id"
  AND o."user_email" IS NULL;

UPDATE "orders"
SET
  "plan_price" = COALESCE("plan_price", "amount"::DOUBLE PRECISION),
  "plan_count" = COALESCE("plan_count", "quota_amount"),
  "status" = COALESCE(NULLIF("status", ''), "payment_status", 'pending');

UPDATE "orders"
SET "user_email" = COALESCE("user_email", '')
WHERE "user_email" IS NULL;

UPDATE "orders"
SET "plan_price" = COALESCE("plan_price", 0)
WHERE "plan_price" IS NULL;

UPDATE "orders"
SET "plan_count" = COALESCE("plan_count", 0)
WHERE "plan_count" IS NULL;

ALTER TABLE "orders"
ALTER COLUMN "user_email" SET NOT NULL,
ALTER COLUMN "plan_price" SET NOT NULL,
ALTER COLUMN "plan_count" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "orders_user_id_status_idx" ON "orders"("user_id", "status");
CREATE INDEX IF NOT EXISTS "orders_status_created_at_idx" ON "orders"("status", "created_at");
