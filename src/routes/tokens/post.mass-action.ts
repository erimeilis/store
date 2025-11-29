import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getPrismaClient } from '@/lib/database.js';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { TokenMassActionSchema } from '@/const/schemas/tokens.js';
import { generateSecureToken } from './_shared.js';

const app = new Hono();

/**
 * Mass actions endpoint
 * POST /api/tokens/mass-action
 */
app.post('/mass-action', adminWriteAuthMiddleware, zValidator('json', TokenMassActionSchema), async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { action, ids } = c.req.valid('json');

    if (ids.length === 0) {
      return c.json({ error: 'No tokens selected' }, 400);
    }

    let result;

    switch (action) {
      case 'regenerate':
        // Regenerate tokens for selected items
        const tokens = await database.token.findMany({
          where: { id: { in: ids } }
        });

        for (const token of tokens) {
          await database.token.update({
            where: { id: token.id },
            data: { token: generateSecureToken() }
          });
        }

        result = { count: tokens.length };
        break;

      case 'extend_expiry':
        // Extend expiry by 1 year for tokens that have an expiry
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        result = await database.token.updateMany({
          where: {
            id: { in: ids },
            expiresAt: { not: null }
          },
          data: { expiresAt: oneYearFromNow }
        });
        break;

      case 'delete':
        result = await database.token.deleteMany({
          where: { id: { in: ids } }
        });
        break;

      default:
        return c.json({ error: 'Invalid action' }, 400);
    }

    return c.json({
      message: `Successfully ${action.replace('_', ' ')}ed ${result.count} token(s)`,
      count: result.count
    });
  } catch (error) {
    console.error('Error executing mass action:', error);
    return c.json({ error: 'Failed to execute mass action' }, 500);
  }
});

export default app;
