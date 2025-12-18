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
 * Execute mass action on columns
 * POST /api/tables/:id/columns/mass-action
 */
app.post('/:id/columns/mass-action', adminWriteAuthMiddleware, async (c) => {
  const service = new TableService(c.env);
  const user = c.get('user');
  const tableId = c.req.param('id');
  const body = await c.req.json();

  // Expected body format: { action: 'make_required' | 'make_optional' | 'delete', columnIds: string[] }
  // Accept both 'ids' and 'columnIds' for backward compatibility
  const columnIds = body.ids || body.columnIds;
  const result = await service.executeColumnMassAction(c, user, tableId, body.action, columnIds);

  return c.json(result.response, result.status as ContentfulStatusCode);
});

export default app;
