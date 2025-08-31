-- CreateTable: Tokens
-- API authentication with IP/domain whitelist and permission system
CREATE TABLE IF NOT EXISTS "tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" TEXT NOT NULL DEFAULT 'read',
    "allowed_ips" TEXT,
    "allowed_domains" TEXT,
    "expires_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex: Unique token constraint
CREATE UNIQUE INDEX "tokens_token_key" ON "tokens"("token");