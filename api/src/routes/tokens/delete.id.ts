import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import { getPrismaClient } from '@/lib/database.js';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { invalidateTokenCache } from '@/lib/token-service.js';

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Delete token
 * DELETE /api/tokens/:id
 */
app.delete('/:id', adminWriteAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();

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

    // Invalidate token cache before deletion
    if (c.env.KV) {
      await invalidateTokenCache(c.env.KV, existingToken.token);
    }

    // Delete token
    await database.token.delete({
      where: { id }
    });

    return c.json({ message: 'Token deleted successfully' });
  } catch (error) {
    console.error('Error deleting token:', error);
    return c.json({ error: 'Failed to delete token' }, 500);
  }
});

export default app;
