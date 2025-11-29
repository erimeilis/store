import { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { adminReadAuthMiddleware } from '@/middleware/auth.js';
import { TableDataService } from '@/services/tableDataService/index.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Check for invalid country codes in table data
 * GET /api/tables/:tableId/data/country-issues
 * Returns list of rows with invalid country codes (names instead of ISO codes)
 * NOTE: Must be defined BEFORE :rowId routes to prevent "country-issues" matching as rowId
 */
app.get('/:tableId/data/country-issues', adminReadAuthMiddleware, async (c) => {
  const service = new TableDataService(c.env);
  const user = c.get('user');
  const tableId = c.req.param('tableId');

  const result = await service.detectCountryIssues(c, user, tableId);

  return c.json(result.response, result.status as ContentfulStatusCode);
});

export default app;
