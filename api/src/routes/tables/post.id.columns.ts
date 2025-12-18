import { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { TableService } from '@/services/tableService/index.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Add new column to table
 * POST /api/tables/:id/columns
 */
app.post('/:id/columns', adminWriteAuthMiddleware, async (c) => {
  const service = new TableService(c.env);
  const user = c.get('user');
  const tableId = c.req.param('id');
  const body = await c.req.json();

  const result = await service.addColumn(c, user, tableId, body);

  return c.json(result.response, result.status as ContentfulStatusCode);
});

export default app;
