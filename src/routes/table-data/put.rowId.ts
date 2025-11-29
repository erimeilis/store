import { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { TableDataService } from '@/services/tableDataService/index.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Update existing data row
 * PUT /api/tables/:tableId/data/:rowId
 */
app.put('/:tableId/data/:rowId', adminWriteAuthMiddleware, async (c) => {
  const service = new TableDataService(c.env);
  const user = c.get('user');
  const tableId = c.req.param('tableId');
  const rowId = c.req.param('rowId');
  const body = await c.req.json();

  const result = await service.updateDataRow(c, user, tableId, rowId, body);

  return c.json(result.response, result.status as ContentfulStatusCode);
});

export default app;
