import { Hono } from 'hono';
import { getPrismaClient } from '@/lib/database.js';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { formatApiDate } from '@/lib/date-utils.js';

const app = new Hono();

/**
 * Patch allowed email (for inline editing)
 * PATCH /api/allowed-emails/:id
 */
app.patch('/:id', adminWriteAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();
    const updates = await c.req.json();

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

    // Validate specific field updates for inline editing
    const allowedFields = ['type', 'email', 'domain'];
    const updateData: any = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if (key === 'type' && ['email', 'domain'].includes(value as string)) {
          updateData.type = value;
        } else if (key === 'email') {
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value && !emailRegex.test(value as string)) {
            return c.json({ error: 'Invalid email format' }, 400);
          }

          // Check for duplicates
          if (value && value !== existingAllowedEmail.email) {
            const duplicateEmail = await database.allowedEmail.findFirst({
              where: {
                type: 'email',
                email: value as string,
                id: { not: id }
              }
            });
            if (duplicateEmail) {
              return c.json({ error: 'Email already exists in allowed list' }, 400);
            }
          }
          updateData.email = value || null;
        } else if (key === 'domain') {
          // Check for duplicates
          if (value && value !== existingAllowedEmail.domain) {
            const duplicateDomain = await database.allowedEmail.findFirst({
              where: {
                type: 'domain',
                domain: value as string,
                id: { not: id }
              }
            });
            if (duplicateDomain) {
              return c.json({ error: 'Domain already exists in allowed list' }, 400);
            }
          }
          updateData.domain = value || null;
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
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
    console.error('Error patching allowed email:', error);
    return c.json({ error: 'Failed to update allowed email' }, 500);
  }
});

export default app;
