import { Hono } from 'hono';
import { getPrismaClient } from '@/lib/database.js';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { formatApiDate } from '@/lib/date-utils.js';

const app = new Hono();

/**
 * Get single allowed email by ID
 * GET /api/allowed-emails/:id
 */
app.get('/:id', adminWriteAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();

    if (!id) {
      return c.json({ error: 'Allowed email ID is required' }, 400);
    }

    const allowedEmail = await database.allowedEmail.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        domain: true,
        type: true,
        createdAt: true,
      }
    });

    if (!allowedEmail) {
      return c.json({ error: 'Allowed email not found' }, 404);
    }

    const response = {
      ...allowedEmail,
      createdAt: formatApiDate(allowedEmail.createdAt),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching allowed email:', error);
    return c.json({ error: 'Failed to fetch allowed email' }, 500);
  }
});

export default app;
