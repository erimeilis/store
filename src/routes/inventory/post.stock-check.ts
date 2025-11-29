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
 * Check stock levels and get alerts
 * POST /api/inventory/stock-check
 *
 * Admin-only endpoint for low stock alerts
 */
app.post('/stock-check', adminReadAuthMiddleware, async (c) => {
  const service = new InventoryService(c.env);
  const user = c.get('user');

  try {
    const data: StockLevelCheckRequest = await c.req.json().catch(() => ({}));

    // Provide defaults if no body is sent
    const request: StockLevelCheckRequest = {
      lowStockThreshold: data.lowStockThreshold ||
                          parseInt(c.req.query('lowStockThreshold') || '5', 10)
    };

    // Only add tableId if it exists
    const tableIdParam = data.tableId || c.req.query('tableId');
    if (tableIdParam) {
      request.tableId = tableIdParam;
    }

    const result = await service.checkStockLevels(c, user, request);

    if (result instanceof Response) {
      return result;
    }

    return c.json(result);

  } catch (error) {
    console.error('Error in POST /api/inventory/stock-check:', error);
    return c.json({ error: 'Invalid request data' }, 400);
  }
});

export default app;
