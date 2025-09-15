-- Essential Tokens Seed
-- Creates required API tokens for frontend access across all environments

-- Note: No allowed_emails seeding - first user automatically becomes admin

-- Insert essential tokens with environment-specific domain allowlists
-- These tokens will be updated with proper domains based on environment

-- Full Access Token for Frontend (will be updated per environment)
INSERT OR REPLACE INTO tokens (id, token, name, permissions, allowed_ips, allowed_domains, created_at, updated_at) VALUES
('frontend-token', 'frontend-access-token-placeholder', 'Frontend Access Token', 'read,write', '["0.0.0.0/0"]', '["placeholder-domain"]', datetime('now'), datetime('now'));

-- Admin Token for Development/Testing
INSERT OR REPLACE INTO tokens (id, token, name, permissions, allowed_ips, allowed_domains, created_at, updated_at) VALUES
('admin-token', 'admin-access-token-placeholder', 'Admin Access Token', 'read,write,delete,admin', '["0.0.0.0/0"]', '["placeholder-domain"]', datetime('now'), datetime('now'));