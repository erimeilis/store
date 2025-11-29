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
 * Mass action for table data (delete, export, set_field_value)
 * POST /api/tables/:tableId/data/mass-action
 */
app.post('/:tableId/data/mass-action', adminWriteAuthMiddleware, async (c) => {
  const service = new TableDataService(c.env);
  const user = c.get('user');
  const tableId = c.req.param('tableId');
  const body = await c.req.json();

  // Extract options for actions that require additional parameters
  const options = {
    fieldName: body.fieldName,
    value: body.value,
    selectAll: body.selectAll // Gmail-style select all pages
  };

  const result = await service.executeMassAction(c, user, tableId, body.action, body.ids || [], options);

  return c.json(result.response, result.status as ContentfulStatusCode);
});

export default app;
