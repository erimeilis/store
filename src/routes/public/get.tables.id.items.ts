import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import { PublicSalesService } from '@/services/publicSalesService/index.js';
import { PublicRentService } from '@/services/publicRentService/index.js';
import { TableRepository } from '@/repositories/tableRepository.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user?: UserContext };
}>();

/**
 * Get items from a specific public table (sale or rent)
 * GET /api/public/tables/:tableId/items
 *
 * Returns all available items from a public table
 * Response format depends on tableType:
 * - sale: includes price, qty, available
 * - rent: includes price, used, available, canRent
 * Note: Default tables are not accessible via this endpoint
 */
app.get('/tables/:tableId/items', async (c) => {
  const tableId = c.req.param('tableId');
  const tableRepo = new TableRepository(c.env);

  try {
    // First, get table to determine its type
    const table = await tableRepo.findTableByIdInternal(tableId);
    if (!table) {
      return c.json({ error: 'Table not found' }, 404);
    }

    if (!['public', 'shared'].includes(table.visibility)) {
      return c.json({ error: 'Table is not publicly accessible' }, 403);
    }

    // Only sale and rent tables are accessible via public API
    if (!['sale', 'rent'].includes(table.tableType)) {
      return c.json({ error: 'This endpoint only supports sale and rent tables' }, 403);
    }

    // Route to appropriate service based on table type
    if (table.tableType === 'rent') {
      const rentService = new PublicRentService(c.env);
      const result = await rentService.getTableItems(c, tableId);

      if ('error' in result) {
        return c.json({ error: result.error }, (result.status || 404) as any);
      }
      return c.json(result);
    } else {
      const saleService = new PublicSalesService(c.env);
      const result = await saleService.getTableItems(c, tableId);

      if ('error' in result) {
        return c.json({ error: result.error }, (result.status || 404) as any);
      }
      return c.json(result);
    }

  } catch (error) {
    console.error('Error fetching table items:', error);
    return c.json({ error: 'Failed to fetch table items' }, 500);
  }
});

export default app;
