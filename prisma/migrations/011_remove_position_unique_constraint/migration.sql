-- Migration 011: Remove unique constraint from column positions
-- This allows multiple columns to have the same position value for easier reordering

-- SQLite doesn't support ALTER TABLE DROP CONSTRAINT directly
-- We need to recreate the table without the unique constraint

-- Create new table without the unique position constraint
CREATE TABLE IF NOT EXISTS table_columns_new (
    id TEXT PRIMARY KEY,
    table_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'number', 'date', 'boolean', 'email', 'url', 'textarea', 'country')),
    is_required BOOLEAN DEFAULT FALSE,
    default_value TEXT,
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES user_tables(id) ON DELETE CASCADE,
    UNIQUE(table_id, name) -- Keep column names unique within a table
    -- REMOVED: UNIQUE(table_id, position) -- Allow non-unique positions
);

-- Copy all data from old table to new table
INSERT INTO table_columns_new (id, table_id, name, type, is_required, default_value, position, created_at)
SELECT id, table_id, name, type, is_required, default_value, position, created_at
FROM table_columns;

-- Drop old table
DROP TABLE table_columns;

-- Rename new table to original name
ALTER TABLE table_columns_new RENAME TO table_columns;

-- Recreate indexes for better performance
CREATE INDEX IF NOT EXISTS idx_table_columns_table_id ON table_columns(table_id);
CREATE INDEX IF NOT EXISTS idx_table_columns_position ON table_columns(table_id, position);