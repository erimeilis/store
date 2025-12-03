import { Hono } from 'hono';
import { getPrismaClient } from '@/lib/database.js';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { formatApiDate } from '@/lib/date-utils.js';

const app = new Hono();

/**
 * Get single token by ID
 * GET /api/tokens/:id
 */
app.get('/:id', adminWriteAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();

    if (!id) {
      return c.json({ error: 'Token ID is required' }, 400);
    }

    const token = await database.token.findUnique({
      where: { id },
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

    if (!token) {
      return c.json({ error: 'Token not found' }, 404);
    }

    // Filter tableAccess to only include existing tables
    let validTableAccess: string[] = [];
    if (token.tableAccess) {
      const tableIds: string[] = JSON.parse(token.tableAccess);
      if (tableIds.length > 0) {
        const existingTables = await database.userTable.findMany({
          where: { id: { in: tableIds } },
          select: { id: true }
        });
        validTableAccess = existingTables.map(t => t.id);
      }
    }

    const response = {
      ...token,
      is_admin: token.isAdmin,
      allowedIps: token.allowedIps,
      allowedDomains: token.allowedDomains,
      tableAccess: validTableAccess,
      expiresAt: token.expiresAt ? token.expiresAt.toISOString() : null,
      createdAt: formatApiDate(token.createdAt),
      updatedAt: formatApiDate(token.updatedAt),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching token:', error);
    return c.json({ error: 'Failed to fetch token' }, 500);
  }
});

export default app;
