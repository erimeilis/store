-- Migration 010: Add country column type support
-- Updates the CHECK constraint in table_columns to include 'country' type

-- SQLite doesn't support ALTER TABLE to modify CHECK constraints directly
-- We need to recreate the table with the updated constraint

-- Step 1: Create new table with updated constraint
CREATE TABLE table_columns_new (
    id TEXT PRIMARY KEY,
    table_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'number', 'date', 'boolean', 'email', 'url', 'textarea', 'country')),
    is_required BOOLEAN DEFAULT FALSE,
    default_value TEXT,
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES user_tables(id) ON DELETE CASCADE,
    UNIQUE(table_id, name), -- Column names must be unique within a table
    UNIQUE(table_id, position) -- Positions must be unique within a table
);

-- Step 2: Copy data from old table to new table
INSERT INTO table_columns_new
SELECT id, table_id, name, type, is_required, default_value, position, created_at
FROM table_columns;

-- Step 3: Drop old table
DROP TABLE table_columns;

-- Step 4: Rename new table to original name
ALTER TABLE table_columns_new RENAME TO table_columns;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_table_columns_table_id ON table_columns(table_id);
CREATE INDEX IF NOT EXISTS idx_table_columns_position ON table_columns(table_id, position);