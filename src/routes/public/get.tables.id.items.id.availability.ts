import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import { PublicSalesService } from '@/services/publicSalesService/index.js';
import { PublicRentService } from '@/services/publicRentService/index.js';
import { TableRepository } from '@/repositories/tableRepository.js';
import { hasTableAccess } from '@/utils/tableAccess.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user?: UserContext };
}>();

/**
 * Check item availability (sale or rent)
 * GET /api/public/tables/:tableId/items/:itemId/availability
 *
 * Check if an item is available for purchase/rental
 * Response format depends on tableType:
 * - sale: { available, currentStock, requestedQuantity, canFulfill }
 * - rent: { available, used, currentlyRented, rentalPrice, activeRentalId? }
 *
 * Access is granted if:
 * - Token has explicit tableAccess for this table
 * - Table visibility is public/shared
 */
app.get('/tables/:tableId/items/:itemId/availability', async (c) => {
  const tableId = c.req.param('tableId');
  const itemId = c.req.param('itemId');
  const quantity = parseInt(c.req.query('quantity') || '1');
  const tableRepo = new TableRepository(c.env);
  const user = c.get('user');

  try {
    // First, get table to determine its type
    const table = await tableRepo.findTableByIdInternal(tableId);
    if (!table) {
      return c.json({ error: 'Table not found' }, 404);
    }

    // Check access: token tableAccess OR public/shared visibility
    if (!hasTableAccess(user, table)) {
      return c.json({ error: 'Table is not accessible with this token' }, 403);
    }

    // Route to appropriate service based on table type
    if (table.tableType === 'rent') {
      const rentService = new PublicRentService(c.env);
      const result = await rentService.checkRentalAvailability(c, tableId, itemId);

      if ('error' in result) {
        return c.json({ error: result.error }, (result.status || 404) as any);
      }
      return c.json(result);
    } else {
      const saleService = new PublicSalesService(c.env);
      const result = await saleService.checkAvailability(c, tableId, itemId, quantity);

      if ('error' in result) {
        return c.json({ error: result.error }, (result.status || 404) as any);
      }
      return c.json(result);
    }

  } catch (error) {
    console.error('Error checking availability:', error);
    return c.json({ error: 'Failed to check availability' }, 500);
  }
});

export default app;
