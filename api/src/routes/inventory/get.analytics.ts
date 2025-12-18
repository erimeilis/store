import { Hono } from 'hono';
import { adminReadAuthMiddleware } from '@/middleware/auth.js';
import { InventoryService } from '@/services/inventoryService/index.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Get inventory analytics
 * GET /api/inventory/analytics
 *
 * Admin-only endpoint for inventory reporting
 */
app.get('/analytics', adminReadAuthMiddleware, async (c) => {
  const service = new InventoryService(c.env);
  const user = c.get('user');

  const dateFrom = c.req.query('dateFrom') || undefined;
  const dateTo = c.req.query('dateTo') || undefined;
  const tableId = c.req.query('tableId') || undefined;

  const result = await service.getInventoryAnalytics(c, user, dateFrom, dateTo, tableId);

  if (result instanceof Response) {
    return result;
  }

  return c.json(result);
});

export default app;
