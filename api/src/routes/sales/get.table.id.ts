import { Hono } from 'hono';
import { adminReadAuthMiddleware } from '@/middleware/auth.js';
import { SalesService } from '@/services/salesService/index.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Get sales for specific table
 * GET /api/sales/table/:tableId
 */
app.get('/table/:tableId', adminReadAuthMiddleware, async (c) => {
  const service = new SalesService(c.env);
  const user = c.get('user');
  const tableId = c.req.param('tableId');
  const limit = parseInt(c.req.query('limit') || '50', 10);

  const result = await service.getSalesByTable(c, user, tableId, limit);

  // Handle response based on result type
  if (result && typeof result === 'object' && 'error' in result) {
    return result; // Service already returns proper Response
  }

  return result;
});

export default app;
