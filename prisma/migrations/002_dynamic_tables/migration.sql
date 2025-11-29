-- Migration 002: Dynamic User-Created Tables System
-- Creates tables for user-defined table schemas and data storage
-- Includes tableType enum for different table modes (default, sale, rent)

-- User-created tables metadata
-- tableType: 'default' (regular), 'sale' (e-commerce), 'rent' (rental system)
CREATE TABLE IF NOT EXISTS userTables (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    createdBy TEXT NOT NULL,
    userId TEXT,
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'shared')),
    tableType TEXT DEFAULT 'default' CHECK (tableType IN ('default', 'sale', 'rent')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for userTables
CREATE INDEX IF NOT EXISTS idx_userTables_createdBy ON userTables(createdBy);
CREATE INDEX IF NOT EXISTS idx_userTables_userId ON userTables(userId);
CREATE INDEX IF NOT EXISTS idx_userTables_visibility ON userTables(visibility);
CREATE INDEX IF NOT EXISTS idx_userTables_tableType ON userTables(tableType);
CREATE INDEX IF NOT EXISTS idx_userTables_visibility_createdBy ON userTables(visibility, createdBy);
CREATE INDEX IF NOT EXISTS idx_userTables_visibility_tableType ON userTables(visibility, tableType);

-- Column definitions for user tables
-- Supports all column types: text, textarea, email, url, phone, country,
-- integer, float, currency, percentage, number (deprecated),
-- date, time, datetime, boolean, select, rating, color
CREATE TABLE IF NOT EXISTS tableColumns (
    id TEXT PRIMARY KEY,
    tableId TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    isRequired BOOLEAN DEFAULT FALSE,
    allowDuplicates BOOLEAN DEFAULT TRUE,
    defaultValue TEXT,
    position INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tableId) REFERENCES userTables(id) ON DELETE CASCADE,
    UNIQUE(tableId, name)
);

-- Indexes for tableColumns
CREATE INDEX IF NOT EXISTS idx_tableColumns_tableId ON tableColumns(tableId);
CREATE INDEX IF NOT EXISTS idx_tableColumns_position ON tableColumns(tableId, position);

-- Dynamic table data (JSON storage for flexibility)
CREATE TABLE IF NOT EXISTS tableData (
    id TEXT PRIMARY KEY,
    tableId TEXT NOT NULL,
    data TEXT NOT NULL,
    createdBy TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tableId) REFERENCES userTables(id) ON DELETE CASCADE
);

-- Indexes for tableData
CREATE INDEX IF NOT EXISTS idx_tableData_tableId ON tableData(tableId);
CREATE INDEX IF NOT EXISTS idx_tableData_createdBy ON tableData(createdBy);

-- Schema version: 002 - Dynamic tables system with tableType enum
