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
 * Mass action for tables (make public/private, delete)
 * POST /api/tables/mass-action
 */
app.post('/mass-action', adminWriteAuthMiddleware, async (c) => {
  const service = new TableService(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  // Pass selectAll flag as options (Gmail-style select all)
  const options = body.selectAll ? { selectAll: true } : undefined;

  const result = await service.executeMassAction(c, user, body.action, body.ids, options);

  return c.json(result.response, result.status as ContentfulStatusCode);
});

export default app;
