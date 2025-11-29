-- Migration 006: Token Admin Flag
-- Adds isAdmin column to tokens table to distinguish admin/frontend tokens from regular API tokens
-- Admin tokens: Can access all routes (frontend sessions, admin operations)
-- Regular tokens: Can only access /api/public/* routes

-- Add isAdmin column to tokens table (default false for existing tokens)
ALTER TABLE "tokens" ADD COLUMN "isAdmin" INTEGER NOT NULL DEFAULT 0;

-- Schema version: 006 - Token admin flag for route access control
