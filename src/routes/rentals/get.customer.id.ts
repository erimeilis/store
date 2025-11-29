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
 * Get rentals for specific customer
 * GET /api/rentals/customer/:customerId
 */
app.get('/customer/:customerId', adminReadAuthMiddleware, async (c) => {
  const repository = new RentalRepository(c.env);
  const customerId = c.req.param('customerId');
  const limit = parseInt(c.req.query('limit') || '50', 10);

  try {
    const rentals = await repository.findRentalsByCustomer(customerId, limit);
    return c.json({ data: rentals, total: rentals.length });
  } catch (error) {
    console.error('Error in GET /api/rentals/customer/:customerId:', error);
    return c.json({ error: 'Failed to fetch customer rentals' }, 500);
  }
});

export default app;
