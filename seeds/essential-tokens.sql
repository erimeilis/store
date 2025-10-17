-- Essential Tokens Seed
-- Creates required API tokens for frontend access across all environments

-- Note: No allowedEmails seeding - first user automatically becomes admin

-- Insert essential tokens with environment-specific domain allowlists
-- These tokens will be updated with proper domains based on environment

-- Full Access Token for Frontend (will be updated per environment)
-- Note: Standalone tokens have unrestricted table access
INSERT OR REPLACE INTO tokens (id, token, name, permissions, allowedIps, allowedDomains, tableAccess, createdAt, updatedAt) VALUES
('frontend-token', 'frontend-access-token-placeholder', 'Frontend Access Token', 'read,write', '["0.0.0.0/0"]', '["placeholder-domain"]', '[]', datetime('now'), datetime('now'));

-- Admin Token for Development/Testing
-- Note: Standalone tokens have unrestricted table access
INSERT OR REPLACE INTO tokens (id, token, name, permissions, allowedIps, allowedDomains, tableAccess, createdAt, updatedAt) VALUES
('admin-token', 'admin-access-token-placeholder', 'Admin Access Token', 'read,write,delete,admin', '["0.0.0.0/0"]', '["placeholder-domain"]', '[]', datetime('now'), datetime('now'));
