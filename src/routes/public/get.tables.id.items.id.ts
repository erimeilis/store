import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import { PublicSalesService } from '@/services/publicSalesService/index.js';
import { PublicRentService } from '@/services/publicRentService/index.js';
import { TableRepository } from '@/repositories/tableRepository.js';
import { hasTableAccess, isSupportedTableType } from '@/utils/tableAccess.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user?: UserContext };
}>();

/**
 * Get specific item details (sale or rent)
 * GET /api/public/tables/:tableId/items/:itemId
 *
 * Returns detailed information about a specific item
 * Response format depends on tableType
 *
 * Access is granted if:
 * - Token has explicit tableAccess for this table
 * - Table visibility is public/shared
 */
app.get('/tables/:tableId/items/:itemId', async (c) => {
  const tableId = c.req.param('tableId');
  const itemId = c.req.param('itemId');
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

    // Only sale and rent tables are accessible via public API
    if (!isSupportedTableType(table.tableType)) {
      return c.json({ error: 'This endpoint only supports sale and rent tables' }, 403);
    }

    // Route to appropriate service based on table type
    if (table.tableType === 'rent') {
      const rentService = new PublicRentService(c.env);
      const result = await rentService.getItem(c, tableId, itemId);

      if ('error' in result) {
        return c.json({ error: result.error }, (result.status || 404) as any);
      }
      return c.json(result);
    } else {
      const saleService = new PublicSalesService(c.env);
      const result = await saleService.getItem(c, tableId, itemId);

      if ('error' in result) {
        return c.json({ error: result.error }, (result.status || 404) as any);
      }
      return c.json(result);
    }

  } catch (error) {
    console.error('Error fetching item details:', error);
    return c.json({ error: 'Failed to fetch item details' }, 500);
  }
});

export default app;
