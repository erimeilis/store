import { Hono } from 'hono';
import { getPrismaClient } from '@/lib/database.js';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { formatApiDate } from '@/lib/date-utils.js';

const app = new Hono();

/**
 * Patch token (partial update for inline editing)
 * PATCH /api/tokens/:id
 */
app.patch('/:id', adminWriteAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();
    const updates = await c.req.json();

    if (!id) {
      return c.json({ error: 'Token ID is required' }, 400);
    }

    // Check if token exists
    const existingToken = await database.token.findUnique({
      where: { id }
    });

    if (!existingToken) {
      return c.json({ error: 'Token not found' }, 404);
    }

    // Validate specific field updates for inline editing
    const allowedFields = ['name', 'permissions', 'isAdmin', 'allowedIps', 'allowedDomains', 'expiresAt'];
    const updateData: any = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if (key === 'name') {
          // Check name uniqueness
          if (value !== existingToken.name) {
            const nameExists = await database.token.findFirst({
              where: { name: value as string }
            });
            if (nameExists) {
              return c.json({ error: 'Token name already exists' }, 400);
            }
          }
          updateData[key] = value;
        } else if (key === 'permissions') {
          updateData[key] = value;
        } else if (key === 'isAdmin') {
          updateData[key] = Boolean(value);
        } else if (key === 'allowedIps' || key === 'allowedDomains') {
          updateData[key] = value || null;
        } else if (key === 'tableAccess') {
          updateData[key] = value ? JSON.stringify(value) : null;
        } else if (key === 'expiresAt') {
          updateData[key] = value ? new Date(value as string) : null;
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    const token = await database.token.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        token: true,
        name: true,
        permissions: true,
        isAdmin: true,
        allowedIps: true,
        allowedDomains: true,
        tableAccess: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const response = {
      ...token,
      is_admin: token.isAdmin,
      allowed_ips: token.allowedIps,
      allowed_domains: token.allowedDomains,
      table_access: token.tableAccess ? JSON.parse(token.tableAccess) : [],
      expires_at: token.expiresAt ? formatApiDate(token.expiresAt) : null,
      createdAt: formatApiDate(token.createdAt),
      updatedAt: formatApiDate(token.updatedAt),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error patching token:', error);
    return c.json({ error: 'Failed to update token' }, 500);
  }
});

export default app;
