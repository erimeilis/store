import { Hono } from 'hono';
import { getPrismaClient } from '@/lib/database.js';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';

const app = new Hono();

/**
 * Delete allowed email
 * DELETE /api/allowed-emails/:id
 */
app.delete('/:id', adminWriteAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();

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

    // Delete allowed email
    await database.allowedEmail.delete({
      where: { id }
    });

    return c.json({ message: 'Allowed email deleted successfully' });
  } catch (error) {
    console.error('Error deleting allowed email:', error);
    return c.json({ error: 'Failed to delete allowed email' }, 500);
  }
});

export default app;
