-- CreateTable: Allowed Emails
-- Access control whitelist for email addresses and domain patterns
CREATE TABLE "allowedEmails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "domain" TEXT,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);