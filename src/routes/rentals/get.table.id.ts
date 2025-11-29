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
 * Get rentals for specific table
 * GET /api/rentals/table/:tableId
 */
app.get('/table/:tableId', adminReadAuthMiddleware, async (c) => {
  const repository = new RentalRepository(c.env);
  const tableId = c.req.param('tableId');
  const limit = parseInt(c.req.query('limit') || '50', 10);

  try {
    const rentals = await repository.findRentalsByTable(tableId, limit);
    return c.json({ data: rentals, total: rentals.length });
  } catch (error) {
    console.error('Error in GET /api/rentals/table/:tableId:', error);
    return c.json({ error: 'Failed to fetch table rentals' }, 500);
  }
});

export default app;
