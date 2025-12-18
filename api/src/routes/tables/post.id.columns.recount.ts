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
 * Recount column positions to ensure proper sequential ordering (0, 1, 2, 3...)
 * POST /api/tables/:id/columns/recount
 */
app.post('/:id/columns/recount', adminWriteAuthMiddleware, async (c) => {
  const service = new TableService(c.env);
  const user = c.get('user');
  const tableId = c.req.param('id');
  const result = await service.recountPositions(c, user, tableId);
  return c.json(result.response, result.status as ContentfulStatusCode);
});

export default app;
