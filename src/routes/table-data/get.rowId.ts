import { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { adminReadAuthMiddleware } from '@/middleware/auth.js';
import { TableDataService } from '@/services/tableDataService/index.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Get specific data row by ID
 * GET /api/tables/:tableId/data/:rowId
 */
app.get('/:tableId/data/:rowId', adminReadAuthMiddleware, async (c) => {
  const service = new TableDataService(c.env);
  const user = c.get('user');
  const tableId = c.req.param('tableId');
  const rowId = c.req.param('rowId');

  const result = await service.getDataRow(c, user, tableId, rowId);

  return c.json(result.response, result.status as ContentfulStatusCode);
});

export default app;
