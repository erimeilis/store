import { z } from 'zod';

/**
 * AllowedEmail validation schemas
 */

export const CreateAllowedEmailSchema = z.object({
  type: z.enum(['email', 'domain'], {
    message: 'Type is required and must be either "email" or "domain"'
  }),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address').nullable().optional(),
  domain: z.string().min(1, 'Domain is required').nullable().optional(),
}).refine(
  (data) => {
    if (data.type === 'email' && !data.email) {
      return false;
    }
    if (data.type === 'domain' && !data.domain) {
      return false;
    }
    return true;
  },
  {
    message: 'Email is required when type is "email", domain is required when type is "domain"',
    path: ['email', 'domain'],
  }
);

export const UpdateAllowedEmailSchema = z.object({
  type: z.enum(['email', 'domain']).optional(),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address').nullable().optional(),
  domain: z.string().min(1, 'Domain is required').nullable().optional(),
});

export const AllowedEmailMassActionSchema = z.object({
  action: z.enum(['delete']),
  ids: z.array(z.string()),
});

export const ValidateEmailSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'),
});
