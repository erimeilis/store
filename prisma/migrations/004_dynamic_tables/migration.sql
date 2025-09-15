-- Migration 004: Dynamic User-Created Tables System
-- Creates tables for user-defined table schemas and data storage

-- User-created tables metadata
CREATE TABLE IF NOT EXISTS user_tables (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    -- Note: created_by stores email but we can't enforce FK since users.email is not primary key
);

-- Column definitions for user tables
CREATE TABLE IF NOT EXISTS table_columns (
    id TEXT PRIMARY KEY,
    table_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'number', 'date', 'boolean', 'email', 'url', 'textarea')),
    is_required BOOLEAN DEFAULT FALSE,
    default_value TEXT,
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES user_tables(id) ON DELETE CASCADE,
    UNIQUE(table_id, name), -- Column names must be unique within a table
    UNIQUE(table_id, position) -- Positions must be unique within a table
);

-- Dynamic table data (JSON storage for flexibility)
CREATE TABLE IF NOT EXISTS table_data (
    id TEXT PRIMARY KEY,
    table_id TEXT NOT NULL,
    data TEXT NOT NULL, -- JSON blob with column data
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES user_tables(id) ON DELETE CASCADE
    -- Note: created_by stores email but we can't enforce FK since users.email is not primary key
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_tables_created_by ON user_tables(created_by);
CREATE INDEX IF NOT EXISTS idx_user_tables_is_public ON user_tables(is_public);
CREATE INDEX IF NOT EXISTS idx_table_columns_table_id ON table_columns(table_id);
CREATE INDEX IF NOT EXISTS idx_table_columns_position ON table_columns(table_id, position);
CREATE INDEX IF NOT EXISTS idx_table_data_table_id ON table_data(table_id);
CREATE INDEX IF NOT EXISTS idx_table_data_created_by ON table_data(created_by);

-- Note: schema_migrations tracking will be handled by the reset script