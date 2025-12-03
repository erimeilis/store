import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getPrismaClient } from '@/lib/database.js';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { formatApiDate } from '@/lib/date-utils.js';
import { CreateTokenSchema } from '@/const/schemas/tokens.js';
import { generateSecureToken } from './_shared.js';

const app = new Hono();

/**
 * Create new token
 * POST /api/tokens
 */
app.post('/', adminWriteAuthMiddleware, zValidator('json', CreateTokenSchema), async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const tokenData = c.req.valid('json');

    // Generate secure token
    const tokenValue = generateSecureToken();

    // Check if name already exists
    const existingToken = await database.token.findFirst({
      where: { name: tokenData.name }
    });

    if (existingToken) {
      return c.json({
        error: 'Name already exists',
        errors: { name: 'This token name is already in use' }
      }, 400);
    }

    // Filter tableAccess to only include existing tables
    let validTableAccess: string[] = [];
    if (tokenData.tableAccess && tokenData.tableAccess.length > 0) {
      const existingTables = await database.userTable.findMany({
        where: { id: { in: tokenData.tableAccess } },
        select: { id: true }
      });
      validTableAccess = existingTables.map(t => t.id);
    }

    // Validate that at least one table is selected (unless no tables exist in system)
    if (validTableAccess.length === 0) {
      // Check if there are any tables in the system
      const tablesCount = await database.userTable.count();
      if (tablesCount > 0) {
        return c.json({
          error: 'Table access required',
          errors: { tableAccess: 'At least one valid table must be selected for token access' }
        }, 400);
      }
    }

    const token = await database.token.create({
      data: {
        token: tokenValue,
        name: tokenData.name,
        permissions: tokenData.permissions || 'read',
        isAdmin: tokenData.isAdmin || false, // Default: regular API tokens can only access /api/public/*
        allowedIps: tokenData.allowedIps || null,
        allowedDomains: tokenData.allowedDomains || null,
        tableAccess: JSON.stringify(validTableAccess),
        expiresAt: tokenData.expiresAt ? new Date(tokenData.expiresAt) : null,
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
      allowed_ips: token.allowedIps,
      allowed_domains: token.allowedDomains,
      table_access: token.tableAccess ? JSON.parse(token.tableAccess) : [],
      expires_at: token.expiresAt ? formatApiDate(token.expiresAt) : null,
      createdAt: formatApiDate(token.createdAt),
      updatedAt: formatApiDate(token.updatedAt),
    };

    return c.json(response, 201);
  } catch (error) {
    console.error('Error creating token:', error);
    return c.json({ error: 'Failed to create token' }, 500);
  }
});

export default app;
