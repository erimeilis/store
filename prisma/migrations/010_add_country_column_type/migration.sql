-- Migration 010: Add country column type support
-- Updates the CHECK constraint in table_columns to include 'country' type

-- SQLite doesn't support ALTER TABLE to modify CHECK constraints directly
-- We need to recreate the table with the updated constraint

-- Step 1: Create new table with updated constraint
CREATE TABLE tableColumnsNew (
    id TEXT PRIMARY KEY,
    tableId TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'number', 'date', 'boolean', 'email', 'url', 'textarea', 'country')),
    isRequired BOOLEAN DEFAULT FALSE,
    defaultValue TEXT,
    position INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tableId) REFERENCES userTables(id) ON DELETE CASCADE,
    UNIQUE(tableId, name), -- Column names must be unique within a table
    UNIQUE(tableId, position) -- Positions must be unique within a table
);

-- Step 2: Copy data from old table to new table
INSERT INTO tableColumnsNew
SELECT id, tableId, name, type, isRequired, defaultValue, position, createdAt
FROM tableColumns;

-- Step 3: Drop old table
DROP TABLE tableColumns;

-- Step 4: Rename new table to original name
ALTER TABLE tableColumnsNew RENAME TO tableColumns;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_tableColumns_tableId ON tableColumns(tableId);
CREATE INDEX IF NOT EXISTS idx_tableColumns_position ON tableColumns(tableId, position);