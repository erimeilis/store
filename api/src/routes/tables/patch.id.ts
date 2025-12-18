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
 * Update table metadata (name, description, publicity) - PATCH method for inline editing
 * PATCH /api/tables/:id
 */
app.patch('/:id', adminWriteAuthMiddleware, async (c) => {
  try {
    const service = new TableService(c.env);
    const user = c.get('user');
    const tableId = c.req.param('id');

    console.log('🔍 PATCH Tables Route Debug:');
    console.log('  - tableId:', tableId);
    console.log('  - user:', user ? { id: user.id, permissions: user.permissions } : 'none');

    const body = await c.req.json();
    console.log('  - body:', JSON.stringify(body, null, 2));
    console.log('  - bodyType:', typeof body);

    const result = await service.updateTable(c, user, tableId, body);

    return c.json(result.response, result.status as ContentfulStatusCode);
  } catch (error) {
    console.log('❌ PATCH Tables Route Error:', error);
    console.log('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

export default app;
