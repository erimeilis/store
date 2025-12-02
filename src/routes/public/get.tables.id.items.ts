import { Hono } from 'hono';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import { PublicSalesService } from '@/services/publicSalesService/index.js';
import { PublicRentService } from '@/services/publicRentService/index.js';
import { TableRepository } from '@/repositories/tableRepository.js';
import { hasTableAccess, isSupportedTableType } from '@/utils/tableAccess.js';
import { flattenPublicItem } from '@/services/publicSalesService/getPublicData.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user?: UserContext };
}>();

/**
 * Get items from a specific public table (sale or rent)
 * GET /api/public/tables/:tableId/items
 *
 * Query params:
 * - flat=true: Flatten data.* fields to top level in response
 *
 * Returns all available items from a public table
 * Response format depends on tableType:
 * - sale: includes price, qty, available
 * - rent: includes price, used, available, canRent
 * Note: Default tables are not accessible via this endpoint
 *
 * Access is granted if:
 * - Token has explicit tableAccess for this table
 * - Table visibility is public/shared
 *
 * When flat=true, response items have data.* fields at top level:
 * {
 *   "id": "...",
 *   "number": "+1234567890",  // was data.number
 *   "country": "UK",          // was data.country
 *   "price": 100,             // was data.price
 *   ...
 * }
 */
app.get('/tables/:tableId/items', async (c) => {
  const tableId = c.req.param('tableId');
  const flatMode = c.req.query('flat') === 'true';
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

    // Table info for flattening
    const tableInfo = {
      id: table.id,
      name: table.name,
      tableType: table.tableType
    };

    // Route to appropriate service based on table type
    if (table.tableType === 'rent') {
      const rentService = new PublicRentService(c.env);
      const result = await rentService.getTableItems(c, tableId);

      if ('error' in result) {
        return c.json({ error: result.error }, (result.status || 404) as any);
      }

      // Flatten items if requested
      if (flatMode && 'items' in result) {
        const flatItems = result.items.map((item: any) => flattenPublicItem(item, tableInfo));
        return c.json({ ...result, items: flatItems });
      }
      return c.json(result);
    } else {
      const saleService = new PublicSalesService(c.env);
      const result = await saleService.getTableItems(c, tableId);

      if ('error' in result) {
        return c.json({ error: result.error }, (result.status || 404) as any);
      }

      // Flatten items if requested
      if (flatMode && 'items' in result) {
        const flatItems = result.items.map((item: any) => flattenPublicItem(item, tableInfo));
        return c.json({ ...result, items: flatItems });
      }
      return c.json(result);
    }

  } catch (error) {
    console.error('Error fetching table items:', error);
    return c.json({ error: 'Failed to fetch table items' }, 500);
  }
});

export default app;
