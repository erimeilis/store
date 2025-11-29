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
 * Fix all invalid country codes in table data
 * POST /api/tables/:tableId/data/fix-countries
 * Converts country names to ISO codes
 * NOTE: Must be defined BEFORE :rowId routes
 */
app.post('/:tableId/data/fix-countries', adminWriteAuthMiddleware, async (c) => {
  const service = new TableDataService(c.env);
  const user = c.get('user');
  const tableId = c.req.param('tableId');

  const result = await service.fixCountryCodes(c, user, tableId);

  return c.json(result.response, result.status as ContentfulStatusCode);
});

export default app;
