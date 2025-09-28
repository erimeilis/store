-- Migration 004: Dynamic User-Created Tables System
-- Creates tables for user-defined table schemas and data storage

-- User-created tables metadata
CREATE TABLE IF NOT EXISTS userTables (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    createdBy TEXT NOT NULL,
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'shared')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    -- Note: created_by stores email but we can't enforce FK since users.email is not primary key
);

-- Column definitions for user tables
CREATE TABLE IF NOT EXISTS tableColumns (
    id TEXT PRIMARY KEY,
    tableId TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'number', 'date', 'boolean', 'email', 'url', 'textarea')),
    isRequired BOOLEAN DEFAULT FALSE,
    defaultValue TEXT,
    position INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tableId) REFERENCES userTables(id) ON DELETE CASCADE,
    UNIQUE(tableId, name), -- Column names must be unique within a table
    UNIQUE(tableId, position) -- Positions must be unique within a table
);

-- Dynamic table data (JSON storage for flexibility)
CREATE TABLE IF NOT EXISTS tableData (
    id TEXT PRIMARY KEY,
    tableId TEXT NOT NULL,
    data TEXT NOT NULL, -- JSON blob with column data
    createdBy TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tableId) REFERENCES userTables(id) ON DELETE CASCADE
    -- Note: created_by stores email but we can't enforce FK since users.email is not primary key
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_userTables_createdBy ON userTables(createdBy);
CREATE INDEX IF NOT EXISTS idx_userTables_visibility ON userTables(visibility);
CREATE INDEX IF NOT EXISTS idx_userTables_visibility_createdBy ON userTables(visibility, createdBy);
CREATE INDEX IF NOT EXISTS idx_tableColumns_tableId ON tableColumns(tableId);
CREATE INDEX IF NOT EXISTS idx_tableColumns_position ON tableColumns(tableId, position);
CREATE INDEX IF NOT EXISTS idx_tableData_tableId ON tableData(tableId);
CREATE INDEX IF NOT EXISTS idx_tableData_createdBy ON tableData(createdBy);

-- Note: schema_migrations tracking will be handled by the reset script