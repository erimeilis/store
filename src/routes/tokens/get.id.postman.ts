import { Hono } from 'hono';
import { getPrismaClient } from '@/lib/database.js';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { PostmanGeneratorService } from '@/services/postman-generator.js';

const app = new Hono();

/**
 * Generate Postman collection for a token
 * GET /api/tokens/:id/postman
 */
app.get('/:id/postman', adminWriteAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();

    if (!id) {
      return c.json({ error: 'Token ID is required' }, 400);
    }

    // Get token details
    const token = await database.token.findUnique({
      where: { id },
      select: {
        id: true,
        token: true,
        name: true,
        permissions: true,
        allowedIps: true,
        allowedDomains: true,
        tableAccess: true,
        expiresAt: true,
      }
    });

    if (!token) {
      return c.json({ error: 'Token not found' }, 404);
    }

    // Get all tables to filter based on token access
    const tables = await database.userTable.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        tableType: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Generate Postman collection
    const apiUrl = c.env?.API_URL || 'http://localhost:8787';
    const postmanService = new PostmanGeneratorService(apiUrl);

    const tokenWithParsedAccess = {
      ...token,
      tableAccess: token.tableAccess ? JSON.parse(token.tableAccess) : null,
    };

    // Convert tables to format expected by PostmanGeneratorService (with forSale for compatibility)
    const tablesWithForSale = tables.map(t => ({
      ...t,
      forSale: t.tableType === 'sale'
    }));

    const collection = await postmanService.generateCollection(tokenWithParsedAccess, tablesWithForSale);

    // Set response headers for file download
    c.header('Content-Type', 'application/json');
    c.header('Content-Disposition', `attachment; filename="${token.name.replace(/[^a-z0-9]/gi, '_')}_collection.json"`);

    return c.json(collection);
  } catch (error) {
    console.error('Error generating Postman collection:', error);
    return c.json({ error: 'Failed to generate Postman collection' }, 500);
  }
});

export default app;
