import { z } from 'zod';

/**
 * User validation schemas
 */

export const CreateUserSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'),
  name: z.string().nullable().optional(),
  picture: z.string().regex(/^https?:\/\/.+/, 'Invalid URL').nullable().optional(),
  role: z.enum(['user', 'admin']).default('user'),
});

export const UpdateUserSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address').optional(),
  name: z.string().nullable().optional(),
  picture: z.string().regex(/^https?:\/\/.+/, 'Invalid URL').nullable().optional(),
  role: z.enum(['user', 'admin']).optional(),
});

export const UserMassActionSchema = z.object({
  action: z.enum(['make_admin', 'make_user', 'delete']),
  ids: z.array(z.string()),
});
