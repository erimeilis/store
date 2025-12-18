-- Migration 005: E-commerce Settings Enhancement
-- Adds productIdColumn, rentalPeriod columns to userTables for better e-commerce support

-- Add productIdColumn: References a column name that serves as the product identifier/title
-- This is used in sales/inventory displays to show a meaningful product name
ALTER TABLE userTables ADD COLUMN productIdColumn TEXT DEFAULT NULL;

-- Add rentalPeriod: For rent tables, defines the rental billing period
-- Values: 'hour', 'day', 'week', 'month', 'year' (default: 'month')
ALTER TABLE userTables ADD COLUMN rentalPeriod TEXT DEFAULT 'month' CHECK (rentalPeriod IN ('hour', 'day', 'week', 'month', 'year'));

-- Index for productIdColumn lookups
CREATE INDEX IF NOT EXISTS idx_userTables_productIdColumn ON userTables(productIdColumn);

-- Schema version: 005 - E-commerce settings enhancement (productIdColumn, rentalPeriod)
