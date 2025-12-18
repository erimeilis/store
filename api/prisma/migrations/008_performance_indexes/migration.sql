-- Migration 008: Performance Indexes for Public Records API
-- Adds covering indexes to optimize heavy read queries

-- Composite index for tableData queries with ordering
-- Covers: WHERE tableId IN (...) ORDER BY updatedAt DESC
-- This index allows SQLite to use index scan instead of table scan + sort
CREATE INDEX IF NOT EXISTS idx_tableData_tableId_updatedAt
ON tableData(tableId, updatedAt DESC);

-- Index for counting records efficiently
-- Allows COUNT(*) to use index-only scan when filtering by tableId
CREATE INDEX IF NOT EXISTS idx_tableData_tableId_id
ON tableData(tableId, id);

-- Schema version: 008 - Performance indexes for public API
