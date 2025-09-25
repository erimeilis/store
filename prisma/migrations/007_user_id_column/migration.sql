-- Add user_id column to user_tables for proper user tracking
-- This will store the Google OAuth user ID from sessions

ALTER TABLE userTables ADD COLUMN userId TEXT;

-- Update existing tables to use a default user ID (admin user)
UPDATE userTables SET userId = '107895019654329312169' WHERE userId IS NULL;

-- Create index for faster queries
CREATE INDEX idx_userTables_userId ON userTables(userId);