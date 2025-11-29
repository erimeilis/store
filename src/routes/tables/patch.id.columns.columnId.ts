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
 * Update column in table
 * PATCH /api/tables/:id/columns/:columnId
 */
app.patch('/:id/columns/:columnId', adminWriteAuthMiddleware, async (c) => {
  const service = new TableService(c.env);
  const user = c.get('user');
  const tableId = c.req.param('id');
  const columnId = c.req.param('columnId');
  const body = await c.req.json();

  const result = await service.updateColumn(c, user, tableId, columnId, body);

  return c.json(result.response, result.status as ContentfulStatusCode);
});

export default app;
