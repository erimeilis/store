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
 * Get sales analytics
 * GET /api/sales/analytics
 *
 * Admin-only endpoint for sales reporting
 */
app.get('/analytics', adminReadAuthMiddleware, async (c) => {
  const service = new SalesService(c.env);
  const user = c.get('user');

  const dateFrom = c.req.query('date_from') || undefined;
  const dateTo = c.req.query('date_to') || undefined;
  const tableId = c.req.query('tableId') || undefined;

  const result = await service.getSalesAnalytics(c, user, dateFrom, dateTo, tableId);

  // Handle response based on result type - check if it's a Response object
  if (result instanceof Response) {
    return result;
  }

  return c.json(result);
});

export default app;
