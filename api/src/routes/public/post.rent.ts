import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import type { CreateRentalRequest } from '@/types/rentals.js';
import { readAuthMiddleware } from '@/middleware/auth.js';
import { PublicRentService } from '@/services/publicRentService/index.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user?: UserContext };
}>();

/**
 * Rent an item
 * POST /api/public/rent
 *
 * Creates a rental transaction for an item from a rent-type table
 * Requires read authentication (API token) to prevent abuse
 *
 * Request body:
 * {
 *   tableId: string,
 *   itemId: string,
 *   customerId: string,
 *   notes?: string
 * }
 *
 * State change: available=true -> available=false
 */
app.post('/rent', readAuthMiddleware, async (c) => {
  const service = new PublicRentService(c.env);
  const user = c.get('user');

  try {
    const data = await c.req.json();

    // Validate required fields
    if (!data.tableId || !data.itemId || !data.customerId) {
      return c.json({
        error: 'Missing required fields: tableId, itemId, customerId'
      }, 400);
    }

    const rentalRequest: CreateRentalRequest = {
      tableId: data.tableId,
      itemId: data.itemId,
      customerId: data.customerId,
      notes: data.notes
    };

    const result = await service.rentItem(c, user!, rentalRequest);

    if ('error' in result) {
      return c.json({ error: result.error }, (result.status || 400) as any);
    }

    return c.json({
      message: 'Item rented successfully',
      rental: result.rental
    }, 201);

  } catch (error) {
    console.error('Error processing rental:', error);
    return c.json({ error: 'Failed to process rental' }, 500);
  }
});

export default app;
