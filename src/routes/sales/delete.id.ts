import { Hono } from 'hono';
import { adminWriteAuthMiddleware } from '@/middleware/auth.js';
import { SalesService } from '@/services/salesService/index.js';
import type { Bindings } from '@/types/bindings.js';
import type { UserContext } from '@/types/database.js';

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: UserContext };
}>();

/**
 * Delete sale (Admin only)
 * DELETE /api/sales/:id
 *
 * Use with caution for audit compliance
 */
app.delete('/:id', adminWriteAuthMiddleware, async (c) => {
  const service = new SalesService(c.env);
  const user = c.get('user');
  const saleId = c.req.param('id');

  const result = await service.deleteSale(c, user, saleId);

  // Handle response based on result type
  if (result && typeof result === 'object' && 'error' in result) {
    return result; // Service already returns proper Response
  }

  return result;
});

export default app;
