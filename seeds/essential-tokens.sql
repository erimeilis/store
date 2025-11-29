-- Essential Tokens Seed
-- Creates required API tokens for frontend access across all environments

-- Note: No allowedEmails seeding - first user automatically becomes admin

-- Insert essential tokens with environment-specific domain allowlists
-- These tokens will be updated with proper domains based on environment

-- IMPORTANT: isAdmin flag determines route access:
--   isAdmin=1: Can access ALL routes (frontend sessions, admin operations)
--   isAdmin=0: Can ONLY access /api/public/* routes (regular API consumers)

-- Full Access Token for Frontend (will be updated per environment)
-- isAdmin=1: Frontend needs access to all routes for admin panel functionality
-- Note: Standalone tokens have unrestricted table access
INSERT OR REPLACE INTO tokens (id, token, name, permissions, isAdmin, allowedIps, allowedDomains, tableAccess, createdAt, updatedAt) VALUES
('frontend-token', 'frontend-access-token-placeholder', 'Frontend Access Token', 'read,write', 1, '["0.0.0.0/0"]', '["placeholder-domain"]', '[]', datetime('now'), datetime('now'));

-- Admin Token for Development/Testing
-- isAdmin=1: Admin token needs access to all routes
-- Note: Standalone tokens have unrestricted table access
INSERT OR REPLACE INTO tokens (id, token, name, permissions, isAdmin, allowedIps, allowedDomains, tableAccess, createdAt, updatedAt) VALUES
('admin-token', 'admin-access-token-placeholder', 'Admin Access Token', 'read,write,delete,admin', 1, '["0.0.0.0/0"]', '["placeholder-domain"]', '[]', datetime('now'), datetime('now'));
