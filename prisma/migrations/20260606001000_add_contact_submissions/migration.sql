CREATE TABLE "contact_submissions" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "company" TEXT,
  "phone" TEXT,
  "wechat" TEXT,
  "email" TEXT,
  "douyin" TEXT,
  "industry" TEXT NOT NULL,
  "budget" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "source_page" TEXT NOT NULL DEFAULT '联系定制',
  "feishu_table_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions"("created_at");
CREATE INDEX "contact_submissions_email_idx" ON "contact_submissions"("email");
