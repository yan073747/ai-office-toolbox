CREATE TABLE "rate_limit_events" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "rate_limit_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "rate_limit_events_key_action_createdAt_idx" ON "rate_limit_events"("key", "action", "createdAt");
