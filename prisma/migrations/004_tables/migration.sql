-- CreateTable: Tables
-- Metadata for user-created custom tables with ownership and schema definitions
CREATE TABLE "tables" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "schema" TEXT NOT NULL,
    "permissions" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tables_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex: Unique table name per owner constraint
CREATE UNIQUE INDEX "tables_name_owner_id_key" ON "tables"("name", "owner_id");