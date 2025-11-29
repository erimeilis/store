import { Hono } from 'hono';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { RentalRepository } from '@/repositories/rentalRepository.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import type { UpdateRentalRequest } from '@/types/rentals.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Update rental (Admin only)
 * PUT /api/rentals/:id
 *
 * Can update status and notes
 */
app.put('/:id', adminWriteAuthMiddleware, async (c) => {
  const repository = new RentalRepository(c.env);
  const rentalId = c.req.param('id');

  try {
    const data: UpdateRentalRequest = await c.req.json();

    const existing = await repository.findRentalById(rentalId);
    if (!existing) {
      return c.json({ error: 'Rental not found' }, 404);
    }

    const updated = await repository.updateRental(rentalId, data);

    return c.json({
      message: 'Rental updated successfully',
      rental: updated
    });
  } catch (error) {
    console.error('Error in PUT /api/rentals/:id:', error);
    return c.json({ error: 'Failed to update rental' }, 500);
  }
});

export default app;
