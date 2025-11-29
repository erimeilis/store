import { Hono } from 'hono';
import { adminReadAuthMiddleware } from '@/middleware/auth.js';
import { InventoryService } from '@/services/inventoryService/index.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import type { StockLevelCheckRequest } from '@/types/inventory.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Get quick stock check via GET (alternative to POST)
 * GET /api/inventory/stock-check
 */
app.get('/stock-check', adminReadAuthMiddleware, async (c) => {
  const service = new InventoryService(c.env);
  const user = c.get('user');

  const request: StockLevelCheckRequest = {
    lowStockThreshold: parseInt(c.req.query('lowStockThreshold') || '5', 10)
  };

  // Only add tableId if it exists
  const tableIdParam = c.req.query('tableId');
  if (tableIdParam) {
    request.tableId = tableIdParam;
  }

  const result = await service.checkStockLevels(c, user, request);

  if (result instanceof Response) {
    return result;
  }

  return c.json(result);
});

export default app;
