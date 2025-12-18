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
 * Get inventory summary for a specific table
 * GET /api/inventory/tables/:tableId
 *
 * Admin-only endpoint for table-level inventory overview
 */
app.get('/tables/:tableId', adminReadAuthMiddleware, async (c) => {
  const service = new InventoryService(c.env);
  const user = c.get('user');
  const tableId = c.req.param('tableId');

  const result = await service.getTableInventorySummary(c, user, tableId);

  if (result instanceof Response) {
    return result;
  }

  return c.json(result);
});

export default app;
