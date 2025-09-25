-- Migration 012: Add allow_duplicates column to table_columns
-- Adds allow_duplicates boolean column with default value true

ALTER TABLE tableColumns ADD COLUMN allowDuplicates BOOLEAN DEFAULT TRUE;