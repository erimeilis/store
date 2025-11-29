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
 * Get inventory summary for a specific item
 * GET /api/inventory/items/:tableId/:itemId
 *
 * Admin-only endpoint for item-level inventory tracking
 */
app.get('/items/:tableId/:itemId', adminReadAuthMiddleware, async (c) => {
  const service = new InventoryService(c.env);
  const user = c.get('user');
  const tableId = c.req.param('tableId');
  const itemId = c.req.param('itemId');

  const result = await service.getItemInventorySummary(c, user, tableId, itemId);

  if (result instanceof Response) {
    return result;
  }

  return c.json(result);
});

export default app;
