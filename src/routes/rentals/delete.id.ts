import { Hono } from 'hono';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { RentalRepository } from '@/repositories/rentalRepository.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Delete rental (Admin only)
 * DELETE /api/rentals/:id
 */
app.delete('/:id', adminWriteAuthMiddleware, async (c) => {
  const repository = new RentalRepository(c.env);
  const rentalId = c.req.param('id');

  try {
    const rental = await repository.deleteRental(rentalId);

    return c.json({
      message: 'Rental deleted successfully',
      rental
    });
  } catch (error) {
    console.error('Error in DELETE /api/rentals/:id:', error);
    if (error instanceof Error && error.message === 'Rental not found') {
      return c.json({ error: 'Rental not found' }, 404);
    }
    return c.json({ error: 'Failed to delete rental' }, 500);
  }
});

export default app;
