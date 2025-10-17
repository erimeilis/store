-- Add tableAccess column to tokens table for table-level access control
ALTER TABLE tokens ADD COLUMN tableAccess TEXT;
