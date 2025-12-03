import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getPrismaClient } from '@/lib/database.js';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { formatApiDate } from '@/lib/date-utils.js';
import { UpdateTokenSchema } from '@/const/schemas/tokens.js';

const app = new Hono();

/**
 * Update token (full update)
 * PUT /api/tokens/:id
 */
app.put('/:id', adminWriteAuthMiddleware, zValidator('json', UpdateTokenSchema), async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();
    const tokenData = c.req.valid('json');

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

    // Check name uniqueness if name is being updated
    if (tokenData.name && tokenData.name !== existingToken.name) {
      const nameExists = await database.token.findFirst({
        where: { name: tokenData.name }
      });

      if (nameExists) {
        return c.json({
          error: 'Name already exists',
          errors: { name: 'This token name is already in use' }
        }, 400);
      }
    }

    // Filter tableAccess to only include existing tables
    let validTableAccess: string[] | undefined;
    if (tokenData.tableAccess !== undefined) {
      if (tokenData.tableAccess.length > 0) {
        const existingTables = await database.userTable.findMany({
          where: { id: { in: tokenData.tableAccess } },
          select: { id: true }
        });
        validTableAccess = existingTables.map(t => t.id);

        // Require at least one valid table if tables exist in system
        if (validTableAccess.length === 0) {
          const tablesCount = await database.userTable.count();
          if (tablesCount > 0) {
            return c.json({
              error: 'Table access required',
              errors: { tableAccess: 'At least one valid table must be selected for token access' }
            }, 400);
          }
        }
      } else {
        validTableAccess = [];
      }
    }

    const token = await database.token.update({
      where: { id },
      data: {
        ...(tokenData.name && { name: tokenData.name }),
        ...(tokenData.permissions && { permissions: tokenData.permissions }),
        ...(tokenData.isAdmin !== undefined && { isAdmin: tokenData.isAdmin }),
        ...(tokenData.allowedIps !== undefined && { allowedIps: tokenData.allowedIps }),
        ...(tokenData.allowedDomains !== undefined && { allowedDomains: tokenData.allowedDomains }),
        ...(validTableAccess !== undefined && { tableAccess: JSON.stringify(validTableAccess) }),
        ...(tokenData.expiresAt !== undefined && {
          expiresAt: tokenData.expiresAt ? new Date(tokenData.expiresAt) : null
        }),
      },
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
    console.error('Error updating token:', error);
    return c.json({ error: 'Failed to update token' }, 500);
  }
});

export default app;
