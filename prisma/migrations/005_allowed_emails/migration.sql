-- CreateTable: Allowed Emails
-- Access control whitelist for email addresses and domain patterns
CREATE TABLE "allowed_emails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "domain" TEXT,
    "type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);