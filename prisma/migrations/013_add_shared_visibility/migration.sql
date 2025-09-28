-- Migration 013: Add Shared Visibility System
-- This migration is for existing databases that need to upgrade from isPublic to visibility
-- Fresh databases already have the correct schema from migration 004

-- Drop the old isPublic index if it exists (safe operation)
DROP INDEX IF EXISTS idx_userTables_isPublic;

-- Note: Fresh databases from db-reset already have visibility column from migration 004
-- For existing production databases with isPublic column, manual migration may be needed