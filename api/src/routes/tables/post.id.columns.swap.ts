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
 * Swap positions of two columns
 * POST /api/tables/:id/columns/swap
 */
app.post('/:id/columns/swap', adminWriteAuthMiddleware, async (c) => {
  const service = new TableService(c.env);
  const user = c.get('user');
  const tableId = c.req.param('id');
  const body = await c.req.json();
  const result = await service.swapColumnPositions(c, user, tableId, body.columnId1, body.columnId2);
  return c.json(result.response, result.status as ContentfulStatusCode);
});

export default app;
