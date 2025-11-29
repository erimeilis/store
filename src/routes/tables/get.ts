import { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { adminReadAuthMiddleware } from '@/middleware/auth.js';
import { TableService } from '@/services/tableService/index.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * List all tables accessible to user (own tables + public tables)
 * GET /api/tables
 */
app.get('/', adminReadAuthMiddleware, async (c) => {
  const service = new TableService(c.env);
  const user = c.get('user');

  const query = {
    page: parseInt(c.req.query('page') || '1', 10),
    limit: parseInt(c.req.query('limit') || c.env.PAGE_SIZE || '10', 10),
    sort: c.req.query('sort') || 'updatedAt',
    direction: c.req.query('direction') || 'desc',
    filterName: c.req.query('filterName'),
    filterDescription: c.req.query('filterDescription'),
    filterOwner: c.req.query('filterCreatedBy'),
    filterVisibility: c.req.query('filterVisibility'),
    filterCreatedAt: c.req.query('filterCreatedAt'),
    filterUpdatedAt: c.req.query('filterUpdatedAt'),
    filterTableType: c.req.query('filterTableType'),
    tableType: c.req.query('tableType'),
    // Legacy support
    filterForSale: c.req.query('filterForSale'),
    forSale: c.req.query('forSale')
  };

  const result = await service.listTables(c, user, query);

  return c.json(result.response, result.status as ContentfulStatusCode);
});

export default app;
