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
 * Get sales summary for dashboard
 * GET /api/sales/summary
 *
 * Admin-only endpoint for dashboard overview
 */
app.get('/summary', adminReadAuthMiddleware, async (c) => {
  const service = new SalesService(c.env);
  const user = c.get('user');

  const result = await service.getSalesSummary(c, user);

  // Handle response based on result type
  if (result && typeof result === 'object' && 'error' in result) {
    return result; // Service already returns proper Response
  }

  return result;
});

export default app;
