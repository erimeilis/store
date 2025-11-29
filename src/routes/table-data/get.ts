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
 * List all data rows for a table with pagination, filtering, and sorting
 * GET /api/tables/:tableId/data
 */
app.get('/:tableId/data', adminReadAuthMiddleware, async (c) => {
  const service = new TableDataService(c.env);
  const user = c.get('user');
  const tableId = c.req.param('tableId');

  const query = {
    page: parseInt(c.req.query('page') || '1', 10),
    limit: parseInt(c.req.query('limit') || '10', 10),
    sort: c.req.query('sort') || 'updatedAt',
    direction: c.req.query('direction') || 'desc'
  };

  const result = await service.listTableData(c, user, tableId, query);

  return c.json(result.response, result.status as ContentfulStatusCode);
});

export default app;
