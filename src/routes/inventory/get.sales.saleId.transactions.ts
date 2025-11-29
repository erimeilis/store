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
 * Get inventory transactions for a specific sale
 * GET /api/inventory/sales/:saleId/transactions
 *
 * Admin-only endpoint for sale audit trail
 */
app.get('/sales/:saleId/transactions', adminReadAuthMiddleware, async (c) => {
  const service = new InventoryService(c.env);
  const user = c.get('user');
  const saleId = c.req.param('saleId');

  const result = await service.getTransactionsBySale(c, user, saleId);

  if (result instanceof Response) {
    return result;
  }

  return c.json(result);
});

export default app;
