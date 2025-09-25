-- Migration: Add for_sale column to user_tables
-- This enables tables to be marked as "for sale" which automatically
-- creates and protects price/qty columns for e-commerce functionality

ALTER TABLE userTables ADD COLUMN forSale BOOLEAN DEFAULT FALSE;

-- Update the schema version comment
-- Schema version: 008 - Added forSale column to userTables