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
 * Add new data row to table
 * POST /api/tables/:tableId/data
 */
app.post('/:tableId/data', adminWriteAuthMiddleware, async (c) => {
  const service = new TableDataService(c.env);
  const user = c.get('user');
  const tableId = c.req.param('tableId');
  const body = await c.req.json();

  console.log('🔍 /data endpoint called with:', JSON.stringify(body, null, 2));

  const result = await service.createDataRow(c, user, tableId, body);

  return c.json(result.response, result.status as ContentfulStatusCode);
});

export default app;
