import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import type { ReleaseRentalRequest } from '@/types/rentals.js';
import { readAuthMiddleware } from '@/middleware/auth.js';
import { PublicRentService } from '@/services/publicRentService/index.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user?: UserContext };
}>();

/**
 * Release a rented item
 * POST /api/public/release
 *
 * Releases a rental and marks the item as used
 * Requires read authentication (API token) to prevent abuse
 *
 * Request body (option 1 - by rental ID):
 * {
 *   rentalId: string,
 *   notes?: string
 * }
 *
 * Request body (option 2 - by item):
 * {
 *   tableId: string,
 *   itemId: string,
 *   notes?: string
 * }
 *
 * State change: available=false, used=false -> available=false, used=true
 * After release, item cannot be rented again (one-time rental items)
 */
app.post('/release', readAuthMiddleware, async (c) => {
  const service = new PublicRentService(c.env);
  const user = c.get('user');

  try {
    const data = await c.req.json();

    // Validate required fields - either rentalId OR (tableId + itemId)
    if (!data.rentalId && !(data.tableId && data.itemId)) {
      return c.json({
        error: 'Either rentalId or both tableId and itemId are required'
      }, 400);
    }

    const releaseRequest: ReleaseRentalRequest = {
      rentalId: data.rentalId,
      tableId: data.tableId,
      itemId: data.itemId,
      notes: data.notes
    };

    const result = await service.releaseItem(c, user!, releaseRequest);

    if ('error' in result) {
      return c.json({ error: result.error }, (result.status || 400) as any);
    }

    return c.json({
      message: result.message,
      rental: result.rental
    });

  } catch (error) {
    console.error('Error releasing rental:', error);
    return c.json({ error: 'Failed to release rental' }, 500);
  }
});

export default app;
