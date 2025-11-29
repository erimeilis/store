import { z } from 'zod';

/**
 * Token validation schemas
 */

// Note: isAdmin defaults to false - regular API tokens can ONLY access /api/public/* routes
// Admin tokens (isAdmin=true) can access ALL routes, typically for frontend/admin use
export const CreateTokenSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  permissions: z.string().default('read'), // comma-separated: read,write,delete,admin
  isAdmin: z.boolean().default(false), // false = public routes only, true = all routes
  allowedIps: z.string().nullable().optional(), // JSON array of IPs/CIDR ranges
  allowedDomains: z.string().nullable().optional(), // JSON array of domain patterns
  tableAccess: z.array(z.string()).default([]), // Array of table IDs the token can access
  expiresAt: z.string().datetime().nullable().optional(),
});

export const UpdateTokenSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  permissions: z.string().optional(),
  isAdmin: z.boolean().optional(),
  allowedIps: z.string().nullable().optional(),
  allowedDomains: z.string().nullable().optional(),
  tableAccess: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export const TokenMassActionSchema = z.object({
  action: z.enum(['regenerate', 'delete', 'extend_expiry']),
  ids: z.array(z.string()),
});
