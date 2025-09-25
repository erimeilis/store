-- CreateTable: Tokens
-- API authentication with IP/domain whitelist and permission system
CREATE TABLE IF NOT EXISTS "tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" TEXT NOT NULL DEFAULT 'read',
    "allowedIps" TEXT,
    "allowedDomains" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex: Unique token constraint
CREATE UNIQUE INDEX "tokens_token_key" ON "tokens"("token");