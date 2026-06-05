ALTER TABLE "usage_records" ADD COLUMN "error_message" TEXT;

CREATE TABLE "audit_logs" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "event" TEXT NOT NULL,
  "level" TEXT NOT NULL DEFAULT 'info',
  "ip" TEXT,
  "userAgent" TEXT,
  "message" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");
CREATE INDEX "audit_logs_event_createdAt_idx" ON "audit_logs"("event", "createdAt");
