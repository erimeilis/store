import { Hono } from 'hono';
import { getPrismaClient } from '@/lib/database.js';
import { writeAuthMiddleware } from '@/middleware/auth.js';
import { formatApiDate } from '@/lib/date-utils.js';

const app = new Hono();

/**
 * Get single user by ID
 * GET /api/users/:id
 */
app.get('/:id', writeAuthMiddleware, async (c) => {
  try {
    const database = getPrismaClient(c.env);
    const { id } = c.req.param();

    if (!id) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const user = await database.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const response = {
      ...user,
      createdAt: formatApiDate(user.createdAt),
      updatedAt: formatApiDate(user.updatedAt),
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

export default app;
