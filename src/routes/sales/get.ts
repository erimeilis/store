import { Hono } from 'hono';
import { adminReadAuthMiddleware } from '@/middleware/auth.js';
import { SalesService } from '@/services/salesService/index.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';
import type { SaleListQuery } from '@/types/sales.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * List sales with admin filtering and pagination
 * GET /api/sales
 *
 * Admin-only endpoint for sales management
 */
app.get('/', adminReadAuthMiddleware, async (c) => {
  const service = new SalesService(c.env);
  const user = c.get('user');

  const query: SaleListQuery = {
    page: parseInt(c.req.query('page') || '1', 10),
    limit: parseInt(c.req.query('limit') || '50', 10),
    sortBy: c.req.query('sort_by') as any || 'createdAt',
    sortOrder: c.req.query('sort_order') as any || 'desc'
  };

  // Only add optional fields if they have values
  const tableIdParam = c.req.query('tableId');
  if (tableIdParam) query.tableId = tableIdParam;

  const customerIdParam = c.req.query('customerId');
  if (customerIdParam) query.customerId = customerIdParam;

  const saleStatusParam = c.req.query('saleStatus');
  if (saleStatusParam) query.saleStatus = saleStatusParam as any;

  const dateFromParam = c.req.query('date_from');
  if (dateFromParam) query.dateFrom = dateFromParam;

  const dateToParam = c.req.query('date_to');
  if (dateToParam) query.dateTo = dateToParam;

  const searchParam = c.req.query('search');
  if (searchParam) query.search = searchParam;

  const result = await service.getSales(c, user, query);

  // Handle response based on result type - check if it's a Response object
  if (result instanceof Response) {
    return result;
  }

  return c.json(result);
});

export default app;
