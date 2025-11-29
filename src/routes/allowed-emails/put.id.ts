import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getPrismaClient } from '@/lib/database.js';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { formatApiDate } from '@/lib/date-utils.js';
import { UpdateAllowedEmailSchema } from '@/const/schemas/allowed-emails.js';

const app = new Hono();

/**
 * Update allowed email
 * PUT /api/allowed-emails/:id
 */
app.put('/:id', adminWriteAuthMiddleware, zValidator('json', UpdateAllowedEmailSchema), async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();
    const allowedEmailData = c.req.valid('json');

    if (!id) {
      return c.json({ error: 'Allowed email ID is required' }, 400);
    }

    // Check if allowed email exists
    const existingAllowedEmail = await database.allowedEmail.findUnique({
      where: { id }
    });

    if (!existingAllowedEmail) {
      return c.json({ error: 'Allowed email not found' }, 404);
    }

    // Validate data consistency
    if (allowedEmailData.type === 'email' && !allowedEmailData.email) {
      return c.json({
        error: 'Validation failed',
        errors: { email: 'Email is required when type is "email"' }
      }, 400);
    }

    if (allowedEmailData.type === 'domain' && !allowedEmailData.domain) {
      return c.json({
        error: 'Validation failed',
        errors: { domain: 'Domain is required when type is "domain"' }
      }, 400);
    }

    // Check for duplicates
    if (allowedEmailData.type === 'email' && allowedEmailData.email) {
      const duplicateEmail = await database.allowedEmail.findFirst({
        where: {
          type: 'email',
          email: allowedEmailData.email,
          id: { not: id }
        }
      });

      if (duplicateEmail) {
        return c.json({
          error: 'Email already exists',
          errors: { email: 'This email is already in the allowed list' }
        }, 400);
      }
    }

    if (allowedEmailData.type === 'domain' && allowedEmailData.domain) {
      const duplicateDomain = await database.allowedEmail.findFirst({
        where: {
          type: 'domain',
          domain: allowedEmailData.domain,
          id: { not: id }
        }
      });

      if (duplicateDomain) {
        return c.json({
          error: 'Domain already exists',
          errors: { domain: 'This domain is already in the allowed list' }
        }, 400);
      }
    }

    const updateData: any = {};

    if (allowedEmailData.type) {
      updateData.type = allowedEmailData.type;
      if (allowedEmailData.type === 'email') {
        updateData.email = allowedEmailData.email || null;
        updateData.domain = null;
      } else if (allowedEmailData.type === 'domain') {
        updateData.domain = allowedEmailData.domain || null;
        updateData.email = null;
      }
    } else {
      // Update only the relevant field based on existing type
      if (existingAllowedEmail.type === 'email' && allowedEmailData.email !== undefined) {
        updateData.email = allowedEmailData.email;
      }
      if (existingAllowedEmail.type === 'domain' && allowedEmailData.domain !== undefined) {
        updateData.domain = allowedEmailData.domain;
      }
    }

    const allowedEmail = await database.allowedEmail.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        domain: true,
        type: true,
        createdAt: true,
      }
    });

    const response = {
      ...allowedEmail,
      createdAt: formatApiDate(allowedEmail.createdAt),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error updating allowed email:', error);
    return c.json({ error: 'Failed to update allowed email' }, 500);
  }
});

export default app;
