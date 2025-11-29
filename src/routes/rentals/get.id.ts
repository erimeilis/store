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
 * Get specific rental by ID
 * GET /api/rentals/:id
 */
app.get('/:id', adminReadAuthMiddleware, async (c) => {
  const repository = new RentalRepository(c.env);
  const rentalId = c.req.param('id');

  try {
    const rental = await repository.findRentalById(rentalId);

    if (!rental) {
      return c.json({ error: 'Rental not found' }, 404);
    }

    return c.json({ rental });
  } catch (error) {
    console.error('Error in GET /api/rentals/:id:', error);
    return c.json({ error: 'Failed to fetch rental' }, 500);
  }
});

export default app;
