-- Add user_id column to user_tables for proper user tracking
-- This will store the Google OAuth user ID from sessions

ALTER TABLE user_tables ADD COLUMN user_id TEXT;

-- Update existing tables to use a default user ID (admin user)
UPDATE user_tables SET user_id = '107895019654329312169' WHERE user_id IS NULL;

-- Create index for faster queries
CREATE INDEX idx_user_tables_user_id ON user_tables(user_id);