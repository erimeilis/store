-- Migration 011: Remove unique constraint from column positions
-- This allows multiple columns to have the same position value for easier reordering

-- SQLite doesn't support ALTER TABLE DROP CONSTRAINT directly
-- We need to recreate the table without the unique constraint

-- Create new table without the unique position constraint
CREATE TABLE IF NOT EXISTS tableColumnsNew (
    id TEXT PRIMARY KEY,
    tableId TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'number', 'date', 'boolean', 'email', 'url', 'textarea', 'country')),
    isRequired BOOLEAN DEFAULT FALSE,
    defaultValue TEXT,
    position INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tableId) REFERENCES userTables(id) ON DELETE CASCADE,
    UNIQUE(tableId, name) -- Keep column names unique within a table
    -- REMOVED: UNIQUE(tableId, position) -- Allow non-unique positions
);

-- Copy all data from old table to new table
INSERT INTO tableColumnsNew (id, tableId, name, type, isRequired, defaultValue, position, createdAt)
SELECT id, tableId, name, type, isRequired, defaultValue, position, createdAt
FROM tableColumns;

-- Drop old table
DROP TABLE tableColumns;

-- Rename new table to original name
ALTER TABLE tableColumnsNew RENAME TO tableColumns;

-- Recreate indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tableColumns_tableId ON tableColumns(tableId);
CREATE INDEX IF NOT EXISTS idx_tableColumns_position ON tableColumns(tableId, position);