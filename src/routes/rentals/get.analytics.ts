import { Hono } from 'hono';
import { adminReadAuthMiddleware } from '@/middleware/auth.js';
import { RentalRepository } from '@/repositories/rentalRepository.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Get rental analytics
 * GET /api/rentals/analytics
 */
app.get('/analytics', adminReadAuthMiddleware, async (c) => {
  const repository = new RentalRepository(c.env);

  const dateFrom = c.req.query('dateFrom') || undefined;
  const dateTo = c.req.query('dateTo') || undefined;
  const tableId = c.req.query('tableId') || undefined;

  try {
    const analytics = await repository.getRentalAnalytics(dateFrom, dateTo, tableId);
    return c.json(analytics);
  } catch (error) {
    console.error('Error in GET /api/rentals/analytics:', error);
    return c.json({ error: 'Failed to fetch rental analytics' }, 500);
  }
});

export default app;
